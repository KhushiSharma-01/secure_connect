const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication token required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("username role");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
}

module.exports = { authenticateSocket };
