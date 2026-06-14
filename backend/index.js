const express = require("express");
const { app, server } = require("./socket/socket");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.URL, // http://localhost:5173
  credentials: true,
};

app.use(cors(corsOptions));

const connectdb = require("./utils/db");
connectdb();

const userroute = require("./routes/userroute");
const postroute = require("./routes/postroute");
const messageroute = require("./routes/messageroute");

app.use("/api/v1/user", userroute);
app.use("/api/v1/post", postroute);
app.use("/api/v1/message", messageroute);

server.listen(PORT, () => {
  console.log(`Server listening at PORT: ${PORT}`);
});