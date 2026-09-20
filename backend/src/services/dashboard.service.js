const pool = require("../config/database");

const getDashboardData = async () => {
  // =========================
  // STATISTICS
  // =========================

  const [productionStats] = await pool.query(`
    SELECT
      COALESCE(SUM(quantity_produced), 0) AS totalProduction,
      COALESCE(SUM(quantity_defective), 0) AS totalDefective
    FROM production_records
  `);

  const [workOrderStats] = await pool.query(`
    SELECT
      COUNT(*) AS totalWorkOrders,
      SUM(status = 'in_progress') AS activeWorkOrders,
      SUM(status = 'completed') AS completedWorkOrders,
      SUM(status = 'planned') AS plannedWorkOrders
    FROM work_orders
  `);

  const [machineStats] = await pool.query(`
    SELECT
      COUNT(*) AS totalMachines,
      SUM(status = 'available') AS availableMachines,
      SUM(status = 'in_use') AS runningMachines,
      SUM(status = 'under_maintenance') AS maintenanceMachines
    FROM machines
  `);

  const [inventoryStats] = await pool.query(`
    SELECT
      COUNT(*) AS totalMaterials,
      SUM(stock_qty <= reorder_level) AS lowStockMaterials
    FROM raw_materials
  `);

  const [qualityStats] = await pool.query(`
    SELECT
      COUNT(*) AS totalInspections,
      SUM(result = 'pass') AS passed,
      SUM(result = 'fail') AS failed,
      SUM(result = 'rework') AS rework
    FROM quality_inspections
  `);

  // =========================
  // PRODUCTION CHART
  // Last 7 days
  // =========================

  const [productionChart] = await pool.query(`
    SELECT
      DATE(production_date) AS date,
      COALESCE(SUM(quantity_produced), 0) AS quantity,
      COALESCE(SUM(quantity_defective), 0) AS defective
    FROM production_records
    WHERE production_date >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(production_date)
    ORDER BY date ASC
  `);

  // =========================
  // MACHINES
  // =========================

  const [machines] = await pool.query(`
    SELECT
      machine_id,
      name,
      type,
      status,
      location
    FROM machines
    ORDER BY machine_id DESC
  `);

  // =========================
  // RECENT WORK ORDERS
  // =========================

  const [workOrders] = await pool.query(`
    SELECT
      wo.work_order_id,
      wo.order_number,
      wo.quantity_to_produce,
      wo.priority,
      wo.status,
      wo.start_date,
      wo.end_date,
      p.name AS product_name,
      p.sku
    FROM work_orders wo
    INNER JOIN products p
      ON wo.product_id = p.product_id
    ORDER BY wo.created_at DESC
    LIMIT 10
  `);

  // =========================
  // LOW STOCK MATERIALS
  // =========================

  const [lowStockMaterials] = await pool.query(`
    SELECT
      material_id,
      name,
      unit,
      stock_qty,
      reorder_level,
      supplier_id
    FROM raw_materials
    WHERE stock_qty <= reorder_level
    ORDER BY stock_qty ASC
  `);

  // =========================
  // RECENT PRODUCTION
  // =========================

  const [recentProduction] = await pool.query(`
    SELECT
      pr.production_record_id,
      pr.quantity_produced,
      pr.quantity_defective,
      pr.production_date,
      wo.order_number,
      p.name AS product_name
    FROM production_records pr
    INNER JOIN work_orders wo
      ON pr.work_order_id = wo.work_order_id
    INNER JOIN products p
      ON wo.product_id = p.product_id
    ORDER BY pr.production_date DESC
    LIMIT 10
  `);

  return {
    stats: {
      totalProduction: Number(productionStats[0].totalProduction),
      totalDefective: Number(productionStats[0].totalDefective),

      totalWorkOrders: Number(workOrderStats[0].totalWorkOrders),
      activeWorkOrders: Number(workOrderStats[0].activeWorkOrders || 0),
      completedWorkOrders: Number(workOrderStats[0].completedWorkOrders || 0),
      plannedWorkOrders: Number(workOrderStats[0].plannedWorkOrders || 0),

      totalMachines: Number(machineStats[0].totalMachines),
      availableMachines: Number(machineStats[0].availableMachines || 0),
      runningMachines: Number(machineStats[0].runningMachines || 0),
      maintenanceMachines: Number(machineStats[0].maintenanceMachines || 0),

      totalMaterials: Number(inventoryStats[0].totalMaterials),
      lowStockMaterials: Number(inventoryStats[0].lowStockMaterials || 0),

      totalInspections: Number(qualityStats[0].totalInspections),
      passedInspections: Number(qualityStats[0].passed || 0),
      failedInspections: Number(qualityStats[0].failed || 0),
      reworkInspections: Number(qualityStats[0].rework || 0),
    },

    productionChart,

    machines,

    workOrders,

    lowStockMaterials,

    recentProduction,
  };
};

module.exports = {
  getDashboardData,
};
