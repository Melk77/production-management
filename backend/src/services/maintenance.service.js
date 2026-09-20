const pool = require("../config/database");

// =========================================================
// GET ALL MAINTENANCE RECORDS
// =========================================================

const getAllMaintenance = async () => {
  const [records] = await pool.query(`
    SELECT
      ml.maintenance_id,
      ml.machine_id,
      m.name AS machine_name,
      m.type AS machine_type,

      ml.employee_id,
      u.name AS employee_name,

      ml.type,
      ml.cost,
      ml.maintenance_date,
      ml.status,
      ml.description

    FROM maintenance_logs ml

    LEFT JOIN machines m
      ON ml.machine_id = m.machine_id

    LEFT JOIN employees e
      ON ml.employee_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    ORDER BY ml.maintenance_date DESC
  `);

  return records;
};

// =========================================================
// GET MAINTENANCE BY ID
// =========================================================

const getMaintenanceById = async (id) => {
  const [records] = await pool.query(
    `
    SELECT
      ml.maintenance_id,
      ml.machine_id,
      m.name AS machine_name,
      m.type AS machine_type,

      ml.employee_id,
      u.name AS employee_name,

      ml.type,
      ml.cost,
      ml.maintenance_date,
      ml.status,
      ml.description

    FROM maintenance_logs ml

    LEFT JOIN machines m
      ON ml.machine_id = m.machine_id

    LEFT JOIN employees e
      ON ml.employee_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE ml.maintenance_id = ?
    `,
    [id],
  );

  if (records.length === 0) {
    throw new Error("Maintenance record not found");
  }

  return records[0];
};

// =========================================================
// CREATE / SCHEDULE MAINTENANCE
// =========================================================

const createMaintenance = async (maintenance) => {
  const {
    machine_id,
    employee_id,
    type,
    cost = 0,
    maintenance_date,
    description,
  } = maintenance;

  if (!machine_id) {
    throw new Error("Machine is required");
  }

  if (!employee_id) {
    throw new Error("Employee is required");
  }

  if (!type) {
    throw new Error("Maintenance type is required");
  }

  if (!maintenance_date) {
    throw new Error("Maintenance date is required");
  }

  const allowedTypes = ["preventive", "corrective"];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid maintenance type");
  }

  if (Number(cost) < 0) {
    throw new Error("Maintenance cost cannot be negative");
  }

  // Check machine
  const [machines] = await pool.query(
    `
    SELECT machine_id
    FROM machines
    WHERE machine_id = ?
    `,
    [machine_id],
  );

  if (machines.length === 0) {
    throw new Error("Machine not found");
  }

  // Check employee
  const [employees] = await pool.query(
    `
    SELECT employee_id
    FROM employees
    WHERE employee_id = ?
    `,
    [employee_id],
  );

  if (employees.length === 0) {
    throw new Error("Employee not found");
  }

  const [result] = await pool.query(
    `
    INSERT INTO maintenance_logs
    (
      machine_id,
      employee_id,
      type,
      cost,
      maintenance_date,
      status,
      description
    )
    VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
    `,
    [
      machine_id,
      employee_id,
      type,
      cost,
      maintenance_date,
      description || null,
    ],
  );

  return {
    maintenance_id: result.insertId,
    machine_id,
    employee_id,
    type,
    cost,
    maintenance_date,
    status: "scheduled",
    description: description || null,
  };
};

// =========================================================
// UPDATE MAINTENANCE
// =========================================================

