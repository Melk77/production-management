import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { employeesApi } from "../../services/api";
import "./Departments.css";

const EDEPT = { name: "" };
const ESHIFT = { name: "", start_time: "", end_time: "" };

function DeptPanel({ departments, reload }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EDEPT);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEdit(null);
    setForm(EDEPT);
    setError("");
    setModal(true);
  };
  const openEdit = (d) => {
    setEdit(d);
    setForm({ name: d.name });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (edit) await employeesApi.updateDepartment(edit.department_id, form);
      else await employeesApi.createDepartment(form);
      setModal(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await employeesApi.deleteDepartment(delId);
      reload();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <div>
          <h3>Departments</h3>
          <p>{departments.length} departments</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add Dept
        </button>
      </div>
      <div className="table-container">
        {departments.length === 0 ? (
          <div className="no-results">No departments.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.department_id}>
                  <td>{d.department_id}</td>
                  <td>
                    <strong>{d.name}</strong>
                  </td>
                  <td>{d.manager_name || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(d)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDelId(d.department_id)}
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
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={edit ? "Edit Department" : "Add Department"}
        size="sm"
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label>Department Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              required
              placeholder="e.g. Production"
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
        title="Delete Department"
        message="Delete this department? Employees must be reassigned first."
      />
    </div>
  );
}

function ShiftPanel({ shifts, reload }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(ESHIFT);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEdit(null);
    setForm(ESHIFT);
    setError("");
    setModal(true);
  };
  const openEdit = (s) => {
    setEdit(s);
    setForm({ name: s.name, start_time: s.start_time, end_time: s.end_time });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (edit) await employeesApi.updateShift(edit.shift_id, form);
      else await employeesApi.createShift(form);
      setModal(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await employeesApi.deleteShift(delId);
      reload();
    } catch (e) {
      alert(e.message);
    }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Shift Management</h3>
          <p>{shifts.length} shifts</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add Shift
        </button>
      </div>
      <div className="table-container">
        {shifts.length === 0 ? (
          <div className="no-results">No shifts.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.shift_id}>
                  <td>{s.shift_id}</td>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{s.start_time}</td>
                  <td>{s.end_time}</td>
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
                        onClick={() => setDelId(s.shift_id)}
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
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={edit ? "Edit Shift" : "Add Shift"}
        size="sm"
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label>Shift Name *</label>
            <input
              value={form.name}
              onChange={f("name")}
              required
              placeholder="e.g. Morning Shift"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                value={form.start_time}
                onChange={f("start_time")}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                value={form.end_time}
                onChange={f("end_time")}
                required
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
        title="Delete Shift"
        message="Delete this shift?"
      />
    </div>
  );
}

export default function Departments() {
  const [departments, setDepts] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([employeesApi.getAllDepartments(), employeesApi.getAllShifts()])
      .then(([d, s]) => {
        setDepts(d.data || []);
        setShifts(s.data || []);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Departments & Shifts</h1>
          <p>Manage organizational structure</p>
        </div>
      </div>
      {loading ? (
        <div className="no-results">Loading…</div>
      ) : (
        <>
          <DeptPanel departments={departments} reload={load} />
          <ShiftPanel shifts={shifts} reload={load} />
        </>
      )}
    </PageLayout>
  );
}
