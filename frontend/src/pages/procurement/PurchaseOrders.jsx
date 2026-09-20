import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import { purchaseOrdersApi, suppliersApi, inventoryApi } from "../../services/api";

const STATUS_OPTS = ["draft", "ordered", "received", "cancelled"];
const EMPTY_PO    = { supplier_id: "", order_number: "", expected_delivery_date: "", notes: "" };
const EMPTY_ITEM  = { material_id: "", quantity: "", unit_price: "" };

export default function PurchaseOrders() {
  const [orders, setOrders]       = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal]         = useState(false);   // create PO modal
  const [itemModal, setItemModal] = useState(false);   // add item modal
  const [selectedOrder, setSelectedOrder] = useState(null); // order to add items to
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_PO);
  const [itemForm, setItemForm]   = useState(EMPTY_ITEM);
  const [expanded, setExpanded]   = useState(null);
  const [delId, setDelId]         = useState(null);
  const [error, setError]         = useState("");
  const [itemError, setItemError] = useState("");
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([purchaseOrdersApi.getAll(), suppliersApi.getAll(), inventoryApi.getAllMaterials()])
      .then(([po, s, m]) => { setOrders(po.data || []); setSuppliers(s.data || []); setMaterials(m.data || []); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const match = !q || o.order_number?.toLowerCase().includes(q) || o.supplier_name?.toLowerCase().includes(q);
    const st = !statusFilter || o.status === statusFilter;
    return match && st;
  });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_PO, order_number: `PO-${Date.now().toString().slice(-6)}` }); setError(""); setModal(true); };
  const openEdit   = o => { setEditing(o); setForm({ supplier_id: o.supplier_id, order_number: o.order_number, expected_delivery_date: o.expected_delivery_date?.split("T")[0] || "", notes: o.notes || "" }); setError(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      if (editing) await purchaseOrdersApi.create({ ...form, _method: "PUT" }); // update via API
      else {
        const res = await purchaseOrdersApi.create(form);
        setModal(false);
        // Open item modal for new PO
        const newId = res.data?.purchase_order_id;
        if (newId) { setSelectedOrder({ ...form, purchase_order_id: newId }); setItemForm(EMPTY_ITEM); setItemError(""); setItemModal(true); }
        load(); return;
      }
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally { setSaving(false); }
  };

  const addItem = async e => {
    e.preventDefault(); setItemError(""); setSaving(true);
    try {
      await purchaseOrdersApi.addItem(selectedOrder.purchase_order_id, itemForm);
      setItemForm(EMPTY_ITEM);
      load();
    } catch(err){ setItemError(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "ordered")   await purchaseOrdersApi.updateStatus(id, "ordered");
      else if (status === "received") await purchaseOrdersApi.updateStatus(id, "received");
      else if (status === "cancelled") await purchaseOrdersApi.updateStatus(id, "cancelled");
      else await purchaseOrdersApi.updateStatus(id, status);
      load();
    } catch(e){ alert(e.message); }
  };

  const remove = async () => {
    try { await purchaseOrdersApi.delete(delId); load(); } catch(e){ alert(e.message); }
  };

  const toggleExpand = async id => {
    if (expanded === id) { setExpanded(null); return; }
    const res = await purchaseOrdersApi.getById(id).catch(() => null);
    if (res) setOrders(prev => prev.map(o => o.purchase_order_id === id ? { ...o, items: res.data?.items || [] } : o));
    setExpanded(id);
  };

  const f    = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const fi   = k => e => setItemForm(p => ({ ...p, [k]: e.target.value }));

  const stats = [
    ["Total",     orders.length,                                          "#e8f0fb", "📋"],
    ["Draft",     orders.filter(o => o.status === "draft").length,       "#f7fafc", "📝"],
    ["Ordered",   orders.filter(o => o.status === "ordered").length,     "#fffff0", "📦"],
    ["Received",  orders.filter(o => o.status === "received").length,    "#f0fff4", "✅"],
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Purchase Orders</h1>
          <p>Manage procurement and supplier orders</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Create PO</button>
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
            <input className="search-input" placeholder="Search POs…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No purchase orders found.</div> :
            <table>
              <thead><tr><th>PO #</th><th>Supplier</th><th>Expected Delivery</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.flatMap(o => [
                <tr key={o.purchase_order_id}>
                  <td><strong style={{ color: "#1255b8", cursor: "pointer" }} onClick={() => toggleExpand(o.purchase_order_id)}>{o.order_number}</strong></td>
                  <td>{o.supplier_name || "—"}</td>
                  <td>{o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString() : "—"}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(o.purchase_order_id)}>
                        {expanded === o.purchase_order_id ? "Hide Items" : "Items"}
                      </button>
                      {o.status === "draft" && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o.purchase_order_id, "ordered")}>Order</button>}
                      {o.status === "ordered" && <button className="btn btn-success btn-sm" onClick={() => updateStatus(o.purchase_order_id, "received")}>Receive</button>}
                      {o.status !== "received" && o.status !== "cancelled" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(o)}>Edit</button>
                      )}
                      {o.status === "draft" && <button className="btn btn-danger btn-sm" onClick={() => setDelId(o.purchase_order_id)}>Delete</button>}
                    </div>
                  </td>
                </tr>,
                expanded === o.purchase_order_id && (
                  <tr key={`items-${o.purchase_order_id}`}>
                    <td colSpan={5} style={{ padding: 0, background: "#f7fafc" }}>
                      <div style={{ padding: "12px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <strong style={{ fontSize: "0.85rem" }}>Order Items</strong>
                          {o.status === "draft" && (
                            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedOrder(o); setItemForm(EMPTY_ITEM); setItemError(""); setItemModal(true); }}>+ Add Item</button>
                          )}
                        </div>
                        {(!o.items || o.items.length === 0) ? (
                          <div style={{ color: "#718096", fontSize: "0.85rem", padding: "8px 0" }}>No items yet. Add materials to this PO.</div>
                        ) : (
                          <table style={{ background: "#fff", borderRadius: 8 }}>
                            <thead><tr><th>Material</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                            <tbody>{o.items.map((item, idx) => (
                              <tr key={item.item_id || idx}>
                                <td>{item.material_name || "—"}</td>
                                <td>{item.quantity} {item.unit}</td>
                                <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                                <td><strong>${(Number(item.quantity) * Number(item.unit_price || 0)).toFixed(2)}</strong></td>
                              </tr>
                            ))}</tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ].filter(Boolean))}</tbody>
            </table>}
          </div>
        </div>
      </div>

      {/* Create/Edit PO Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Purchase Order" : "Create Purchase Order"}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group"><label>Supplier *</label>
            <select value={form.supplier_id} onChange={f("supplier_id")} required>
              <option value="">— Select Supplier —</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Order Number *</label>
              <input value={form.order_number} onChange={f("order_number")} required placeholder="PO-001" />
            </div>
            <div className="form-group"><label>Expected Delivery</label>
              <input type="date" value={form.expected_delivery_date} onChange={f("expected_delivery_date")} />
            </div>
          </div>
          <div className="form-group"><label>Notes</label>
            <textarea value={form.notes} onChange={f("notes")} rows={2} placeholder="Order notes…" style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save" : "Create & Add Items"}</button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={`Add Item — ${selectedOrder?.order_number || ""}`}>
        {itemError && <div className="alert alert-error">{itemError}</div>}
        <form onSubmit={addItem}>
          <div className="form-group"><label>Material *</label>
            <select value={itemForm.material_id} onChange={fi("material_id")} required>
              <option value="">— Select Material —</option>
              {materials.map(m => <option key={m.material_id} value={m.material_id}>{m.name} ({m.unit})</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Quantity *</label>
              <input type="number" step="0.01" min="0.01" value={itemForm.quantity} onChange={fi("quantity")} required />
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
        title="Delete Purchase Order" message="Delete this purchase order and all its items?" />
    </PageLayout>
  );
}
