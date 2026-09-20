const supplierService = require("../services/supplier.service");

const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();

    res.status(200).json({
      message: "Suppliers retrieved successfully",
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve suppliers",
      error: error.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);

    res.status(200).json({
      message: "Supplier retrieved successfully",
      data: supplier,
    });
  } catch (error) {
    if (error.message === "Supplier not found") {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve supplier",
      error: error.message,
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);

    res.status(201).json({
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create supplier",
      error: error.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.updateSupplier(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    if (error.message === "Supplier not found") {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.status(400).json({
      message: "Failed to update supplier",
      error: error.message,
    });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    await supplierService.deleteSupplier(req.params.id);

    res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    if (error.message === "Supplier not found") {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    // Supplier is still referenced by another table
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "Supplier cannot be deleted because it is still being used",
      });
    }

    res.status(400).json({
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
};

const searchSuppliers = async (req, res) => {
  try {
    const { search } = req.query;

    const suppliers = await supplierService.searchSuppliers(search);

    res.status(200).json({
      message: "Suppliers retrieved successfully",
      data: suppliers,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to search suppliers",
      error: error.message,
    });
  }
};

const getSupplierMaterials = async (req, res) => {
  try {
    const materials = await supplierService.getSupplierMaterials(req.params.id);

    res.status(200).json({
      message: "Supplier materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    if (error.message === "Supplier not found") {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve supplier materials",
      error: error.message,
    });
  }
};

const getSupplierPurchaseOrders = async (req, res) => {
  try {
    const orders = await supplierService.getSupplierPurchaseOrders(
      req.params.id,
    );

    res.status(200).json({
      message: "Supplier purchase orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    if (error.message === "Supplier not found") {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve supplier purchase orders",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  getSupplierMaterials,
  getSupplierPurchaseOrders,
};
