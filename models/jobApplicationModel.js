const mongoose = require("mongoose");

const jobApplicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true, // job is still required
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false, // Make vendor field optional
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "interview", "hired", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
