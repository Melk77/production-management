import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { suppliersApi } from "../../services/api";

const EMPTY = { name: "", contact_name: "", email: "", phone: "", address: "" };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    suppliersApi
      .getAll()
      .then((r) => setSuppliers(r.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.contact_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModal(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      contact_name: s.contact_name || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
    });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await suppliersApi.update(editing.supplier_id, form);
      else await suppliersApi.create(form);
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await suppliersApi.delete(delId);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Suppliers</h1>
          <p>Manage your supplier directory and contacts</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Supplier
          </button>
        </div>
      </div>

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 20 }}
      >
        {[
          ["Total Suppliers", suppliers.length, "#e8f0fb", "🏢"],
          ["Active", suppliers.length, "#f0fff4", "✅"],
        ].map(([l, v, bg, icon]) => (
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
              placeholder="Search suppliers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-container">
            {loading ? (
              <div className="no-results">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="no-results">No suppliers found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company Name</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.supplier_id}>
                      <td>{s.supplier_id}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#e8f0fb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "#1255b8",
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <strong>{s.name}</strong>
                        </div>
                      </td>
                      <td>{s.contact_name || "—"}</td>
                      <td>
                        {s.email ? (
                          <a
                            href={`mailto:${s.email}`}
                            style={{ color: "#1255b8" }}
                          >
                            {s.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{s.phone || "—"}</td>
                      <td
                        style={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#718096",
                          fontSize: "0.82rem",
                        }}
                      >
                        {s.address || "—"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDelId(s.supplier_id)}
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
        title={editing ? "Edit Supplier" : "Add Supplier"}
        size="lg"
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Company Name *</label>
              <input
                value={form.name}
                onChange={f("name")}
                required
                placeholder="e.g. Steel Corp Ltd."
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                value={form.contact_name}
                onChange={f("contact_name")}
                placeholder="your name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={f("email")}
                placeholder="contact@company.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={f("phone")}
                placeholder="+251910000000"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                value={form.address}
                onChange={f("address")}
                placeholder="Bahirdar, Ethiopia"
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
        title="Delete Supplier"
        message="Delete this supplier? Any associated purchase orders will remain."
      />
    </PageLayout>
  );
}
