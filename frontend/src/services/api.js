const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "https://factoryflow-backend-le1u.onrender.com"
).replace(/\/$/, "");
const BASE_URL = `${API_ORIGIN}/api`;

const getToken = () => sessionStorage.getItem("token");

const request = async (method, endpoint, body = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  const url = `${BASE_URL}${endpoint}`;

  console.log("API Request:", {
    method,
    url,
    body,
  });

  const res = await fetch(url, config);

  // Read response as text first.
  // This prevents "Unexpected token <" when server returns HTML.
  const text = await res.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (parseError) {
    console.error("Server returned non-JSON response:", text);

    throw new Error(
      `Server returned HTML/non-JSON response. ` +
        `Status: ${res.status} ${res.statusText}. ` +
        `URL: ${url}`,
    );
  }

  console.log("API Response:", {
    status: res.status,
    data,
  });

  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || "Request failed");
  }

  return data;
};

export const api = {
  get: (ep) => request("GET", ep),
  post: (ep, b) => request("POST", ep, b),
  put: (ep, b) => request("PUT", ep, b),
  delete: (ep) => request("DELETE", ep),
};

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
};

export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  getMe: () => api.get("/users/me"),
  updateMe: (d) => api.put("/users/me", d),
  create: (d) => api.post("/users", d),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
};

export const employeesApi = {
  getAll: () => api.get("/employees"),
  getById: (id) => api.get(`/employees/${id}`),
  create: (d) => api.post("/employees", d),
  update: (id, d) => api.put(`/employees/${id}`, d),
  delete: (id) => api.delete(`/employees/${id}`),
  getAllDepartments: () => api.get("/employees/departments/all"),
  createDepartment: (d) => api.post("/employees/departments", d),
  updateDepartment: (id, d) => api.put(`/employees/departments/${id}`, d),
  deleteDepartment: (id) => api.delete(`/employees/departments/${id}`),
  getAllShifts: () => api.get("/employees/shifts/all"),
  createShift: (d) => api.post("/employees/shifts", d),
  updateShift: (id, d) => api.put(`/employees/shifts/${id}`, d),
  deleteShift: (id) => api.delete(`/employees/shifts/${id}`),
};

export const productionApi = {
  getAllWorkOrders: () => api.get("/production/work-orders"),
  getWorkOrderById: (id) => api.get(`/production/work-orders/${id}`),
  createWorkOrder: (d) => api.post("/production/work-orders", d),
  updateWorkOrder: (id, d) => api.put(`/production/work-orders/${id}`, d),
  deleteWorkOrder: (id) => api.delete(`/production/work-orders/${id}`),
  startWorkOrder: (id) => api.post(`/production/work-orders/${id}/start`),
  completeWorkOrder: (id) => api.post(`/production/work-orders/${id}/complete`),
  addProductionRecord: (d) => api.post("/production/production-records", d),
  getProductionRecords: (id) =>
    api.get(`/production/work-orders/${id}/production-records`),
  addDowntime: (d) => api.post("/production/downtime", d),
  getDowntimeRecords: (id) => api.get(`/production/work-orders/${id}/downtime`),
};

export const productsApi = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (d) => api.post("/products", d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: (id) => api.delete(`/products/${id}`),
  getBOM: (pid) => api.get(`/products/${pid}/bom`),
  addBOMItem: (pid, d) => api.post(`/products/${pid}/bom`, d),
  updateBOMItem: (bid, d) => api.put(`/products/bom/${bid}`, d),
  deleteBOMItem: (bid) => api.delete(`/products/bom/${bid}`),
};

export const inventoryApi = {
  getAllMaterials: () => api.get("/inventory/materials"),
  createMaterial: (d) => api.post("/inventory/materials", d),
  updateMaterial: (id, d) => api.put(`/inventory/materials/${id}`, d),
  deleteMaterial: (id) => api.delete(`/inventory/materials/${id}`),
  getLowStock: () => api.get("/inventory/materials/low-stock"),
  getMaterialReceipts: () => api.get("/inventory/receipts"),
  getStockMovements: () => api.get("/inventory/movements"),
};

export const machinesApi = {
  getAll: () => api.get("/machines"),
  create: (d) => api.post("/machines", d),
  update: (id, d) => api.put(`/machines/${id}`, d),
  delete: (id) => api.delete(`/machines/${id}`),
};

export const maintenanceApi = {
  getAll: () => api.get("/maintenance"),
  create: (d) => api.post("/maintenance", d),
  update: (id, d) => api.put(`/maintenance/${id}`, d),
  delete: (id) => api.delete(`/maintenance/${id}`),
  complete: (id) => api.put(`/maintenance/${id}/complete`),
};

export const qualityApi = {
  getAll: () => api.get("/quality"),
  create: (d) => api.post("/quality", d),
  update: (id, d) => api.put(`/quality/${id}`, d),
  delete: (id) => api.delete(`/quality/${id}`),
};

export const suppliersApi = {
  getAll: () => api.get("/suppliers"),
  create: (d) => api.post("/suppliers", d),
  update: (id, d) => api.put(`/suppliers/${id}`, d),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const purchaseOrdersApi = {
  getAll: () => api.get("/purchase-orders"),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (d) => api.post("/purchase-orders", d),
  addItem: (id, d) => api.post(`/purchase-orders/${id}/items`, d),
  // Status transitions — match the actual backend routes
  order: (id) => api.put(`/purchase-orders/${id}/order`),
  receive: (id) => api.put(`/purchase-orders/${id}/receive`),
  cancel: (id) => api.put(`/purchase-orders/${id}/cancel`),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
};

export const customersApi = {
  getAll: () => api.get("/customers"),
  create: (d) => api.post("/customers", d),
  update: (id, d) => api.put(`/customers/${id}`, d),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const salesOrdersApi = {
  getAll: () => api.get("/sales-orders"),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (d) => api.post("/sales-orders", d),
  addItem: (id, d) => api.post(`/sales-orders/${id}/items`, d),
  updateStatus: (id, status) =>
    api.put(`/sales-orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/sales-orders/${id}`),
};

export const dashboardApi = {
  getData: () => api.get("/dashboard"),
};
