const express = require("express");
const User = require("../schema/UserSchema");
const router = express.Router();

const response = (res, status, message) => {
  return res.status(status).json({ error: message });
};

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }
});

router.put("/follow/:id", async (req, res) => {
  const loggedInUser = req.user;
  const profileUserId = req.params.id;

  const option = loggedInUser.following.includes(profileUserId) ? "$pull" : "$addToSet";

  try{
    const updatedLoggedInUser = await User.findByIdAndUpdate(loggedInUser._id, {[option]: {following: profileUserId}}, {new: true});
    await User.findByIdAndUpdate(profileUserId, {[option]: {followers: loggedInUser._id}});
    return res.status(200).json(updatedLoggedInUser)
  }catch(err){
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later")
  }
})

module.exports = router;
