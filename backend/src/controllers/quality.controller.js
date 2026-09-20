const qualityService = require("../services/quality.service");

const getAllInspections = async (req, res) => {
  try {
    const inspections = await qualityService.getAllInspections();

    res.status(200).json({
      message: "Quality inspections retrieved successfully",
      data: inspections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve quality inspections",
      error: error.message,
    });
  }
};

const getInspectionById = async (req, res) => {
  try {
    const inspection = await qualityService.getInspectionById(req.params.id);

    res.status(200).json({
      message: "Quality inspection retrieved successfully",
      data: inspection,
    });
  } catch (error) {
    if (error.message === "Quality inspection not found") {
      return res.status(404).json({
        message: "Quality inspection not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve quality inspection",
      error: error.message,
    });
  }
};

const createInspection = async (req, res) => {
  try {
    const inspection = await qualityService.createInspection(req.body);

    res.status(201).json({
      message: "Quality inspection created successfully",
      data: inspection,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create quality inspection",
      error: error.message,
    });
  }
};

const updateInspection = async (req, res) => {
  try {
    const inspection = await qualityService.updateInspection(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Quality inspection updated successfully",
      data: inspection,
    });
  } catch (error) {
    if (error.message === "Quality inspection not found") {
      return res.status(404).json({
        message: "Quality inspection not found",
      });
    }

    res.status(400).json({
      message: "Failed to update quality inspection",
      error: error.message,
    });
  }
};

const deleteInspection = async (req, res) => {
  try {
    await qualityService.deleteInspection(req.params.id);

    res.status(200).json({
      message: "Quality inspection deleted successfully",
    });
  } catch (error) {
    if (error.message === "Quality inspection not found") {
      return res.status(404).json({
        message: "Quality inspection not found",
      });
    }

    res.status(400).json({
      message: "Failed to delete quality inspection",
      error: error.message,
    });
  }
};

const getInspectionsByWorkOrder = async (req, res) => {
  try {
    const inspections = await qualityService.getInspectionsByWorkOrder(
      req.params.workOrderId,
    );

    res.status(200).json({
      message: "Work order quality inspections retrieved successfully",
      data: inspections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve work order quality inspections",
      error: error.message,
    });
  }
};

const getInspectionsByResult = async (req, res) => {
  try {
    const inspections = await qualityService.getInspectionsByResult(
      req.params.result,
    );

    res.status(200).json({
      message: "Quality inspections retrieved successfully",
      data: inspections,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve quality inspections by result",
      error: error.message,
    });
  }
};

const getFailedInspections = async (req, res) => {
  try {
    const inspections = await qualityService.getFailedInspections();

    res.status(200).json({
      message: "Failed inspections retrieved successfully",
      data: inspections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve failed inspections",
      error: error.message,
    });
  }
};

const getReworkInspections = async (req, res) => {
  try {
    const inspections = await qualityService.getReworkInspections();

    res.status(200).json({
      message: "Rework inspections retrieved successfully",
      data: inspections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve rework inspections",
      error: error.message,
    });
  }
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
