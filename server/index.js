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

  socket.on("user-message", (message) => {
    console.log("Message from client:", message);
    io.emit("message", message);
    console.log("Broadcasted message to all clients:", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(9001, () => {
  console.log("Server (Express + Socket.IO) running on port 9001");
});
