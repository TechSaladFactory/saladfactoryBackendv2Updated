// const asyncHandler = require("express-async-handler");
// const {ProductionModel} = require("../models/ProductionModel");
// const {productOPModel} = require("../models/productOPModel");
// const {ProductionRequestModel} = require("../models/ProductionRequest");

// const ApiErrors = require("../utils/apiErrors");

// // ✅ 1. إرسال طلب إنتاج (من المستخدم)
// // exports.sendProductionRequests = asyncHandler(async (req, res) => {
// //   const { items } = req.body;

// //   if (!Array.isArray(items) || items.length === 0) {
// //     return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
// //   }

// //   for (const { productId, qty } of items) {
// //     const product = await productOPModel.findById(productId);
// //     if (!product) {
// //       return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
// //     }

// //     await ProductionRequestModel.create({
// //       product: productId,
// //       qty,
// //     });
// //   }

// //   res.status(200).json({
// //     message: "تم إرسال الطلبات في انتظار الاعتماد",
// //     status: 200,
// //   });
// // });


// exports.sendProductionRequests = asyncHandler(async (req, res) => {
//   const { items, isAdmin } = req.body;

//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
//   }

//   for (const { productId, qty } of items) {
//     const product = await productOPModel.findById(productId);
//     if (!product) {
//       return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
//     }

//     if (isAdmin === true) {
//       // اعتماد مباشر
//       const existingProduction = await ProductionModel.findOne({ product: productId });

//       if (existingProduction) {
//         existingProduction.qty += qty;
//         await existingProduction.save();
//       } else {
//         await ProductionModel.create({
//           product: [productId],
//           qty,
//         });
//       }

//       await ProductionRequestModel.create({
//         product: productId,
//         qty,
//         approved: true,
//       });
//     } else {
//       // إرسال بدون اعتماد
//       await ProductionRequestModel.create({
//         product: productId,
//         qty,
//       });
//     }
//   }

//   const msg = isAdmin ? "تم اعتماد الطلبات مباشرة بنجاح" : "تم إرسال الطلبات في انتظار الاعتماد";

//   res.status(200).json({
//     message: msg,
//     status: 200,
//   });
// });


// // ✅ اعتماد مجموعة من طلبات الإنتاج المختارة من المشرف
// exports.approveSelectedProductionRequests = asyncHandler(async (req, res) => {
//   const { requestIds } = req.body;

//   if (!Array.isArray(requestIds) || requestIds.length === 0) {
//     return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
//   }

//   let approvedCount = 0;

//   for (const requestId of requestIds) {
//     const request = await ProductionRequestModel.findById(requestId).populate("product");

//     if (!request || request.approved) continue;

//     const existingProduction = await ProductionModel.findOne({ product: request.product._id });

//     if (existingProduction) {
//       existingProduction.qty += request.qty;
//       await existingProduction.save();
//     } else {
//       await ProductionModel.create({
//         product: [request.product._id],
//         qty: request.qty,
//       });
//     }

//     request.approved = true;
//     await request.save();
//     approvedCount++;
//   }

//   res.status(200).json({
//     message: `تم اعتماد ${approvedCount} طلب بنجاح`,
//     approvedCount,
//     status: 200,
//   });
// });


// // ✅ 3. عرض الطلبات غير المعتمدة
// exports.getPendingProductionRequests = asyncHandler(async (req, res) => {
//   const requests = await ProductionRequestModel.find({ approved: false })
//   .populate({
//     path: "product",
//     populate: {
//       path: "mainProductOP",
//       select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//     },
//   }).populate({
//     path: "product",
//     populate: {
//       path: "packageUnit",
//       select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//     },
//   });
//   res.status(200).json({
//     data: requests,
//     itemsnumber: requests.length,
//     status: 200,
//   });
// });


// // ✅ 4. عرض الطلبات المعتمدة (اختياري)
// exports.getApprovedProductions = asyncHandler(async (req, res) => {
//   const productions = await ProductionModel.find()
//     .populate({
//       path: "product",
//       populate: {
//         path: "mainProductOP",
//         select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//       },
//     }).populate({
//       path: "product",
//       populate: {
//         path: "packageUnit",
//         select: "name", // اجلب فقط الاسم أو أي بيانات تحتاجها
//       },
//     });

//   res.status(200).json({
//     data: productions,
//     itemsnumber: productions.length,
//     status: 200,
//   });
// });
// 6


