const slugify = require("slugify");
const { TransactionModel } = require("../models/transactionModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const searchByname = require("../utils/searchBykeyword");
const { productModel } = require("../models/productModel"); // تأكد أنك مستدعي موديل المنتج
const { UserModel } = require("../models/userModel");
const { UnitModel } = require("../models/unitModel");
const { DepartmentModel } = require("../models/departmentModel");
const { SupplierModel } = require("../models/supplierModel");
const nodemailer = require("nodemailer");

const ExcelJS = require("exceljs");

// 📌 Get All Transactions
// Route >> GET /api/transaction/getAll
exports.getAllTransactions = asyncHandler(async (req, res) => {
  const filter = searchByname(req.query);
const allTransactions = await TransactionModel.find(filter)
  .populate({
    path: "productID",
    populate: [
      { path: "unit" },
      { path: "supplierAccepted" },
      { path: "mainProduct" }
    ]
  })
  .populate("userID")
  .populate("supplier")
  .lean();


  res.status(200).json({
    data: allTransactions,
    itemsnumber: allTransactions.length,
    status: 200,
  });
});

// 📌 Get Transaction By ID
// Route >> GET /api/transaction/:id
exports.getTransactionByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const transaction = await TransactionModel.findById(id)
    .populate("productID")
    .populate("userID")
    .populate("supplier");

  if (!transaction) {
    return next(new ApiErrors(`No transaction found with ID: ${id}`, 404));
  }

  res.status(200).json({ data: transaction, status: 200 });
});

// 📌 Add New Transaction
// Route >> POST /api/transaction/add

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {Object} product - بيانات المنتج
 * @param {string} product.name - اسم المنتج
 * @param {number} product.availableQuantity - الكمية المتاحة
 * @param {number} product.minQuantity - الحد الأدنى المطلوب
 * @returns {Promise<void>}
 */
