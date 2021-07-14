const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const User = require("../schema/UserSchema");

const storage = multer.diskStorage({
  
  destination: function (req, file, callback) {
    const type = req.params.type
    callback(null, path.join(__dirname, `../uploads/images/${type}`));
  },

  filename: function (req, file, callback) {
    callback(null,  req.user._id + '.png');
  },
});

const upload = multer({ storage});

router.post("/:type", upload.single("image"), async (req, res) => {
  const type = req.params.type
  await User.findByIdAndUpdate(req.user._id, {[type]: `${req.user._id}.png`})
    return res.status(200)
  });

module.exports = router;
