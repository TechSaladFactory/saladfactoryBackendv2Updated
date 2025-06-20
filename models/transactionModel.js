const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"]
  },
  product_name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["IN", "OUT"],
    required: [true, "Transaction type is required"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
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
    required: [true, "Supplier name is required"]

  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
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
