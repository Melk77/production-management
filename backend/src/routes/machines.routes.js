const express = require("express");

const router = express.Router();

const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  updateMachineStatus,
  getMachinesByStatus,
} = require("../controllers/machine.controller");

const { validateMachine } = require("../middleware/validateMachine");
const { protect, authorize } = require("../middleware/auth.middleware");

// View machines
router.get("/", protect, getAllMachines);

router.get("/status/:status", protect, getMachinesByStatus);

router.get("/:id", protect, getMachineById);

// Manager + Admin
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  validateMachine,
  createMachine,
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  validateMachine,
  updateMachine,
);

// Admin only
router.delete("/:id", protect, authorize("admin"), deleteMachine);

// Manager + Admin
router.put(
  "/:id/status",
  protect,
  authorize("admin", "manager"),
  updateMachineStatus,
);

module.exports = router;
