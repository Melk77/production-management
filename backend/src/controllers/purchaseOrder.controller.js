const purchaseOrderService = require("../services/purchaseOrder.service");

const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await purchaseOrderService.getAllPurchaseOrders();

    res.status(200).json({
      message: "Purchase orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve purchase orders",
      error: error.message,
    });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await purchaseOrderService.getPurchaseOrderById(
      req.params.id,
    );

    res.status(200).json({
      message: "Purchase order retrieved successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve purchase order",
      error: error.message,
    });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.createPurchaseOrder(
      req.body,
      req.user,
    );

    res.status(201).json({
      message: "Purchase order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create purchase order",
      error: error.message,
    });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.updatePurchaseOrder(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Purchase order updated successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(400).json({
      message: "Failed to update purchase order",
      error: error.message,
    });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    await purchaseOrderService.deletePurchaseOrder(req.params.id);

    res.status(200).json({
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(400).json({
      message: "Failed to delete purchase order",
      error: error.message,
    });
  }
};

const addPurchaseOrderItem = async (req, res) => {
  try {
    const item = await purchaseOrderService.addPurchaseOrderItem(
      req.params.id,
      req.body,
    );

    res.status(201).json({
      message: "Purchase order item added successfully",
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add purchase order item",
      error: error.message,
    });
  }
};

const updatePurchaseOrderItem = async (req, res) => {
  try {
    const item = await purchaseOrderService.updatePurchaseOrderItem(
      req.params.itemId,
      req.body,
    );

    res.status(200).json({
      message: "Purchase order item updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update purchase order item",
      error: error.message,
    });
  }
};

const deletePurchaseOrderItem = async (req, res) => {
  try {
    await purchaseOrderService.deletePurchaseOrderItem(req.params.itemId);

    res.status(200).json({
      message: "Purchase order item deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete purchase order item",
      error: error.message,
    });
  }
};

const calculatePurchaseOrderTotal = async (req, res) => {
  try {
    const total = await purchaseOrderService.calculatePurchaseOrderTotal(
      req.params.id,
    );

    res.status(200).json({
      message: "Purchase order total calculated successfully",
      data: {
        purchase_order_id: Number(req.params.id),
        total_amount: total,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to calculate purchase order total",
      error: error.message,
    });
  }
};

const orderPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.orderPurchaseOrder(req.params.id);

    res.status(200).json({
      message: "Purchase order placed successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(400).json({
      message: "Failed to place purchase order",
      error: error.message,
    });
  }
};

const receivePurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.receivePurchaseOrder(
      req.params.id,
    );

    res.status(200).json({
      message: "Purchase order received successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(400).json({
      message: "Failed to receive purchase order",
      error: error.message,
    });
  }
};

const cancelPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.cancelPurchaseOrder(req.params.id);

    res.status(200).json({
      message: "Purchase order cancelled successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Purchase order not found") {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.status(400).json({
      message: "Failed to cancel purchase order",
      error: error.message,
    });
  }
};

const getPurchaseOrdersByStatus = async (req, res) => {
  try {
    const orders = await purchaseOrderService.getPurchaseOrdersByStatus(
      req.params.status,
    );

    res.status(200).json({
      message: "Purchase orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve purchase orders by status",
      error: error.message,
    });
  }
};

const getPurchaseOrdersBySupplier = async (req, res) => {
  try {
    const orders = await purchaseOrderService.getPurchaseOrdersBySupplier(
      req.params.supplierId,
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
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,

  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,

  calculatePurchaseOrderTotal,

  orderPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,

  getPurchaseOrdersByStatus,
  getPurchaseOrdersBySupplier,
};
