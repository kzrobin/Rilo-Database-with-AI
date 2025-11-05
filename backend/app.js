const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");
const fabricRoutes = require("./routes/fabricRoutes");

const connectToDB = require("./db/db");
const cookieParser = require("cookie-parser");
connectToDB();

app.use(
  cors({
    origin: process.env.FRONTEMD_URL.split(","),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/home", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/fabrics", fabricRoutes);

app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
