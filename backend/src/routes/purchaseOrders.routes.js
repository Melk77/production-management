const express = require("express");
const router = express.Router();

const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,

  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,

  calculatePurchaseOrderTotal,

  orderPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,

  getPurchaseOrdersByStatus,
  getPurchaseOrdersBySupplier,
} = require("../controllers/purchaseOrder.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validatePurchaseOrder, validatePurchaseOrderItem } = require("../middleware/validate");

// Read — any authenticated user
router.get("/", protect, getAllPurchaseOrders);
router.get("/status/:status", protect, getPurchaseOrdersByStatus);
router.get("/supplier/:supplierId", protect, getPurchaseOrdersBySupplier);
router.get("/:id", protect, getPurchaseOrderById);
router.get("/:id/total", protect, allowRoles("admin", "manager", "procurement"), calculatePurchaseOrderTotal);

// Write — procurement officers, managers, and admins can create/update
router.post("/", protect, allowRoles("admin", "manager", "procurement"), validatePurchaseOrder, createPurchaseOrder);
router.put("/:id", protect, allowRoles("admin", "manager", "procurement"), validatePurchaseOrder, updatePurchaseOrder);
router.post("/:id/items", protect, allowRoles("admin", "manager", "procurement"), validatePurchaseOrderItem, addPurchaseOrderItem);
router.put("/items/:itemId", protect, allowRoles("admin", "manager", "procurement"), validatePurchaseOrderItem, updatePurchaseOrderItem);

// Status transitions — managers and admins
router.put("/:id/order", protect, allowRoles("admin", "manager", "procurement"), orderPurchaseOrder);
router.put("/:id/receive", protect, allowRoles("admin", "manager", "warehouse"), receivePurchaseOrder);

// Destructive — admin only
router.delete("/:id", protect, adminOnly, deletePurchaseOrder);
router.delete("/items/:itemId", protect, adminOnly, deletePurchaseOrderItem);
router.put("/:id/cancel", protect, adminOnly, cancelPurchaseOrder);

module.exports = router;


