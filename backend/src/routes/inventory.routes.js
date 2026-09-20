const express = require("express");
const {
  getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial,
  getLowStockMaterials, receiveMaterial, getMaterialReceipts,
  checkMaterialReceipt, acceptMaterialReceipt, rejectMaterialReceipt, getStockMovements,
} = require("../controllers/inventory.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateMaterial, validateMaterialReceipt } = require("../middleware/validate");
const router = express.Router();

// Read — any authenticated user
router.get("/materials",           protect, getAllMaterials);
router.get("/materials/low-stock", protect, getLowStockMaterials);
router.get("/materials/:id",       protect, getMaterialById);
router.get("/receipts",            protect, getMaterialReceipts);
router.get("/movements",           protect, getStockMovements);

// Write — warehouse staff and admins only
router.post("/materials",      protect, allowRoles("admin", "warehouse"), validateMaterial, createMaterial);
router.put("/materials/:id",   protect, allowRoles("admin", "warehouse"), validateMaterial, updateMaterial);
router.delete("/materials/:id",protect, allowRoles("admin", "warehouse"), deleteMaterial);
router.post("/receipts",                   protect, allowRoles("admin", "warehouse"), validateMaterialReceipt, receiveMaterial);
router.post("/receipts/:id/check",         protect, allowRoles("admin", "warehouse"), checkMaterialReceipt);
router.post("/receipts/:id/accept",        protect, allowRoles("admin", "warehouse"), acceptMaterialReceipt);
router.post("/receipts/:id/reject",        protect, allowRoles("admin", "warehouse"), rejectMaterialReceipt);

module.exports = router;

