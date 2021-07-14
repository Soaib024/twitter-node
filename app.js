const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

require("./database");

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json({
  limit: '2mb'
}));
app.use(express.urlencoded({ extended: false, limit:'2mb' }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

const AuthRouter = require("./routes/auth");
const PostRouter = require("./routes/post");
const UserRouter = require("./routes/user");
const CommentRouter = require("./routes/comment");
const searchRouter = require("./routes/search");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const notificationsRouter = require("./routes/notifications");
const uploadsRouter = require('./routes/uploads');

const AuthController = require("./controllers/auth");


app.use("/auth", AuthRouter);
app.use("/post", AuthController.protected, PostRouter);
app.use("/user", AuthController.protected, UserRouter);
app.use("/comment", AuthController.protected, CommentRouter);
app.use("/search", AuthController.protected, searchRouter);
app.use("/chat", AuthController.protected, chatRouter);
app.use("/message", AuthController.protected, messageRouter);
app.use("/notifications", AuthController.protected, notificationsRouter);
app.use("/uploads", AuthController.protected, uploadsRouter)



app.use("*", (req, res) => {
  return res.status(404).json({ error: "page not found" });
});
const server = app.listen(port, () => {
  console.log("listening");
});


//socket

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "*" , methods: ["GET", "POST"]},
});

io.on("connection", (socket) => {
  socket.on("setup", userId => {
    socket.join(userId);
    socket.emit("connected")
  })

  socket.on("join chat", chatId => socket.join(chatId));
  socket.on("typing", chatId => socket.in(chatId).emit("typing"))
  socket.on("stop typing", chatId => socket.in(chatId).emit("stop typing"));
  socket.on("new message", ({chatId, message}) => socket.in(chatId).emit("new message", message))
});
