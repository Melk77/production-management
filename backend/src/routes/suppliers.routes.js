const express = require("express");
const router = express.Router();

const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  getSupplierMaterials,
  getSupplierPurchaseOrders,
} = require("../controllers/supplier.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateSupplier } = require("../middleware/validate");

// Read — any authenticated user
router.get("/", protect, getAllSuppliers);
router.get("/search", protect, searchSuppliers);
router.get("/:id/materials", protect, getSupplierMaterials);
router.get("/:id/purchase-orders", protect, getSupplierPurchaseOrders);
router.get("/:id", protect, getSupplierById);

// Write — procurement officers, managers, and admins can create/update
router.post("/", protect, allowRoles("admin", "manager", "procurement"), validateSupplier, createSupplier);
router.put("/:id", protect, allowRoles("admin", "manager", "procurement"), validateSupplier, updateSupplier);

// Destructive — admin only
router.delete("/:id", protect, adminOnly, deleteSupplier);

module.exports = router;


