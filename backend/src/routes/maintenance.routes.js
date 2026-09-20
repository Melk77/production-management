const express = require("express");
const router = express.Router();

const {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
  getMachineMaintenance,
  getScheduledMaintenance,
  getCompletedMaintenance,
} = require("../controllers/maintenance.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateMaintenance } = require("../middleware/validate");

// Read — any authenticated user
router.get("/", protect, getAllMaintenance);
router.get("/scheduled", protect, getScheduledMaintenance);
router.get("/completed", protect, getCompletedMaintenance);
router.get("/machine/:machineId", protect, getMachineMaintenance);
router.get("/:id", protect, getMaintenanceById);

// Write — managers and admins can create/update/complete; only admin can delete
router.post("/", protect, allowRoles("admin", "manager"), validateMaintenance, createMaintenance);
router.put("/:id", protect, allowRoles("admin", "manager"), validateMaintenance, updateMaintenance);
router.delete("/:id", protect, adminOnly, deleteMaintenance);
router.put("/:id/complete", protect, allowRoles("admin", "manager"), completeMaintenance);

module.exports = router;


