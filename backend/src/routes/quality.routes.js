const express = require("express");
const router = express.Router();

const {
  getAllInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  getInspectionsByWorkOrder,
  getInspectionsByResult,
  getFailedInspections,
  getReworkInspections,
} = require("../controllers/quality.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateInspection } = require("../middleware/validate");

// Read — any authenticated user
router.get("/", protect, getAllInspections);
router.get("/work-order/:workOrderId", protect, getInspectionsByWorkOrder);
router.get("/result/:result", protect, getInspectionsByResult);
router.get("/failed", protect, getFailedInspections);
router.get("/rework", protect, getReworkInspections);
router.get("/:id", protect, getInspectionById);

// Write — inspectors and admins can create/update; only admin can delete
router.post("/", protect, allowRoles("admin", "inspector"), validateInspection, createInspection);
router.put("/:id", protect, allowRoles("admin", "inspector"), validateInspection, updateInspection);
router.delete("/:id", protect, adminOnly, deleteInspection);

module.exports = router;


