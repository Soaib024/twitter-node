const express = require("express");
const Notification = require("../schema/NotificationSchema");
const router = express.Router();

router.get("/", (req, res) => {
  Notification.find({
    userTo: req.user._id,
    notificationType: { $ne: "newMessage" },
  })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then((results) => res.status(200).json(results))

    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

//mark as opened
router.put("/:notificationId", (req, res) => {
  console.log("df");
  Notification.findByIdAndUpdate(req.params.notificationId, { opened: true })
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

//mark all as read
router.patch("/", (req, res) => {
  Notification.updateMany({ userTo: req.user._id }, { opened: true })
    .then(() => res.status(204))
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

router.get('/count', async (req, res) => {
    const results = await Notification.find({userTo: req.user._id, opened:false});
    const totalCount = results.length;
    let messageCount = 0;
    results.forEach(result => {
        if(result.notificationType === "newMessage"){
            messageCount++;
        }
    })
    return res.status(200).json({
        notificationCount : totalCount- messageCount,
        messageCount
    })
})

module.exports = router;
