const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required !"],
      unique: [true, "This name is already exists !"],
    },
    email: {
      type: String,
      lowercase: true,
      default: "",
    },
    slug: {
      type: String,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "no phone",
    },
    lastLogin: Date,

    password: {
      type: String,
      required: [true, "password required !"],
      minlength: [4, "Too short password !"],
      unique: [true, "This password is already exists for another account!"],
    },

    department: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],
    //permission
    canAddProduct: { type: Boolean, default: false },
    canRemoveProduct: { type: Boolean, default: false },
    canaddProductIN: { type: Boolean, default: false },

    canProduction: { type: Boolean, default: false },
    canOrderProduction: { type: Boolean, default: false },
    canReceive: { type: Boolean, default: false },
    canSend: { type: Boolean, default: false },
    canSupply: { type: Boolean, default: false },
    
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

exports.UserModel = mongoose.model("User", userSchema);
