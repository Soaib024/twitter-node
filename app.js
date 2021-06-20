const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

require("./database");

const port = 5000;
const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads',express.static('uploads'));



const AuthRouter = require("./routes/auth");
const PostRouter = require("./routes/post");
const UserRouter = require("./routes/user");

const AuthController = require("./controllers/auth");


app.use("/auth", AuthRouter);
app.use("/post", AuthController.protected, PostRouter);
app.use("/user", AuthController.protected, UserRouter);


app.use("*", (req, res) => {
  return res.status(404).json({ error: "page not found" });
});
app.listen(port, () => {
  console.log("listening");
});
