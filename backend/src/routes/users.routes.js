const express = require("express");

const {
  getAllUsers,
  getUserById,
  getMe,
  updateMe,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const { validateUser } = require("../middleware/validate");

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);

router.post("/", protect, adminOnly, validateUser, createUser);
router.put("/:id", protect, adminOnly, validateUser, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;

