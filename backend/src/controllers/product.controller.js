const productService = require("../services/product.service");

const getAllProducts = async (req, res) => {
  try {
    const data = await productService.getAllProducts();
    res.status(200).json({ message: "Products retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.status(200).json({ message: "Product retrieved successfully", data });
  } catch (error) {
    if (error.message === "Product not found")
      return res.status(404).json({ message: "Product not found" });
    res.status(500).json({ message: "Failed to retrieve product", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = await productService.createProduct(req.body);
    res.status(201).json({ message: "Product created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ message: "Product updated successfully", data });
  } catch (error) {
    if (error.message === "Product not found")
      return res.status(404).json({ message: "Product not found" });
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error.message === "Product not found")
      return res.status(404).json({ message: "Product not found" });
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

const getBOM = async (req, res) => {
  try {
    const data = await productService.getBOM(req.params.productId);
    res.status(200).json({ message: "BOM retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve BOM", error: error.message });
  }
};

const addBOMItem = async (req, res) => {
  try {
    const data = await productService.addBOMItem(req.params.productId, req.body);
    res.status(201).json({ message: "BOM item added successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to add BOM item", error: error.message });
  }
};

const updateBOMItem = async (req, res) => {
  try {
    const data = await productService.updateBOMItem(req.params.bomId, req.body);
    res.status(200).json({ message: "BOM item updated successfully", data });
  } catch (error) {
    if (error.message === "BOM item not found")
      return res.status(404).json({ message: "BOM item not found" });
    res.status(500).json({ message: "Failed to update BOM item", error: error.message });
  }
};

const deleteBOMItem = async (req, res) => {
  try {
    await productService.deleteBOMItem(req.params.bomId);
    res.status(200).json({ message: "BOM item deleted successfully" });
  } catch (error) {
    if (error.message === "BOM item not found")
      return res.status(404).json({ message: "BOM item not found" });
    res.status(500).json({ message: "Failed to delete BOM item", error: error.message });
  }
};

module.exports = {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getBOM, addBOMItem, updateBOMItem, deleteBOMItem,
};
