const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
require("dotenv").config({});
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.URL ? process.env.URL.split(",") : []),
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
  },
});

const userSocketMap = {};
const getRecieverSocketid = (receiverId) => {
  if (userSocketMap[receiverId] && userSocketMap[receiverId].length > 0) {
    return receiverId;
  }
  return undefined;
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    if (!userSocketMap[userId].includes(socket.id)) {
      userSocketMap[userId].push(socket.id);
    }
    socket.join(userId);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(
        (id) => id !== socket.id,
      );
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // WebRTC Audio/Video Call Events
  socket.on(
    "call-user",
    ({ userToCall, signalData, from, callerName, type }) => {
      const receiverSocketId = getRecieverSocketid(userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incoming-call", {
          signal: signalData,
          from,
          callerName,
          type, // 'video' or 'audio'
        });
      }
    },
  );

  socket.on("answer-call", ({ to, signal }) => {
    const callerSocketId = getRecieverSocketid(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", { signal });
    }
  });

  socket.on("reject-call", ({ to }) => {
    const callerSocketId = getRecieverSocketid(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected");
    }
  });

  socket.on("end-call", ({ to }) => {
    const otherSocketId = getRecieverSocketid(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit("call-ended");
    }
  });

  socket.on("webrtc-signal", ({ to, signal }) => {
    const targetSocketId = getRecieverSocketid(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-signal", { signal, from: userId });
    }
  });
});
module.exports = { app, server, io, getRecieverSocketid };
