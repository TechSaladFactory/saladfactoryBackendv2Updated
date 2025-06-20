const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { protect, allwoedTo } = require("../services/authServices");

const {
  deleteproductByID,
  updateproductByID,
  getSpecialproductByid,
  addproduct,
  getproduct,
  minQty,
  productByBarCode,
  downloadProductByIdExcel,
  downloadAllProductsExcel,
} = require("../services/productServices");
//validator imports
const {
  addproductValidators,
  getSpecialproductByidValidators,
  updateproductByIDValidators,
  deleteproductByIDValidators,
  UpdateminQtyByIDValidators,
} = require("../validators/productValidators");
const router = express.Router();

//productRoute
router.route("/barcode").post(productByBarCode);
router.route("/download/excel/:id").get(downloadProductByIdExcel);
router.route("/downloadAll").get(downloadAllProductsExcel);

router.route("/add").post(addproductValidators, addproduct);
router.route("/getAll").get(getproduct);
router
  .route("/:id")
  .get(getSpecialproductByidValidators, getSpecialproductByid)
  .put(updateproductByIDValidators, updateproductByID)
  .delete(deleteproductByIDValidators, deleteproductByID);
router.route("/minQty/:id").put(UpdateminQtyByIDValidators, minQty);
module.exports = router;

//
