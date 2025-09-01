const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const {
  signUp,
  login,
  forgetPassword,
  checkAccountVerified,
  verifyOTP,
  reconfirmEmail,
  confirmOTPEmail,
  changepassword,
  getuser,
  changepasswordNotsessioned,
  updateuserdataSessioned,
  deleteLoggeduser,
  getuserDepartment,
} = require("../services/authServices");

const {
  signUpValidators,
  LoginValidators,
  forgetValidators,
  changepasswordValidators,
  getverfyemailValidators,
  getuserValidators,
  changepasswordNotsessionedValidators,
  updateuserdataSessionedValidators,
} = require("../validators/authValidators");

router.route("/login").post(LoginValidators, login);
router.route("/user/department").get(getuserDepartment);

router.route("/user").get(getuserValidators, getuser);

module.exports = router;
