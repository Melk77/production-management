const inventoryService = require("../services/inventory.service");

// Materials
const getAllMaterials = async (req, res) => {
  try {
    const materials = await inventoryService.getAllMaterials();

    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve materials",
      error: error.message,
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const material = await inventoryService.getMaterialById(req.params.id);

    res.status(200).json({
      message: "Material retrieved successfully",
      data: material,
    });
  } catch (error) {
    const status = error.message === "Material not found" ? 404 : 500;

    res.status(status).json({
      message: error.message,
    });
  }
};

const createMaterial = async (req, res) => {
  try {
    const material = await inventoryService.createMaterial(req.body);

    res.status(201).json({
      message: "Material created successfully",
      data: material,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create material",
      error: error.message,
    });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const material = await inventoryService.updateMaterial(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Material updated successfully",
      data: material,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update material",
      error: error.message,
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    await inventoryService.deleteMaterial(req.params.id);

    res.status(200).json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete material",
      error: error.message,
    });
  }
};

// Low stock
const getLowStockMaterials = async (req, res) => {
  try {
    const materials = await inventoryService.getLowStockMaterials();

    res.status(200).json({
      message: "Low stock materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve low stock materials",
      error: error.message,
    });
  }
};

// Receiving
const receiveMaterial = async (req, res) => {
  try {
    const receipt = await inventoryService.receiveMaterial(req.body, req.user);

    res.status(201).json({
      message: "Material received successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to receive material",
      error: error.message,
    });
  }
};

const getMaterialReceipts = async (req, res) => {
  try {
    const receipts = await inventoryService.getMaterialReceipts();

    res.status(200).json({
      message: "Material receipts retrieved successfully",
      data: receipts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve material receipts",
      error: error.message,
    });
  }
};

const checkMaterialReceipt = async (req, res) => {
  try {
    const receipt = await inventoryService.checkMaterialReceipt(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      message: "Material checked successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to check material",
      error: error.message,
    });
  }
};

const acceptMaterialReceipt = async (req, res) => {
  try {
    const receipt = await inventoryService.acceptMaterialReceipt(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      message: "Material accepted successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to accept material",
      error: error.message,
    });
  }
};

const rejectMaterialReceipt = async (req, res) => {
  try {
    const receipt = await inventoryService.rejectMaterialReceipt(
      req.params.id,
      req.body.reason,
      req.user,
    );

    res.status(200).json({
      message: "Material rejected successfully",
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to reject material",
      error: error.message,
    });
  }
};

// Movements
const getStockMovements = async (req, res) => {
  try {
    const movements = await inventoryService.getStockMovements();

    res.status(200).json({
      message: "Stock movements retrieved successfully",
      data: movements,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve stock movements",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  receiveMaterial,
  getMaterialReceipts,
  checkMaterialReceipt,
  acceptMaterialReceipt,
  rejectMaterialReceipt,
  getStockMovements,
};
