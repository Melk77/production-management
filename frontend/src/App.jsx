import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/account/Profile";

import Dashboard from "./pages/dashboard/Dashboard";

import Users from "./pages/admin/Users";
import Employees from "./pages/admin/Employees";
import Departments from "./pages/admin/Departments";

import WorkOrders from "./pages/production/WorkOrders";
import WorkOrderDetail from "./pages/production/WorkOrderDetail";
import Products from "./pages/production/Products";
import ProductionLog from "./pages/production/ProductionLog";

import Machines from "./pages/machines/Machines";
import Maintenance from "./pages/machines/Maintenance";

import Inventory from "./pages/warehouse/Inventory";
import FinishedGoods from "./pages/warehouse/FinishedGoods";
import StockMovements from "./pages/warehouse/StockMovements";

import Quality from "./pages/quality/Quality";

import Suppliers from "./pages/procurement/Suppliers";
import PurchaseOrders from "./pages/procurement/PurchaseOrders";
import Customers from "./pages/procurement/Customers";
import SalesOrders from "./pages/procurement/SalesOrders";

/** Shorthand: wrap children in a ProtectedRoute, forwarding allowedRoles. */
const P = ({ children, roles }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/profile"
            element={
              <P>
                <Profile />
              </P>
            }
          />

          {/* Dashboard — any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <P>
                <Dashboard />
              </P>
            }
          />

          {/* Admin — admin only */}
          <Route
            path="/users"
            element={
              <P roles={["admin"]}>
                <Users />
              </P>
            }
          />
          <Route
            path="/employees"
            element={
              <P roles={["admin"]}>
                <Employees />
              </P>
            }
          />
          <Route
            path="/departments"
            element={
              <P roles={["admin"]}>
                <Departments />
              </P>
            }
          />

          {/* Production — managers and operators */}
          <Route
            path="/work-orders"
            element={
              <P roles={["admin", "manager", "operator"]}>
                <WorkOrders />
              </P>
            }
          />
          <Route
            path="/work-orders/:id"
            element={
              <P roles={["admin", "manager", "operator"]}>
                <WorkOrderDetail />
              </P>
            }
          />
          <Route
            path="/products"
            element={
              <P roles={["admin", "manager"]}>
                <Products />
              </P>
            }
          />
          <Route
            path="/production"
            element={
              <P roles={["admin", "manager", "operator"]}>
                <ProductionLog />
              </P>
            }
          />

          {/* Machines & Maintenance — managers and admins */}
          <Route
            path="/machines"
            element={
              <P roles={["admin", "manager"]}>
                <Machines />
              </P>
            }
          />
          <Route
            path="/maintenance"
            element={
              <P roles={["admin", "manager"]}>
                <Maintenance />
              </P>
            }
          />

          {/* Inventory / Warehouse — warehouse staff and admins */}
          <Route
            path="/inventory"
            element={
              <P roles={["admin", "warehouse"]}>
                <Inventory />
              </P>
            }
          />
          <Route
            path="/finished-goods"
            element={
              <P roles={["admin", "warehouse", "manager"]}>
                <FinishedGoods />
              </P>
            }
          />
          <Route
            path="/stock-movements"
            element={
              <P roles={["admin", "warehouse", "manager"]}>
                <StockMovements />
              </P>
            }
          />

          {/* Quality — inspectors and admins */}
          <Route
            path="/quality"
            element={
              <P roles={["admin", "inspector"]}>
                <Quality />
              </P>
            }
          />

          {/* Procurement — procurement officers and admins */}
          <Route
            path="/suppliers"
            element={
              <P roles={["admin", "procurement", "manager"]}>
                <Suppliers />
              </P>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <P roles={["admin", "procurement", "manager"]}>
                <PurchaseOrders />
              </P>
            }
          />

          {/* Sales — procurement, managers, and admins */}
          <Route
            path="/customers"
            element={
              <P roles={["admin", "procurement", "manager"]}>
                <Customers />
              </P>
            }
          />
          <Route
            path="/sales-orders"
            element={
              <P roles={["admin", "procurement", "manager"]}>
                <SalesOrders />
              </P>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
