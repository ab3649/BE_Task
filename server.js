const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const apiLimiter = require("./middleware/rateLimiter"); // Import the rate limiter
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();
connectDB();

const app = express();

// 1) GLOBAL MIDDLEWARES
app.use(express.json());
app.use(require("cors")());
app.use(helmet());

// 2) Rate Limiting
app.use("/api", apiLimiter); // Apply rate limiter to all API routes

// Custom logging middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`[${req.requestTime}] ${req.method} ${req.originalUrl}`);
  next();
});

// 3) Set up morgan logging based on environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny"));
}

// 4) ROUTES
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// 5) Error Handling Middleware - must be at the end
app.use(errorHandler);

// 6) Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
