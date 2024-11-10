const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
});

module.exports = mongoose.model("Job", jobSchema);
