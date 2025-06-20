const express = require("express");
const multer = require("multer");
const { protect, allwoedTo } = require("../services/authServices");
const {
  getunit,
  getSpecialunitByid,
  addunit,
  updateunitByID,
  deleteunitByID,
} = require("../services/unitServices");
//validator imports
const {
  getSpecialunitByidValidators,
  updateunitByIDValidators,
  deleteunitByIDValidators, addunitValidators
} = require("../validators/unitValidators");
const router = express.Router();

//unitRoute
router
  .route("/addunit")
  .post(
    addunitValidators,
    addunit
  );
router.route("/getAll").get(getunit);
router
  .route("/:id")
  .get(getSpecialunitByidValidators,getSpecialunitByid )
  .put(
    updateunitByIDValidators,
    updateunitByID
  )
  .delete(
    deleteunitByIDValidators, deleteunitByID);

module.exports = router;

//
