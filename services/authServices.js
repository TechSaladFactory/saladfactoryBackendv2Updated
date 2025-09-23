const ApiErrors = require("../utils/apiErrors");
const { UserModel } = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { default: slugify } = require("slugify");
const { createToken } = require("../utils/createToken");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
//signUp

async function sendOTPConfirmEmail(toEmail, code) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Ecommerce 2026" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Confirm E-mail Code",
    text: `Your Confirm E-mail code is: ${code}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TroveeBuy - Email Verification</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f7fa;
          color: #333333;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        .container {
          max-width: 580px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          padding: 25px 0;
          text-align: center;
          border-bottom: 1px solid #eaeaea;
          background-color: #ffffff;
        }
        .brand-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .logo {
          height: 40px;
          width: auto;
        }
        .brand-name {
          font-size: 24px;
          font-weight: 700;
          color: #2a52be;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 32px 40px;
        }
        .greeting {
          font-size: 18px;
          color: #2c3e50;
          margin-bottom: 24px;
        }
        .code-container {
          margin: 32px 0;
          text-align: center;
        }
        .verification-code {
          display: inline-block;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #2a52be;
          padding: 16px 24px;
          background-color: #f8f9ff;
          border-radius: 6px;
          border: 1px solid #e0e5ff;
        }
        .instructions {
          font-size: 15px;
          color: #555555;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        .expiry-notice {
          background-color: #fff9f2;
          border-left: 4px solid #ffb347;
          padding: 16px;
          margin: 28px 0;
          font-size: 14px;
          border-radius: 0 4px 4px 0;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #999999;
          border-top: 1px solid #eeeeee;
          background-color: #fafafa;
        }
        .support-info {
          margin-top: 20px;
          font-size: 14px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand-container">
            <img src="https://firebasestorage.googleapis.com/v0/b/pure-zoo-406914.appspot.com/o/logoapps%2Fshopping.png?alt=media&token=4d3a92fd-5df2-4404-b767-88eda54f0d14" alt="TroveeBuy Logo" class="logo">
            <div class="brand-name">TroveeBuy</div>
          </div>
        </div>
        
        <div class="content">
          <div class="greeting">Dear Valued Customer,</div>
          
          <p class="instructions">
            Thank you for joining TroveeBuy. To complete your account verification, 
            please use the following security code:
          </p>
          
          <div class="code-container">
            <div class="verification-code">${code}</div>
          </div>
          
          <div class="expiry-notice">
            <strong>This verification code will expire in 10 minutes.</strong>
            For your security, please do not share this code with anyone.
          </div>
          
          <p class="instructions">
            If you didn't request this code, please ignore this email or contact our 
            support team immediately at <a href="mailto:support@troveebuy.com" style="color: #2a52be;">support@troveebuy.com</a>.
          </p>
          
          <div class="support-info">
            Need assistance? Our customer service team is available 24/7 at +1 (800) 555-0199
          </div>
        </div>
        
        <div class="footer">
          © ${new Date().getFullYear()} TroveeBuy Inc. All rights reserved.<br>
          456 Marketplace Drive, Seattle, WA 98101<br><br>
          <span style="color: #bbbbbb;">This is an automated message. Please do not reply.</span>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

//login
exports.login = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const userdata = await UserModel.findOne({ password });
  if (userdata) {
    const returnpassword = userdata.password;

    const userIdcreated = await userdata._id;

    // const isMatch = await bcrypt.compare(password, returnpassword);
    const isMatch = password == returnpassword ? true : false;
    if (isMatch) {
      const token = await createToken(userIdcreated);
      if (userdata.isVerified === true) {
        await UserModel.findByIdAndUpdate(
          { _id: userdata._id },
          { lastLogin: Date.now() },
          { new: true },
        );
        res.status(200).json({
          message: "Login successfully !",
          data: userdata,
          status: 200,
          token: token,
        });
      } else {
        return next(new ApiErrors(`your Account is Not Active !`, 401));
      }
    } else {
      return next(new ApiErrors(`The password is not correct !`, 404));
    }
  }
  if (!userdata) {
    return next(new ApiErrors("This account is not exist", 404));
  }
});

//protect
exports.protect = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return next(new ApiErrors("Headers does not have token !", 404));
  } else {
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userexist = await UserModel.findById({ _id: decoded.id });

      if (userexist) {
        if (userexist.passwordChangedAt) {
          const passwordChangedAtTime = parseInt(
            userexist.passwordChangedAt.getTime() / 1000,
            10,
          );
          if (passwordChangedAtTime > decoded.iat) {
            return next(
              new ApiErrors(
                "The user recently changed this password, Login again !",
                401,
              ),
            );
          } else {
            req.user = userexist;
            next();
          }
        } else {
          req.user = userexist;
          next();
        }
      }
      if (!userexist) {
        return next(
          new ApiErrors(
            "This user that belong to this token dosen't exist",
            401,
          ),
        );
      }
    } else {
      return next(new ApiErrors("You are not login to accsses ?", 401));
    }
  }
});

//permissions
exports.allwoedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("You are not Allowed to accsses to this Route !");
      return next(
        new ApiErrors("You are not Allowed to accsses to this Route !", 403),
      );
    }
    next();
  });

exports.getuser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "department",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    profileImg: userData.profileImg,
    role: userData.role,
    department: userData.department,
    isVerified: userData.isVerified,
    updatedAt: userData.updatedAt,
    createdAt: userData.createdAt,
    lastLogin: userData.lastLogin,
    canAddProduct: userData.canAddProduct,
    canRemoveProduct: userData.canRemoveProduct,
    canaddProductIN:userData.canaddProductIN,
    canProduction:userData.canProduction,
    canOrderProduction:userData.canOrderProduction,
    canReceive:userData.canReceive,

    canSend:userData.canSend,
    canSupply:userData.canSupply,
    canDamaged:  userData.canDamaged,

        canEditLastSupply:  userData.canEditLastSupply,
    canEditLastOrderProduction:  userData.canEditLastOrderProduction


  });
});

exports.getuserDepartment = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "department",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.department,
  });
});

exports.getuserBranchOP = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_OP",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_OP,
  });
});



exports.getuserBranchOS = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_OS",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_OS,
  });
});
