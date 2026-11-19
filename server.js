require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const { authenticateSocket } = require("./src/middleware/socketAuth");
const { chatEvents } = require("./src/events/chatEvents");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Secure Connect API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  socket.on("join_room", (roomName) => {
    if (typeof roomName !== "string" || !roomName.trim()) return;
    const room = roomName.trim().slice(0, 50);
    socket.join(room);
    console.log(`${socket.user.username} joined room ${room}`);
    socket.emit("joined_room", { room });
  });

  socket.on("chat_message", (data) => {
    if (!data || typeof data.room !== "string" || typeof data.message !== "string") return;

    const room = data.room.trim().slice(0, 50);
    const message = data.message.trim().slice(0, 1000);
    if (!room || !message || !socket.rooms.has(room)) return;

    const chatMessage = {
      username: socket.user.username,
      message,
      room,
      sentAt: new Date()
    };

    chatEvents.emit("messageSent", chatMessage);
    io.to(room).emit("receive_message", chatMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

chatEvents.on("messageSent", (message) => {
  console.log(`[${message.room}] ${message.username}: ${message.message}`);
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Please configure MONGO_URI and JWT_SECRET in your .env file.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
