const pool = require("../config/database");

const getAllInspections = async () => {
  const [inspections] = await pool.query(`
    SELECT
      qi.inspection_id,
      qi.work_order_id,
      wo.order_number,

      qi.inspector_id,
      u.name AS inspector_name,

      qi.result,
      qi.defects_found,
      qi.inspection_date

    FROM quality_inspections qi

    LEFT JOIN work_orders wo
      ON qi.work_order_id = wo.work_order_id

    LEFT JOIN employees e
      ON qi.inspector_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    ORDER BY qi.inspection_date DESC
  `);

  return inspections;
};

const getInspectionById = async (id) => {
  const [inspections] = await pool.query(
    `
    SELECT
      qi.inspection_id,
      qi.work_order_id,
      wo.order_number,

      qi.inspector_id,
      u.name AS inspector_name,

      qi.result,
      qi.defects_found,
      qi.inspection_date

    FROM quality_inspections qi

    LEFT JOIN work_orders wo
      ON qi.work_order_id = wo.work_order_id

    LEFT JOIN employees e
      ON qi.inspector_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE qi.inspection_id = ?
    `,
    [id],
  );

  if (inspections.length === 0) {
    throw new Error("Quality inspection not found");
  }

  return inspections[0];
};

const createInspection = async (inspection) => {
  const { work_order_id, inspector_id, result, defects_found } = inspection;

  if (!work_order_id) {
    throw new Error("Work order is required");
  }

  if (!inspector_id) {
    throw new Error("Inspector is required");
  }

  if (!result) {
    throw new Error("Inspection result is required");
  }

  const allowedResults = ["pass", "fail", "rework"];

  if (!allowedResults.includes(result)) {
    throw new Error("Invalid inspection result");
  }

  // Check work order
  const [workOrders] = await pool.query(
    `
    SELECT work_order_id
    FROM work_orders
    WHERE work_order_id = ?
    `,
    [work_order_id],
  );

  if (workOrders.length === 0) {
    throw new Error("Work order not found");
  }

  // Check inspector
  const [employees] = await pool.query(
    `
    SELECT employee_id
    FROM employees
    WHERE employee_id = ?
    `,
    [inspector_id],
  );

  if (employees.length === 0) {
    throw new Error("Inspector not found");
  }

  const [resultData] = await pool.query(
    `
    INSERT INTO quality_inspections
    (
      work_order_id,
      inspector_id,
      result,
      defects_found
    )
    VALUES (?, ?, ?, ?)
    `,
    [work_order_id, inspector_id, result, defects_found || null],
  );

  return {
    inspection_id: resultData.insertId,
    work_order_id,
    inspector_id,
    result,
    defects_found: defects_found || null,
  };
};

const updateInspection = async (id, inspection) => {
  const { work_order_id, inspector_id, result, defects_found } = inspection;

  const [existing] = await pool.query(
    `
    SELECT inspection_id
    FROM quality_inspections
    WHERE inspection_id = ?
    `,
    [id],
  );

  if (existing.length === 0) {
    throw new Error("Quality inspection not found");
  }

  const allowedResults = ["pass", "fail", "rework"];

  if (!allowedResults.includes(result)) {
    throw new Error("Invalid inspection result");
  }

  const [workOrders] = await pool.query(
    `
    SELECT work_order_id
    FROM work_orders
    WHERE work_order_id = ?
    `,
    [work_order_id],
  );

  if (workOrders.length === 0) {
    throw new Error("Work order not found");
  }

  const [employees] = await pool.query(
    `
    SELECT employee_id
    FROM employees
    WHERE employee_id = ?
    `,
    [inspector_id],
  );

  if (employees.length === 0) {
    throw new Error("Inspector not found");
  }

  const [resultData] = await pool.query(
    `
    UPDATE quality_inspections
    SET
      work_order_id = ?,
      inspector_id = ?,
      result = ?,
      defects_found = ?
    WHERE inspection_id = ?
    `,
    [work_order_id, inspector_id, result, defects_found || null, id],
  );

  if (resultData.affectedRows === 0) {
    throw new Error("Quality inspection not found");
  }

  return {
    inspection_id: Number(id),
    work_order_id,
    inspector_id,
    result,
    defects_found: defects_found || null,
  };
};

const deleteInspection = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM quality_inspections
    WHERE inspection_id = ?
    `,
    [id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Quality inspection not found");
  }
};

const getInspectionsByWorkOrder = async (workOrderId) => {
  const [inspections] = await pool.query(
    `
    SELECT
      qi.inspection_id,
      qi.work_order_id,
      wo.order_number,

      qi.inspector_id,
      u.name AS inspector_name,

      qi.result,
      qi.defects_found,
      qi.inspection_date

    FROM quality_inspections qi

    LEFT JOIN work_orders wo
      ON qi.work_order_id = wo.work_order_id

    LEFT JOIN employees e
      ON qi.inspector_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE qi.work_order_id = ?

    ORDER BY qi.inspection_date DESC
    `,
    [workOrderId],
  );

  return inspections;
};

const getInspectionsByResult = async (result) => {
  const allowedResults = ["pass", "fail", "rework"];

  if (!allowedResults.includes(result)) {
    throw new Error("Invalid inspection result");
  }

  const [inspections] = await pool.query(
    `
    SELECT
      qi.inspection_id,
      qi.work_order_id,
      wo.order_number,

      qi.inspector_id,
      u.name AS inspector_name,

      qi.result,
      qi.defects_found,
      qi.inspection_date

    FROM quality_inspections qi

    LEFT JOIN work_orders wo
      ON qi.work_order_id = wo.work_order_id

    LEFT JOIN employees e
      ON qi.inspector_id = e.employee_id

    LEFT JOIN users u
      ON e.user_id = u.user_id

    WHERE qi.result = ?

    ORDER BY qi.inspection_date DESC
    `,
    [result],
  );

  return inspections;
};

const getFailedInspections = async () => {
  return getInspectionsByResult("fail");
};

const getReworkInspections = async () => {
  return getInspectionsByResult("rework");
};

module.exports = {
  getAllInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  getInspectionsByWorkOrder,
  getInspectionsByResult,
  getFailedInspections,
  getReworkInspections,
};
