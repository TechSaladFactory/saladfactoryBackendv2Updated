const express = require("express");
const router = express.Router();

const {
  getAllOrderProductions,
  getOrderProductionById,
  createOrderProduction,
  updateOrderProduction,
  deleteOrderProduction,
  Issended
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
router.route("/isSended/:id").put(Issended)

// Get specific by ID
router.route("/:id").get(getOrderProductionByIdValidator, getOrderProductionById)
.put( updateOrderProductionValidator, updateOrderProduction)
.delete(deleteOrderProductionValidator, deleteOrderProduction);

module.exports = router;
