const pool = require("../config/database");
// Get all work orders
const getAllWorkOrders = async () => {
  const [workOrders] = await pool.query(`
        SELECT
            wo.work_order_id,
            wo.order_number,
            wo.quantity_to_produce,
            wo.priority,
            wo.status,
            wo.start_date,
            wo.end_date,
            wo.created_at,

            p.product_id,
            p.name AS product_name,
            p.sku,

            m.machine_id,
            m.name AS machine_name,
            e.employee_id,
            e.position AS operator_position,
            u.name AS operator_name

        FROM work_orders wo
        JOIN products p
            ON wo.product_id = p.product_id
        JOIN machines m
            ON wo.machine_id = m.machine_id
        JOIN employees e
            ON wo.employee_id = e.employee_id
        JOIN users u
            ON e.user_id = u.user_id
        ORDER BY wo.created_at DESC
    `);
  return workOrders;
};

// Get work order by ID
const getWorkOrderById = async (id) => {
  const [workOrders] = await pool.query(
    `
        SELECT
            wo.work_order_id,
            wo.order_number,
            wo.quantity_to_produce,
            wo.priority,
            wo.status,
            wo.start_date,
            wo.end_date,
            wo.created_at,

            p.product_id,
            p.name AS product_name,
            p.sku,
            m.machine_id,
            m.name AS machine_name,
            e.employee_id,
            e.position AS operator_position,
            u.name AS operator_name

        FROM work_orders wo
        JOIN products p
            ON wo.product_id = p.product_id
        JOIN machines m
            ON wo.machine_id = m.machine_id
        JOIN employees e
            ON wo.employee_id = e.employee_id
        JOIN users u
            ON e.user_id = u.user_id
        WHERE wo.work_order_id = ?
        `,
    [id],
  );
  if (workOrders.length === 0) {
    throw new Error("Work order not found");
  }
  return workOrders[0];
};

