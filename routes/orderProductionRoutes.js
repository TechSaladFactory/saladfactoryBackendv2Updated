const express = require("express");
const router = express.Router();

const {
  getAllOrderProductions,
  getOrderProductionById,
  createOrderProduction,
  updateOrderProduction,
  deleteOrderProduction,
} = require("../services/orderProductionServices");

const {
  createOrderProductionValidator,
  getOrderProductionByIdValidator,
  updateOrderProductionValidator,
  deleteOrderProductionValidator
} = require("../validators/orderProductionValidators");

// Get all
router.get("/getAll", getAllOrderProductions);

// Create new
router.post("/add", createOrderProduction);

// Get specific by ID
router.route("/:id").get(getOrderProductionByIdValidator, getOrderProductionById)
.put( updateOrderProductionValidator, updateOrderProduction)
.delete(deleteOrderProductionValidator, deleteOrderProduction);

module.exports = router;
