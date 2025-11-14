const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");
const fabricRoutes = require("./routes/fabricRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const aiQueryRouter = require("./routes/aiQueryRoutes");
const adminProductsRouter = require("./routes/adminRoutes/adminProductRoutes");

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

app.use("/", homeRoutes);
app.use("/api/admin", adminProductsRouter);
app.use("/api/users", userRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRouter);
app.use("/api/ai-query", aiQueryRouter);
// app.use("/api/reviews", reviewRouter);

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.error("GLOBAL ERROR HANDLER:", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "An internal server error occurred.",
  });
});

module.exports = app;