// //deletependingrequestByID
// exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedProductionrequest= await ProductionRequestModel.findOneAndDelete({ _id: id });

//   if (id === undefined) {
//     return next(new ApiErrors("set Production Pending request ID !", 404));
//   } else {
//     if (!deletedProductionrequest) {
//       return next(new ApiErrors(`No Production Pending requestID for this Production Pending requestID: ${id} !`, 404));
//     }

//     res.status(200).json({ 
//       message: "Production Pending request deleted successfully !",
//       status: 200,
//       data: deletedProductionrequest});
//   }
// });



// //delete accpeted


// exports.deleteaccpetedProductionByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedProductionrequest= await ProductionModel.findOneAndDelete({ _id: id });

//   if (id === undefined) {
//     return next(new ApiErrors("set accpeted Production Id!", 404));
//   } else {
//     if (!deletedProductionrequest) {
//       return next(new ApiErrors(`No Production accpetedID for this Production accpetedID: ${id} !`, 404));
//     }

//     res.status(200).json({ 
//       message: "Production accpeted deleted successfully !",
//       status: 200,
//       data: deletedProductionrequest});
//   }
// });




// exports.updatePendingRequestQtyByID = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { qty } = req.body;

//   if (!id) {
//     return next(new ApiErrors("Please provide the Production Request ID", 400));
//   }

//   if (qty === undefined) {
//     return next(new ApiErrors("Please provide the new quantity (qty)", 400));
//   }

//   const updatedRequest = await ProductionRequestModel.findByIdAndUpdate(
//     id,
//     { qty }, // Make sure this field name matches your schema
//     { new: true, runValidators: true }
//   );

//   if (!updatedRequest) {
//     return next(new ApiErrors(`No Production Request found with ID: ${id}`, 404));
//   }

//   res.status(200).json({
//     message: "Production Request quantity updated successfully",
//     status: 200,
//     data: updatedRequest,
//   });
// });


// exports.updateProductionQty = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { qty } = req.body;

//   if (qty < 0) {
//     return res.status(400).json({ message: "Quantity cannot be negative" });
//   }

//   const updatedProduction = await ProductionModel.findByIdAndUpdate(
//     id,
//     { qty },
//     { new: true, runValidators: true }
//   );

//   if (!updatedProduction) {
//     return res.status(404).json({ message: "Production not found" });
//   }

//   res.status(200).json({
//     status: "success",
//     data: updatedProduction,
//   });
// });

// // تعديل آخر عملية إنتاج لمنتج معين
// exports.updateLastProductionByProduct = asyncHandler(async (req, res, next) => {
//   const { productId } = req.params; // أو تبعتها من body
//   const { qty } = req.body;

//   if (!productId) {
//     return next(new ApiErrors("Please provide productId", 400));
//   }

//   if (qty === undefined || isNaN(qty) || qty < 0) {
//     return next(new ApiErrors("Please provide a valid quantity (qty >= 0)", 400));
//   }

//   // هات آخر عملية إنتاج للمنتج المطلوب
//   const lastProduction = await ProductionModel.findOne({ product: productId })
//     .sort({ createdAt: -1 });

//   if (!lastProduction) {
//     return next(new ApiErrors(`No Production found for productId: ${productId}`, 404));
//   }

//   lastProduction.qty = qty;
//   await lastProduction.save();

//   res.status(200).json({
//     message: "Last production updated successfully",
//     status: 200,
//     data: lastProduction,
//   });
// });

const asyncHandler = require("express-async-handler");
const { ProductionModel } = require("../models/ProductionModel");
const { productOPModel } = require("../models/productOPModel");
const { ProductionRequestModel } = require("../models/ProductionRequest");
const { ProductionHistoryModel } = require("../models/ProductionHistoryModel");
const ApiErrors = require("../utils/apiErrors");



