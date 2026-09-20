const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/customer.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateCustomer } = require("../middleware/validate");

// Read — any authenticated user
router.get("/",    protect, ctrl.getAllCustomers);
router.get("/:id", protect, ctrl.getCustomerById);

// Write — procurement officers, managers, and admins can create/update
router.post("/",      protect, allowRoles("admin", "manager", "procurement"), validateCustomer, ctrl.createCustomer);
router.put("/:id",    protect, allowRoles("admin", "manager", "procurement"), validateCustomer, ctrl.updateCustomer);

// Destructive — admin only
router.delete("/:id", protect, adminOnly, ctrl.deleteCustomer);

module.exports = router;


