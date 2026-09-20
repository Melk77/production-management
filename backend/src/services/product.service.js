const pool = require("../config/database");

// =========================================================
// PRODUCTS
// =========================================================

const getAllProducts = async () => {
  const [products] = await pool.query(`
    SELECT product_id, name, sku, category, unit_price, created_at
    FROM products
    ORDER BY created_at DESC
  `);
  return products;
};

const getProductById = async (id) => {
  const [products] = await pool.query(
    `SELECT product_id, name, sku, category, unit_price, created_at
     FROM products WHERE product_id = ?`,
    [id]
  );
  if (products.length === 0) throw new Error("Product not found");

  const [bom] = await pool.query(
    `SELECT
       bom.bom_id,
       bom.product_id,
       bom.material_id,
       rm.name AS material_name,
       rm.unit AS material_unit,
       bom.quantity_required,
       bom.unit
     FROM bill_of_materials bom
     JOIN raw_materials rm ON bom.material_id = rm.material_id
     WHERE bom.product_id = ?
     ORDER BY bom.bom_id ASC`,
    [id]
  );

  return { ...products[0], bom };
};

const createProduct = async (data) => {
  const { name, sku, category, unit_price = 0 } = data;
  if (!name) throw new Error("Product name is required");
  if (!sku) throw new Error("SKU is required");

  const [result] = await pool.query(
    `INSERT INTO products (name, sku, category, unit_price) VALUES (?, ?, ?, ?)`,
    [name, sku, category || null, unit_price]
  );
  return { product_id: result.insertId, name, sku, category: category || null, unit_price };
};

const updateProduct = async (id, data) => {
  const { name, sku, category, unit_price } = data;
  if (!name) throw new Error("Product name is required");
  if (!sku) throw new Error("SKU is required");

  const [result] = await pool.query(
    `UPDATE products SET name = ?, sku = ?, category = ?, unit_price = ? WHERE product_id = ?`,
    [name, sku, category || null, unit_price, id]
  );
  if (result.affectedRows === 0) throw new Error("Product not found");
  return { product_id: Number(id), name, sku, category: category || null, unit_price };
};

const deleteProduct = async (id) => {
  const [result] = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);
  if (result.affectedRows === 0) throw new Error("Product not found");
};

// =========================================================
// BILL OF MATERIALS
// =========================================================

const getBOM = async (productId) => {
  const [bom] = await pool.query(
    `SELECT
       bom.bom_id,
       bom.product_id,
       bom.material_id,
       rm.name AS material_name,
       rm.unit AS material_unit,
       bom.quantity_required,
       bom.unit
     FROM bill_of_materials bom
     JOIN raw_materials rm ON bom.material_id = rm.material_id
     WHERE bom.product_id = ?
     ORDER BY bom.bom_id ASC`,
    [productId]
  );
  return bom;
};

const addBOMItem = async (productId, data) => {
  const { material_id, quantity_required, unit } = data;
  if (!material_id) throw new Error("Material is required");
  if (!quantity_required || Number(quantity_required) <= 0)
    throw new Error("Quantity must be greater than zero");
  if (!unit) throw new Error("Unit is required");

  // Check product exists
  const [products] = await pool.query("SELECT product_id FROM products WHERE product_id = ?", [productId]);
  if (products.length === 0) throw new Error("Product not found");

  // Check material exists
  const [materials] = await pool.query("SELECT material_id FROM raw_materials WHERE material_id = ?", [material_id]);
  if (materials.length === 0) throw new Error("Material not found");

  const [result] = await pool.query(
    `INSERT INTO bill_of_materials (product_id, material_id, quantity_required, unit) VALUES (?, ?, ?, ?)`,
    [productId, material_id, quantity_required, unit]
  );
  return { bom_id: result.insertId, product_id: Number(productId), material_id, quantity_required, unit };
};

const updateBOMItem = async (bomId, data) => {
  const { quantity_required, unit } = data;
  if (!quantity_required || Number(quantity_required) <= 0)
    throw new Error("Quantity must be greater than zero");

  const [result] = await pool.query(
    `UPDATE bill_of_materials SET quantity_required = ?, unit = ? WHERE bom_id = ?`,
    [quantity_required, unit, bomId]
  );
  if (result.affectedRows === 0) throw new Error("BOM item not found");
  return { bom_id: Number(bomId), quantity_required, unit };
};

const deleteBOMItem = async (bomId) => {
  const [result] = await pool.query("DELETE FROM bill_of_materials WHERE bom_id = ?", [bomId]);
  if (result.affectedRows === 0) throw new Error("BOM item not found");
};

module.exports = {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getBOM, addBOMItem, updateBOMItem, deleteBOMItem,
};
