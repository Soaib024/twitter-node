const express = require('express');
const Chat = require('../schema/ChatSchema');
const Message = require('../schema/MessageSchema');
const router = express.Router();

router.post('/', async (req, res) => {
    const messageData = req.body;
    messageData.sender = req.user._id;
    const message = await Message.create(messageData);
    message.sender = req.user
    await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: message._id});
    return res.status(200).json(message)
});


router.get('/:chatId', async(req, res) => {
    const chatId = req.params.chatId;
    const messages = await Message.find({chat: chatId}).populate("sender")
    return res.status(200).json(messages)
})

module.exports = router;