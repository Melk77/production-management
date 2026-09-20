const pool = require("../config/database");

const PO_STATUSES = ["draft", "ordered", "received", "cancelled"];

const getAllPurchaseOrders = async () => {
  const [orders] = await pool.query(`
    SELECT
      po.purchase_order_id,
      po.supplier_id,
      s.name AS supplier_name,

      po.created_by,
      u.name AS created_by_name,

      po.status,
      po.order_date,
      po.expected_delivery,
      po.total_amount

    FROM purchase_orders po

    LEFT JOIN suppliers s
      ON po.supplier_id = s.supplier_id

    LEFT JOIN users u
      ON po.created_by = u.user_id

    ORDER BY po.purchase_order_id DESC
  `);

  return orders;
};

const getPurchaseOrderById = async (id) => {
  const [orders] = await pool.query(
    `
    SELECT
      po.purchase_order_id,
      po.supplier_id,
      s.name AS supplier_name,

      po.created_by,
      u.name AS created_by_name,

      po.status,
      po.order_date,
      po.expected_delivery,
      po.total_amount

    FROM purchase_orders po

    LEFT JOIN suppliers s
      ON po.supplier_id = s.supplier_id

    LEFT JOIN users u
      ON po.created_by = u.user_id

    WHERE po.purchase_order_id = ?
    `,
    [id],
  );

  if (orders.length === 0) {
    throw new Error("Purchase order not found");
  }

  const [items] = await pool.query(
    `
    SELECT
      poi.po_item_id,
      poi.purchase_order_id,
      poi.material_id,
      rm.name AS material_name,
      rm.unit AS material_unit,
      poi.quantity,
      poi.unit_price,
      (poi.quantity * poi.unit_price) AS line_total

    FROM purchase_order_items poi

    LEFT JOIN raw_materials rm
      ON poi.material_id = rm.material_id

    WHERE poi.purchase_order_id = ?

    ORDER BY poi.po_item_id ASC
    `,
    [id],
  );

  return {
    ...orders[0],
    items,
  };
};

