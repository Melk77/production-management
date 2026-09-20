const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/product.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { validateProduct } = require("../middleware/validate");

// BOM item routes (must come before /:id)
router.put("/bom/:bomId",    protect, allowRoles("admin", "manager"), ctrl.updateBOMItem);
router.delete("/bom/:bomId", protect, allowRoles("admin", "manager"), ctrl.deleteBOMItem);

// Product routes — read: any authenticated; write: manager+ only
router.get("/",    protect, ctrl.getAllProducts);
router.get("/:id", protect, ctrl.getProductById);
router.post("/",   protect, allowRoles("admin", "manager"), validateProduct, ctrl.createProduct);
router.put("/:id", protect, allowRoles("admin", "manager"), validateProduct, ctrl.updateProduct);
router.delete("/:id", protect, allowRoles("admin", "manager"), ctrl.deleteProduct);

// Product BOM routes
router.get("/:productId/bom",  protect, ctrl.getBOM);
router.post("/:productId/bom", protect, allowRoles("admin", "manager"), ctrl.addBOMItem);

module.exports = router;

