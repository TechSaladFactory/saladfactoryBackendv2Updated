const { default: slugify } = require("slugify");
const { OrderProductionModel } = require("../models/orderProductionModel");
const { BranchModel } = require("../models/branchModel");
const { productOPModel } = require("../models/productOPModel");
const { MainProductOPModel } = require("../models/mainProduct_OPModel");
const { UnitModel } = require("../models/unitModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname = require("../utils/searchBykeyword");
const mongoose = require("mongoose");

// Get All OrderProductions
// GET /api/orderproduction/getAll
exports.getAllOrderProductions = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);

  const orders = await OrderProductionModel.find(filter)
     .populate({ path: "branch", select: "name" })
     .populate({ path: "product", select: "name" })
     .populate({ path: "packageUnit", select: "name" })
    .populate({ path: "mainProductOP" ,select: "name" } );

  res.status(200).json({
    data: orders,
    itemsnumber: orders.length,
    status: 200,
  });
});

// Get Specific OrderProduction By ID
// GET /api/orderproduction/:id
exports.getOrderProductionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await OrderProductionModel.findById(id)
    .populate("branch", "name")
    .populate("ProductOP", "name");

  if (!order) {
    return next(new ApiErrors(`No order production found for ID: ${id}`, 404));
  }

  res.status(200).json({ data: order, status: 200 });
});

// Create New OrderProduction
// POST /api/orderproduction
exports.createOrderProduction = asyncHandler(async (req, res, next) => {
  const {
    branch,
    product,
    package, // الآن اختياري، فلا حاجة لفرضه
    qty,
    ordername,
    mainProductOP,
    packageUnit,
  } = req.body;

  // التحقق من الحقول الأساسية المطلوبة فقط
  if (!branch || !product || !qty) {
    return next(new ApiErrors("Fields (branch, product, qty) are required!", 400));
  }

  // تحقق من الـ branch
  const branchExists = await BranchModel.findById(branch);
  if (!branchExists) {
    return next(new ApiErrors("Invalid branch ID!", 400));
  }

  // تحقق من المنتج
  const productExists = await productOPModel.findById(product);
  if (!productExists) {
    return next(new ApiErrors("Invalid product ID!", 400));
  }

  // تحقق من packageUnit إذا تم إرساله
  if (packageUnit !== undefined && packageUnit !== null && packageUnit !== "") {
    if (!mongoose.Types.ObjectId.isValid(packageUnit)) {
      return next(new ApiErrors("Invalid Unit ID format!", 400));
    }

    const isexistUnit = await UnitModel.findById(packageUnit);
    if (!isexistUnit) {
      return next(new ApiErrors(`This Unit doesn't exist!`, 400));
    }
  }

  // تحقق من mainProductOP إذا تم إرساله
  if (mainProductOP !== undefined && mainProductOP !== null && mainProductOP !== "") {
    if (!mongoose.Types.ObjectId.isValid(mainProductOP)) {
      return next(new ApiErrors("Invalid mainProductOP ID format!", 400));
    }

    const mainProductExists = await MainProductOPModel.findById(mainProductOP);
    if (!mainProductExists) {
      return next(new ApiErrors("Invalid mainProductOP ID!", 400));
    }
  }

  // إنشاء الطلب
  const newOrder = await OrderProductionModel.create({
    branch,
    product,
    packageUnit: packageUnit || null,
    mainProductOP: mainProductOP || null,
    package: package || null,
    qty,
    ordername: ordername || "",
  });

  res.status(200).json({
    message: "Order production created successfully!",
    status: 200,
    data: newOrder,
  });
});

// Update OrderProduction
// PUT /api/orderproduction/:id
exports.updateOrderProduction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { branch, product,packageUnit, package, qty ,ordername} = req.body;

  const order = await OrderProductionModel.findById(id);
  if (!order) {
    return next(new ApiErrors(`No order production found for ID: ${id}`, 404));
  }

  if (branch && !(await BranchModel.findById(branch))) {
    return next(new ApiErrors("Invalid branch ID!", 400));
  }

  if (product && !(await productOPModel.findById(product))) {
    return next(new ApiErrors("Invalid product ID!", 400));
  }
  if (packageUnit !== undefined) {
    if (packageUnit !== null) {
      const isexistUnit = await UnitModel.findById(packageUnit);
      if (!isexistUnit) {
        return next(new ApiErrors(`This Unit doesn't exist!`, 400));
      }
    }
  }
  order.branch = branch || order.branch;
  order.product = product || order.product;
  order.package = package || order.package;
  order.qty = qty || order.qty;
  order.ordername=ordername||order.ordername
  order.packageUnit=packageUnit||order.packageUnit
  await order.save();

  res.status(200).json({
    message: "Order production updated successfully!",
    status: 200,
    data: order,
  });
});

// Delete OrderProduction
// DELETE /api/orderproduction/:id
exports.deleteOrderProduction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await OrderProductionModel.findByIdAndDelete(id);

  if (!deleted) {
    return next(new ApiErrors(`No order production found for ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Order production deleted successfully!",
    status: 200,
    data: deleted,
  });
});
