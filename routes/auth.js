const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../schema/UserSchema");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (res, status, user) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  return res.status(status).json({ token, user });
};

const response = (res, status, message) => {
  return res.status(status).json({ error: message });
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({ error: "Credentials is invalid" });
  }

  let user = undefined;
  try {
    user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }

  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return sendToken(res, 200, user);
    }
  } else {
    return response(res, 401, "Incorrect email/username or password");
  }
});

router.post("/register", async (req, res) => {
  const { email, password, username, name } = req.body;

  if (!email || !password || !username || !name) {
    return response(res, 400, "Make sure each fields has valid value");
  }

  let user = null;
  try {
    user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
  } catch (err) {
    return response(res, 400, "Something went wrong, Please try again later");
  }

  if (user === null) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email,
      username: username,
      password: hashedPassword,
      name: name,
    });
    return sendToken(res, 201, user);
  }

  if (user.email === email) {
    return response(res, 400, "Email already in use");
  } else {
    return response(res, 400, "Username already in use");
  }
});

module.exports = router;