const updateMaintenance = async (id, maintenance) => {
  const {
    machine_id,
    employee_id,
    type,
    cost,
    maintenance_date,
    status,
    description,
  } = maintenance;

  const [existing] = await pool.query(
    `
    SELECT maintenance_id
    FROM maintenance_logs
    WHERE maintenance_id = ?
    `,
    [id],
  );

  if (existing.length === 0) {
    throw new Error("Maintenance record not found");
  }

  const allowedTypes = ["preventive", "corrective"];

  const allowedStatuses = ["scheduled", "completed"];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid maintenance type");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid maintenance status");
  }

  if (Number(cost) < 0) {
    throw new Error("Maintenance cost cannot be negative");
  }

  const [machines] = await pool.query(
    `
    SELECT machine_id
    FROM machines
    WHERE machine_id = ?
    `,
    [machine_id],
  );

  if (machines.length === 0) {
    throw new Error("Machine not found");
  }

  const [employees] = await pool.query(
    `
    SELECT employee_id
    FROM employees
    WHERE employee_id = ?
    `,
    [employee_id],
  );

  if (employees.length === 0) {
    throw new Error("Employee not found");
  }

  const [result] = await pool.query(
    `
    UPDATE maintenance_logs
    SET
      machine_id = ?,
      employee_id = ?,
      type = ?,
      cost = ?,
      maintenance_date = ?,
      status = ?,
      description = ?
    WHERE maintenance_id = ?
    `,
    [
      machine_id,
      employee_id,
      type,
      cost,
      maintenance_date,
      status,
      description || null,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    throw new Error("Maintenance record not found");
  }

  return {
    maintenance_id: Number(id),
    machine_id,
    employee_id,
    type,
    cost,
    maintenance_date,
    status,
    description: description || null,
  };
};

// =========================================================
// DELETE MAINTENANCE
// =========================================================

const deleteMaintenance = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM maintenance_logs
    WHERE maintenance_id = ?
    `,
    [id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Maintenance record not found");
  }
};

// =========================================================
// COMPLETE MAINTENANCE
// =========================================================

const completeMaintenance = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [records] = await connection.query(
      `
      SELECT
        maintenance_id,
        machine_id,
        status
      FROM maintenance_logs
      WHERE maintenance_id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (records.length === 0) {
      throw new Error("Maintenance record not found");
    }

    const maintenance = records[0];

    if (maintenance.status !== "scheduled") {
      throw new Error("Only scheduled maintenance can be completed");
    }

    await connection.query(
      `
      UPDATE maintenance_logs
      SET status = 'completed'
      WHERE maintenance_id = ?
      `,
      [id],
    );

    // After maintenance is completed,
    // return the machine to available.
    await connection.query(
      `
      UPDATE machines
      SET status = 'available'
      WHERE machine_id = ?
      `,
      [maintenance.machine_id],
    );

    await connection.commit();

    return {
      maintenance_id: Number(id),
      machine_id: maintenance.machine_id,
      status: "completed",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// =========================================================
// GET MAINTENANCE BY MACHINE
// =========================================================

const getMachineMaintenance = async (machineId) => {
  const [records] = await pool.query(
    `
    SELECT
      ml.maintenance_id,
      ml.machine_id,
      m.name AS machine_name,
      ml.employee_id,
      u.name AS employee_name,
      ml.type,
      ml.cost,
      ml.maintenance_date,
      ml.status,
      ml.description

    FROM maintenance_logs ml

    LEFT JOIN machines m
      ON ml.machine_id = m.machine_id

    LEFT JOIN employees e
      ON ml.employee_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE ml.machine_id = ?

    ORDER BY ml.maintenance_date DESC
    `,
    [machineId],
  );

  return records;
};

// =========================================================
// GET SCHEDULED MAINTENANCE
// =========================================================

const getScheduledMaintenance = async () => {
  const [records] = await pool.query(`
    SELECT
      ml.maintenance_id,
      ml.machine_id,
      m.name AS machine_name,
      ml.employee_id,
      u.name AS employee_name,
      ml.type,
      ml.cost,
      ml.maintenance_date,
      ml.status,
      ml.description

    FROM maintenance_logs ml

    LEFT JOIN machines m
      ON ml.machine_id = m.machine_id

    LEFT JOIN employees e
      ON ml.employee_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE ml.status = 'scheduled'

    ORDER BY ml.maintenance_date ASC
  `);

  return records;
};

// =========================================================
// GET COMPLETED MAINTENANCE
// =========================================================

const getCompletedMaintenance = async () => {
  const [records] = await pool.query(`
    SELECT
      ml.maintenance_id,
      ml.machine_id,
      m.name AS machine_name,
      ml.employee_id,
      u.name AS employee_name,
      ml.type,
      ml.cost,
      ml.maintenance_date,
      ml.status,
      ml.description

    FROM maintenance_logs ml

    LEFT JOIN machines m
      ON ml.machine_id = m.machine_id

    LEFT JOIN employees e
      ON ml.employee_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE ml.status = 'completed'

    ORDER BY ml.maintenance_date DESC
  `);

  return records;
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
  getMachineMaintenance,
  getScheduledMaintenance,
  getCompletedMaintenance,
};
