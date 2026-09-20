import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import { salesOrdersApi, customersApi, productsApi } from "../../services/api";

const STATUS_OPTS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const EMPTY_SO    = { customer_id: "", order_number: "", notes: "" };
const EMPTY_ITEM  = { product_id: "", quantity: "", unit_price: "" };

export default function SalesOrders() {
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal]         = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm]           = useState(EMPTY_SO);
  const [itemForm, setItemForm]   = useState(EMPTY_ITEM);
  const [expanded, setExpanded]   = useState(null);
  const [delId, setDelId]         = useState(null);
  const [error, setError]         = useState("");
  const [itemError, setItemError] = useState("");
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([salesOrdersApi.getAll(), customersApi.getAll(), productsApi.getAll()])
      .then(([so, c, p]) => { setOrders(so.data || []); setCustomers(c.data || []); setProducts(p.data || []); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const match = !q || o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q);
    const st = !statusFilter || o.status === statusFilter;
    return match && st;
  });

  const openCreate = () => { setForm({ ...EMPTY_SO, order_number: `SO-${Date.now().toString().slice(-6)}` }); setError(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const res = await salesOrdersApi.create(form);
      setModal(false);
      const newId = res.data?.sales_order_id;
      if (newId) { setSelectedOrder({ ...form, sales_order_id: newId }); setItemForm(EMPTY_ITEM); setItemError(""); setItemModal(true); }
      load();
    } catch(err){ setError(err.message); }
    finally { setSaving(false); }
  };

  const addItem = async e => {
    e.preventDefault(); setItemError(""); setSaving(true);
    try {
      await salesOrdersApi.addItem(selectedOrder.sales_order_id, itemForm);
      setItemForm(EMPTY_ITEM);
      load();
    } catch(err){ setItemError(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { await salesOrdersApi.updateStatus(id, status); load(); } catch(e){ alert(e.message); }
  };

  const remove = async () => {
    try { await salesOrdersApi.delete(delId); load(); } catch(e){ alert(e.message); }
  };

  const toggleExpand = async id => {
    if (expanded === id) { setExpanded(null); return; }
    const res = await salesOrdersApi.getById(id).catch(() => null);
    if (res) setOrders(prev => prev.map(o => o.sales_order_id === id ? { ...o, items: res.data?.items || [] } : o));
    setExpanded(id);
  };

  const f  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const fi = k => e => setItemForm(p => ({ ...p, [k]: e.target.value }));

  const nextStatus = {
    pending:    "processing",
    processing: "shipped",
    shipped:    "delivered",
  };

  const stats = [
    ["Total",     orders.length,                                            "#e8f0fb", "📋"],
    ["Pending",   orders.filter(o => o.status === "pending").length,       "#fffff0", "⏳"],
    ["Processing",orders.filter(o => o.status === "processing").length,    "#ebf8ff", "⚙️"],
    ["Delivered", orders.filter(o => o.status === "delivered").length,     "#f0fff4", "✅"],
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Sales Orders</h1>
          <p>Manage customer orders and fulfillment</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
        {stats.map(([l, v, bg, icon]) => (
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="stat-info"><span>{l}</span><h2>{v}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No sales orders found.</div> :
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.flatMap(o => [
                <tr key={o.sales_order_id}>
                  <td><strong style={{ color: "#1255b8", cursor: "pointer" }} onClick={() => toggleExpand(o.sales_order_id)}>{o.order_number}</strong></td>
                  <td>{o.customer_name || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(o.sales_order_id)}>
                        {expanded === o.sales_order_id ? "Hide" : "Items"}
                      </button>
                      {nextStatus[o.status] && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o.sales_order_id, nextStatus[o.status])}>
                          → {nextStatus[o.status].charAt(0).toUpperCase() + nextStatus[o.status].slice(1)}
                        </button>
                      )}
                      {o.status === "pending" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setItemForm(EMPTY_ITEM); setItemError(""); setItemModal(true); }}>+ Item</button>
                      )}
                      {(o.status === "pending" || o.status === "cancelled") && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDelId(o.sales_order_id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>,
                expanded === o.sales_order_id && (
                  <tr key={`items-${o.sales_order_id}`}>
                    <td colSpan={5} style={{ padding: 0, background: "#f7fafc" }}>
                      <div style={{ padding: "12px 20px" }}>
                        <strong style={{ fontSize: "0.85rem" }}>Order Items</strong>
                        <div style={{ marginTop: 8 }}>
                          {(!o.items || o.items.length === 0) ? (
                            <div style={{ color: "#718096", fontSize: "0.85rem" }}>No items added yet.</div>
                          ) : (
                            <table style={{ background: "#fff", borderRadius: 8 }}>
                              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                              <tbody>{o.items.map((item, idx) => (
                                <tr key={item.item_id || idx}>
                                  <td>{item.product_name || "—"}</td>
                                  <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.sku || "—"}</span></td>
                                  <td>{item.quantity}</td>
                                  <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                                  <td><strong>${(Number(item.quantity) * Number(item.unit_price || 0)).toFixed(2)}</strong></td>
                                </tr>
                              ))}</tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ].filter(Boolean))}</tbody>
            </table>}
          </div>
        </div>
      </div>

      {/* Create SO Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Sales Order">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group"><label>Customer *</label>
            <select value={form.customer_id} onChange={f("customer_id")} required>
              <option value="">— Select Customer —</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Order Number *</label>
            <input value={form.order_number} onChange={f("order_number")} required placeholder="SO-001" />
          </div>
          <div className="form-group"><label>Notes</label>
            <textarea value={form.notes} onChange={f("notes")} rows={2} placeholder="Order notes…" style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create & Add Items"}</button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={`Add Item — ${selectedOrder?.order_number || ""}`}>
        {itemError && <div className="alert alert-error">{itemError}</div>}
        <form onSubmit={addItem}>
          <div className="form-group"><label>Product *</label>
            <select value={itemForm.product_id} onChange={fi("product_id")} required>
              <option value="">— Select Product —</option>
              {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Quantity *</label>
              <input type="number" min="1" value={itemForm.quantity} onChange={fi("quantity")} required />
            </div>
            <div className="form-group"><label>Unit Price ($) *</label>
              <input type="number" step="0.01" min="0" value={itemForm.unit_price} onChange={fi("unit_price")} required />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setItemModal(false)}>Done</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Adding…" : "Add Item"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={remove}
        title="Delete Sales Order" message="Delete this sales order and all its items?" />
    </PageLayout>
  );
}