async function sendLowQuantityEmail(product) {
  const emailTemplate = `
    🌟 <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #d9534f; text-align: center;">⚠️ تنبيه انخفاض الكمية</h2>
      
      <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-size: 16px;">مرحباً مدير المخازن،</p>
        
        <p style="font-size: 16px;">المنتج <strong>"${product.name}"</strong> كمية المخزون الحالية منخفضة.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">الكمية المتاحة حالياً</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: ${product.availableQuantity <= 0 ? "#d9534f" : "#f0ad4e"};">${product.availableQuantity}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">الحد الأدنى المطلوب</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${product.minQuantity}</td>
          </tr>
        </table>
        
        <p style="font-size: 16px; color: #d9534f; font-weight: bold;">يرجى إعادة التوريد في أقرب وقت لتجنب نفاذ الكمية.</p>
      </div>
      
      <div style="text-align: left; font-size: 14px; color: #777;">
        <p>مع تحيات،<br>نظام المخزون الذكي</p>
        <p style="font-size: 12px;">هذه رسالة آلية، لا ترد عليها</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"نظام المخزون الذكي" <inventory@example.com>',
    to: "niroelawady@gmail.com",
    subject: `🚨 تنبيه عاجل: انخفاض كمية ${product.name}`,
    text: `
مرحباً مدير المخازن،

المنتج "${product.name}" كمية المخزون الحالية منخفضة.

الكمية المتاحة حالياً: ${product.availableQuantity}
الحد الأدنى المطلوب: ${product.minQuantity}

يرجى إعادة التوريد في أقرب وقت لتجنب نفاذ الكمية.

مع تحيات،
نظام المخزون الذكي
    `.trim(),
    html: emailTemplate.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ [${new Date().toISOString()}] تم إرسال تنبيه انخفاض الكمية للمنتج "${product.name}" بنجاح.`,
    );
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] حدث خطأ أثناء إرسال تنبيه انخفاض الكمية للمنتج "${product.name}":`,
      error,
    );
    throw error; // إعادة رمي الخطأ للتعامل معه في المستوى الأعلى إذا لزم الأمر
  }
}
exports.addTransaction = asyncHandler(async (req, res, next) => {
  const {
    productID,
    type,
    quantity,
    userID,
    supplier,
    price,
    packSize,
    note,
    expiredDate
  } = req.body;

  if (!type || !userID) {
    return next(new ApiErrors("Type and UserID are required!", 400));
  }

  // ✅ تأكيد وجود المستخدم
  const user = await UserModel.findById(userID);
  if (!user) return next(new ApiErrors("User not found!", 404));

  // ✅ لو فيه supplier نتأكد من وجوده
  let supplierDoc = null;
  if (supplier) {
    supplierDoc = await SupplierModel.findById(supplier);
    if (!supplierDoc) return next(new ApiErrors("Supplier not found!", 404));
  }

  // ============ INEXIST ============
  if (type === "INEXIST") {
    if (!quantity || !price || !supplier) {
      return next(
        new ApiErrors("Quantity, Price and Supplier are required for INEXIST!", 400)
      );
    }

    const newTransaction = await TransactionModel.create({
      productID,
      type,
      quantity,
      price,
      expiredDate,
      userID,
      supplier,
      packSize: packSize || "لم يتم تحديد حجم العبوة",
      note,
    });

    return res.status(201).json({
      data: newTransaction,
      message: "INEXIST transaction created successfully",
    });
  }

  // ✅ باقي الحالات لازم productID
  if (!productID) {
    return next(new ApiErrors("ProductID is required for IN/OUT transactions!", 400));
  }

  const product = await productModel.findById(productID);
  if (!product) return next(new ApiErrors("Product not found!", 404));

  // ============ OUT ============
  if (type === "OUT") {
    if (!quantity || !supplier) {
      return next(
        new ApiErrors("Quantity and Supplier are required for OUT!", 400)
      );
    }

    // هنا تقدر تضيف شرط الخصم من الكمية لو محتاج
    // if (product.availableQuantity < quantity) {
    //   return next(
    //     new ApiErrors(`Not enough stock, available: ${product.availableQuantity}`, 400)
    //   );
    // }
    // product.availableQuantity -= Number(quantity);
    // await product.save();
  }

  // ============ IN ============
  if (type === "IN") {
    // هنا تقدر تزود الكمية لو حابب
    // const q = quantity ? Number(quantity) : 0;
    // product.availableQuantity += q;
    // await product.save();

    if (product.availableQuantity <= product.minQuantity) {
      await sendLowQuantityEmail(product);
    }
  }

  // ✅ تسجيل العملية
  const newTransaction = await TransactionModel.create({
    productID,
    type,
    quantity: quantity || 0,
    userID,
    supplier,
    price: price || 0,
    packSize: packSize || 1,
    note,
  });

  res.status(201).json({
    data: newTransaction,
    message: "Transaction created successfully",
  });
});

//add tran in not inc for product
exports.addTransactionwhenaddNewProduct = asyncHandler(
  async (req, res, next) => {
    const { productID, type, quantity, userID, unit, department } = req.body;

    // تحقق من الحقول المطلوبة (quantity ممكن تكون صفر أو مفقودة فقط لو type هو "IN")
    if (!productID || !type || !userID || !unit || !department) {
      return next(new ApiErrors("All required fields must be provided!", 400));
    }

    // تحقق من وجود الكيانات في قواعد البيانات
    const [product, user, unitDoc, departmentDoc] = await Promise.all([
      productModel.findById(productID),
      UserModel.findById(userID),
      UnitModel.findById(unit),
      DepartmentModel.findById(department),
    ]);

    if (!product) return next(new ApiErrors("Product not found!", 404));
    if (!user) return next(new ApiErrors("User not found!", 404));
    if (!unitDoc) return next(new ApiErrors("Unit not found!", 404));
    if (!departmentDoc)
      return next(new ApiErrors("Department not found!", 404));

    if (type === "IN") {
      // فقط نزود الكمية إذا كانت quantity موجودة وأكبر من صفر
      if (quantity && quantity > 0) {
        // إذا الكمية وصلت للحد الأدنى أو أقل، ابعت إيميل تنبيه
        if (product.availableQuantity <= product.minQuantity) {
          await sendLowQuantityEmail(product);
        }
      }
    } else if (type === "OUT") {
      // تحقق من quantity > 0
      if (!quantity || quantity <= 0) {
        return next(
          new ApiErrors(
            "Quantity must be greater than zero for OUT transactions",
            400,
          ),
        );
      }
      if (product.availableQuantity < quantity) {
        return next(
          new ApiErrors(
            `You can't be OUT, available quantity is only ${product.availableQuantity}`,
            400,
          ),
        );
      }
      // product.availableQuantity -= quantity;

      // إذا الكمية وصلت للحد الأدنى أو أقل، ابعت إيميل تنبيه
      if (product.availableQuantity <= product.minQuantity) {
        await sendLowQuantityEmail(product);
      }
    } else {
      return next(new ApiErrors("Invalid transaction type", 400));
    }

    // إنشاء المعاملة
    const newTransaction = await TransactionModel.create({
      ...req.body,
    });

    res.status(200).json({
      data: newTransaction,
      message: "Transaction added successfully!",
      status: 200,
    });
  },
);

