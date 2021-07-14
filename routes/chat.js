const express = require('express');
const Chat = require('../schema/ChatSchema');
const User = require('../schema/UserSchema');
const router = express.Router();

router.post('/', (req, res) => {
    const chatData = req.body;
    chatData.users.push(req.user._id)
    Chat.create(chatData)
    .then(results => res.status(204).json(results))
    .catch(err => res.status(400))
})

router.get('/', (req, res) => {
    Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
    .populate("users")
    .populate("latestMessage")
    .sort({updatedAt: -1})
    .then(async results => {
        results = await User.populate(results, {path: "latestMessage.sender"})
        return res.status(200).json(results)
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.get('/:id', (req, res) => {
    Chat.findById(req.params.id)
    .populate("users")
    .populate("latestMessage")
    .then(async results => {
        results = await User.populate(results, {path: "latestMessage.sender"})
        return res.status(200).json(results)
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

//change chat name
router.put('/:chatId', async (req, res) => {
    const chatId = req.params.chatId;
    const name = req.body.name;
    await Chat.findByIdAndUpdate(chatId, {chatName: name})
    res.status(204)
})



module.exports = router;