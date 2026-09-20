import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import { maintenanceApi, machinesApi } from "../../services/api";

const TYPE_OPTS = ["preventive", "corrective", "predictive"];
const STATUS_OPTS = ["scheduled", "in_progress", "completed", "cancelled"];
const EMPTY = {
  machine_id: "",
  type: "preventive",
  description: "",
  scheduled_date: "",
  status: "scheduled",
  cost: "",
};

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([maintenanceApi.getAll(), machinesApi.getAll()])
      .then(([r, m]) => {
        setRecords(r.data || []);
        setMachines(m.data || []);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const match =
      !q ||
      r.machine_name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q);
    const tp = !typeFilter || r.type === typeFilter;
    const st = !statusFilter || r.status === statusFilter;
    return match && tp && st;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY,
      scheduled_date: new Date().toISOString().split("T")[0],
    });
    setError("");
    setModal(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      machine_id: r.machine_id,
      type: r.type,
      description: r.description,
      scheduled_date: r.scheduled_date?.split("T")[0] || "",
      status: r.status,
      cost: r.cost || "",
    });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await maintenanceApi.update(editing.maintenance_id, form);
      else await maintenanceApi.create(form);
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id) => {
    try {
      await maintenanceApi.complete(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async () => {
    try {
      await maintenanceApi.delete(delId);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const stats = [
    ["Total", records.length, "#e8f0fb", "🔧"],
    [
      "Scheduled",
      records.filter((r) => r.status === "scheduled").length,
      "#fffff0",
      "📅",
    ],
    [
      "In Progress",
      records.filter((r) => r.status === "in_progress").length,
      "#ebf8ff",
      "⚙️",
    ],
    [
      "Completed",
      records.filter((r) => r.status === "completed").length,
      "#f0fff4",
      "✅",
    ],
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Maintenance</h1>
          <p>Track preventive and corrective maintenance records</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            + Log Maintenance
          </button>
        </div>
      </div>

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}
      >
        {stats.map(([l, v, bg, icon]) => (
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{ background: bg }}>
              {icon}
            </div>
            <div className="stat-info">
              <span>{l}</span>
              <h2>{v}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search maintenance…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {TYPE_OPTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="no-results">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="no-results">No maintenance records found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Machine</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Scheduled Date</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.maintenance_id}>
                      <td>{r.maintenance_id}</td>
                      <td>
                        <strong>{r.machine_name || "—"}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                          }}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td
                        style={{
                          maxWidth: 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.description}
                      </td>
                      <td>
                        {r.scheduled_date
                          ? new Date(r.scheduled_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{r.cost ? `$${Number(r.cost).toFixed(2)}` : "—"}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          {r.status !== "completed" &&
                            r.status !== "cancelled" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => complete(r.maintenance_id)}
                              >
                                Complete
                              </button>
                            )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDelId(r.maintenance_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Maintenance Record" : "Log Maintenance"}
        size="lg"
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Machine *</label>
              <select
                value={form.machine_id}
                onChange={f("machine_id")}
                required
              >
                <option value="">— Select Machine —</option>
                {machines.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={f("type")}>
                {TYPE_OPTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Scheduled Date *</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={f("scheduled_date")}
                required
              />
            </div>
            <div className="form-group">
              <label>Cost (birr)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={f("cost")}
                placeholder="0.00"
              />
            </div>
            {editing && (
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={f("status")}>
                  {STATUS_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description *</label>
              <textarea
                value={form.description}
                onChange={f("description")}
                required
                rows={3}
                placeholder="Describe the maintenance work…"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete Maintenance Record"
        message="Delete this maintenance record? This cannot be undone."
      />
    </PageLayout>
  );
}
