const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/salesOrder.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateSalesOrder, validateSalesOrderItem } = require("../middleware/validate");

// Read — any authenticated user
router.get("/",    protect, ctrl.getAllSalesOrders);
router.get("/:id", protect, ctrl.getSalesOrderById);

// Write — procurement and managers+
router.post("/",           protect, allowRoles("admin", "manager", "procurement"), validateSalesOrder, ctrl.createSalesOrder);
router.post("/:id/items",  protect, allowRoles("admin", "manager", "procurement"), validateSalesOrderItem, ctrl.addSalesOrderItem);
router.put("/:id/status",  protect, allowRoles("admin", "manager", "procurement"), ctrl.updateSalesOrderStatus);
router.delete("/:id",      protect, adminOnly, ctrl.deleteSalesOrder);

module.exports = router;

