import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { inventoryApi } from "../../services/api";

const UNIT_OPTS = ["kg", "g", "liter", "ml", "pcs", "m", "cm", "sheet", "box", "roll"];
const EMPTY = { name: "", unit: "kg", quantity_in_stock: 0, min_stock_level: 0, cost_per_unit: 0, description: "" };

export default function Inventory() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [delId, setDelId]         = useState(null);
  const [error, setError]         = useState("");
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    inventoryApi.getAllMaterials()
      .then(r => setMaterials(r.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const lowStock = materials.filter(m => Number(m.quantity_in_stock) <= Number(m.min_stock_level));

  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    const match = !q || m.name?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
    const ls = !showLowStock || Number(m.quantity_in_stock) <= Number(m.min_stock_level);
    return match && ls;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit   = m => {
    setEditing(m);
    setForm({ name: m.name, unit: m.unit, quantity_in_stock: m.quantity_in_stock, min_stock_level: m.min_stock_level, cost_per_unit: m.cost_per_unit || 0, description: m.description || "" });
    setError(""); setModal(true);
  };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      if (editing) await inventoryApi.updateMaterial(editing.material_id, form);
      else          await inventoryApi.createMaterial(form);
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    try { await inventoryApi.deleteMaterial(delId); load(); } catch(e){ alert(e.message); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Raw Materials Inventory</h1>
          <p>Manage stock levels for raw materials and components</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Add Material</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          ["Total Materials", materials.length,  "#e8f0fb", "📦"],
          ["Low Stock",       lowStock.length,   "#fff5f5", "⚠️"],
          ["Well Stocked",    materials.length - lowStock.length, "#f0fff4", "✅"],
        ].map(([l, v, bg, icon]) => (
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="stat-info"><span>{l}</span><h2>{v}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", cursor: "pointer", color: showLowStock ? "#e53e3e" : "#718096", fontWeight: showLowStock ? 700 : 400 }}>
              <input type="checkbox" checked={showLowStock} onChange={e => setShowLowStock(e.target.checked)} />
              ⚠️ Show Low Stock Only
            </label>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No materials found.</div> :
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Unit</th><th>In Stock</th><th>Min Level</th><th>Cost/Unit</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(m => {
                const isLow = Number(m.quantity_in_stock) <= Number(m.min_stock_level);
                return (
                  <tr key={m.material_id}>
                    <td>{m.material_id}</td>
                    <td>
                      <div><strong>{m.name}</strong></div>
                      {m.description && <div style={{ fontSize: "0.75rem", color: "#718096" }}>{m.description}</div>}
                    </td>
                    <td>{m.unit}</td>
                    <td><span style={{ fontWeight: 700, color: isLow ? "#e53e3e" : "#38a169" }}>{Number(m.quantity_in_stock).toLocaleString()}</span></td>
                    <td>{Number(m.min_stock_level).toLocaleString()}</td>
                    <td>{m.cost_per_unit ? `$${Number(m.cost_per_unit).toFixed(2)}` : "—"}</td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700,
                        background: isLow ? "#fff5f5" : "#f0fff4",
                        color: isLow ? "#e53e3e" : "#38a169",
                        border: `1px solid ${isLow ? "#fed7d7" : "#c6f6d5"}` }}>
                        {isLow ? "Low Stock" : "OK"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelId(m.material_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>}
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Material" : "Add Material"} size="lg">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Material Name *</label>
              <input value={form.name} onChange={f("name")} required placeholder="e.g. Steel Rod 10mm" />
            </div>
            <div className="form-group"><label>Unit *</label>
              <select value={form.unit} onChange={f("unit")}>
                {UNIT_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Cost per Unit ($)</label>
              <input type="number" step="0.01" min="0" value={form.cost_per_unit} onChange={f("cost_per_unit")} />
            </div>
            <div className="form-group"><label>Quantity in Stock *</label>
              <input type="number" step="0.01" min="0" value={form.quantity_in_stock} onChange={f("quantity_in_stock")} required />
            </div>
            <div className="form-group"><label>Minimum Stock Level *</label>
              <input type="number" step="0.01" min="0" value={form.min_stock_level} onChange={f("min_stock_level")} required />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description</label>
              <input value={form.description} onChange={f("description")} placeholder="Optional description…" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={remove}
        title="Delete Material" message="Delete this material? This cannot be undone if it is used in BOMs." />
    </PageLayout>
  );
}
