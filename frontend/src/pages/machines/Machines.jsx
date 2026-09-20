import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import { machinesApi } from "../../services/api";

const STATUS_OPTS = ["available", "in_use", "under_maintenance"];

const EMPTY = {
  name: "",
  type: "",
  status: "available",
  location: "",
  purchase_date: "",
};

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(EMPTY);

  const [delId, setDelId] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD MACHINES
  // =========================

  const load = async () => {
    setLoading(true);

    try {
      const response = await machinesApi.getAll();

      setMachines(response.data || []);
    } catch (err) {
      console.error("Failed to load machines:", err);
      setError(err.message || "Failed to load machines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // FILTER
  // =========================

  const filtered = machines.filter((machine) => {
    const q = search.toLowerCase().trim();

    const matchesSearch =
      !q ||
      machine.name?.toLowerCase().includes(q) ||
      machine.type?.toLowerCase().includes(q) ||
      machine.location?.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || machine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // CREATE
  // =========================

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError("");
    setModal(true);
  };

  // =========================
  // EDIT
  // =========================

  const openEdit = (machine) => {
    setEditing(machine);

    setForm({
      name: machine.name || "",
      type: machine.type || "",
      status: machine.status || "available",
      location: machine.location || "",
      purchase_date: machine.purchase_date
        ? machine.purchase_date.split("T")[0]
        : "",
    });

    setError("");
    setModal(true);
  };

  // =========================
  // SAVE
  // =========================

  const save = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type.trim(),
        status: form.status,
        location: form.location.trim() || null,
        purchase_date: form.purchase_date || null,
      };

      if (!payload.name) {
        throw new Error("Machine name is required");
      }

      if (!payload.type) {
        throw new Error("Machine type is required");
      }

      if (editing) {
        await machinesApi.update(editing.machine_id, payload);
      } else {
        await machinesApi.create(payload);
      }

      setModal(false);
      setEditing(null);
      setForm({ ...EMPTY });

      await load();
    } catch (err) {
      console.error("Save machine error:", err);

      setError(err.message || "Failed to save machine");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const remove = async () => {
    if (!delId) return;

    try {
      await machinesApi.delete(delId);

      setDelId(null);

      await load();
    } catch (err) {
      console.error("Delete machine error:", err);

      alert(err.message || "Failed to delete machine");
    }
  };

  // =========================
  // FORM HANDLER
  // =========================

  const handleChange = (field) => (e) => {
    setForm((previous) => ({
      ...previous,
      [field]: e.target.value,
    }));
  };

  // =========================
  // STATISTICS
  // =========================

  const stats = [
    {
      label: "Total",
      value: machines.length,
      background: "#e8f0fb",
      icon: "🏭",
    },
    {
      label: "Available",
      value: machines.filter((m) => m.status === "available").length,
      background: "#f0fff4",
      icon: "✅",
    },
    {
      label: "In Use",
      value: machines.filter((m) => m.status === "in_use").length,
      background: "#ebf8ff",
      icon: "⚙️",
    },
    {
      label: "Maintenance",
      value: machines.filter((m) => m.status === "under_maintenance").length,
      background: "#fffff0",
      icon: "🔧",
    },
  ];

  return (
    <PageLayout>
      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Machines</h1>

          <p>Manage factory machines and their status</p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Machine
          </button>
        </div>
      </div>

      {/* =========================
          STATISTICS
      ========================== */}

      <div
        className="stats-grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: 20,
        }}
      >
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div
              className="stat-icon"
              style={{
                background: stat.background,
              }}
            >
              {stat.icon}
            </div>

            <div className="stat-info">
              <span>{stat.label}</span>
              <h2>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          MACHINE TABLE
      ========================== */}

      <div className="card">
        <div className="card-body">
          {/* FILTERS */}

          <div className="filters">
            <input
              className="search-input"
              placeholder="Search machines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>

              {STATUS_OPTS.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}

          <div className="table-container">
            {loading ? (
              <div className="no-results">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="no-results">No machines found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Purchase Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((machine) => (
                    <tr key={machine.machine_id}>
                      <td>{machine.machine_id}</td>

                      <td>
                        <strong>{machine.name}</strong>
                      </td>

                      <td>{machine.type || "—"}</td>

                      <td>
                        <StatusBadge status={machine.status} />
                      </td>

                      <td>{machine.location || "—"}</td>

                      <td>
                        {machine.purchase_date
                          ? new Date(machine.purchase_date).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(machine)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDelId(machine.machine_id)}
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

      {/* =========================
          CREATE / EDIT MODAL
      ========================== */}

      <Modal
        isOpen={modal}
        onClose={() => {
          if (!saving) {
            setModal(false);
          }
        }}
        title={editing ? "Edit Machine" : "Add Machine"}
      >
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={save}>
          <div className="form-grid">
            {/* NAME */}

            <div className="form-group">
              <label>Machine Name *</label>

              <input
                value={form.name}
                onChange={handleChange("name")}
                required
                placeholder="e.g. CNC Lathe #1"
              />
            </div>

            {/* TYPE */}

            <div className="form-group">
              <label>Machine Type *</label>

              <input
                value={form.type}
                onChange={handleChange("type")}
                required
                placeholder="e.g. CNC Lathe"
              />
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <select value={form.status} onChange={handleChange("status")}>
                {STATUS_OPTS.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* PURCHASE DATE */}

            <div className="form-group">
              <label>Purchase Date</label>

              <input
                type="date"
                value={form.purchase_date}
                onChange={handleChange("purchase_date")}
              />
            </div>

            {/* LOCATION */}

            <div
              className="form-group"
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label>Location</label>

              <input
                value={form.location}
                onChange={handleChange("location")}
                placeholder="e.g. Building A, Floor 2"
              />
            </div>
          </div>

          {/* BUTTONS */}

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
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? "Saving..."
                : editing
                  ? "Update Machine"
                  : "Save Machine"}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================
          DELETE CONFIRMATION
      ========================== */}

      <ConfirmDialog
        isOpen={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete Machine"
        message="Delete this machine? This cannot be undone."
      />
    </PageLayout>
  );
}
