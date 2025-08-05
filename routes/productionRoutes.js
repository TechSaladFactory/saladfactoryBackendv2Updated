const express = require("express");
const router = express.Router();


const {
    sendProductionRequests,
    approveSelectedProductionRequests,
    getPendingProductionRequests,
    getApprovedProductions,
    deletependingrequestByID,
    deleteaccpetedProductionByID,
    updatePendingRequestQtyByID,
    updateProductionQty
  } = require("../services/productionServices");

// المستخدم يرسل طلبات
router.route("/request").post( sendProductionRequests);

// المشرف يعتمد طلب
router.route("/approve").post( approveSelectedProductionRequests);

// عرض الطلبات المعلقة
router.route("/requests/pending").get(getPendingProductionRequests);


router.route("/refusePendingRequest/:id").delete(deletependingrequestByID)
router.route("/refuseacceptedRequest/:id").delete(deleteaccpetedProductionByID)
router.route("/updateQty/:id").put(updatePendingRequestQtyByID)
router.route("/Qtyproduction/:id").put(updateProductionQty)

// عرض المنتجات المعتمدة (اختياري)
router.route("/approved").get(getApprovedProductions);

module.exports = router;
