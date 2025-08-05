const asyncHandler = require("express-async-handler");
const {ProductionModel} = require("../models/ProductionModel");
const {productOPModel} = require("../models/productOPModel");
const {ProductionRequestModel} = require("../models/ProductionRequest");

const ApiErrors = require("../utils/apiErrors");

// ✅ 1. إرسال طلب إنتاج (من المستخدم)
// exports.sendProductionRequests = asyncHandler(async (req, res) => {
//   const { items } = req.body;

//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
//   }

//   for (const { productId, qty } of items) {
//     const product = await productOPModel.findById(productId);
//     if (!product) {
//       return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
//     }

//     await ProductionRequestModel.create({
//       product: productId,
//       qty,
//     });
//   }

//   res.status(200).json({
//     message: "تم إرسال الطلبات في انتظار الاعتماد",
//     status: 200,
//   });
// });


exports.sendProductionRequests = asyncHandler(async (req, res) => {
  const { items, isAdmin } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
  }

  for (const { productId, qty } of items) {
    const product = await productOPModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
    }

    if (isAdmin === true) {
      // اعتماد مباشر
      const existingProduction = await ProductionModel.findOne({ product: productId });

      if (existingProduction) {
        existingProduction.qty += qty;
        await existingProduction.save();
      } else {
        await ProductionModel.create({
          product: [productId],
          qty,
        });
      }

      await ProductionRequestModel.create({
        product: productId,
        qty,
        approved: true,
      });
    } else {
      // إرسال بدون اعتماد
      await ProductionRequestModel.create({
        product: productId,
        qty,
      });
    }
  }

  const msg = isAdmin ? "تم اعتماد الطلبات مباشرة بنجاح" : "تم إرسال الطلبات في انتظار الاعتماد";

  res.status(200).json({
    message: msg,
    status: 200,
  });
});


// ✅ اعتماد مجموعة من طلبات الإنتاج المختارة من المشرف
exports.approveSelectedProductionRequests = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;

  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
  }

  let approvedCount = 0;

  for (const requestId of requestIds) {
    const request = await ProductionRequestModel.findById(requestId).populate("product");

    if (!request || request.approved) continue;

    const existingProduction = await ProductionModel.findOne({ product: request.product._id });

    if (existingProduction) {
      existingProduction.qty += request.qty;
      await existingProduction.save();
    } else {
      await ProductionModel.create({
        product: [request.product._id],
        qty: request.qty,
      });
    }

    request.approved = true;
    await request.save();
    approvedCount++;
  }

  res.status(200).json({
    message: `تم اعتماد ${approvedCount} طلب بنجاح`,
    approvedCount,
    status: 200,
  });
});


// ✅ 3. عرض الطلبات غير المعتمدة
exports.getPendingProductionRequests = asyncHandler(async (req, res) => {
  const requests = await ProductionRequestModel.find({ approved: false })
  .populate({
    path: "product",
    populate: {
      path: "mainProductOP",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  }).populate({
    path: "product",
    populate: {
      path: "packageUnit",
      select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
    },
  });
  res.status(200).json({
    data: requests,
    itemsnumber: requests.length,
    status: 200,
  });
});


// ✅ 4. عرض الطلبات المعتمدة (اختياري)
exports.getApprovedProductions = asyncHandler(async (req, res) => {
  const productions = await ProductionModel.find()
    .populate({
      path: "product",
      populate: {
        path: "mainProductOP",
        select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
      },
    }).populate({
      path: "product",
      populate: {
        path: "packageUnit",
        select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
      },
    });

  res.status(200).json({
    data: productions,
    itemsnumber: productions.length,
    status: 200,
  });
});
6


//deletependingrequestByID
exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedProductionrequest= await ProductionRequestModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set Production Pending request ID !", 404));
  } else {
    if (!deletedProductionrequest) {
      return next(new ApiErrors(`No Production Pending requestID for this Production Pending requestID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "Production Pending request deleted successfully !",
      status: 200,
      data: deletedProductionrequest});
  }
});



//delete accpeted


exports.deleteaccpetedProductionByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedProductionrequest= await ProductionModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set accpeted Production Id!", 404));
  } else {
    if (!deletedProductionrequest) {
      return next(new ApiErrors(`No Production accpetedID for this Production accpetedID: ${id} !`, 404));
    }

    res.status(200).json({ 
      message: "Production accpeted deleted successfully !",
      status: 200,
      data: deletedProductionrequest});
  }
});




exports.updatePendingRequestQtyByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (!id) {
    return next(new ApiErrors("Please provide the Production Request ID", 400));
  }

  if (qty === undefined) {
    return next(new ApiErrors("Please provide the new quantity (qty)", 400));
  }

  const updatedRequest = await ProductionRequestModel.findByIdAndUpdate(
    id,
    { qty }, // Make sure this field name matches your schema
    { new: true, runValidators: true }
  );

  if (!updatedRequest) {
    return next(new ApiErrors(`No Production Request found with ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Production Request quantity updated successfully",
    status: 200,
    data: updatedRequest,
  });
});


exports.updateProductionQty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (qty < 0) {
    return res.status(400).json({ message: "Quantity cannot be negative" });
  }

  const updatedProduction = await ProductionModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updatedProduction) {
    return res.status(404).json({ message: "Production not found" });
  }

  res.status(200).json({
    status: "success",
    data: updatedProduction,
  });
});
