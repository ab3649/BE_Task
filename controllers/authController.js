const Vendor = require("../models/vendorModel");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "10m" });
};

// Register a new vendor
const registerVendor = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const vendor = await Vendor.create({ name, email, password });
    const token = generateToken(vendor._id);

    res.status(201).json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

// Login vendor
const loginVendor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });

    if (vendor && (await vendor.matchPassword(password))) {
      const token = generateToken(vendor._id);
      res.json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

module.exports = {
  registerVendor,
  loginVendor,
};
