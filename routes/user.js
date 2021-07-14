const express = require("express");
const Notification = require("../schema/NotificationSchema");
const User = require("../schema/UserSchema");
const router = express.Router();

const response = (res, status, message) => {
  return res.status(status).json({ error: message });
};

router.get("/followSuggestion", (req, res) => {
  User.find({
    $and: [{_id: { $nin: req.user.following }}, {_id: { $ne: req.user._id }}],
  })
    .limit(3)
    .then((results) => res.status(200).json(results))
    .catch((err) => {
      cosole.error(err);
      res.status(400);
    });
  res.status(200);
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following")
      .populate("pinnedPost")
      .populate("followers");
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
});

router.put("/follow/:id", async (req, res) => {
  const loggedInUser = req.user;
  const profileUserId = req.params.id;

  const isFollowing =
    loggedInUser.following && loggedInUser.following.includes(profileUserId);
  const option = isFollowing ? "$pull" : "$addToSet";

  try {
    const updatedLoggedInUser = await User.findByIdAndUpdate(
      loggedInUser._id,
      { [option]: { following: profileUserId } },
      { new: true }
    );
    await User.findByIdAndUpdate(profileUserId, {
      [option]: { followers: loggedInUser._id },
    });
    if (!isFollowing) {
      await Notification.insertNotification(
        profileUserId,
        loggedInUser._id,
        "follow",
        loggedInUser._id
      );
    }
    return res.status(200).json(updatedLoggedInUser);
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
});


router.put('/pin/:postId', async (req, res) => {
  const previousPinnedPost = req.user.pinnedPost;
  const newPinnedPostId = req.params.postId
  if(previousPinnedPost?.toString() === newPinnedPostId.toString()){
    await User.findByIdAndUpdate(req.user._id, {pinnedPost: undefined})
    return res.status(201).json(undefined)
  }else{
    await User.findByIdAndUpdate(req.user._id, {pinnedPost: newPinnedPostId})
    return res.status(200).json(newPinnedPostId);
  }
})
module.exports = router;
