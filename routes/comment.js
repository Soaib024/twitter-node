const express = require('express');
const Comment = require('../schema/CommentSchema');
const Post = require('../schema/PostSchema');
const User = require('../schema/UserSchema');
const router = express.Router();

const response = (res, status, message) => {
    return res.status(status).json({ error: message });
};

router.post('/:postId', async (req, res) => {
    const post = req.params.postId;
    const user = req.user._id;
    const comment = req.body.comment

    try{
        let newComment = await Comment.create({post, user, comment});
        newComment = await User.populate(newComment, {path: "user"})
        await Post.findByIdAndUpdate(post, {$addToSet: {comments: newComment._id}});
        await User.findByIdAndUpdate(user, {$addToSet: {comments: newComment._id}});
        return res.status(200).json(newComment);
    }catch(err){
        console.log(err);
        return response(res, 400, "Something went wrong, Please try again later");
    }
});

router.get('/:postId', async (req, res) => {
    const post = req.params.postId;
    const queryObj = req.query;
    const query = Comment.find({post}).populate("user");
    try{
        if(queryObj.limit){
            let result = await query.sort({'createdAt': -1}).limit(queryObj.limit * 1);
            return res.status(200).json(result.reverse())
        }
        const result = await query.sort({'createdAt': 1});
        return res.status(200).json(result)
    }catch(err){
        console.log(err)
        return response(res, 400, "Something went wrong, Please try again later")
    }
})


module.exports = router;

