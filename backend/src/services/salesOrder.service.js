const pool = require("../config/database");

const VALID_STATUSES = ["pending", "confirmed", "fulfilled", "cancelled"];

const getAllSalesOrders = async () => {
  const [orders] = await pool.query(`
    SELECT
      so.sales_order_id,
      so.customer_id,
      c.name AS customer_name,
      so.created_by,
      so.status,
      so.order_date,
      so.total_amount
    FROM sales_orders so
    JOIN customers c ON so.customer_id = c.customer_id
    ORDER BY so.sales_order_id DESC
  `);
  return orders;
};

const getSalesOrderById = async (id) => {
  const [orders] = await pool.query(
    `SELECT
      so.sales_order_id,
      so.customer_id,
      c.name AS customer_name,
      so.created_by,
      so.status,
      so.order_date,
      so.total_amount
    FROM sales_orders so
    JOIN customers c ON so.customer_id = c.customer_id
    WHERE so.sales_order_id = ?`,
    [id]
  );
  if (orders.length === 0) throw new Error("Sales order not found");

  const [items] = await pool.query(
    `SELECT
      soi.so_item_id,
      soi.sales_order_id,
      soi.product_id,
      p.name AS product_name,
      soi.quantity,
      soi.unit_price,
      (soi.quantity * soi.unit_price) AS line_total
    FROM sales_order_items soi
    JOIN products p ON soi.product_id = p.product_id
    WHERE soi.sales_order_id = ?
    ORDER BY soi.so_item_id ASC`,
    [id]
  );

  return { ...orders[0], items };
};

const createSalesOrder = async (data, user) => {
  const { customer_id, order_date } = data;
  if (!customer_id) throw new Error("Customer is required");
  if (!order_date) throw new Error("Order date is required");

  // Verify customer
  const [customers] = await pool.query("SELECT customer_id FROM customers WHERE customer_id = ?", [customer_id]);
  if (customers.length === 0) throw new Error("Customer not found");

  const [result] = await pool.query(
    `INSERT INTO sales_orders (customer_id, created_by, order_date, status, total_amount)
     VALUES (?, ?, ?, 'pending', 0)`,
    [customer_id, user?.id || null, order_date]
  );

  return {
    sales_order_id: result.insertId,
    customer_id,
    order_date,
    status: "pending",
    total_amount: 0,
  };
};

const addSalesOrderItem = async (orderId, data) => {
  const { product_id, quantity, unit_price } = data;
  if (!product_id) throw new Error("Product is required");
  if (!quantity || Number(quantity) <= 0) throw new Error("Quantity must be greater than zero");
  if (unit_price === undefined || Number(unit_price) < 0) throw new Error("Unit price must be >= 0");

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT sales_order_id, status FROM sales_orders WHERE sales_order_id = ? FOR UPDATE",
      [orderId]
    );
    if (orders.length === 0) throw new Error("Sales order not found");

    const [products] = await connection.query(
      "SELECT product_id FROM products WHERE product_id = ?",
      [product_id]
    );
    if (products.length === 0) throw new Error("Product not found");

    const [itemResult] = await connection.query(
      "INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [orderId, product_id, quantity, unit_price]
    );

    // Recalculate total
    await connection.query(
      `UPDATE sales_orders
       SET total_amount = (
         SELECT COALESCE(SUM(quantity * unit_price), 0)
         FROM sales_order_items
         WHERE sales_order_id = ?
       )
       WHERE sales_order_id = ?`,
      [orderId, orderId]
    );

    await connection.commit();

    return {
      so_item_id: itemResult.insertId,
      sales_order_id: Number(orderId),
      product_id,
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

const updateSalesOrderStatus = async (id, status) => {
  if (!VALID_STATUSES.includes(status))
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT * FROM sales_orders WHERE sales_order_id = ? FOR UPDATE",
      [id]
    );
    if (orders.length === 0) throw new Error("Sales order not found");

    await connection.query(
      "UPDATE sales_orders SET status = ? WHERE sales_order_id = ?",
      [status, id]
    );

    await connection.commit();
    return { sales_order_id: Number(id), status };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteSalesOrder = async (id) => {
  const [orders] = await pool.query(
    "SELECT status FROM sales_orders WHERE sales_order_id = ?",
    [id]
  );
  if (orders.length === 0) throw new Error("Sales order not found");
  if (!["pending", "cancelled"].includes(orders[0].status))
    throw new Error("Only pending or cancelled orders can be deleted");

  await pool.query("DELETE FROM sales_orders WHERE sales_order_id = ?", [id]);
};

module.exports = {
  getAllSalesOrders, getSalesOrderById, createSalesOrder,
  addSalesOrderItem, updateSalesOrderStatus, deleteSalesOrder,
};
