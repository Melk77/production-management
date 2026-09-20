const customerService = require("../services/customer.service");

const getAllCustomers = async (req, res) => {
  try {
    const data = await customerService.getAllCustomers();
    res.status(200).json({ message: "Customers retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve customers", error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const data = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ message: "Customer retrieved successfully", data });
  } catch (error) {
    if (error.message === "Customer not found")
      return res.status(404).json({ message: "Customer not found" });
    res.status(500).json({ message: "Failed to retrieve customer", error: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const data = await customerService.createCustomer(req.body);
    res.status(201).json({ message: "Customer created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create customer", error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const data = await customerService.updateCustomer(req.params.id, req.body);
    res.status(200).json({ message: "Customer updated successfully", data });
  } catch (error) {
    if (error.message === "Customer not found")
      return res.status(404).json({ message: "Customer not found" });
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    if (error.message === "Customer not found")
      return res.status(404).json({ message: "Customer not found" });
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
