const pool = require("../config/database");

const getAllMaterials = async () => {
  const [materials] = await pool.query(`
    SELECT
      rm.material_id,
      rm.name,
      rm.unit,
      rm.stock_qty,
      rm.reorder_level,
      rm.supplier_id,
      s.name AS supplier_name
    FROM raw_materials rm
    LEFT JOIN suppliers s
      ON rm.supplier_id = s.supplier_id
    ORDER BY rm.material_id DESC
  `);

  return materials;
};

const getMaterialById = async (id) => {
  const [materials] = await pool.query(
    `
    SELECT
      rm.material_id,
      rm.name,
      rm.unit,
      rm.stock_qty,
      rm.reorder_level,
      rm.supplier_id,
      s.name AS supplier_name
    FROM raw_materials rm
    LEFT JOIN suppliers s
      ON rm.supplier_id = s.supplier_id
    WHERE rm.material_id = ?
    `,
    [id],
  );

  if (materials.length === 0) {
    throw new Error("Material not found");
  }

  return materials[0];
};

const createMaterial = async (material) => {
  const {
    name,
    unit,
    stock_qty = 0,
    reorder_level = 0,
    supplier_id,
  } = material;

  if (!name) {
    throw new Error("Material name is required");
  }

  if (!unit) {
    throw new Error("Material unit is required");
  }

  if (!supplier_id) {
    throw new Error("Supplier is required");
  }

  if (Number(stock_qty) < 0) {
    throw new Error("Stock quantity cannot be negative");
  }

  if (Number(reorder_level) < 0) {
    throw new Error("Reorder level cannot be negative");
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

  const [result] = await pool.query(
    `
    INSERT INTO raw_materials
    (
      name,
      unit,
      stock_qty,
      reorder_level,
      supplier_id
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, unit, stock_qty, reorder_level, supplier_id],
  );

  return {
    material_id: result.insertId,
    name,
    unit,
    stock_qty,
    reorder_level,
    supplier_id,
  };
};

const updateMaterial = async (id, material) => {
  const { name, unit, reorder_level, supplier_id } = material;

  const [existing] = await pool.query(
    `
    SELECT material_id
    FROM raw_materials
    WHERE material_id = ?
    `,
    [id],
  );

  if (existing.length === 0) {
    throw new Error("Material not found");
  }

  if (!name || !unit || !supplier_id) {
    throw new Error("Name, unit and supplier are required");
  }

  const [result] = await pool.query(
    `
    UPDATE raw_materials
    SET
      name = ?,
      unit = ?,
      reorder_level = ?,
      supplier_id = ?
    WHERE material_id = ?
    `,
    [name, unit, reorder_level, supplier_id, id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Material not found");
  }

  return {
    material_id: Number(id),
    name,
    unit,
    reorder_level,
    supplier_id,
  };
};

const deleteMaterial = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM raw_materials
    WHERE material_id = ?
    `,
    [id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Material not found");
  }
};

const getLowStockMaterials = async () => {
  const [materials] = await pool.query(`
    SELECT
      rm.material_id,
      rm.name,
      rm.unit,
      rm.stock_qty,
      rm.reorder_level,
      s.name AS supplier_name
    FROM raw_materials rm
    LEFT JOIN suppliers s
      ON rm.supplier_id = s.supplier_id
    WHERE rm.stock_qty <= rm.reorder_level
    ORDER BY rm.stock_qty ASC
  `);

  return materials;
};

const receiveMaterial = async (data, user) => {
  const { material_id, supplier_id, quantity, unit, reference_number, notes } =
    data;

  if (!material_id) {
    throw new Error("Material is required");
  }

  if (!supplier_id) {
    throw new Error("Supplier is required");
  }

  if (!quantity || Number(quantity) <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (!unit) {
    throw new Error("Unit is required");
  }

  const [materials] = await pool.query(
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

  const [result] = await pool.query(
    `
    INSERT INTO material_receipts
    (
      material_id,
      supplier_id,
      quantity,
      unit,
      reference_number,
      notes,
      received_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      material_id,
      supplier_id,
      quantity,
      unit,
      reference_number || null,
      notes || null,
      user.id,
    ],
  );

  return {
    receipt_id: result.insertId,
    material_id,
    supplier_id,
    quantity,
    unit,
    status: "pending",
    reference_number: reference_number || null,
    notes: notes || null,
    received_by: user.id,
  };
};

const checkMaterialReceipt = async (receiptId, user) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [receipts] = await connection.query(
      `
      SELECT *
      FROM material_receipts
      WHERE receipt_id = ?
      FOR UPDATE
      `,
      [receiptId],
    );

    if (receipts.length === 0) {
      throw new Error("Material receipt not found");
    }

    const receipt = receipts[0];

    if (receipt.status !== "pending") {
      throw new Error("Only pending materials can be checked");
    }

    await connection.query(
      `
      UPDATE material_receipts
      SET
        status = 'checked',
        checked_by = ?,
        checked_at = CURRENT_TIMESTAMP
      WHERE receipt_id = ?
      `,
      [user.id, receiptId],
    );

    await connection.commit();

    return {
      receipt_id: receiptId,
      status: "checked",
      checked_by: user.id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const acceptMaterialReceipt = async (receiptId, user) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [receipts] = await connection.query(
      `
      SELECT *
      FROM material_receipts
      WHERE receipt_id = ?
      FOR UPDATE
      `,
      [receiptId],
    );

    if (receipts.length === 0) {
      throw new Error("Material receipt not found");
    }

    const receipt = receipts[0];

    if (receipt.status !== "checked") {
      throw new Error("Material must be checked before acceptance");
    }

    await connection.query(
      `
      UPDATE material_receipts
      SET
        status = 'accepted',
        accepted_by = ?,
        accepted_at = CURRENT_TIMESTAMP
      WHERE receipt_id = ?
      `,
      [user.id, receiptId],
    );

    // Add accepted quantity to inventory
    await connection.query(
      `
      UPDATE raw_materials
      SET stock_qty = stock_qty + ?
      WHERE material_id = ?
      `,
      [receipt.quantity, receipt.material_id],
    );

    // Record stock movement
    await connection.query(
      `
      INSERT INTO inventory_movements
      (
        material_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_by
      )
      VALUES (?, 'IN', ?, 'material_receipt', ?, ?, ?)
      `,
      [
        receipt.material_id,
        receipt.quantity,
        receiptId,
        "Accepted material receipt",
        user.id,
      ],
    );

    await connection.commit();

    return {
      receipt_id: receiptId,
      material_id: receipt.material_id,
      quantity: receipt.quantity,
      status: "accepted",
      accepted_by: user.id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectMaterialReceipt = async (receiptId, reason, user) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [receipts] = await connection.query(
      `
      SELECT *
      FROM material_receipts
      WHERE receipt_id = ?
      FOR UPDATE
      `,
      [receiptId],
    );

    if (receipts.length === 0) {
      throw new Error("Material receipt not found");
    }

    const receipt = receipts[0];

    if (receipt.status !== "pending" && receipt.status !== "checked") {
      throw new Error("This material cannot be rejected");
    }

    if (!reason) {
      throw new Error("Rejection reason is required");
    }

    await connection.query(
      `
      UPDATE material_receipts
      SET
        status = 'rejected',
        rejection_reason = ?
      WHERE receipt_id = ?
      `,
      [reason, receiptId],
    );

    await connection.commit();

    return {
      receipt_id: receiptId,
      status: "rejected",
      rejection_reason: reason,
      rejected_by: user.id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getMaterialReceipts = async () => {
  const [receipts] = await pool.query(`
    SELECT
      mr.receipt_id,
      mr.material_id,
      rm.name AS material_name,

      mr.supplier_id,
      s.name AS supplier_name,

      mr.quantity,
      mr.unit,
      mr.reference_number,
      mr.status,
      mr.received_at,

      mr.received_by,
      receiver.name AS received_by_name,

      mr.checked_by,
      checker.name AS checked_by_name,
      mr.checked_at,

      mr.accepted_by,
      accepter.name AS accepted_by_name,
      mr.accepted_at,

      mr.rejection_reason,
      mr.notes

    FROM material_receipts mr

    JOIN raw_materials rm
      ON mr.material_id = rm.material_id

    JOIN suppliers s
      ON mr.supplier_id = s.supplier_id

    LEFT JOIN users receiver
      ON mr.received_by = receiver.user_id

    LEFT JOIN users checker
      ON mr.checked_by = checker.user_id

    LEFT JOIN users accepter
      ON mr.accepted_by = accepter.user_id

    ORDER BY mr.received_at DESC
  `);

  return receipts;
};

const getStockMovements = async () => {
  const [movements] = await pool.query(`
    SELECT
      im.movement_id,
      im.material_id,
      rm.name AS material_name,
      im.movement_type,
      im.quantity,
      im.reference_type,
      im.reference_id,
      im.notes,
      im.created_by,
      u.name AS created_by_name,
      im.created_at
    FROM inventory_movements im

    JOIN raw_materials rm
      ON im.material_id = rm.material_id

    JOIN users u
      ON im.created_by = u.user_id

    ORDER BY im.created_at DESC
  `);

  return movements;
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  receiveMaterial,
  checkMaterialReceipt,
  acceptMaterialReceipt,
  rejectMaterialReceipt,
  getMaterialReceipts,
  getStockMovements,
};
