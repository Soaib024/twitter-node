const express = require("express");

const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const Post = require("../schema/PostSchema");
const User = require("../schema/UserSchema");
const router = express.Router();

const response = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../uploads/images/posts"));
  },

  filename: function (req, file, callback) {
    callback(null, uuid() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, callback) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({ storage, fileFilter });

const postHepler = async (req, res, postImage = undefined) => {
  const postedBy = req.user._id;
  const content = req.body.content;
  const newPostData = { content, postedBy };

  if (postImage !== undefined) {
    newPostData.postImage = postImage;
  }

  if (req.body.replyTo != "undefined") {
    newPostData.replyTo = req.body.replyTo;
  }

  let newPost;
  try {
    newPost = await Post.create(newPostData);
    newPost = await User.populate(newPost, { path: "postedBy" });
    newPost = await Post.populate(newPost, { path: "replyTo" });
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
  return res.status(201).json(newPost);
};

router.post("/withoutImage", async (req, res) => {
  return postHepler(req, res);
});

router.post("/withImage", upload.single("image"), async (req, res) => {
  return postHepler(req, res, req.file.filename);
});

router.get("/:id", async (req, res) => {
  const postId = req.params.id;
  let postData = await getPost({_id: postId});
  postData = postData[0];
  const results= {
      postData: postData
  }
  if(postData.replyTo && postData.replyTo !== undefined){
      results.replyTo = postData.replyTo;
  }

  results.replies = await getPost({replyTo: postId});
  return res.status(200).json(results);

});



router.get("/", async (req, res) => {
  const posts = await getPost({});
  return res.status(200).json(posts);
});

router.put("/like", async (req, res) => {
  const postId = req.body.postId;
  const user = req.user;

  const isAlreadyLiked = user.likes && user.likes.includes(postId);
  const option = isAlreadyLiked ? "$pull" : "$addToSet";

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { [option]: { likes: postId } },
      { new: true }
    );
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { [option]: { likes: user._id } },
      { new: true }
    )
      .populate("postedBy")
      .populate("replyTo")
      .populate("retweetData");

    return res.status(200).json({
      post: updatedPost,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
});

router.post("/retweet", async (req, res) => {
  const postId = req.body.postId;
  let deletedPost;
  try {
    deletedPost = await Post.findOneAndDelete({
      postedBy: req.user._id,
      retweetData: postId,
    });
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }

  let repost = deletedPost;

  if (repost === null) {
    repost = await Post.create({
      postedBy: req.user._id,
      retweetData: postId,
    });
  }

  const option = deletedPost !== null ? "$pull" : "$addToSet";

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { [option]: { retweets: postId } },
      { new: true }
    );
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: req.user._id } },
      { new: true }
    )
      .populate("postedBy")
      .populate("replyTo")
      .populate("retweetData");

    return res.status(200).json({
      post: updatedPost,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
});

async function getPost(filter) {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));
  results = await User.populate(results, { path: "replyTo.postedBy" });
  
  return await User.populate(results, { path: "retweetData.postedBy" });
}

module.exports = router;