// 📌 Update Transaction
// Route >> PUT /api/transaction/:id
exports.updateTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedTransaction = await TransactionModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTransaction) {
    return next(new ApiErrors(`No transaction found with ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Transaction updated successfully!",
    status: 200,
    data: updatedTransaction,
  });
});

// 📌 Delete Transaction
// Route >> DELETE /api/transaction/:id
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedTransaction = await TransactionModel.findByIdAndDelete(id);

  if (!deletedTransaction) {
    return next(new ApiErrors(`No transaction found with ID: ${id}`, 404));
  }

  res.status(200).json({
    message: "Transaction deleted successfully!",
    status: 200,
    data: deletedTransaction,
  });
});

/*
exports.exportTransactionToExcel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await TransactionModel.findById(id)
    .populate("productID")
    .populate("unit")
    .populate("department")
    .populate("userID");

  if (!transaction) {
    return next(new ApiErrors(`No transaction found with ID: ${id}`, 404));
  }

  // إنشاء ملف Excel جديد
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transaction Details');

  // إعداد رؤوس الأعمدة
  worksheet.columns = [
    { header: 'الحقل', key: 'field', width: 30 },
    { header: 'القيمة', key: 'value', width: 50 },
  ];

  // بيانات المعاملة التي تريد عرضها
  const data = [
    { field: 'معرف المعاملة', value: transaction._id.toString() },
    { field: 'نوع العملية', value: transaction.type },
    { field: 'الكمية', value: transaction.quantity },
    { field: 'المنتج', value: transaction.productID ? transaction.productID.name : 'غير موجود' },
    { field: 'الوحدة', value: transaction.unit ? transaction.unit.name : 'غير موجود' },
    { field: 'القسم', value: transaction.department ? transaction.department.name : 'غير موجود' },
    { field: 'المستخدم', value: transaction.userID ? transaction.userID.name : 'غير موجود' },
    { field: 'تاريخ العملية', value: transaction.createdAt ? transaction.createdAt.toISOString().split('T')[0] : '' },
  ];

  // إضافة البيانات إلى الورقة
  data.forEach(item => {
    worksheet.addRow(item);
  });

  // تهيئة ملف الإكسل للتحميل
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=transaction_${id}.xlsx`
  );

  // كتابة ملف الإكسل إلى الـ response
  await workbook.xlsx.write(res);

  // إنهاء الاستجابة
  res.end();
});

