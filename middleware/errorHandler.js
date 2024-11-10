const AppError = require("../utils/appError");

// Handle Mongoose invalid ObjectId error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // 400 Bad Request
};

// Handle Mongoose duplicate key error
const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0]; // Extract the duplicate field value
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 400);
};

// Handle Mongoose validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again!", 401);

// Send detailed error in development
const sendErrorDev = (err, res) => {
  console.error("Error 💥", err); // Log the error stack for debugging
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send simplified error in production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// Global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Default status code to 500 if not set
  err.status = err.status || "error"; // Default status to "error"

  // Check the environment for detailed or minimal error handling
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message }; // Copy error and include the original message

    // Handle specific error types for better error messages
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
