const express = require("express");
const router = express.Router();

const {
  getAllorderSupply,
  getorderSupplyById,
  createorderSupply,
  updateorderSupply,
  deleteorderSupply,
  Issended
} = require("../services/orderSupplyServices");

const {
  createorderSupplyModelValidator,
  getorderSupplyModelByIdValidator,
  updateorderSupplyModelValidator,
  deleteorderSupplyModelValidator
} = require("../validators/orderSupplyValidators");

// Get all
router.get("/getAll", getAllorderSupply);

// Create new
router.post("/add", createorderSupply);
router.route("/isSended/:id").put(Issended)

// Get specific by ID
router.route("/:id").get(getorderSupplyModelByIdValidator, getorderSupplyById)
.put( updateorderSupplyModelValidator, updateorderSupply)
.delete(deleteorderSupplyModelValidator, deleteorderSupply);

module.exports = router;