exports.exportAllTransactionsToExcel = asyncHandler(async (req, res, next) => {
  const transactions = await TransactionModel.find()
    .populate("productID")
    .populate("unit")
    .populate("department")
    .populate("userID");

  if (!transactions || transactions.length === 0) {
    return next(new ApiErrors(`لا توجد أي عمليات متاحة للتصدير`, 404));
  }

  // إنشاء ملف Excel جديد
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('All Transactions');

  // إعداد رؤوس الأعمدة
  worksheet.columns = [
    { header: 'معرف المعاملة', key: 'id', width: 25 },
    { header: 'نوع العملية', key: 'type', width: 20 },
    { header: 'الكمية', key: 'quantity', width: 15 },
    { header: 'المنتج', key: 'product', width: 25 },
    { header: 'الوحدة', key: 'unit', width: 20 },
    { header: 'القسم', key: 'department', width: 20 },
    { header: 'المستخدم', key: 'user', width: 25 },
    { header: 'تاريخ العملية', key: 'date', width: 20 },
  ];

  // إضافة المعاملات كسطور في الجدول
  transactions.forEach(tx => {
    worksheet.addRow({
      id: tx._id.toString(),
      type: tx.type=="OUT"?"اخراج":"ادخال",
      quantity: tx.quantity,
      product: tx.productID ? tx.productID.name : 'غير موجود',
      unit: tx.unit ? tx.unit.name : 'غير موجود',
      department: tx.department ? tx.department.name : 'غير موجود',
      user: tx.userID ? tx.userID.name : 'غير موجود',
      date: tx.createdAt ? tx.createdAt.toISOString().split('T')[0] : '',
    });
  });

  // تهيئة ملف الإكسل للتحميل
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=all_transactions.xlsx`
  );

  // كتابة ملف الإكسل إلى الـ response
  await workbook.xlsx.write(res);
  res.end();
});
*/

exports.exportTransactionToExcel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await TransactionModel.findById(id)
    .populate("productID")
    .populate("unit")
    .populate("department")
    .populate("userID");

  if (!transaction) {
    return next(new ApiErrors(`No transaction found with ID: ${id}`, 404));
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transaction Details");

  worksheet.columns = [
    { header: "الحقل", key: "field", width: 30 },
    { header: "القيمة", key: "value", width: 50 },
  ];

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("ar-EG", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const data = [
    { field: "معرف المعاملة", value: transaction._id.toString() },
    { field: "نوع العملية", value: transaction.type },
    { field: "الكمية", value: transaction.quantity },
    {
      field: "المنتج",
      value: transaction.productID ? transaction.productID.name : "غير موجود",
    },
    {
      field: "الوحدة",
      value: transaction.unit ? transaction.unit.name : "غير موجود",
    },
    {
      field: "القسم",
      value: transaction.department ? transaction.department.name : "غير موجود",
    },
    {
      field: "المستخدم",
      value: transaction.userID ? transaction.userID.name : "غير موجود",
    },
    {
      field: "تاريخ ووقت العملية",
      value: transaction.createdAt ? formatDateTime(transaction.createdAt) : "",
    },
  ];

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=transaction_${id}.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.end();
});

exports.exportAllTransactionsToExcel = asyncHandler(async (req, res, next) => {
  const transactions = await TransactionModel.find()
    .populate("productID")
    .populate("unit")
    .populate("department")
    .populate("userID");

  if (!transactions || transactions.length === 0) {
    return next(new ApiErrors(`لا توجد أي عمليات متاحة للتصدير`, 404));
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Transactions");

  worksheet.columns = [
    { header: "معرف المعاملة", key: "id", width: 25 },
    { header: "نوع العملية", key: "type", width: 20 },
    { header: "الكمية", key: "quantity", width: 15 },
    { header: "المنتج", key: "product", width: 25 },
    { header: "الوحدة", key: "unit", width: 20 },
    { header: "القسم", key: "department", width: 20 },
    { header: "المستخدم", key: "user", width: 25 },
    { header: "تاريخ ووقت العملية", key: "date", width: 25 },
  ];

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("ar-EG", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  transactions.forEach((tx) => {
    worksheet.addRow({
      id: tx._id.toString(),
      type: tx.type === "OUT" ? "اخراج" : "ادخال",
      quantity: tx.quantity,
      product: tx.productID ? tx.productID.name : "غير موجود",
      unit: tx.unit ? tx.unit.name : "غير موجود",
      department: tx.department ? tx.department.name : "غير موجود",
      user: tx.userID ? tx.userID.name : "غير موجود",
      date: tx.createdAt ? formatDateTime(tx.createdAt) : "",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=all_transactions.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.end();
});
