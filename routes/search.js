const express = require("express");
const Post = require("../schema/PostSchema");
const User = require("../schema/UserSchema");
const router = express.Router();

router.get("/", async (req, res) => {
  const { type, pattern, followingOnly } = req.query;
  let results;
  if (type === "user") {
    results = await findUsers(req, pattern);
  } else if (type === "post") {
    results = await findPosts(pattern);
  }
  return res.status(200).json(results);
});

findUsers = async (req, pattern) => {
  const searchObj = {
    $or: [
      { name: { $regex: pattern, $options: "i" } },
      { username: { $regex: pattern, $options: "i" } },
    ],
    name: { $ne: req.user.name },
    username: { $ne: req.user.username },
  };

  return await User.find(searchObj);
};

findPosts = async (pattern) => {
  let posts = await Post.find({ content: { $regex: pattern, $options: "i" } })
    .populate("postedBy")
    .populate("retweetData")
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));
  return await User.populate(posts, { path: "retweetData.postedBy" });
};

module.exports = router;
