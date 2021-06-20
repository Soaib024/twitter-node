const User = require("../schema/UserSchema");
const jwt = require("jsonwebtoken");

const { promisify } = require("util");

const response = (res, status, message) => {
  return res.status(status).json({ error: message });
};

exports.protected = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return response(
      res,
      401,
      "You are not logged in, Please login to continue"
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  let user;
  try {
    user = await User.findById(decoded.id);
  } catch (err) {
    console.log(err);
    return response(res, 400, "Something went wrong, Please try again later");
  }

  if (user) {
    req.user = user;
    return next();
  }

  return response(
    res,
    401,
    "Either you are not logged in our your token is expired, Please login again"
  );
};
