const employeeService = require("../services/employee.service");

// =========================================================
// EMPLOYEES
// =========================================================

const getAllEmployees = async (req, res) => {
  try {
    const data = await employeeService.getAllEmployees();
    res.status(200).json({ message: "Employees retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve employees", error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const data = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({ message: "Employee retrieved successfully", data });
  } catch (error) {
    if (error.message === "Employee not found")
      return res.status(404).json({ message: "Employee not found" });
    res.status(500).json({ message: "Failed to retrieve employee", error: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ message: "Employee created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create employee", error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const data = await employeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json({ message: "Employee updated successfully", data });
  } catch (error) {
    if (error.message === "Employee not found")
      return res.status(404).json({ message: "Employee not found" });
    res.status(500).json({ message: "Failed to update employee", error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    if (error.message === "Employee not found")
      return res.status(404).json({ message: "Employee not found" });
    res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
};

// =========================================================
// DEPARTMENTS
// =========================================================

const getAllDepartments = async (req, res) => {
  try {
    const data = await employeeService.getAllDepartments();
    res.status(200).json({ message: "Departments retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve departments", error: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const data = await employeeService.getDepartmentById(req.params.id);
    res.status(200).json({ message: "Department retrieved successfully", data });
  } catch (error) {
    if (error.message === "Department not found")
      return res.status(404).json({ message: "Department not found" });
    res.status(500).json({ message: "Failed to retrieve department", error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const data = await employeeService.createDepartment(req.body);
    res.status(201).json({ message: "Department created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create department", error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const data = await employeeService.updateDepartment(req.params.id, req.body);
    res.status(200).json({ message: "Department updated successfully", data });
  } catch (error) {
    if (error.message === "Department not found")
      return res.status(404).json({ message: "Department not found" });
    res.status(500).json({ message: "Failed to update department", error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await employeeService.deleteDepartment(req.params.id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    if (error.message === "Department not found")
      return res.status(404).json({ message: "Department not found" });
    res.status(500).json({ message: "Failed to delete department", error: error.message });
  }
};

// =========================================================
// SHIFTS
// =========================================================

const getAllShifts = async (req, res) => {
  try {
    const data = await employeeService.getAllShifts();
    res.status(200).json({ message: "Shifts retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve shifts", error: error.message });
  }
};

const createShift = async (req, res) => {
  try {
    const data = await employeeService.createShift(req.body);
    res.status(201).json({ message: "Shift created successfully", data });
  } catch (error) {
    res.status(400).json({ message: "Failed to create shift", error: error.message });
  }
};

const updateShift = async (req, res) => {
  try {
    const data = await employeeService.updateShift(req.params.id, req.body);
    res.status(200).json({ message: "Shift updated successfully", data });
  } catch (error) {
    if (error.message === "Shift not found")
      return res.status(404).json({ message: "Shift not found" });
    res.status(500).json({ message: "Failed to update shift", error: error.message });
  }
};

const deleteShift = async (req, res) => {
  try {
    await employeeService.deleteShift(req.params.id);
    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    if (error.message === "Shift not found")
      return res.status(404).json({ message: "Shift not found" });
    res.status(500).json({ message: "Failed to delete shift", error: error.message });
  }
};

module.exports = {
  getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
  getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment,
  getAllShifts, createShift, updateShift, deleteShift,
};
