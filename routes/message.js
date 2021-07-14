const express = require("express");
const Chat = require("../schema/ChatSchema");
const Message = require("../schema/MessageSchema");
const Notification = require("../schema/NotificationSchema");
const router = express.Router();

//create a message
router.post("/", async (req, res) => {
  const messageData = req.body;
  messageData.sender = req.user._id;
  const message = await Message.create(messageData);
  message.sender = req.user;
  const chat = await Chat.findByIdAndUpdate(
    req.body.chat,
    { latestMessage: message._id },
    { new: true }
  );
  chat.users.forEach((userId) => {
    if (userId.toString() !== req.user._id.toString()) {
      Notification.insertNotification(
        userId,
        req.user._id,
        "newMessage",
        message.chat._id
      );
    }
  });
  return res.status(201).json(message);
});

//get all messages of a chat
router.get("/:chatId", async (req, res) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chat: chatId }).populate("sender");
  return res.status(200).json(messages);
});

router.put('/:messageId', async (req, res) => {
  const userId = req.user._id;
  const messageId = req.params.messageId;
  await Message.findByIdAndUpdate(messageId, {$addToSet: {readBy: userId}});
  return res.status(204);
})

module.exports = router;
