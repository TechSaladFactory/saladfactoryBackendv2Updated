const mongoose = require("mongoose");

const productionHistorySchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductOP",
          required: false, // 👈 مش إجباري
        },
        qty: {
          type: Number,
          default: 1, // 👈 قيمة افتراضية
          min: 0,
          required: false, // 👈 مش إجباري
        },
      },
    ],
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false, // 👈 مش إجباري
    },
    action: {
      type: String,
      default: "create", // create أو update
    },
    note: {
      type: String,
      required: false, // 👈 إضافة note كـ optional
    },
  },
  { timestamps: true }
);

exports.ProductionHistoryModel = mongoose.model(
  "ProductionHistory",
  productionHistorySchema
);
