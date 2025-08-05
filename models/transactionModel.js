const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [false, "Product ID is required"]
  },
  product_name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["IN", "OUT"],
    required: [false, "Transaction type is required"]
  },
  quantity: {
    type: Number,
    default: 0,

    required: [false, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  supplier: {
    type: String,
    required: [false, "Supplier name is required"]

  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [false, "User ID is required"]
  },
  user_name: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  },

}, {
  timestamps: true
});

exports.TransactionModel = mongoose.model("Transaction", TransactionSchema)
