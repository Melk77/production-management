import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { usersApi } from "../../services/api";

const ROLES = [
  "admin",
  "manager",
  "operator",
  "inspector",
  "procurement",
  "warehouse",
];
const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "operator",
  phone: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
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
    usersApi
      .getAll()
      .then((r) => setUsers(r.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModal(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      phone: u.phone || "",
    });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await usersApi.update(editing.user_id, form);
      else await usersApi.create(form);
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
      await usersApi.delete(delId);
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
          <h1>User Management</h1>
          <p>Manage system users and access roles</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            + Create User
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-container">
            {loading ? (
              <div className="no-results">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="no-results">No users found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <StatusBadge status={u.role} />
                      </td>
                      <td>{u.phone || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDelId(u.user_id)}
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
        title={editing ? "Edit User" : "Create User"}
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={form.name}
                onChange={f("name")}
                required
                placeholder="Your Name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={f("email")}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>
                {editing ? "New Password (leave blank to keep)" : "Password *"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={f("password")}
                required={!editing}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={f("phone")}
                placeholder="+251 911 000000"
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select value={form.role} onChange={f("role")} required>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
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
              {saving ? "Saving…" : "Save User"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={remove}
        title="Delete User"
        message="Are you sure you want to delete this user? This cannot be undone."
      />
    </PageLayout>
  );
}
