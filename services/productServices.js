const { default: slugify } = require("slugify");
const { productModel } = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const ExcelJS = require("exceljs");

//Get All products
//roure >> Get Method
// /api/product/getAll
exports.getproduct = asyncHandler(async (req, res) => {
  const allproduct = await productModel
    .find({})
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });
  res.status(200).json({
    data: allproduct,
    itemsnumber: allproduct.length,
    status: 200,
  });
});
//Get Special Category By id
//roure >> Get Method
// /api/product/id
exports.getSpecialproductByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const productByid = await productModel
    .findById({ _id: id })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (!productByid) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }

  res.status(200).json({ data: productByid, status: 200 });
});
//create new category
//roure >> Post Method
// /api/product/addcategory
exports.addproduct = asyncHandler(async (req, res, next) => {
  const { name, bracode, availableQuantity, unit, supplierAccepted } = req.body;

  if (name === undefined) {
    return next(new ApiErrors(`name are required !`, 404));
  } else if (name === "") {
    return next(new ApiErrors(`name must not be empty !`, 404));
  } else {
    const productresponse = await productModel.create({
      name,
      slug: slugify(name),
      bracode,
      availableQuantity,
      unit,
      supplierAccepted,
    });

    res.status(200).json({
      data: productresponse,
      message: "product is added successfully !",
      status: 200,
    });
  }
});

//Update to Special product
//roure >> Update Method
// /api/product/id
exports.updateproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, bracode, availableQuantity, unit, supplierAccepted } = req.body;

  if (!req.file || req.file === undefined || req.file === "") {
    const productAfterUpdated = await productModel
      .findOneAndUpdate(
        { _id: id },
        {
          name,
          slug: slugify(name),
          bracode,
          availableQuantity,
          unit,
          supplierAccepted,
        },
        { new: true },
      )
      .populate({ path: "unit", select: "name" })
      .populate({ path: "supplierAccepted", select: "name" });
    console.log(11);
    if (productAfterUpdated) {
      res.status(200).json({
        message: "product name is updated successfully !",
        status: 200,
        data: productAfterUpdated,
      });
    }
    if (!productAfterUpdated) {
      return next(
        new ApiErrors(`No product found for this productID: ${id} !`, 404),
      );
    }
  } else {
    const image = await uploadImage(req, "products", next);
    console.log(name);
    const productAfterUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      { name, slug: slugify(name), image },
      { new: true },
    );

    if (name === undefined) {
      return next(new ApiErrors("product name required !", 404));
    } else if (name === "") {
      return next(new ApiErrors(`product name is empty !`, 404));
    } else {
      if (!productAfterUpdated) {
        return next(
          new ApiErrors(`No product found for this productID: ${id} !`, 404),
        );
      }

      if (productAfterUpdated) {
        res.status(200).json({
          message: "product name is updated successfully !",
          status: 200,
          data: productAfterUpdated,
        });
      }
      if (!productAfterUpdated) {
        return next(
          new ApiErrors(`No product found for this productID: ${id} !`, 404),
        );
      }
    }
  }
});

//Delete product
//roure >> Delete Method
// /api/product/id

exports.deleteproductByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedproduct = await productModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("set product ID !", 404));
  } else {
    if (!deletedproduct) {
      return next(
        new ApiErrors(`No product found for this productID: ${id} !`, 404),
      );
    }

    res.status(200).json({
      message: "product is deleted successfully !",
      status: 200,
      data: deletedproduct,
    });
  }
});

//update minQty

exports.minQty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { minQuantity } = req.body;

  if (!minQuantity || minQuantity === undefined || minQuantity === "") {
    new ApiErrors(`minQuantity is required !`, 404);
  }
  const productAfterUpdated = await productModel
    .findOneAndUpdate({ _id: id }, { minQuantity }, { new: true })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });
  console.log(11);
  if (productAfterUpdated) {
    res.status(200).json({
      message: "product minQuantity is updated successfully !",
      status: 200,
      data: productAfterUpdated,
    });
  }
  if (!productAfterUpdated) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }
});

exports.productByBarCode = asyncHandler(async (req, res, next) => {
  const { bracode } = req.body;
  if (!bracode) {
    return next(new ApiErrors("Barcode is required", 400));
  }

  const product = await productModel
    .findOne({ bracode })
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (!product) {
    return next(
      new ApiErrors(`No product found for this barcode: ${bracode} !`, 404),
    );
  }

  res.status(200).json({ data: product, status: 200 });
});

exports.downloadProductByIdExcel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productModel
    .findById(id)
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (!product) {
    return next(
      new ApiErrors(`No product found for this productID: ${id} !`, 404),
    );
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Product Details");

  worksheet.columns = [
    { header: "المنتج", key: "name", width: 30 },
    { header: "الباركود", key: "bracode", width: 20 },
    { header: "الكمية المتاحة", key: "availableQuantity", width: 20 },
    { header: "الحد الادني", key: "minQuantity", width: 20 },
    { header: "وحدة القياس", key: "unit", width: 20 },
    { header: "المورد", key: "supplier", width: 30 },
    { header: "تم الانشاء", key: "createdAt", width: 25 },
  ];

  worksheet.addRow({
    name: product.name,
    bracode: product.bracode,
    availableQuantity: product.availableQuantity,
    minQuantity: product.minQuantity || "",
    unit: product.unit?.name || "",
    supplier: product.supplierAccepted?.name || "",
    createdAt: product.createdAt.toISOString().slice(0, 19).replace("T", " "),
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=product_${id}.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.status(200).end();
});

exports.downloadAllProductsExcel = asyncHandler(async (req, res, next) => {
  const allProducts = await productModel
    .find({})
    .populate({ path: "unit", select: "name" })
    .populate({ path: "supplierAccepted", select: "name" });

  if (allProducts.length === 0) {
    return next(new ApiErrors("لا يوجد منتجات حالياً.", 404));
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Products");

  worksheet.columns = [
    { header: "المنتج", key: "name", width: 30 },
    { header: "الباركود", key: "bracode", width: 20 },
    { header: "الكمية المتاحة", key: "availableQuantity", width: 20 },
    { header: "الحد الأدنى", key: "minQuantity", width: 20 },
    { header: "وحدة القياس", key: "unit", width: 20 },
    { header: "المورد", key: "supplier", width: 30 },
    { header: "تاريخ الإنشاء", key: "createdAt", width: 25 },
  ];

  allProducts.forEach((product) => {
    worksheet.addRow({
      name: product.name,
      bracode: product.bracode || "",
      availableQuantity: product.availableQuantity || "",
      minQuantity: product.minQuantity || "",
      unit: product.unit?.name || "",
      supplier: product.supplierAccepted?.name || "",
      createdAt:
        product.createdAt?.toISOString().slice(0, 19).replace("T", " ") || "",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=all_products.xlsx",
  );

  await workbook.xlsx.write(res);
  res.status(200).end();
});
