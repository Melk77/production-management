const pool = require("../config/database");

const getAllSuppliers = async () => {
  const [suppliers] = await pool.query(`
    SELECT
      supplier_id,
      name,
      contact_person,
      phone,
      email,
      address
    FROM suppliers
    ORDER BY supplier_id DESC
  `);

  return suppliers;
};

const getSupplierById = async (id) => {
  const [suppliers] = await pool.query(
    `
    SELECT
      supplier_id,
      name,
      contact_person,
      phone,
      email,
      address
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [id],
  );

  if (suppliers.length === 0) {
    throw new Error("Supplier not found");
  }

  return suppliers[0];
};

const createSupplier = async (supplier) => {
  const { name, contact_person, phone, email, address } = supplier;

  if (!name || name.trim() === "") {
    throw new Error("Supplier name is required");
  }

  const [result] = await pool.query(
    `
    INSERT INTO suppliers
    (
      name,
      contact_person,
      phone,
      email,
      address
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      name.trim(),
      contact_person || null,
      phone || null,
      email || null,
      address || null,
    ],
  );

  return {
    supplier_id: result.insertId,
    name: name.trim(),
    contact_person: contact_person || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
  };
};

const updateSupplier = async (id, supplier) => {
  const { name, contact_person, phone, email, address } = supplier;

  if (!name || name.trim() === "") {
    throw new Error("Supplier name is required");
  }

  const [existing] = await pool.query(
    `
    SELECT supplier_id
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [id],
  );

  if (existing.length === 0) {
    throw new Error("Supplier not found");
  }

  const [result] = await pool.query(
    `
    UPDATE suppliers
    SET
      name = ?,
      contact_person = ?,
      phone = ?,
      email = ?,
      address = ?
    WHERE supplier_id = ?
    `,
    [
      name.trim(),
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    throw new Error("Supplier not found");
  }

  return {
    supplier_id: Number(id),
    name: name.trim(),
    contact_person: contact_person || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
  };
};

const deleteSupplier = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM suppliers
    WHERE supplier_id = ?
    `,
    [id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Supplier not found");
  }
};

const searchSuppliers = async (search) => {
  if (!search || search.trim() === "") {
    throw new Error("Search term is required");
  }

  const term = `%${search.trim()}%`;

  const [suppliers] = await pool.query(
    `
    SELECT
      supplier_id,
      name,
      contact_person,
      phone,
      email,
      address
    FROM suppliers
    WHERE
      name LIKE ?
      OR contact_person LIKE ?
      OR phone LIKE ?
      OR email LIKE ?
    ORDER BY name ASC
    `,
    [term, term, term, term],
  );

  return suppliers;
};

const getSupplierMaterials = async (supplierId) => {
  const [suppliers] = await pool.query(
    `
    SELECT supplier_id, name
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [supplierId],
  );

  if (suppliers.length === 0) {
    throw new Error("Supplier not found");
  }

  const [materials] = await pool.query(
    `
    SELECT
      material_id,
      name,
      unit,
      stock_qty,
      reorder_level
    FROM raw_materials
    WHERE supplier_id = ?
    ORDER BY name ASC
    `,
    [supplierId],
  );

  return materials;
};

const getSupplierPurchaseOrders = async (supplierId) => {
  const [suppliers] = await pool.query(
    `
    SELECT supplier_id, name
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [supplierId],
  );

  if (suppliers.length === 0) {
    throw new Error("Supplier not found");
  }

  const [orders] = await pool.query(
    `
    SELECT
      po.purchase_order_id,
      po.status,
      po.order_date,
      po.expected_delivery,
      po.total_amount,
      po.created_by
    FROM purchase_orders po
    WHERE po.supplier_id = ?
    ORDER BY po.order_date DESC
    `,
    [supplierId],
  );

  return orders;
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  getSupplierMaterials,
  getSupplierPurchaseOrders,
};
