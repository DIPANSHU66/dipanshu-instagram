const express = require("express");
const { app, server } = require("./socket/socket");
const cors = require("cors");
const path = require("path");
const _dirname = path.resolve();
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("dotenv").config();

const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
const connectdb = require("./utils/db");
connectdb();
const userroute = require("./routes/userroute");
const postroute = require("./routes/postroute");
const messageroute = require("./routes/messageroute");
app.use("/api/v1/post", postroute);
app.use("/api/v1/message", messageroute);
app.use("/api/v1/user", userroute);
app.use(express.static(path.join(_dirname, "frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, (req, res) => {
  console.log(`server listen at PORT:${PORT}`);
});
