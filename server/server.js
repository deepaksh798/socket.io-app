const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

// CORS middleware for Express
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://socket-io-app.pages.dev",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://socket-io-app.pages.dev",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const ROOM = "group";
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", async (username) => {
    console.log(`${username} joined the group.`);
    await socket.join(ROOM);
    // broadcasting
    socket.to(ROOM).emit("roomNotice", username);
  });

  socket.on("chatMessage", (msg) => {
    socket.to(ROOM).emit("chatMessage", msg);
  });

  socket.on("typing", (username) => {
    socket.to(ROOM).emit("typing", username);
  });

  socket.on("stopTyping", (username) => {
    socket.to(ROOM).emit("stopTyping", username);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

server.listen(port, () => {
  console.log("Server (Express + Socket.IO) running");
});
