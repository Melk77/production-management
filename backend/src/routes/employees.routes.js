const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employee.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { validateEmployee, validateDepartment, validateShift } = require("../middleware/validate");

// Departments (must be before /:id to avoid conflict)
router.get("/departments/all", protect, ctrl.getAllDepartments);
router.get("/departments/:id", protect, ctrl.getDepartmentById);
router.post("/departments", protect, adminOnly, validateDepartment, ctrl.createDepartment);
router.put("/departments/:id", protect, adminOnly, validateDepartment, ctrl.updateDepartment);
router.delete("/departments/:id", protect, adminOnly, ctrl.deleteDepartment);

// Shifts
router.get("/shifts/all", protect, ctrl.getAllShifts);
router.post("/shifts", protect, adminOnly, validateShift, ctrl.createShift);
router.put("/shifts/:id", protect, adminOnly, validateShift, ctrl.updateShift);
router.delete("/shifts/:id", protect, adminOnly, ctrl.deleteShift);

// Employees
router.get("/", protect, ctrl.getAllEmployees);
router.get("/:id", protect, ctrl.getEmployeeById);
router.post("/", protect, adminOnly, validateEmployee, ctrl.createEmployee);
router.put("/:id", protect, adminOnly, validateEmployee, ctrl.updateEmployee);
router.delete("/:id", protect, adminOnly, ctrl.deleteEmployee);

module.exports = router;

