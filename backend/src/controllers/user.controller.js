const userService = require("../services/user.service");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve user",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);
    res.status(200).json({
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json({
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve profile",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const updatedUser = await userService.updateOwnProfile(req.user.id, {
      name,
      email,
      password,
      phone,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  getMe,
  updateMe,
  createUser,
  updateUser,
  deleteUser,
};
