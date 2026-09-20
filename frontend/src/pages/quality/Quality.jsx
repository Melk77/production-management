import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { qualityApi, productionApi, employeesApi } from "../../services/api";

const RESULT_OPTS = ["pass", "fail", "rework"];
const EMPTY = { work_order_id: "", inspector_id: "", result: "pass", defects_found: 0, rework_quantity: 0, notes: "" };

export default function Quality() {
  const [inspections, setInspections] = useState([]);
  const [workOrders, setWorkOrders]   = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [delId, setDelId]             = useState(null);
  const [error, setError]             = useState("");
  const [saving, setSaving]           = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      qualityApi.getAll(),
      productionApi.getAllWorkOrders(),
      employeesApi.getAll(),
    ]).then(([q, wo, e]) => {
      setInspections(q.data || []);
      setWorkOrders(wo.data || []);
      setEmployees(e.data || []);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = inspections.filter(i => {
    const q = search.toLowerCase();
    const match = !q || i.order_number?.toLowerCase().includes(q) || i.inspector_name?.toLowerCase().includes(q);
    const rf = !resultFilter || i.result === resultFilter;
    return match && rf;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit   = i => {
    setEditing(i);
    setForm({ work_order_id: i.work_order_id, inspector_id: i.inspector_id, result: i.result, defects_found: i.defects_found || 0, rework_quantity: i.rework_quantity || 0, notes: i.notes || "" });
    setError(""); setModal(true);
  };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      if (editing) await qualityApi.update(editing.inspection_id, form);
      else          await qualityApi.create(form);
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    try { await qualityApi.delete(delId); load(); } catch(e){ alert(e.message); }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const resultStyle = result => ({
    pass:   { bg: "#f0fff4", color: "#38a169", border: "#c6f6d5" },
    fail:   { bg: "#fff5f5", color: "#e53e3e", border: "#fed7d7" },
    rework: { bg: "#fffff0", color: "#d69e2e", border: "#fefcbf" },
  }[result] || { bg: "#f7fafc", color: "#718096", border: "#e2e8f0" });

  const stats = [
    ["Total Inspections", inspections.length,                                     "#e8f0fb", "🔍"],
    ["Passed",            inspections.filter(i => i.result === "pass").length,    "#f0fff4", "✅"],
    ["Failed",            inspections.filter(i => i.result === "fail").length,    "#fff5f5", "❌"],
    ["Rework",            inspections.filter(i => i.result === "rework").length,  "#fffff0", "🔄"],
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Quality Control</h1>
          <p>Manage quality inspections and defect tracking</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Add Inspection</button>
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
            <input className="search-input" placeholder="Search inspections…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={resultFilter} onChange={e => setResultFilter(e.target.value)}>
              <option value="">All Results</option>
              {RESULT_OPTS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No inspections found.</div> :
            <table>
              <thead><tr><th>#</th><th>Work Order</th><th>Inspector</th><th>Result</th><th>Defects</th><th>Rework Qty</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(i => {
                const rs = resultStyle(i.result);
                return (
                  <tr key={i.inspection_id}>
                    <td>{i.inspection_id}</td>
                    <td><strong style={{ color: "#1255b8" }}>{i.order_number || "—"}</strong></td>
                    <td>{i.inspector_name || "—"}</td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700,
                        background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, textTransform: "capitalize" }}>
                        {i.result}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: Number(i.defects_found) > 0 ? 700 : 400, color: Number(i.defects_found) > 0 ? "#e53e3e" : "#718096" }}>{i.defects_found || 0}</span></td>
                    <td>{i.rework_quantity || 0}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{i.inspected_at ? new Date(i.inspected_at).toLocaleDateString() : i.created_at ? new Date(i.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelId(i.inspection_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>}
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Inspection" : "Add Inspection"} size="lg">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group"><label>Work Order *</label>
              <select value={form.work_order_id} onChange={f("work_order_id")} required>
                <option value="">— Select Work Order —</option>
                {workOrders.map(w => <option key={w.work_order_id} value={w.work_order_id}>{w.order_number} — {w.product_name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Inspector *</label>
              <select value={form.inspector_id} onChange={f("inspector_id")} required>
                <option value="">— Select Inspector —</option>
                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name} — {e.position}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Result *</label>
              <select value={form.result} onChange={f("result")}>
                {RESULT_OPTS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Defects Found</label>
              <input type="number" min="0" value={form.defects_found} onChange={f("defects_found")} />
            </div>
            {form.result === "rework" && (
              <div className="form-group"><label>Rework Quantity</label>
                <input type="number" min="0" value={form.rework_quantity} onChange={f("rework_quantity")} />
              </div>
            )}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} rows={3} placeholder="Inspection notes, defect details…" style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={remove}
        title="Delete Inspection" message="Delete this quality inspection record?" />
    </PageLayout>
  );
}
