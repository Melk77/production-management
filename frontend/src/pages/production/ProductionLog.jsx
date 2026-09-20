import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import { productionApi, machinesApi, employeesApi } from "../../services/api";

const EMPTY = { work_order_id: "", machine_id: "", employee_id: "", quantity_produced: "", scrap_quantity: "", notes: "" };

export default function ProductionLog() {
  const [records, setRecords]     = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [machines, setMachines]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState("");
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    // Load all work orders and then get production records for each (or use a flat list)
    Promise.all([
      productionApi.getAllWorkOrders(),
      machinesApi.getAll(),
      employeesApi.getAll(),
    ]).then(([wo, m, e]) => {
      setWorkOrders(wo.data || []);
      setMachines(m.data || []);
      setEmployees(e.data || []);
      // Gather all production records from all in-progress / completed work orders
      const completed = (wo.data || []).filter(w => ["in_progress", "completed"].includes(w.status));
      if (completed.length === 0) { setRecords([]); setLoading(false); return; }
      Promise.all(completed.map(w => productionApi.getProductionRecords(w.work_order_id).catch(() => ({ data: [] }))))
        .then(results => {
          const all = results.flatMap((r, i) =>
            (r.data || []).map(rec => ({ ...rec, order_number: completed[i].order_number, product_name: completed[i].product_name }))
          );
          // Sort newest first
          all.sort((a, b) => new Date(b.recorded_at || b.created_at || 0) - new Date(a.recorded_at || a.created_at || 0));
          setRecords(all);
        })
        .finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q || r.order_number?.toLowerCase().includes(q) || r.product_name?.toLowerCase().includes(q) || r.operator_name?.toLowerCase().includes(q);
  });

  const openCreate = () => { setForm(EMPTY); setError(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      await productionApi.addProductionRecord(form);
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally { setSaving(false); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const totalProduced = records.reduce((s, r) => s + Number(r.quantity_produced || 0), 0);
  const totalScrap    = records.reduce((s, r) => s + Number(r.scrap_quantity || 0), 0);

  const stats = [
    ["Total Records",    records.length,  "#e8f0fb", "📋"],
    ["Units Produced",   totalProduced,   "#f0fff4", "✅"],
    ["Scrap Units",      totalScrap,      "#fff5f5", "❌"],
    ["Work Orders",      workOrders.filter(w => w.status === "in_progress").length, "#ebf8ff", "⚙️"],
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Production Log</h1>
          <p>Track all production records and output</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Add Record</button>
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
            <input className="search-input" placeholder="Search by order, product, operator…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No production records found. Records are created when work orders are in progress.</div> :
            <table>
              <thead><tr><th>Work Order</th><th>Product</th><th>Qty Produced</th><th>Scrap</th><th>Operator</th><th>Recorded At</th></tr></thead>
              <tbody>{filtered.map((r, i) => (
                <tr key={r.record_id || i}>
                  <td><strong style={{ color: "#1255b8" }}>{r.order_number || "—"}</strong></td>
                  <td>{r.product_name || "—"}</td>
                  <td><span style={{ fontWeight: 700, color: "#38a169" }}>{r.quantity_produced}</span></td>
                  <td><span style={{ fontWeight: 600, color: Number(r.scrap_quantity) > 0 ? "#e53e3e" : "#718096" }}>{r.scrap_quantity || 0}</span></td>
                  <td>{r.operator_name || r.employee_name || "—"}</td>
                  <td>{r.recorded_at ? new Date(r.recorded_at).toLocaleString() : r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Production Record" size="lg">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group"><label>Work Order *</label>
              <select value={form.work_order_id} onChange={f("work_order_id")} required>
                <option value="">— Select Work Order —</option>
                {workOrders.filter(w => w.status === "in_progress").map(w => (
                  <option key={w.work_order_id} value={w.work_order_id}>{w.order_number} — {w.product_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Operator *</label>
              <select value={form.employee_id} onChange={f("employee_id")} required>
                <option value="">— Select Operator —</option>
                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name} — {e.position}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Quantity Produced *</label>
              <input type="number" min="0" value={form.quantity_produced} onChange={f("quantity_produced")} required placeholder="0" />
            </div>
            <div className="form-group"><label>Scrap Quantity</label>
              <input type="number" min="0" value={form.scrap_quantity} onChange={f("scrap_quantity")} placeholder="0" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} rows={2} placeholder="Optional notes…" style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