const createPurchaseOrder = async (data, user) => {
  const { supplier_id, order_date, expected_delivery } = data;

  if (!supplier_id) {
    throw new Error("Supplier is required");
  }

  if (!order_date) {
    throw new Error("Order date is required");
  }

  const [suppliers] = await pool.query(
    `
    SELECT supplier_id
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [supplier_id],
  );

  if (suppliers.length === 0) {
    throw new Error("Supplier not found");
  }

  if (expected_delivery && expected_delivery < order_date) {
    throw new Error("Expected delivery cannot be before order date");
  }

  const [result] = await pool.query(
    `
    INSERT INTO purchase_orders
    (
      supplier_id,
      created_by,
      status,
      order_date,
      expected_delivery,
      total_amount
    )
    VALUES (?, ?, 'draft', ?, ?, 0)
    `,
    [supplier_id, user.id, order_date, expected_delivery || null],
  );

  return {
    purchase_order_id: result.insertId,
    supplier_id,
    created_by: user.id,
    status: "draft",
    order_date,
    expected_delivery: expected_delivery || null,
    total_amount: 0,
    items: [],
  };
};

const updatePurchaseOrder = async (id, data) => {
  const { supplier_id, order_date, expected_delivery } = data;

  const [orders] = await pool.query(
    `
    SELECT
      purchase_order_id,
      status
    FROM purchase_orders
    WHERE purchase_order_id = ?
    `,
    [id],
  );

  if (orders.length === 0) {
    throw new Error("Purchase order not found");
  }

  if (orders[0].status !== "draft") {
    throw new Error("Only draft purchase orders can be updated");
  }

  if (!supplier_id) {
    throw new Error("Supplier is required");
  }

  if (!order_date) {
    throw new Error("Order date is required");
  }

  const [suppliers] = await pool.query(
    `
    SELECT supplier_id
    FROM suppliers
    WHERE supplier_id = ?
    `,
    [supplier_id],
  );

  if (suppliers.length === 0) {
    throw new Error("Supplier not found");
  }

  if (expected_delivery && expected_delivery < order_date) {
    throw new Error("Expected delivery cannot be before order date");
  }

  const [result] = await pool.query(
    `
    UPDATE purchase_orders
    SET
      supplier_id = ?,
      order_date = ?,
      expected_delivery = ?
    WHERE purchase_order_id = ?
      AND status = 'draft'
    `,
    [supplier_id, order_date, expected_delivery || null, id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Only draft purchase orders can be updated");
  }

  return getPurchaseOrderById(id);
};

const deletePurchaseOrder = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `
      SELECT
        purchase_order_id,
        status
      FROM purchase_orders
      WHERE purchase_order_id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (orders.length === 0) {
      throw new Error("Purchase order not found");
    }

    if (orders[0].status !== "draft") {
      throw new Error("Only draft purchase orders can be deleted");
    }

    // Delete items first
    await connection.query(
      `
      DELETE FROM purchase_order_items
      WHERE purchase_order_id = ?
      `,
      [id],
    );

    const [result] = await connection.query(
      `
      DELETE FROM purchase_orders
      WHERE purchase_order_id = ?
        AND status = 'draft'
      `,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Purchase order not found");
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const addPurchaseOrderItem = async (purchaseOrderId, data) => {
  const { material_id, quantity, unit_price } = data;

  if (!material_id) {
    throw new Error("Material is required");
  }

  if (!quantity || Number(quantity) <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (
    unit_price === undefined ||
    unit_price === null ||
    Number(unit_price) < 0
  ) {
    throw new Error("Unit price cannot be negative");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `
      SELECT
        purchase_order_id,
        status
      FROM purchase_orders
      WHERE purchase_order_id = ?
      FOR UPDATE
      `,
      [purchaseOrderId],
    );

    if (orders.length === 0) {
      throw new Error("Purchase order not found");
    }

    if (orders[0].status !== "draft") {
      throw new Error("Items can only be added to draft purchase orders");
    }

    const [materials] = await connection.query(
      `
      SELECT
        material_id,
        unit
      FROM raw_materials
      WHERE material_id = ?
      `,
      [material_id],
    );

    if (materials.length === 0) {
      throw new Error("Raw material not found");
    }

    // Prevent duplicate material lines in the same PO.
    const [existingItems] = await connection.query(
      `
      SELECT po_item_id
      FROM purchase_order_items
      WHERE purchase_order_id = ?
        AND material_id = ?
      `,
      [purchaseOrderId, material_id],
    );

    if (existingItems.length > 0) {
      throw new Error("This material is already in the purchase order");
    }

    const [result] = await connection.query(
      `
      INSERT INTO purchase_order_items
      (
        purchase_order_id,
        material_id,
        quantity,
        unit_price
      )
      VALUES (?, ?, ?, ?)
      `,
      [purchaseOrderId, material_id, quantity, unit_price],
    );

    await recalculateTotal(connection, purchaseOrderId);

    await connection.commit();

    return {
      po_item_id: result.insertId,
      purchase_order_id: Number(purchaseOrderId),
      material_id,
      quantity,
      unit_price,
      line_total: Number(quantity) * Number(unit_price),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updatePurchaseOrderItem = async (itemId, data) => {
  const { material_id, quantity, unit_price } = data;

  if (!material_id) {
    throw new Error("Material is required");
  }

  if (!quantity || Number(quantity) <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (
    unit_price === undefined ||
    unit_price === null ||
    Number(unit_price) < 0
  ) {
    throw new Error("Unit price cannot be negative");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [items] = await connection.query(
      `
      SELECT
        poi.po_item_id,
        poi.purchase_order_id,
        po.status
      FROM purchase_order_items poi
      JOIN purchase_orders po
        ON poi.purchase_order_id = po.purchase_order_id
      WHERE poi.po_item_id = ?
      FOR UPDATE
      `,
      [itemId],
    );

    if (items.length === 0) {
      throw new Error("Purchase order item not found");
    }

    const item = items[0];

    if (item.status !== "draft") {
      throw new Error("Items can only be updated in draft purchase orders");
    }

    const [materials] = await connection.query(
      `
      SELECT material_id
      FROM raw_materials
      WHERE material_id = ?
      `,
      [material_id],
    );

    if (materials.length === 0) {
      throw new Error("Raw material not found");
    }

    const [duplicate] = await connection.query(
      `
      SELECT po_item_id
      FROM purchase_order_items
      WHERE purchase_order_id = ?
        AND material_id = ?
        AND po_item_id != ?
      `,
      [item.purchase_order_id, material_id, itemId],
    );

    if (duplicate.length > 0) {
      throw new Error("This material is already in the purchase order");
    }

    await connection.query(
      `
      UPDATE purchase_order_items
      SET
        material_id = ?,
        quantity = ?,
        unit_price = ?
      WHERE po_item_id = ?
      `,
      [material_id, quantity, unit_price, itemId],
    );

    await recalculateTotal(connection, item.purchase_order_id);

    await connection.commit();

    return {
      po_item_id: Number(itemId),
      purchase_order_id: item.purchase_order_id,
      material_id,
      quantity,
      unit_price,
      line_total: Number(quantity) * Number(unit_price),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deletePurchaseOrderItem = async (itemId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [items] = await connection.query(
      `
      SELECT
        poi.po_item_id,
        poi.purchase_order_id,
        po.status
      FROM purchase_order_items poi
      JOIN purchase_orders po
        ON poi.purchase_order_id = po.purchase_order_id
      WHERE poi.po_item_id = ?
      FOR UPDATE
      `,
      [itemId],
    );

    if (items.length === 0) {
      throw new Error("Purchase order item not found");
    }

    const item = items[0];

    if (item.status !== "draft") {
      throw new Error("Items can only be deleted from draft purchase orders");
    }

    await connection.query(
      `
      DELETE FROM purchase_order_items
      WHERE po_item_id = ?
      `,
      [itemId],
    );

    await recalculateTotal(connection, item.purchase_order_id);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const calculatePurchaseOrderTotal = async (purchaseOrderId) => {
  const [rows] = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(quantity * unit_price),
        0
      ) AS total_amount
    FROM purchase_order_items
    WHERE purchase_order_id = ?
    `,
    [purchaseOrderId],
  );

  const total = Number(rows[0].total_amount);

  await pool.query(
    `
    UPDATE purchase_orders
    SET total_amount = ?
    WHERE purchase_order_id = ?
    `,
    [total, purchaseOrderId],
  );

  return total;
};

// Internal version that uses the same transaction connection.
const recalculateTotal = async (connection, purchaseOrderId) => {
  const [rows] = await connection.query(
    `
    SELECT
      COALESCE(
        SUM(quantity * unit_price),
        0
      ) AS total_amount
    FROM purchase_order_items
    WHERE purchase_order_id = ?
    `,
    [purchaseOrderId],
  );

  const total = Number(rows[0].total_amount);

  await connection.query(
    `
    UPDATE purchase_orders
    SET total_amount = ?
    WHERE purchase_order_id = ?
    `,
    [total, purchaseOrderId],
  );

  return total;
};

const orderPurchaseOrder = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `
      SELECT
        purchase_order_id,
        status
      FROM purchase_orders
      WHERE purchase_order_id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (orders.length === 0) {
      throw new Error("Purchase order not found");
    }

    if (orders[0].status !== "draft") {
      throw new Error("Only draft purchase orders can be ordered");
    }

    const [items] = await connection.query(
      `
      SELECT po_item_id
      FROM purchase_order_items
      WHERE purchase_order_id = ?
      `,
      [id],
    );

    if (items.length === 0) {
      throw new Error(
        "Purchase order must have at least one item before ordering",
      );
    }

    await recalculateTotal(connection, id);

    await connection.query(
      `
      UPDATE purchase_orders
      SET status = 'ordered'
      WHERE purchase_order_id = ?
        AND status = 'draft'
      `,
      [id],
    );

    await connection.commit();

    return getPurchaseOrderById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const receivePurchaseOrder = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `
      SELECT
        purchase_order_id,
        supplier_id,
        status
      FROM purchase_orders
      WHERE purchase_order_id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (orders.length === 0) {
      throw new Error("Purchase order not found");
    }

    if (orders[0].status !== "ordered") {
      throw new Error("Only ordered purchase orders can be received");
    }

    await connection.query(
      `
      UPDATE purchase_orders
      SET status = 'received'
      WHERE purchase_order_id = ?
        AND status = 'ordered'
      `,
      [id],
    );

    await connection.commit();

    return getPurchaseOrderById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const cancelPurchaseOrder = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `
      SELECT
        purchase_order_id,
        status
      FROM purchase_orders
      WHERE purchase_order_id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (orders.length === 0) {
      throw new Error("Purchase order not found");
    }

    if (orders[0].status !== "draft" && orders[0].status !== "ordered") {
      throw new Error("Only draft or ordered purchase orders can be cancelled");
    }

    await connection.query(
      `
      UPDATE purchase_orders
      SET status = 'cancelled'
      WHERE purchase_order_id = ?
      `,
      [id],
    );

    await connection.commit();

    return getPurchaseOrderById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getPurchaseOrdersByStatus = async (status) => {
  if (!PO_STATUSES.includes(status)) {
    throw new Error("Invalid purchase order status");
  }

  const [orders] = await pool.query(
    `
    SELECT
      po.purchase_order_id,
      po.supplier_id,
      s.name AS supplier_name,
      po.created_by,
      u.name AS created_by_name,
      po.status,
      po.order_date,
      po.expected_delivery,
      po.total_amount
    FROM purchase_orders po
    LEFT JOIN suppliers s
      ON po.supplier_id = s.supplier_id
    LEFT JOIN users u
      ON po.created_by = u.user_id
    WHERE po.status = ?
    ORDER BY po.purchase_order_id DESC
    `,
    [status],
  );

  return orders;
};

const getPurchaseOrdersBySupplier = async (supplierId) => {
  const [suppliers] = await pool.query(
    `
    SELECT supplier_id
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
      po.supplier_id,
      s.name AS supplier_name,
      po.created_by,
      u.name AS created_by_name,
      po.status,
      po.order_date,
      po.expected_delivery,
      po.total_amount
    FROM purchase_orders po

    LEFT JOIN suppliers s
      ON po.supplier_id = s.supplier_id

    LEFT JOIN users u
      ON po.created_by = u.user_id

    WHERE po.supplier_id = ?

    ORDER BY po.order_date DESC
    `,
    [supplierId],
  );

  return orders;
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,

  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,

  calculatePurchaseOrderTotal,

  orderPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,

  getPurchaseOrdersByStatus,
  getPurchaseOrdersBySupplier,
};
