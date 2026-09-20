const productionService = require("../services/production.service");
// GET /work-orders
const getAllWorkOrders = async (req, res) => {
  try {
    const workOrders = await productionService.getAllWorkOrders();
    res.status(200).json({
      message: "Work orders retrieved successfully",
      data: workOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve work orders",
      error: error.message,
    });
  }
};

// GET /work-orders/:id
const getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await productionService.getWorkOrderById(req.params.id);
    res.status(200).json({
      message: "Work order retrieved successfully",
      data: workOrder,
    });
  } catch (error) {
    if (error.message === "Work order not found") {
      return res.status(404).json({
        message: "Work order not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve work order",
      error: error.message,
    });
  }
};

// POST /work-orders
const createWorkOrder = async (req, res) => {
  try {
    const workOrder = await productionService.createWorkOrder(
      req.body,
      req.user,
    );
    res.status(201).json({
      message: "Work order created successfully",
      data: workOrder,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create work order",
      error: error.message,
    });
  }
};

// PUT /work-orders/:id
const updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await productionService.updateWorkOrder(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      message: "Work order updated successfully",
      data: workOrder,
    });
  } catch (error) {
    if (error.message === "Work order not found") {
      return res.status(404).json({
        message: "Work order not found",
      });
    }
    res.status(500).json({
      message: "Failed to update work order",
      error: error.message,
    });
  }
};

// DELETE /work-orders/:id
const deleteWorkOrder = async (req, res) => {
  try {
    await productionService.deleteWorkOrder(req.params.id);
    res.status(200).json({
      message: "Work order deleted successfully",
    });
  } catch (error) {
    if (error.message === "Work order not found") {
      return res.status(404).json({
        message: "Work order not found",
      });
    }
    res.status(500).json({
      message: "Failed to delete work order",
      error: error.message,
    });
  }
};

// POST /work-orders/:id/start
const startWorkOrder = async (req, res) => {
  try {
    const workOrder = await productionService.startWorkOrder(req.params.id);
    res.status(200).json({
      message: "Work order started successfully",
      data: workOrder,
    });
  } catch (error) {
    if (error.message === "Work order not found or cannot be started") {
      return res.status(400).json({
        message: "Work order not found or cannot be started",
      });
    }
    res.status(500).json({
      message: "Failed to start work order",
      error: error.message,
    });
  }
};

// POST /work-orders/:id/complete
const completeWorkOrder = async (req, res) => {
  try {
    const workOrder = await productionService.completeWorkOrder(req.params.id);
    res.status(200).json({
      message: "Work order completed successfully",
      data: workOrder,
    });
  } catch (error) {
    if (error.message === "Work order not found or cannot be completed") {
      return res.status(400).json({
        message: "Work order not found or cannot be completed",
      });
    }

    res.status(500).json({
      message: "Failed to complete work order",
      error: error.message,
    });
  }
};

// POST /production-records
const addProductionRecord = async (req, res) => {
  try {
    const record = await productionService.addProductionRecord(req.body);
    res.status(201).json({
      message: "Production record added successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add production record",
      error: error.message,
    });
  }
};

// GET /work-orders/:workOrderId/production-records
const getProductionRecords = async (req, res) => {
  try {
    const records = await productionService.getProductionRecords(
      req.params.workOrderId,
    );
    res.status(200).json({
      message: "Production records retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve production records",
      error: error.message,
    });
  }
};

// POST /material-consumption
const addMaterialConsumption = async (req, res) => {
  try {
    const consumption = await productionService.addMaterialConsumption(
      req.body,
    );
    res.status(201).json({
      message: "Material consumption added successfully",
      data: consumption,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add material consumption",
      error: error.message,
    });
  }
};

// POST /downtime
const addDowntime = async (req, res) => {
  try {
    const downtime = await productionService.addDowntime(req.body);
    res.status(201).json({
      message: "Downtime added successfully",
      data: downtime,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add downtime",
      error: error.message,
    });
  }
};

// GET /work-orders/:workOrderId/downtime
const getDowntimeRecords = async (req, res) => {
  try {
    const records = await productionService.getDowntimeRecords(
      req.params.workOrderId,
    );

    res.status(200).json({
      message: "Downtime records retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve downtime records",
      error: error.message,
    });
  }
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
