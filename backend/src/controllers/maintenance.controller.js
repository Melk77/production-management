const maintenanceService = require("../services/maintenance.service");

const getAllMaintenance = async (req, res) => {
  try {
    const records = await maintenanceService.getAllMaintenance();

    res.status(200).json({
      message: "Maintenance records retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve maintenance records",
      error: error.message,
    });
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    const record = await maintenanceService.getMaintenanceById(req.params.id);

    res.status(200).json({
      message: "Maintenance record retrieved successfully",
      data: record,
    });
  } catch (error) {
    if (error.message === "Maintenance record not found") {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve maintenance record",
      error: error.message,
    });
  }
};

const createMaintenance = async (req, res) => {
  try {
    const record = await maintenanceService.createMaintenance(req.body);

    res.status(201).json({
      message: "Maintenance scheduled successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to schedule maintenance",
      error: error.message,
    });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const record = await maintenanceService.updateMaintenance(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Maintenance record updated successfully",
      data: record,
    });
  } catch (error) {
    if (error.message === "Maintenance record not found") {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    res.status(400).json({
      message: "Failed to update maintenance record",
      error: error.message,
    });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    await maintenanceService.deleteMaintenance(req.params.id);

    res.status(200).json({
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    if (error.message === "Maintenance record not found") {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    res.status(400).json({
      message: "Failed to delete maintenance record",
      error: error.message,
    });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const record = await maintenanceService.completeMaintenance(req.params.id);

    res.status(200).json({
      message: "Maintenance completed successfully",
      data: record,
    });
  } catch (error) {
    if (error.message === "Maintenance record not found") {
      return res.status(404).json({
        message: "Maintenance record not found",
      });
    }

    res.status(400).json({
      message: "Failed to complete maintenance",
      error: error.message,
    });
  }
};

const getMachineMaintenance = async (req, res) => {
  try {
    const records = await maintenanceService.getMachineMaintenance(
      req.params.machineId,
    );

    res.status(200).json({
      message: "Machine maintenance history retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve machine maintenance history",
      error: error.message,
    });
  }
};

const getScheduledMaintenance = async (req, res) => {
  try {
    const records = await maintenanceService.getScheduledMaintenance();

    res.status(200).json({
      message: "Scheduled maintenance retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve scheduled maintenance",
      error: error.message,
    });
  }
};

const getCompletedMaintenance = async (req, res) => {
  try {
    const records = await maintenanceService.getCompletedMaintenance();

    res.status(200).json({
      message: "Completed maintenance retrieved successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve completed maintenance",
      error: error.message,
    });
  }
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
