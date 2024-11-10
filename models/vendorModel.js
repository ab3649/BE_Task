const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const vendorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving to database
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // skip encryption if password hasn't been modified
  }

  try {
    const salt = await bcrypt.genSalt(10); // create a salt
    this.password = await bcrypt.hash(this.password, salt); // hash the password with the salt
    next();
  } catch (error) {
    next(error); // pass error to the next middleware
  }
});

// Add matchPassword method to schema
vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // compare entered password with the hashed password
};

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
