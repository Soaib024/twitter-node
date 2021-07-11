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
const CommentRouter = require('./routes/comment');
const searchRouter = require('./routes/search');
const chatRouter = require('./routes/chat');
const messageRouter = require('./routes/message');

const AuthController = require("./controllers/auth");


app.use("/auth", AuthRouter);
app.use("/post", AuthController.protected, PostRouter);
app.use("/user", AuthController.protected, UserRouter);
app.use("/comment", AuthController.protected, CommentRouter);
app.use("/search", AuthController.protected, searchRouter);
app.use("/chat", AuthController.protected, chatRouter);
app.use("/message", AuthController.protected, messageRouter);



app.use("*", (req, res) => {
  return res.status(404).json({ error: "page not found" });
});
app.listen(port, () => {
  console.log("listening");
});