// 🟢 تعديل عملية في History + Sync مع Production (بدون إضافة جديد)
// 🟢 تعديل عملية في History + Sync مع Production (بالفرق مش الاستبدال)
exports.updateHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;
  const { items } = req.body;

  const history = await ProductionHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  // ✅ تعديل الكميات بالفرق
  for (const { product, qty: newQty } of items) {
    const oldItem = history.items.find(i => i.product.toString() === product.toString());
    const oldQty = oldItem ? oldItem.qty : 0;

    const diff = newQty - oldQty; // الفرق بين القديم والجديد

    let prod = await ProductionModel.findOne({ product });
    if (!prod) {
      return next(new ApiErrors(`المنتج ${product} غير موجود في الإنتاج`, 400));
    }

    prod.qty += diff; // تعديل بالفرق فقط
    if (prod.qty < 0) prod.qty = 0; // ضمان عدم السالب
    await prod.save();
  }

  // ✅ تحديث الـ History
  history.items = items;
  history.action = "update";
  await history.save();

  res.status(200).json({
    message: "History updated and Production synced with quantity differences",
    status: 200,
    data: history,
  });
});



// 🟢 عرض كل History
exports.getAllHistory = asyncHandler(async (req, res) => {
  const history = await ProductionHistoryModel.find()
    .populate("items.product", "name");

  res.status(200).json({
    data: history,
    count: history.length,
    status: 200,
  });
});


// 🟢 إرسال طلب إنتاج (User أو Admin)
exports.sendProductionRequests = asyncHandler(async (req, res) => {
  const { items, isAdmin } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "يجب إرسال عناصر المنتجات" });
  }

  // تحقق من وجود المنتجات
  for (const { productId } of items) {
    const product = await productOPModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: `المنتج غير موجود: ${productId}` });
    }
  }

  if (isAdmin) {
    // ✅ تحديث Production
    for (const { productId, qty } of items) {
      let prod = await ProductionModel.findOne({ product: productId });
      if (prod) {
        prod.qty += qty;
        await prod.save();
      } else {
        await ProductionModel.create({ product: [productId], qty });
      }
    }

    // ✅ حفظ العملية في History
    await ProductionHistoryModel.create({
      items: items.map(i => ({ product: i.productId, qty: i.qty })),
      action: "approve",
      note: "Admin اعتمد العملية مباشرة",
    });

    // ✅ تسجيل Requests كمعتمد
    for (const { productId, qty } of items) {
      await ProductionRequestModel.create({
        product: productId,
        qty,
        approved: true,
      });
    }
  } else {
    // ✅ المستخدم العادي (طلب فقط)
    for (const { productId, qty } of items) {
      await ProductionRequestModel.create({ product: productId, qty });
    }

    await ProductionHistoryModel.create({
      items: items.map(i => ({ product: i.productId, qty: i.qty })),
      action: "request",
      note: "تم إرسال طلب في انتظار الاعتماد",
    });
  }

  res.status(200).json({
    message: isAdmin ? "تم الاعتماد وتسجيل العملية" : "تم إرسال الطلب وتسجيله في History",
    status: 200,
  });
});


// 🟢 اعتماد مجموعة من الطلبات
exports.approveSelectedProductionRequests = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;

  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return res.status(400).json({ message: "يجب إرسال قائمة الطلبات المطلوبة للاعتماد" });
  }

  let approvedCount = 0;
  const historyItems = [];

  for (const requestId of requestIds) {
    const request = await ProductionRequestModel.findById(requestId).populate("product");

    if (!request || request.approved) continue;

    let existingProduction = await ProductionModel.findOne({ product: request.product._id });

    if (existingProduction) {
      existingProduction.qty += request.qty;
      await existingProduction.save();
    } else {
      existingProduction = await ProductionModel.create({
        product: [request.product._id],
        qty: request.qty,
      });
    }

    request.approved = true;
    await request.save();
    approvedCount++;

    historyItems.push({ product: request.product._id, qty: request.qty });
  }

  if (historyItems.length > 0) {
    await ProductionHistoryModel.create({
      items: historyItems,
      action: "batch-approve",
      note: "اعتماد مجموعة طلبات",
    });
  }

  res.status(200).json({
    message: `تم اعتماد ${approvedCount} طلب بنجاح`,
    approvedCount,
    status: 200,
  });
});


// 🟢 الطلبات غير المعتمدة
exports.getPendingProductionRequests = asyncHandler(async (req, res) => {
  const requests = await ProductionRequestModel.find({ approved: false })
    .populate({
      path: "product",
      populate: { path: "mainProductOP", select: "name" },
    })
    .populate({
      path: "product",
      populate: { path: "packageUnit", select: "name" },
    });

  res.status(200).json({ data: requests, itemsnumber: requests.length, status: 200 });
});


