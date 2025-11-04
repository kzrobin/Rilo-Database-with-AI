const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const homeRouter = require("./routes/home");

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

app.use("/home", homeRouter);

app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