// Create work order
const createWorkOrder = async (workOrder, user) => {
  const {
    order_number,
    product_id,
    machine_id,
    employee_id,
    quantity_to_produce,
    priority,
  } = workOrder;

  if (!user || !user.id) {
    throw new Error("Authenticated user not found");
  }
  const created_by = user.id;
  const [result] = await pool.query(
    `
        INSERT INTO work_orders
        (
            order_number,
            product_id,
            machine_id,
            employee_id,
            created_by,
            quantity_to_produce,
            priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
    [
      order_number,
      product_id,
      machine_id,
      employee_id,
      created_by,
      quantity_to_produce,
      priority || "normal",
    ],
  );
  return {
    work_order_id: result.insertId,
    order_number,
    product_id,
    machine_id,
    employee_id,
    created_by,
    quantity_to_produce,
    priority: priority || "normal",
    status: "planned",
  };
};

// Update work order
const updateWorkOrder = async (id, workOrder) => {
  const {
    product_id,
    machine_id,
    employee_id,
    quantity_to_produce,
    priority,
    status,
    start_date,
    end_date,
  } = workOrder;

  const [result] = await pool.query(
    `
        UPDATE work_orders
        SET
            product_id = ?,
            machine_id = ?,
            employee_id = ?,
            quantity_to_produce = ?,
            priority = ?,
            status = ?,
            start_date = ?,
            end_date = ?
        WHERE work_order_id = ?
        `,
    [
      product_id,
      machine_id,
      employee_id,
      quantity_to_produce,
      priority,
      status,
      start_date || null,
      end_date || null,
      id,
    ],
  );
  if (result.affectedRows === 0) {
    throw new Error("Work order not found");
  }
  return {
    work_order_id: id,
    product_id,
    machine_id,
    employee_id,
    quantity_to_produce,
    priority,
    status,
    start_date: start_date || null,
    end_date: end_date || null,
  };
};

// Delete work order
const deleteWorkOrder = async (id) => {
  const [result] = await pool.query(
    `
        DELETE FROM work_orders
        WHERE work_order_id = ?
        `,
    [id],
  );
  if (result.affectedRows === 0) {
    throw new Error("Work order not found");
  }
};
// Start work order
const startWorkOrder = async (id) => {
  const [result] = await pool.query(
    `
        UPDATE work_orders
        SET
            status = 'in_progress',
            start_date = CURRENT_TIMESTAMP
        WHERE work_order_id = ?
          AND status = 'planned'
        `,
    [id],
  );
  if (result.affectedRows === 0) {
    throw new Error("Work order not found or cannot be started");
  }
  return {
    work_order_id: id,
    status: "in_progress",
  };
};
// Complete work order
const completeWorkOrder = async (id) => {
  const [result] = await pool.query(
    `
        UPDATE work_orders
        SET
            status = 'completed',
            end_date = CURRENT_TIMESTAMP
        WHERE work_order_id = ?
          AND status = 'in_progress'
        `,
    [id],
  );
  if (result.affectedRows === 0) {
    throw new Error("Work order not found or cannot be completed");
  }
  return {
    work_order_id: id,
    status: "completed",
  };
};
// Add production record
const addProductionRecord = async (record) => {
  const {
    work_order_id,
    employee_id,
    quantity_produced,
    quantity_defective,
    notes,
  } = record;
  if (quantity_produced === undefined) {
    throw new Error("Quantity produced is required");
  }
  if (Number(quantity_produced) < 0) {
    throw new Error("Quantity produced cannot be negative");
  }
  if (quantity_defective !== undefined && Number(quantity_defective) < 0) {
    throw new Error("Quantity defective cannot be negative");
  }
  // Check work order exists
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

  // Check employee exists
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
  const defective = quantity_defective || 0;
  if (Number(defective) > Number(quantity_produced)) {
    throw new Error("Defective quantity cannot exceed produced quantity");
  }

  const [result] = await pool.query(
    `
        INSERT INTO production_records
        (
            work_order_id,
            employee_id,
            quantity_produced,
            quantity_defective,
            notes
        )
        VALUES (?, ?, ?, ?, ?)
        `,
    [work_order_id, employee_id, quantity_produced, defective, notes || null],
  );
  return {
    production_record_id: result.insertId,
    work_order_id,
    employee_id,
    quantity_produced,
    quantity_defective: defective,
    notes: notes || null,
  };
};
// Get production records for a work order
const getProductionRecords = async (workOrderId) => {
  const [records] = await pool.query(
    `
        SELECT
            pr.production_record_id,
            pr.work_order_id,
            pr.quantity_produced,
            pr.quantity_defective,
            pr.production_date,
            pr.notes,

            e.employee_id,
            u.name AS employee_name
        FROM production_records pr
        JOIN employees e
            ON pr.employee_id = e.employee_id
        JOIN users u
            ON e.user_id = u.user_id
        WHERE pr.work_order_id = ?
        ORDER BY pr.production_date DESC
        `,
    [workOrderId],
  );
  return records;
};
// Add material consumption
const addMaterialConsumption = async (consumption) => {
  const { work_order_id, material_id, employee_id, quantity_used, notes } =
    consumption;
  if (!quantity_used || Number(quantity_used) <= 0) {
    throw new Error("Quantity used must be greater than zero");
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [workOrders] = await connection.query(
      `
            SELECT work_order_id
            FROM work_orders
            WHERE work_order_id = ?
            FOR UPDATE
            `,
      [work_order_id],
    );
    if (workOrders.length === 0) {
      throw new Error("Work order not found");
    }
    const [materials] = await connection.query(
      `
            SELECT
                material_id,
                name,
                stock_qty
            FROM raw_materials
            WHERE material_id = ?
            FOR UPDATE
            `,
      [material_id],
    );
    if (materials.length === 0) {
      throw new Error("Raw material not found");
    }
    const material = materials[0];
    if (Number(material.stock_qty) < Number(quantity_used)) {
      throw new Error("Insufficient material stock");
    }
    // Check employee
    const [employees] = await connection.query(
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
    // Insert consumption record
    const [result] = await connection.query(
      `
            INSERT INTO material_consumption
            (
                work_order_id,
                material_id,
                employee_id,
                quantity_used,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
            `,
      [work_order_id, material_id, employee_id, quantity_used, notes || null],
    );

    // Decrease raw material stock
    await connection.query(
      `
            UPDATE raw_materials
            SET stock_qty = stock_qty - ?
            WHERE material_id = ?
            `,
      [quantity_used, material_id],
    );
    await connection.commit();
    return {
      consumption_id: result.insertId,
      work_order_id,
      material_id,
      employee_id,
      quantity_used,
      notes: notes || null,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
// Add downtime record
const addDowntime = async (downtime) => {
  const {
    work_order_id,
    machine_id,
    start_time,
    end_time,
    reason,
    description,
  } = downtime;
  if (!work_order_id) {
    throw new Error("Work order ID is required");
  }
  if (!machine_id) {
    throw new Error("Machine ID is required");
  }
  if (!start_time) {
    throw new Error("Start time is required");
  }
  if (!reason) {
    throw new Error("Downtime reason is required");
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
  const [result] = await pool.query(
    `
        INSERT INTO downtime_records
        (
            work_order_id,
            machine_id,
            start_time,
            end_time,
            reason,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
    [
      work_order_id,
      machine_id,
      start_time,
      end_time || null,
      reason,
      description || null,
    ],
  );
  return {
    downtime_id: result.insertId,
    work_order_id,
    machine_id,
    start_time,
    end_time: end_time || null,
    reason,
    description: description || null,
  };
};

// Get downtime records for a work order
const getDowntimeRecords = async (workOrderId) => {
  const [records] = await pool.query(
    `
        SELECT
            d.downtime_id,
            d.work_order_id,
            d.machine_id,
            m.name AS machine_name,
            d.start_time,
            d.end_time,
            d.reason,
            d.description

        FROM downtime_records d
        JOIN machines m
            ON d.machine_id = m.machine_id
        WHERE d.work_order_id = ?
        ORDER BY d.start_time DESC
        `,
    [workOrderId],
  );
  return records;
};

module.exports = {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  addProductionRecord,
  getProductionRecords,
  addMaterialConsumption,
  addDowntime,
  getDowntimeRecords,
};