// 🟢 الإنتاج المعتمد
exports.getApprovedProductions = asyncHandler(async (req, res) => {
  const productions = await ProductionModel.find()
    .populate({
      path: "product",
      populate: { path: "mainProductOP", select: "name" },
    })
    .populate({
      path: "product",
      populate: { path: "packageUnit", select: "name" },
    });

  res.status(200).json({ data: productions, itemsnumber: productions.length, status: 200 });
});


// 🟢 حذف طلب غير معتمد
exports.deletependingrequestByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الطلب", 400));

  const deleted = await ProductionRequestModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: deleted.product, qty: deleted.qty }],
    action: "delete-pending",
    note: `حذف طلب معلق ID=${id}`,
  });

  res.status(200).json({ message: "تم حذف الطلب المعلق", status: 200, data: deleted });
});


// 🟢 حذف إنتاج معتمد
exports.deleteaccpetedProductionByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ApiErrors("حدد ID الإنتاج", 400));

  const deleted = await ProductionModel.findOneAndDelete({ _id: id });
  if (!deleted) return next(new ApiErrors(`لا يوجد إنتاج بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: deleted.product[0], qty: deleted.qty }],
    action: "delete-production",
    note: `حذف إنتاج ID=${id}`,
  });

  res.status(200).json({ message: "تم حذف الإنتاج", status: 200, data: deleted });
});


// 🟢 تعديل كمية طلب معلق
exports.updatePendingRequestQtyByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (!id) return next(new ApiErrors("حدد ID الطلب", 400));
  if (qty === undefined) return next(new ApiErrors("حدد الكمية الجديدة", 400));

  const updated = await ProductionRequestModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return next(new ApiErrors(`لا يوجد طلب معلق بهذا ID: ${id}`, 404));

  await ProductionHistoryModel.create({
    items: [{ product: updated.product, qty }],
    action: "update-pending",
    note: `تعديل كمية الطلب المعلق ${id}`,
  });

  res.status(200).json({ message: "تم تعديل الطلب", status: 200, data: updated });
});


// 🟢 تعديل كمية إنتاج معتمد
exports.updateProductionQty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (qty < 0) return res.status(400).json({ message: "الكمية لا يمكن أن تكون سالبة" });

  const updated = await ProductionModel.findByIdAndUpdate(
    id,
    { qty },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "الإنتاج غير موجود" });

  await ProductionHistoryModel.create({
    items: [{ product: updated.product[0], qty }],
    action: "update-production",
    note: `تعديل إنتاج ID=${id}`,
  });

  res.status(200).json({ status: "success", data: updated });
});


// 🟢 تعديل آخر عملية إنتاج لمنتج معين
exports.updateLastProductionByProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { qty } = req.body;

  if (!productId) return next(new ApiErrors("حدد productId", 400));
  if (qty === undefined || isNaN(qty) || qty < 0) {
    return next(new ApiErrors("حدد كمية صحيحة", 400));
  }

  const lastProduction = await ProductionModel.findOne({ product: productId })
    .sort({ createdAt: -1 });

  if (!lastProduction) return next(new ApiErrors(`لا يوجد إنتاج للمنتج ${productId}`, 404));

  const oldQty = lastProduction.qty;
  lastProduction.qty = qty;
  await lastProduction.save();

  await ProductionHistoryModel.create({
    items: [{ product: productId, qty }],
    action: "update-last",
    note: `تعديل آخر عملية من ${oldQty} إلى ${qty}`,
  });

  res.status(200).json({
    message: "تم تعديل آخر عملية للمنتج",
    status: 200,
    data: lastProduction,
  });
});


// 🟢 حذف عملية من History + خصم تأثيرها من Production
exports.deleteHistoryAndSync = asyncHandler(async (req, res, next) => {
  const { historyId } = req.params;

  const history = await ProductionHistoryModel.findById(historyId);
  if (!history) {
    return next(new ApiErrors("History record not found", 404));
  }

  // خصم الكميات من الإنتاج
  for (const { product, qty } of history.items) {
    let prod = await ProductionModel.findOne({ product });
    if (prod) {
      prod.qty -= qty; // خصم الكمية
      if (prod.qty < 0) prod.qty = 0; // مايسمحش بالسالب
      await prod.save();
    }
  }

  await ProductionHistoryModel.findByIdAndDelete(historyId);

  res.status(200).json({
    message: "تم حذف العملية من History وتحديث Production",
    status: 200,
    deletedHistory: history,
  });
});
