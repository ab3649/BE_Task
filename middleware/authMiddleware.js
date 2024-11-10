const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendorModel");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if the token is in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the vendor from the database
      req.vendor = await Vendor.findById(decoded.id).select("-password"); // Exclude password from the response

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
