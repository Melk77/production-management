const pool = require("../config/database");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
  const [users] = await pool.query(
    "SELECT user_id, name, email, role, phone FROM users",
  );
  return users;
};

const getUserById = async (id) => {
  const [users] = await pool.query(
    "SELECT user_id, name, email, role, phone FROM users WHERE user_id = ?",
    [id],
  );
  if (users.length === 0) {
    throw new Error("User not found");
  }
  return users[0];
};

const createUser = async (user) => {
  const { name, email, password, role, phone } = user;
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users
      (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, phone],
  );

  return {
    user_id: result.insertId,
    name,
    email,
    role,
    phone,
  };
};

const updateUser = async (id, user) => {
  const { name, email, password, role, phone } = user;

  let result;

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    [result] = await pool.query(
      `UPDATE users
       SET name = ?, email = ?, password_hash = ?, role = ?, phone = ?
       WHERE user_id = ?`,
      [name, email, passwordHash, role, phone, id],
    );
  } else {
    [result] = await pool.query(
      `UPDATE users
       SET name = ?, email = ?, role = ?, phone = ?
       WHERE user_id = ?`,
      [name, email, role, phone, id],
    );
  }
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
  return {
    user_id: id,
    name,
    email,
    role,
    phone,
  };
};

const deleteUser = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [
    id,
  ]);
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
};

const updateOwnProfile = async (id, user) => {
  const { name, email, password, phone } = user;

  let result;

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    [result] = await pool.query(
      `UPDATE users
       SET name = ?, email = ?, password_hash = ?, phone = ?
       WHERE user_id = ?`,
      [name, email, passwordHash, phone, id],
    );
  } else {
    [result] = await pool.query(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE user_id = ?`,
      [name, email, phone, id],
    );
  }
  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }
  return getUserById(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateOwnProfile,
  deleteUser,
};
