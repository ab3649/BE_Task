const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplicants,
  updateApplicantStatus,
  createApplicant,
  updateJobStatus,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware"); // Import only protect
const {
  validateJobCreate,
  validateJobUpdate,
} = require("../utils/jobValidator"); // Import validators

const router = express.Router();

// Protect the following routes (authentication is required for these actions)
router
  .route("/")
  .post(protect, validateJobCreate, createJob) // POST requires authentication + validation
  .get(getJobs); // GET is open for everyone

router
  .route("/:id")
  .get(getJobById)
  .patch(protect, validateJobUpdate, updateJob) // PATCH requires authentication + validation
  .delete(protect, deleteJob); // DELETE requires authentication

router.route("/:id/applicant").post(createApplicant);

// Route to get applicants for a job posting
router.route("/:id/applicants").get(protect, getJobApplicants); // Requires authentication

// Route to update applicant status (e.g., hired, rejected)
router.route("/:id/applicant/:applicantId").patch(
  protect,
  updateApplicantStatus // No need for additional role check
);

// Route to update job status (open/closed)
router.route("/:id/status").patch(protect, updateJobStatus); // Added job status update route

module.exports = router;
