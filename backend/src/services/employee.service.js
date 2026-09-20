const pool = require("../config/database");

// =========================================================
// EMPLOYEES
// =========================================================

const getAllEmployees = async () => {
  const [employees] = await pool.query(`
    SELECT
      e.employee_id,
      e.user_id,
      u.name,
      u.email,
      u.role,
      u.phone,
      e.position,
      e.hire_date,
      e.department_id,
      d.name AS department_name,
      e.shift_id,
      s.name AS shift_name,
      s.start_time,
      s.end_time
    FROM employees e
    JOIN users u ON e.user_id = u.user_id
    JOIN departments d ON e.department_id = d.department_id
    LEFT JOIN shifts s ON e.shift_id = s.shift_id
    ORDER BY e.employee_id DESC
  `);
  return employees;
};

const getEmployeeById = async (id) => {
  const [employees] = await pool.query(
    `
    SELECT
      e.employee_id,
      e.user_id,
      u.name,
      u.email,
      u.role,
      u.phone,
      e.position,
      e.hire_date,
      e.department_id,
      d.name AS department_name,
      e.shift_id,
      s.name AS shift_name,
      s.start_time,
      s.end_time
    FROM employees e
    JOIN users u ON e.user_id = u.user_id
    JOIN departments d ON e.department_id = d.department_id
    LEFT JOIN shifts s ON e.shift_id = s.shift_id
    WHERE e.employee_id = ?
    `,
    [id]
  );
  if (employees.length === 0) throw new Error("Employee not found");
  return employees[0];
};

const createEmployee = async (data) => {
  const { user_id, department_id, shift_id, position, hire_date } = data;

  if (!user_id) throw new Error("User is required");
  if (!department_id) throw new Error("Department is required");
  if (!position) throw new Error("Position is required");
  if (!hire_date) throw new Error("Hire date is required");

  // Check user exists
  const [users] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
  if (users.length === 0) throw new Error("User not found");

  // Check user not already an employee
  const [existing] = await pool.query("SELECT employee_id FROM employees WHERE user_id = ?", [user_id]);
  if (existing.length > 0) throw new Error("This user is already an employee");

  const [result] = await pool.query(
    `INSERT INTO employees (user_id, department_id, shift_id, position, hire_date)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, department_id, shift_id || null, position, hire_date]
  );

  return { employee_id: result.insertId, user_id, department_id, shift_id: shift_id || null, position, hire_date };
};

const updateEmployee = async (id, data) => {
  const { department_id, shift_id, position, hire_date } = data;

  const [result] = await pool.query(
    `UPDATE employees SET department_id = ?, shift_id = ?, position = ?, hire_date = ?
     WHERE employee_id = ?`,
    [department_id, shift_id || null, position, hire_date, id]
  );
  if (result.affectedRows === 0) throw new Error("Employee not found");

  return { employee_id: Number(id), department_id, shift_id: shift_id || null, position, hire_date };
};

const deleteEmployee = async (id) => {
  const [result] = await pool.query("DELETE FROM employees WHERE employee_id = ?", [id]);
  if (result.affectedRows === 0) throw new Error("Employee not found");
};

// =========================================================
// DEPARTMENTS
// =========================================================

const getAllDepartments = async () => {
  const [departments] = await pool.query(`
    SELECT
      d.department_id,
      d.name,
      d.manager_id,
      u.name AS manager_name
    FROM departments d
    LEFT JOIN employees e ON d.manager_id = e.employee_id
    LEFT JOIN users u ON e.user_id = u.user_id
    ORDER BY d.department_id ASC
  `);
  return departments;
};

const getDepartmentById = async (id) => {
  const [departments] = await pool.query(
    `SELECT d.department_id, d.name, d.manager_id, u.name AS manager_name
     FROM departments d
     LEFT JOIN employees e ON d.manager_id = e.employee_id
     LEFT JOIN users u ON e.user_id = u.user_id
     WHERE d.department_id = ?`,
    [id]
  );
  if (departments.length === 0) throw new Error("Department not found");
  return departments[0];
};

const createDepartment = async (data) => {
  const { name } = data;
  if (!name) throw new Error("Department name is required");

  const [result] = await pool.query("INSERT INTO departments (name) VALUES (?)", [name]);
  return { department_id: result.insertId, name };
};

const updateDepartment = async (id, data) => {
  const { name, manager_id } = data;
  if (!name) throw new Error("Department name is required");

  const [result] = await pool.query(
    "UPDATE departments SET name = ?, manager_id = ? WHERE department_id = ?",
    [name, manager_id || null, id]
  );
  if (result.affectedRows === 0) throw new Error("Department not found");
  return { department_id: Number(id), name, manager_id: manager_id || null };
};

const deleteDepartment = async (id) => {
  const [result] = await pool.query("DELETE FROM departments WHERE department_id = ?", [id]);
  if (result.affectedRows === 0) throw new Error("Department not found");
};

// =========================================================
// SHIFTS
// =========================================================

const getAllShifts = async () => {
  const [shifts] = await pool.query(
    "SELECT shift_id, name, start_time, end_time FROM shifts ORDER BY shift_id ASC"
  );
  return shifts;
};

const createShift = async (data) => {
  const { name, start_time, end_time } = data;
  if (!name) throw new Error("Shift name is required");
  if (!start_time) throw new Error("Start time is required");
  if (!end_time) throw new Error("End time is required");

  const [result] = await pool.query(
    "INSERT INTO shifts (name, start_time, end_time) VALUES (?, ?, ?)",
    [name, start_time, end_time]
  );
  return { shift_id: result.insertId, name, start_time, end_time };
};

const updateShift = async (id, data) => {
  const { name, start_time, end_time } = data;

  const [result] = await pool.query(
    "UPDATE shifts SET name = ?, start_time = ?, end_time = ? WHERE shift_id = ?",
    [name, start_time, end_time, id]
  );
  if (result.affectedRows === 0) throw new Error("Shift not found");
  return { shift_id: Number(id), name, start_time, end_time };
};

const deleteShift = async (id) => {
  const [result] = await pool.query("DELETE FROM shifts WHERE shift_id = ?", [id]);
  if (result.affectedRows === 0) throw new Error("Shift not found");
};

module.exports = {
  getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
  getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment,
  getAllShifts, createShift, updateShift, deleteShift,
};
