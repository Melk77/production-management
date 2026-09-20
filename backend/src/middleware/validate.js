/**
 * validate.js
 * Reusable request-body validation middleware.
 * Each exported function validates a specific resource and
 * returns 400 with a descriptive message if validation fails.
 */

/** Helper: collect missing required fields */
function missing(body, fields) {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
}

// ─── Auth ────────────────────────────────────────────────────────────────────

const validateLogin = (req, res, next) => {
  const absent = missing(req.body, ["email", "password"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email))
    return res.status(400).json({ message: "Invalid email format" });
  next();
};

// ─── Users ───────────────────────────────────────────────────────────────────

const validateUser = (req, res, next) => {
  const absent = missing(req.body, ["name", "email", "role"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  const validRoles = ["admin", "manager", "operator", "inspector", "procurement", "warehouse"];
  if (!validRoles.includes(req.body.role))
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email))
    return res.status(400).json({ message: "Invalid email format" });
  next();
};

// ─── Employees ───────────────────────────────────────────────────────────────

const validateEmployee = (req, res, next) => {
  const absent = missing(req.body, ["user_id", "department_id", "position", "hire_date"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

const validateDepartment = (req, res, next) => {
  const absent = missing(req.body, ["name"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

const validateShift = (req, res, next) => {
  const absent = missing(req.body, ["name", "start_time", "end_time"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

// ─── Products ────────────────────────────────────────────────────────────────

const validateProduct = (req, res, next) => {
  const absent = missing(req.body, ["name", "sku"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (req.body.unit_price !== undefined && Number(req.body.unit_price) < 0)
    return res.status(400).json({ message: "unit_price must be >= 0" });
  next();
};

// ─── Work Orders ─────────────────────────────────────────────────────────────

const validateWorkOrder = (req, res, next) => {
  const absent = missing(req.body, ["product_id", "machine_id", "employee_id", "quantity_to_produce"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (Number(req.body.quantity_to_produce) <= 0)
    return res.status(400).json({ message: "quantity_to_produce must be > 0" });
  const validPriorities = ["low", "normal", "high", "urgent"];
  if (req.body.priority && !validPriorities.includes(req.body.priority))
    return res.status(400).json({ message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` });
  next();
};

const validateProductionRecord = (req, res, next) => {
  const absent = missing(req.body, ["work_order_id", "employee_id", "quantity_produced"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (Number(req.body.quantity_produced) <= 0)
    return res.status(400).json({ message: "quantity_produced must be > 0" });
  const defective = Number(req.body.quantity_defective ?? 0);
  if (defective < 0)
    return res.status(400).json({ message: "quantity_defective must be >= 0" });
  if (defective > Number(req.body.quantity_produced))
    return res.status(400).json({ message: "quantity_defective cannot exceed quantity_produced" });
  next();
};

// ─── Inventory ───────────────────────────────────────────────────────────────

const validateMaterial = (req, res, next) => {
  const absent = missing(req.body, ["name", "unit", "supplier_id"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (req.body.stock_qty !== undefined && Number(req.body.stock_qty) < 0)
    return res.status(400).json({ message: "stock_qty must be >= 0" });
  if (req.body.reorder_level !== undefined && Number(req.body.reorder_level) < 0)
    return res.status(400).json({ message: "reorder_level must be >= 0" });
  next();
};

const validateMaterialReceipt = (req, res, next) => {
  const absent = missing(req.body, ["material_id", "supplier_id", "quantity", "unit"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (Number(req.body.quantity) <= 0)
    return res.status(400).json({ message: "quantity must be > 0" });
  next();
};

// ─── Quality ─────────────────────────────────────────────────────────────────

const validateInspection = (req, res, next) => {
  const absent = missing(req.body, ["work_order_id", "inspector_id", "result"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  const validResults = ["pass", "fail", "rework"];
  if (!validResults.includes(req.body.result))
    return res.status(400).json({ message: `Invalid result. Must be one of: ${validResults.join(", ")}` });
  next();
};

// ─── Maintenance ─────────────────────────────────────────────────────────────

const validateMaintenance = (req, res, next) => {
  const absent = missing(req.body, ["machine_id", "employee_id", "type", "maintenance_date"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  const validTypes = ["preventive", "corrective"];
  if (!validTypes.includes(req.body.type))
    return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
  if (req.body.cost !== undefined && Number(req.body.cost) < 0)
    return res.status(400).json({ message: "cost must be >= 0" });
  next();
};

// ─── Suppliers ───────────────────────────────────────────────────────────────

const validateSupplier = (req, res, next) => {
  const absent = missing(req.body, ["name"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

// ─── Customers ───────────────────────────────────────────────────────────────

const validateCustomer = (req, res, next) => {
  const absent = missing(req.body, ["name"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

// ─── Purchase Orders ─────────────────────────────────────────────────────────

const validatePurchaseOrder = (req, res, next) => {
  const absent = missing(req.body, ["supplier_id", "order_date"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

const validatePurchaseOrderItem = (req, res, next) => {
  const absent = missing(req.body, ["material_id", "quantity", "unit_price"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (Number(req.body.quantity) <= 0)
    return res.status(400).json({ message: "quantity must be > 0" });
  if (Number(req.body.unit_price) < 0)
    return res.status(400).json({ message: "unit_price must be >= 0" });
  next();
};

// ─── Sales Orders ────────────────────────────────────────────────────────────

const validateSalesOrder = (req, res, next) => {
  const absent = missing(req.body, ["customer_id", "order_date"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  next();
};

const validateSalesOrderItem = (req, res, next) => {
  const absent = missing(req.body, ["product_id", "quantity", "unit_price"]);
  if (absent.length)
    return res.status(400).json({ message: `Missing required fields: ${absent.join(", ")}` });
  if (Number(req.body.quantity) <= 0)
    return res.status(400).json({ message: "quantity must be > 0" });
  if (Number(req.body.unit_price) < 0)
    return res.status(400).json({ message: "unit_price must be >= 0" });
  next();
};

module.exports = {
  validateLogin,
  validateUser,
  validateEmployee,
  validateDepartment,
  validateShift,
  validateProduct,
  validateWorkOrder,
  validateProductionRecord,
  validateMaterial,
  validateMaterialReceipt,
  validateInspection,
  validateMaintenance,
  validateSupplier,
  validateCustomer,
  validatePurchaseOrder,
  validatePurchaseOrderItem,
  validateSalesOrder,
  validateSalesOrderItem,
};
