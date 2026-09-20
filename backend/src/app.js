const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const productionRoutes = require("./routes/production.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const machineRoutes = require("./routes/machines.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const qualityRoutes = require("./routes/quality.routes");
const supplierRoutes = require("./routes/suppliers.routes");
const purchaseRoutes = require("./routes/purchaseOrders.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const employeeRoutes = require("./routes/employees.routes");
const productRoutes = require("./routes/products.routes");
const customerRoutes = require("./routes/customers.routes");
const salesOrderRoutes = require("./routes/salesOrders.routes");

const app = express();

// Only allow requests from the configured frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales-orders", salesOrderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "FactoryFlow API is running",
    version: "1.0.0",
  });
});

module.exports = app;
