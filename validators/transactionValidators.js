const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// فالييديتور للتحقق من ID في بارامز
const idValidator = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid transaction ID format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));

      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

const addTransactionValidator = [
  body("productID")
    .notEmpty()
    .withMessage("productID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productID format"),
  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isIn(["IN", "OUT"])
    .withMessage("type must be either 'IN' or 'OUT'"),
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isFloat({ min: 0.1 })
    .withMessage("quantity must be a positive integer"),
  body("userID")
    .notEmpty()
    .withMessage("userID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid userID format"),
  body("unit")
    .notEmpty()
    .withMessage("unit is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid unit format"),
  body("department")
    .notEmpty()
    .withMessage("department is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid department format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));

      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

const updateTransactionValidator = [
  idValidator[0], // نفس فالييديتور الـ id
  body("productID")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productID format"),
  body("type")
    .optional()
    .isIn(["IN", "OUT"])
    .withMessage("type must be either 'IN' or 'OUT'"),
  body("quantity")
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage("quantity must be a positive integer"),
  body("userID")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid userID format"),
  body("unit")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid unit format"),
  body("department")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid department format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        message: err.msg,
        status: 400,
      }));

      return res.status(400).json(formattedErrors);
    }
    next();
  },
];

module.exports = {
  idValidator,
  addTransactionValidator,
  updateTransactionValidator,
};
