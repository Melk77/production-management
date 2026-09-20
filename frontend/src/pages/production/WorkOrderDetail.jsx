import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import { productionApi, employeesApi, machinesApi } from "../../services/api";

export default function WorkOrderDetail() {
  const { id } = useParams();
  const nav    = useNavigate();

  const [order,      setOrder]     = useState(null);
  const [records,    setRecords]   = useState([]);
  const [downtimes,  setDowntimes] = useState([]);
  const [employees,  setEmps]      = useState([]);
  const [machines,   setMachines]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [activeTab,  setTab]       = useState("records");

  // Modals
  const [recModal,    setRecModal]    = useState(false);
  const [dtModal,     setDtModal]     = useState(false);
  const [recForm,     setRecForm]     = useState({ work_order_id:id, employee_id:"", quantity_produced:"", quantity_defective:0, notes:"" });
  const [dtForm,      setDtForm]      = useState({ work_order_id:id, machine_id:"", start_time:"", end_time:"", reason:"machine_breakdown", description:"" });
  const [error,       setError]       = useState("");
  const [saving,      setSaving]      = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      productionApi.getWorkOrderById(id),
      productionApi.getProductionRecords(id),
      productionApi.getDowntimeRecords(id),
      employeesApi.getAll(),
      machinesApi.getAll(),
    ]).then(([o,r,d,e,m])=>{
      setOrder(o.data); setRecords(r.data||[]); setDowntimes(d.data||[]);
      setEmps(e.data||[]); setMachines(m.data||[]);
    }).catch(e=>console.error(e))
    .finally(()=>setLoading(false));
  };
  useEffect(load,[id]);

  const handleStart    = async () => { try{ await productionApi.startWorkOrder(id); load(); }catch(e){ alert(e.message); } };
  const handleComplete = async () => { try{ await productionApi.completeWorkOrder(id); load(); }catch(e){ alert(e.message); } };

  const saveRecord = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      await productionApi.addProductionRecord({...recForm, work_order_id:Number(id)});
      setRecModal(false); setRecForm({work_order_id:id,employee_id:"",quantity_produced:"",quantity_defective:0,notes:""});
      load();
    } catch(err){ setError(err.message); }
    finally{ setSaving(false); }
  };

  const saveDt = async e => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      await productionApi.addDowntime({...dtForm, work_order_id:Number(id)});
      setDtModal(false); setDtForm({work_order_id:id,machine_id:"",start_time:"",end_time:"",reason:"machine_breakdown",description:""});
      load();
    } catch(err){ setError(err.message); }
    finally{ setSaving(false); }
  };

  const fRec = k => e => setRecForm(p=>({...p,[k]:e.target.value}));
  const fDt  = k => e => setDtForm(p=>({...p,[k]:e.target.value}));

  const totalProduced = records.reduce((s,r)=>s+Number(r.quantity_produced||0),0);
  const totalDefective= records.reduce((s,r)=>s+Number(r.quantity_defective||0),0);
  const progress      = order ? Math.min(100,Math.round((totalProduced/order.quantity_to_produce)*100)) : 0;

  if (loading) return <PageLayout><div className="no-results" style={{marginTop:80}}>Loading…</div></PageLayout>;
  if (!order)  return <PageLayout><div className="alert alert-error">Work order not found.</div></PageLayout>;

  return (
    <PageLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>nav("/work-orders")}>← Back</button>
            <h1>{order.order_number}</h1>
            <StatusBadge status={order.status}/>
          </div>
          <p>{order.product_name} · Machine: {order.machine_name} · Operator: {order.operator_name}</p>
        </div>
        <div className="page-header-actions">
          {order.status==="planned"     && <button className="btn btn-success" onClick={handleStart}>▶ Start Production</button>}
          {order.status==="in_progress" && <button className="btn btn-primary" onClick={handleComplete}>✓ Complete</button>}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:20}}>
        {[
          ["Target Qty", order.quantity_to_produce],
          ["Produced",   totalProduced],
          ["Defective",  totalDefective],
          ["Good Units", totalProduced - totalDefective],
          ["Progress",   `${progress}%`],
          ["Priority",   order.priority],
        ].map(([l,v])=>(
          <div className="card" style={{padding:16}} key={l}>
            <div style={{fontSize:"0.78rem",color:"#718096",marginBottom:4}}>{l}</div>
            <div style={{fontSize:"1.5rem",fontWeight:700,color:"#1a202c"}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card" style={{padding:16,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontWeight:600}}>Production Progress</span>
          <span style={{fontWeight:700,color:"#1255b8"}}>{progress}%</span>
        </div>
        <div style={{background:"#e2e8f0",borderRadius:8,height:12,overflow:"hidden"}}>
          <div style={{background:"#1255b8",height:"100%",width:`${progress}%`,borderRadius:8,transition:"width 0.3s"}}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["records","Production Records"],["downtime","Downtime Logs"]].map(([key,label])=>(
          <button key={key} className={`btn ${activeTab===key?"btn-primary":"btn-secondary"}`}
            onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      {activeTab==="records" && (
        <div className="card">
          <div className="card-header">
            <div><h3>Production Records</h3><p>{records.length} entries</p></div>
            {order.status==="in_progress" &&
              <button className="btn btn-primary btn-sm" onClick={()=>setRecModal(true)}>+ Log Production</button>}
          </div>
          <div className="table-container">
            {records.length===0 ? <div className="no-results">No records yet.</div> :
            <table>
              <thead><tr><th>Employee</th><th>Produced</th><th>Defective</th><th>Date</th><th>Notes</th></tr></thead>
              <tbody>{records.map(r=>(
                <tr key={r.production_record_id}>
                  <td>{r.employee_name}</td>
                  <td><strong>{r.quantity_produced}</strong></td>
                  <td style={{color:r.quantity_defective>0?"#c53030":"inherit"}}>{r.quantity_defective}</td>
                  <td>{new Date(r.production_date).toLocaleString()}</td>
                  <td>{r.notes||"-"}</td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        </div>
      )}

      {activeTab==="downtime" && (
        <div className="card">
          <div className="card-header">
            <div><h3>Downtime Records</h3><p>{downtimes.length} events</p></div>
            <button className="btn btn-warning btn-sm" onClick={()=>setDtModal(true)}>+ Report Downtime</button>
          </div>
          <div className="table-container">
            {downtimes.length===0 ? <div className="no-results">No downtime recorded.</div> :
            <table>
              <thead><tr><th>Machine</th><th>Reason</th><th>Start</th><th>End</th><th>Description</th></tr></thead>
              <tbody>{downtimes.map(d=>(
                <tr key={d.downtime_id}>
                  <td>{d.machine_name}</td>
                  <td><StatusBadge status={d.reason}/></td>
                  <td>{new Date(d.start_time).toLocaleString()}</td>
                  <td>{d.end_time ? new Date(d.end_time).toLocaleString() : "Ongoing"}</td>
                  <td>{d.description||"-"}</td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        </div>
      )}

      {/* Production Record Modal */}
      <Modal isOpen={recModal} onClose={()=>setRecModal(false)} title="Log Production" size="sm">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={saveRecord}>
          <div className="form-group"><label>Employee *</label>
            <select value={recForm.employee_id} onChange={fRec("employee_id")} required>
              <option value="">— Select Employee —</option>
              {employees.map(e=><option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Qty Produced *</label>
              <input type="number" min="1" value={recForm.quantity_produced} onChange={fRec("quantity_produced")} required/>
            </div>
            <div className="form-group"><label>Qty Defective</label>
              <input type="number" min="0" value={recForm.quantity_defective} onChange={fRec("quantity_defective")}/>
            </div>
          </div>
          <div className="form-group"><label>Notes</label>
            <textarea value={recForm.notes} onChange={fRec("notes")} rows={2} placeholder="Optional notes…"/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setRecModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?"Saving…":"Add Record"}</button>
          </div>
        </form>
      </Modal>

      {/* Downtime Modal */}
      <Modal isOpen={dtModal} onClose={()=>setDtModal(false)} title="Report Downtime" size="sm">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={saveDt}>
          <div className="form-group"><label>Machine *</label>
            <select value={dtForm.machine_id} onChange={fDt("machine_id")} required>
              <option value="">— Select Machine —</option>
              {machines.map(m=><option key={m.machine_id} value={m.machine_id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Reason *</label>
            <select value={dtForm.reason} onChange={fDt("reason")}>
              {["machine_breakdown","maintenance","material_shortage","power_outage","employee_shortage","other"]
                .map(r=><option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Start Time *</label>
              <input type="datetime-local" value={dtForm.start_time} onChange={fDt("start_time")} required/>
            </div>
            <div className="form-group"><label>End Time</label>
              <input type="datetime-local" value={dtForm.end_time} onChange={fDt("end_time")}/>
            </div>
          </div>
          <div className="form-group"><label>Description</label>
            <textarea value={dtForm.description} onChange={fDt("description")} rows={2}/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setDtModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?"Saving…":"Report"}</button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
