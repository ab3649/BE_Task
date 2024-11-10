const { body } = require("express-validator");

const validateJobCreate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("requirements").notEmpty().withMessage("Requirements are required"),
  body("applicationDeadline")
    .isISO8601()
    .withMessage("Valid application deadline is required")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Deadline must be in the future"),
];

const validateJobUpdate = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("requirements")
    .optional()
    .notEmpty()
    .withMessage("Requirements cannot be empty"),
  body("applicationDeadline")
    .optional()
    .isISO8601()
    .withMessage("Valid application deadline is required")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Deadline must be in the future"),
];

module.exports = { validateJobCreate, validateJobUpdate };
