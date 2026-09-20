import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { productionApi, productsApi, machinesApi, employeesApi } from "../../services/api";

const PRIORITY_OPTS = ["low","normal","high","urgent"];
const STATUS_OPTS   = ["planned","in_progress","completed","cancelled"];
const EMPTY = { order_number:"", product_id:"", machine_id:"", employee_id:"", quantity_to_produce:"", priority:"normal" };

export default function WorkOrders() {
  const nav = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [machines, setMachines]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [delId, setDelId]         = useState(null);
  const [error, setError]         = useState("");
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      productionApi.getAllWorkOrders(),
      productsApi.getAll(),
      machinesApi.getAll(),
      employeesApi.getAll(),
    ]).then(([o,p,m,e])=>{
      setOrders(o.data||[]); setProducts(p.data||[]); setMachines(m.data||[]); setEmployees(e.data||[]);
    }).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const filtered = orders.filter(o=>{
    const q = search.toLowerCase();
    const match = !q || o.order_number?.toLowerCase().includes(q) || o.product_name?.toLowerCase().includes(q);
    const st = !statusFilter || o.status===statusFilter;
    return match && st;
  });

  const openCreate = () => { setEditing(null); setForm({...EMPTY, order_number:`WO-${Date.now().toString().slice(-6)}`}); setError(""); setModal(true); };
  const openEdit   = o => {
    setEditing(o);
    setForm({ order_number:o.order_number, product_id:o.product_id, machine_id:o.machine_id,
              employee_id:o.employee_id, quantity_to_produce:o.quantity_to_produce, priority:o.priority,
              status:o.status, start_date:o.start_date?.split("T")[0]||"", end_date:o.end_date?.split("T")[0]||"" });
    setError(""); setModal(true);
  };

  const save = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      if (editing) await productionApi.updateWorkOrder(editing.work_order_id, form);
      else          await productionApi.createWorkOrder(form);
      setModal(false); load();
    } catch(err){ setError(err.message); }
    finally{ setSaving(false); }
  };

  const quickStart    = async id => { try{ await productionApi.startWorkOrder(id); load(); }catch(e){ alert(e.message); } };
  const quickComplete = async id => { try{ await productionApi.completeWorkOrder(id); load(); }catch(e){ alert(e.message); } };
  const remove        = async () => { try{ await productionApi.deleteWorkOrder(delId); load(); }catch(e){ alert(e.message); } };

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const prioColor = p => ({urgent:"#c53030",high:"#c05621",normal:"#2b6cb0",low:"#718096"}[p]||"#718096");

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Work Orders</h1>
          <p>Plan and track production orders</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Create Work Order</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          ["Total",    orders.length,                                "#e8f0fb"],
          ["Planned",  orders.filter(o=>o.status==="planned").length,     "#fffff0"],
          ["In Progress",orders.filter(o=>o.status==="in_progress").length,"#ebf8ff"],
          ["Completed",orders.filter(o=>o.status==="completed").length,    "#f0fff4"],
        ].map(([l,v,bg])=>(
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{background:bg,fontSize:"1.4rem"}}>📋</div>
            <div className="stat-info"><span>{l}</span><h2>{v}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search orders…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="filter-select" value={statusFilter} onChange={e=>setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTS.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length===0 ? <div className="no-results">No work orders found.</div> :
            <table>
              <thead><tr><th>Order #</th><th>Product</th><th>Machine</th><th>Operator</th><th>Qty</th><th>Priority</th><th>Status</th><th>Start</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(o=>(
                <tr key={o.work_order_id}>
                  <td><strong style={{color:"#1255b8",cursor:"pointer"}} onClick={()=>nav(`/work-orders/${o.work_order_id}`)}>{o.order_number}</strong></td>
                  <td>{o.product_name||"-"}</td>
                  <td>{o.machine_name||"-"}</td>
                  <td>{o.operator_name||"-"}</td>
                  <td>{o.quantity_to_produce}</td>
                  <td><span style={{fontWeight:600,color:prioColor(o.priority)}}>{o.priority}</span></td>
                  <td><StatusBadge status={o.status}/></td>
                  <td>{o.start_date ? new Date(o.start_date).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={()=>nav(`/work-orders/${o.work_order_id}`)}>View</button>
                      {o.status==="planned"    && <button className="btn btn-success btn-sm" onClick={()=>quickStart(o.work_order_id)}>Start</button>}
                      {o.status==="in_progress"&& <button className="btn btn-primary btn-sm" onClick={()=>quickComplete(o.work_order_id)}>Complete</button>}
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(o)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>setDelId(o.work_order_id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={()=>setModal(false)} title={editing?"Edit Work Order":"Create Work Order"} size="lg">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group"><label>Order Number *</label>
              <input value={form.order_number} onChange={f("order_number")} required placeholder="WO-001"/>
            </div>
            <div className="form-group"><label>Priority</label>
              <select value={form.priority} onChange={f("priority")}>
                {PRIORITY_OPTS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Product *</label>
              <select value={form.product_id} onChange={f("product_id")} required>
                <option value="">— Select Product —</option>
                {products.map(p=><option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Quantity to Produce *</label>
              <input type="number" min="1" value={form.quantity_to_produce} onChange={f("quantity_to_produce")} required placeholder="100"/>
            </div>
            <div className="form-group"><label>Machine *</label>
              <select value={form.machine_id} onChange={f("machine_id")} required>
                <option value="">— Select Machine —</option>
                {machines.map(m=><option key={m.machine_id} value={m.machine_id}>{m.name} ({m.status})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Operator *</label>
              <select value={form.employee_id} onChange={f("employee_id")} required>
                <option value="">— Select Operator —</option>
                {employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.name} — {e.position}</option>)}
              </select>
            </div>
            {editing && <>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={f("status")}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
            </>}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delId} onClose={()=>setDelId(null)} onConfirm={remove}
        title="Delete Work Order" message="Delete this work order and all its records?"/>
    </PageLayout>
  );
}
