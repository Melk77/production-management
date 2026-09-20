import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { employeesApi, usersApi } from "../../services/api";

const EMPTY_EMP = { user_id:"", department_id:"", shift_id:"", position:"", hire_date:"" };

export default function Employees() {
  const [employees, setEmployees]   = useState([]);
  const [users, setUsers]           = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_EMP);
  const [delId, setDelId]           = useState(null);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      employeesApi.getAll(),
      usersApi.getAll(),
      employeesApi.getAllDepartments(),
      employeesApi.getAllShifts(),
    ]).then(([e,u,d,s]) => {
      setEmployees(e.data||[]);
      setUsers(u.data||[]);
      setDepartments(d.data||[]);
      setShifts(s.data||[]);
    }).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const match = !q || e.name?.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q);
    const dept  = !deptFilter || String(e.department_id)===deptFilter;
    return match && dept;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_EMP); setError(""); setModal(true); };
  const openEdit   = emp => {
    setEditing(emp);
    setForm({ user_id:emp.user_id, department_id:emp.department_id, shift_id:emp.shift_id||"", position:emp.position, hire_date:emp.hire_date?.split("T")[0]||"" });
    setError(""); setModal(true);
  };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      if (editing) await employeesApi.update(editing.employee_id, form);
      else          await employeesApi.create(form);
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally{ setSaving(false); }
  };

  const remove = async () => {
    try { await employeesApi.delete(delId); load(); } catch(e){ alert(e.message); }
  };

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Directory</h1>
          <p>Manage factory employees and their assignments</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Add Employee</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="filter-select" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d=><option key={d.department_id} value={d.department_id}>{d.name}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length===0 ? <div className="no-results">No employees found.</div> :
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Position</th><th>Department</th><th>Shift</th><th>Hire Date</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(emp=>(
                <tr key={emp.employee_id}>
                  <td>{emp.employee_id}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#e8f0fb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#1255b8",fontSize:"0.85rem"}}>
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600}}>{emp.name}</div>
                        <div style={{fontSize:"0.78rem",color:"#718096"}}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.position}</td>
                  <td>{emp.department_name||"-"}</td>
                  <td>{emp.shift_name||"-"}</td>
                  <td>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(emp)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>setDelId(emp.employee_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={()=>setModal(false)} title={editing?"Edit Employee":"Add Employee"}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          {!editing && (
            <div className="form-group">
              <label>User Account *</label>
              <select value={form.user_id} onChange={f("user_id")} required>
                <option value="">— Select User —</option>
                {users.filter(u=>!employees.find(e=>e.user_id===u.user_id)||editing?.user_id===u.user_id)
                  .map(u=><option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>Position *</label>
              <input value={form.position} onChange={f("position")} required placeholder="e.g. Machine Operator"/>
            </div>
            <div className="form-group">
              <label>Hire Date *</label>
              <input type="date" value={form.hire_date} onChange={f("hire_date")} required/>
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select value={form.department_id} onChange={f("department_id")} required>
                <option value="">— Select Department —</option>
                {departments.map(d=><option key={d.department_id} value={d.department_id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Shift</label>
              <select value={form.shift_id} onChange={f("shift_id")}>
                <option value="">— No Shift —</option>
                {shifts.map(s=><option key={s.shift_id} value={s.shift_id}>{s.name} ({s.start_time}–{s.end_time})</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delId} onClose={()=>setDelId(null)} onConfirm={remove}
        title="Remove Employee" message="Remove this employee record? Their user account will remain."/>
    </PageLayout>
  );
}
