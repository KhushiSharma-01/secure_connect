// Run: node chat-client.js YOUR_JWT_TOKEN
const { io } = require("socket.io-client");
const readline = require("readline");

const token = process.argv[2];
if (!token) {
  console.log("Usage: node chat-client.js YOUR_JWT_TOKEN");
  process.exit(1);
}

const socket = io("http://localhost:5000", { auth: { token } });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

socket.on("connect", () => {
  console.log("Connected to chat. Joining room: general");
  socket.emit("join_room", "general");
  console.log("Type a message and press Enter. Type /exit to quit.");
});

socket.on("connect_error", (error) => console.log("Connection error:", error.message));
socket.on("joined_room", ({ room }) => console.log(`Joined room: ${room}`));
socket.on("receive_message", (data) => {
  console.log(`\n[${data.room}] ${data.username}: ${data.message}`);
  rl.prompt();
});

rl.setPrompt("> ");
rl.prompt();
rl.on("line", (line) => {
  if (line.trim() === "/exit") {
    socket.disconnect();
    rl.close();
    process.exit(0);
  }
  if (line.trim()) socket.emit("chat_message", { room: "general", message: line.trim() });
  rl.prompt();
});
