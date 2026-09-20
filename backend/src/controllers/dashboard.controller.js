const dashboardService = require("../services/dashboard.service");

const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboardData();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};
