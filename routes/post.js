const { query } = require("express");
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

  let newPost;
  try {
    newPost = await Post.create(newPostData);
    newPost = await User.populate(newPost, { path: "postedBy" });
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
  let post = await getPost({_id: postId});
  post = post[0];
  return res.status(200).json(post);

});



router.get("/", async (req, res) => {
  let user;
  if(req.query.userId){
    user = await User.findById(req.query.userId);
  }
  let queryObj = {};
  if(req.query.postedBy){
    queryObj = {postedBy: req.query.postedBy}
  }else if(req.query.liked){
    queryObj = {_id : {$in : user.likes}}
  }

  const posts = await getPost(queryObj);
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
    .sort({ createdAt: -1 })
    .catch((error) => console.log(error));  
  return await User.populate(results, { path: "retweetData.postedBy" });
}




module.exports = router;
