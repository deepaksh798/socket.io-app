const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Use same server for Express + Socket.IO

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(4000, () => {
  console.log("Server (Express + Socket.IO) running on port 4000");
});
