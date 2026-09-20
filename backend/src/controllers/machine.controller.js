const machineService = require("../services/machine.service");

const getAllMachines = async (req, res) => {
  try {
    const machines = await machineService.getAllMachines();

    res.status(200).json({
      message: "Machines retrieved successfully",
      data: machines,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve machines",
      error: error.message,
    });
  }
};

const getMachineById = async (req, res) => {
  try {
    const machine = await machineService.getMachineById(req.params.id);

    res.status(200).json({
      message: "Machine retrieved successfully",
      data: machine,
    });
  } catch (error) {
    if (error.message === "Machine not found") {
      return res.status(404).json({
        message: "Machine not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve machine",
      error: error.message,
    });
  }
};

const createMachine = async (req, res) => {
  try {
    const machine = await machineService.createMachine(req.body);

    res.status(201).json({
      message: "Machine created successfully",
      data: machine,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create machine",
      error: error.message,
    });
  }
};

const updateMachine = async (req, res) => {
  try {
    const machine = await machineService.updateMachine(req.params.id, req.body);

    res.status(200).json({
      message: "Machine updated successfully",
      data: machine,
    });
  } catch (error) {
    if (error.message === "Machine not found") {
      return res.status(404).json({
        message: "Machine not found",
      });
    }

    res.status(400).json({
      message: "Failed to update machine",
      error: error.message,
    });
  }
};

const deleteMachine = async (req, res) => {
  try {
    await machineService.deleteMachine(req.params.id);

    res.status(200).json({
      message: "Machine deleted successfully",
    });
  } catch (error) {
    if (error.message === "Machine not found") {
      return res.status(404).json({
        message: "Machine not found",
      });
    }

    res.status(400).json({
      message: "Failed to delete machine",
      error: error.message,
    });
  }
};

const updateMachineStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const machine = await machineService.updateMachineStatus(
      req.params.id,
      status,
    );

    res.status(200).json({
      message: "Machine status updated successfully",
      data: machine,
    });
  } catch (error) {
    if (error.message === "Machine not found") {
      return res.status(404).json({
        message: "Machine not found",
      });
    }

    res.status(400).json({
      message: "Failed to update machine status",
      error: error.message,
    });
  }
};

const getMachinesByStatus = async (req, res) => {
  try {
    const machines = await machineService.getMachinesByStatus(
      req.params.status,
    );

    res.status(200).json({
      message: "Machines retrieved successfully",
      data: machines,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve machines by status",
      error: error.message,
    });
  }
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
