const express = require("express");

const {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  addProductionRecord,
  getProductionRecords,
  addMaterialConsumption,
  addDowntime,
  getDowntimeRecords,
} = require("../controllers/production.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateWorkOrder, validateProductionRecord } = require("../middleware/validate");

const router = express.Router();

// Any authenticated user can read work orders
router.get("/work-orders", protect, getAllWorkOrders);
router.get("/work-orders/:id", protect, getWorkOrderById);
router.get("/work-orders/:workOrderId/production-records", protect, getProductionRecords);
router.get("/work-orders/:workOrderId/downtime", protect, getDowntimeRecords);

// Only managers and admins can create / update work orders
router.post("/work-orders", protect, allowRoles("admin", "manager"), validateWorkOrder, createWorkOrder);
router.put("/work-orders/:id", protect, allowRoles("admin", "manager"), validateWorkOrder, updateWorkOrder);
router.delete("/work-orders/:id", protect, adminOnly, deleteWorkOrder);

// Operators and managers can start / complete / record production
router.post("/work-orders/:id/start", protect, allowRoles("admin", "manager", "operator"), startWorkOrder);
router.post("/work-orders/:id/complete", protect, allowRoles("admin", "manager", "operator"), completeWorkOrder);
router.post("/production-records", protect, allowRoles("admin", "manager", "operator"), validateProductionRecord, addProductionRecord);
router.post("/material-consumption", protect, allowRoles("admin", "manager", "operator", "warehouse"), addMaterialConsumption);
router.post("/downtime", protect, allowRoles("admin", "manager", "operator"), addDowntime);

module.exports = router;

