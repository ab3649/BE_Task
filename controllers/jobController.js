const { validationResult } = require("express-validator"); // For checking validation errors
const Job = require("../models/jobModel");
const JobApplication = require("../models/jobApplicationModel"); // Import JobApplication model
const AppError = require("../utils/appError");
const {
  validateJobCreate,
  validateJobUpdate,
} = require("../utils/jobValidator"); // Ensure this import is here

// Create a new job posting with validation
const createJob = [
  ...validateJobCreate, // Apply job create validation rules
  async (req, res, next) => {
    const errors = validationResult(req); // Check validation errors
    if (!errors.isEmpty()) {
      return next(new AppError("Validation error", 400, errors.array()));
    }

    const { title, description, requirements, applicationDeadline } = req.body;

    try {
      const job = await Job.create({
        vendor: req.vendor._id, // Assuming vendor is populated by authentication middleware
        title,
        description,
        requirements,
        applicationDeadline,
        status: "open", // Set default status to "open" on creation
      });
      res.status(201).json(job); // Return the created job
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },
];

// Get all job postings (only "open" jobs for student view)
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: "open" }).populate(
      "vendor",
      "name email"
    );
    res.json(jobs);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Get job posting by ID
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "vendor",
      "name email"
    );

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    res.json(job);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update job posting with validation (combined with status update functionality)
const updateJob = [
  ...validateJobUpdate, // Apply job update validation rules
  async (req, res, next) => {
    const errors = validationResult(req); // Check validation errors
    if (!errors.isEmpty()) {
      return next(new AppError("Validation error", 400, errors.array()));
    }

    const { title, description, requirements, applicationDeadline, status } =
      req.body;

    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return next(new AppError("Job not found", 404));
      }

      // Check if vendor is authorized to update the job
      if (job.vendor.toString() !== req.vendor._id.toString()) {
        return next(new AppError("Not authorized", 403));
      }

      // If status is included in the body, update only the status
      if (status) {
        if (!["open", "closed"].includes(status)) {
          return next(
            new AppError(
              "Invalid status. Please provide either 'open' or 'closed'.",
              400
            )
          );
        }
        job.status = status; // Update status only
      }

      // Update other fields if provided
      job.title = title || job.title;
      job.description = description || job.description;
      job.requirements = requirements || job.requirements;
      job.applicationDeadline = applicationDeadline || job.applicationDeadline;

      const updatedJob = await job.save();
      res.json(updatedJob); // Return the updated job
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },
];

// Delete job posting
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    // Check if vendor is authorized to delete the job
    if (job.vendor.toString() !== req.vendor._id.toString()) {
      return next(new AppError("Not authorized", 403));
    }

    await Job.deleteOne({ _id: req.params.id });
    res.json({ message: "Job removed" });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Create a job application (applicant)
const createApplicant = async (req, res, next) => {
  const { id } = req.params;
  const { applicantName, applicantEmail } = req.body;

  try {
    const job = await Job.findById(id);
    if (!job || job.status !== "open") {
      return next(
        new AppError("Job not found or not open for applications", 404)
      );
    }

    const newApplication = await JobApplication.create({
      job: id,
      vendor: job.vendor, // Add vendor from the job
      applicantName,
      applicantEmail,
      status: "pending", // default status
    });

    res
      .status(201)
      .json({ message: "Applicant created successfully", newApplication });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Get applicants for a job posting
const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    if (job.vendor.toString() !== req.vendor._id.toString()) {
      return next(new AppError("Not authorized to view applicants", 403));
    }

    const applications = await JobApplication.find({ job: req.params.id })
      .populate("vendor", "name email")
      .select("applicantName applicantEmail status createdAt");

    res.json(applications);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Update application status for a specific applicant
const updateApplicantStatus = async (req, res, next) => {
  const { applicantId } = req.params;
  const { status } = req.body;

  if (!["pending", "hired", "rejected"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  try {
    const application = await JobApplication.findById(applicantId);

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    if (application.job.toString() !== req.params.id) {
      return next(
        new AppError("Not authorized to update this application", 403)
      );
    }

    application.status = status;
    await application.save();

    res.json(application); // Return the updated application
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Update the status of a job posting (open/closed)
const updateJobStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!["open", "closed"].includes(status)) {
    return next(
      new AppError(
        "Invalid status. Please provide either 'open' or 'closed'.",
        400
      )
    );
  }

  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    // Check if vendor is authorized to update the job
    if (job.vendor.toString() !== req.vendor._id.toString()) {
      return next(new AppError("Not authorized", 403));
    }

    // Update the job status
    job.status = status;
    const updatedJob = await job.save();

    res.json(updatedJob); // Return the updated job with the new status
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob, // Now handles both job updates and status updates
  deleteJob,
  getJobApplicants,
  updateApplicantStatus,
  createApplicant,
  updateJobStatus, // Ensure this is included here as well
};
