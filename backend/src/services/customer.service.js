const pool = require("../config/database");

const getAllCustomers = async () => {
  const [customers] = await pool.query(
    "SELECT customer_id, name, contact_person, phone, email, address FROM customers ORDER BY customer_id DESC"
  );
  return customers;
};

const getCustomerById = async (id) => {
  const [customers] = await pool.query(
    "SELECT customer_id, name, contact_person, phone, email, address FROM customers WHERE customer_id = ?",
    [id]
  );
  if (customers.length === 0) throw new Error("Customer not found");
  return customers[0];
};

const createCustomer = async (data) => {
  const { name, contact_person, phone, email, address } = data;
  if (!name) throw new Error("Customer name is required");

  const [result] = await pool.query(
    "INSERT INTO customers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)",
    [name, contact_person || null, phone || null, email || null, address || null]
  );
  return { customer_id: result.insertId, name, contact_person, phone, email, address };
};

const updateCustomer = async (id, data) => {
  const { name, contact_person, phone, email, address } = data;
  if (!name) throw new Error("Customer name is required");

  const [result] = await pool.query(
    "UPDATE customers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE customer_id = ?",
    [name, contact_person || null, phone || null, email || null, address || null, id]
  );
  if (result.affectedRows === 0) throw new Error("Customer not found");
  return { customer_id: Number(id), name, contact_person, phone, email, address };
};

const deleteCustomer = async (id) => {
  const [result] = await pool.query("DELETE FROM customers WHERE customer_id = ?", [id]);
  if (result.affectedRows === 0) throw new Error("Customer not found");
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
