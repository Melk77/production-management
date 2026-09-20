const pool = require("../config/database");

const ALLOWED_STATUSES = ["available", "in_use", "under_maintenance"];

// ========================================
// GET ALL MACHINES
// ========================================

const getAllMachines = async () => {
  const [machines] = await pool.query(`
    SELECT
      machine_id,
      name,
      type,
      status,
      location,
      purchase_date
    FROM machines
    ORDER BY machine_id DESC
  `);

  return machines;
};

// ========================================
// GET MACHINE BY ID
// ========================================

const getMachineById = async (id) => {
  const [machines] = await pool.query(
    `
    SELECT
      machine_id,
      name,
      type,
      status,
      location,
      purchase_date
    FROM machines
    WHERE machine_id = ?
    `,
    [id],
  );

  if (machines.length === 0) {
    throw new Error("Machine not found");
  }

  return machines[0];
};

// ========================================
// CREATE MACHINE
// ========================================

const createMachine = async (machine) => {
  const { name, type, status = "available", location, purchase_date } = machine;

  if (!name || !name.trim()) {
    throw new Error("Machine name is required");
  }

  if (!type || !type.trim()) {
    throw new Error("Machine type is required");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid machine status");
  }

  const [result] = await pool.query(
    `
    INSERT INTO machines
      (
        name,
        type,
        status,
        location,
        purchase_date
      )
    VALUES (?, ?, ?, ?, ?)
    `,
    [name.trim(), type.trim(), status, location || null, purchase_date || null],
  );

  return {
    machine_id: result.insertId,
    name: name.trim(),
    type: type.trim(),
    status,
    location: location || null,
    purchase_date: purchase_date || null,
  };
};

// ========================================
// UPDATE MACHINE
// ========================================

const updateMachine = async (id, machine) => {
  const { name, type, status, location, purchase_date } = machine;

  const [existing] = await pool.query(
    `
    SELECT machine_id
    FROM machines
    WHERE machine_id = ?
    `,
    [id],
  );

  if (existing.length === 0) {
    throw new Error("Machine not found");
  }

  if (!name || !name.trim()) {
    throw new Error("Machine name is required");
  }

  if (!type || !type.trim()) {
    throw new Error("Machine type is required");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid machine status");
  }

  const [result] = await pool.query(
    `
    UPDATE machines
    SET
      name = ?,
      type = ?,
      status = ?,
      location = ?,
      purchase_date = ?
    WHERE machine_id = ?
    `,
    [
      name.trim(),
      type.trim(),
      status,
      location || null,
      purchase_date || null,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    throw new Error("Machine not found");
  }

  return {
    machine_id: Number(id),
    name: name.trim(),
    type: type.trim(),
    status,
    location: location || null,
    purchase_date: purchase_date || null,
  };
};

// ========================================
// DELETE MACHINE
// ========================================

const deleteMachine = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM machines
    WHERE machine_id = ?
    `,
    [id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Machine not found");
  }

  return {
    message: "Machine deleted successfully",
  };
};

// ========================================
// UPDATE MACHINE STATUS
// ========================================

const updateMachineStatus = async (id, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid machine status");
  }

  const [result] = await pool.query(
    `
    UPDATE machines
    SET status = ?
    WHERE machine_id = ?
    `,
    [status, id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Machine not found");
  }

  return {
    machine_id: Number(id),
    status,
  };
};

// ========================================
// GET MACHINES BY STATUS
// ========================================

const getMachinesByStatus = async (status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid machine status");
  }

  const [machines] = await pool.query(
    `
    SELECT
      machine_id,
      name,
      type,
      status,
      location,
      purchase_date
    FROM machines
    WHERE status = ?
    ORDER BY machine_id DESC
    `,
    [status],
  );

  return machines;
};

module.exports = {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  updateMachineStatus,
  getMachinesByStatus,
};
