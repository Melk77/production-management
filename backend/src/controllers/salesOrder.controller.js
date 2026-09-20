const salesOrderService = require("../services/salesOrder.service");

const getAllSalesOrders = async (req, res) => {
  try {
    const data = await salesOrderService.getAllSalesOrders();
    res.status(200).json({ message: "Sales orders retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve sales orders", error: error.message });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const data = await salesOrderService.getSalesOrderById(req.params.id);
    res.status(200).json({ message: "Sales order retrieved successfully", data });
  } catch (error) {
    if (error.message === "Sales order not found")
      return res.status(404).json({ message: "Sales order not found" });
    res.status(500).json({ message: "Failed to retrieve sales order", error: error.message });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const data = await salesOrderService.createSalesOrder(req.body, req.user);
    res.status(201).json({ message: "Sales order created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create sales order", error: error.message });
  }
};

const addSalesOrderItem = async (req, res) => {
  try {
    const data = await salesOrderService.addSalesOrderItem(req.params.id, req.body);
    res.status(201).json({ message: "Item added to sales order", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to add item", error: error.message });
  }
};

const updateSalesOrderStatus = async (req, res) => {
  try {
    const data = await salesOrderService.updateSalesOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ message: "Sales order status updated", data });
  } catch (error) {
    if (error.message === "Sales order not found")
      return res.status(404).json({ message: "Sales order not found" });
    res.status(400).json({ message: "Failed to update status", error: error.message });
  }
};

const deleteSalesOrder = async (req, res) => {
  try {
    await salesOrderService.deleteSalesOrder(req.params.id);
    res.status(200).json({ message: "Sales order deleted successfully" });
  } catch (error) {
    if (error.message === "Sales order not found")
      return res.status(404).json({ message: "Sales order not found" });
    res.status(400).json({ message: "Failed to delete sales order", error: error.message });
  }
};

module.exports = {
  getAllSalesOrders, getSalesOrderById, createSalesOrder,
  addSalesOrderItem, updateSalesOrderStatus, deleteSalesOrder,
};
