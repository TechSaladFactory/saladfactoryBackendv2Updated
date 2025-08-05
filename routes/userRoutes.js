const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { protect, allwoedTo } = require("../services/authServices");

const {
  deleteUserByID,
  updateUserByID,
  getSpecialallUserByid,
  addnewUser,
  getUser,
  updateUserPasswordByid,
  updateUserdeparetmentByID,
  permissionusertoadd,
  permissionusertoremove,
  activeAccount,
  canAddProductIN
} = require("../services/userServices");
//validator imports
const {
  addnewuserValidators,
  getSpecialuserByidValidators,
  updateuserByIDValidators,
  deleteuserByIDValidators,
  updateUserPasswordByIDValidators
  ,updateUserDepValidators,
  permissionusertoaddValidators,
  permissionusertoremoveValidators,
  activeAccountValidators,
  canaddProductValidators
} = require("../validators/userValidators");
const router = express.Router();

router.route("/create").post(
  upload.single('profileImg'),addnewuserValidators, addnewUser);
  router.route("/perToadd/:id").put(permissionusertoaddValidators,permissionusertoadd)
router.route("/updateUserdep/:id").put(updateUserDepValidators,updateUserdeparetmentByID)
  router.route("/perToremove/:id").put(permissionusertoremoveValidators,permissionusertoremove)
router.route("/canAddProductIN/:id").put(canAddProductIN);
router.route("/getAll").get(getUser);
router.route("/resetpassorwd/:id").put(updateUserPasswordByIDValidators,updateUserPasswordByid)
router
  .route("/:id")
  .get( getSpecialuserByidValidators,getSpecialallUserByid)
  .put(upload.single('profileImg'),updateuserByIDValidators, updateUserByID)
  .delete(
    deleteuserByIDValidators,deleteUserByID);
    router.route("/activeAcouunt/:id").put(activeAccountValidators,activeAccount)

module.exports = router;

//
