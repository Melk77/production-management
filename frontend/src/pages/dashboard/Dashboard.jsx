import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardApi } from "../../services/api";
import PageLayout from "../../components/layout/PageLayout";
import "./Dashboard.css";

function Dashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  useEffect(() => {
    if (!token) { setLoading(false); setError("Not authenticated."); return; }
    setLoading(true);
    dashboardApi.getData()
      .then(r => setDashboard(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const fmt = (s) => String(s || "").replace(/_/g, " ").replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  const getMachineColor = (s) =>
    s === "in_use" ? "running" : s === "under_maintenance" ? "maintenance" : "available";

  const getOrderBadge = (s) =>
    s === "in_progress" ? "in-progress" : s === "completed" ? "completed" : "planned";

  const getPrioBadge = (p) =>
    ({ urgent: "urgent", high: "high", low: "low" }[p] || "normal");

  const filteredProduction = useMemo(() => {
    if (!dashboard?.productionChart) return [];
    const d = [...dashboard.productionChart];
    if (selectedPeriod === "1") return d.slice(-1);
    if (selectedPeriod === "7") return d.slice(-7);
    if (selectedPeriod === "30") return d.slice(-30);
    return d;
  }, [dashboard, selectedPeriod]);

  const maxProduction = useMemo(() =>
    Math.max(...filteredProduction.map(i => Number(i.quantity) || 0), 1),
    [filteredProduction]);

  const periodTotal = useMemo(() =>
    filteredProduction.reduce((t, i) => t + (Number(i.quantity) || 0), 0),
    [filteredProduction]);

  if (loading) return (
    <PageLayout><div className="no-results" style={{marginTop:80}}>Loading dashboard…</div></PageLayout>
  );
  if (error) return (
    <PageLayout><div className="alert alert-error">{error}</div></PageLayout>
  );
  if (!dashboard) return null;

  const { stats = {}, machines = [], workOrders = [], lowStockMaterials = [], recentProduction = [] } = dashboard;

  return (
    <PageLayout>
      <div className="dashboard-welcome">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your manufacturing operations</p>
        </div>
        <div className="dashboard-date">
          <span>Today</span>
          <strong>{new Date().toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label:"Total Production", val: stats.totalProduction||0, icon:"📦", color:"#e8f0fb", note:"Total units produced" },
          { label:"Active Work Orders", val: stats.activeWorkOrders||0, icon:"🗂", color:"#f0fff4", note:`${stats.totalWorkOrders||0} total orders` },
          { label:"Running Machines", val: stats.runningMachines||0, icon:"⚙️", color:"#fffff0", note:`${stats.totalMachines||0} total machines` },
          { label:"Low Stock Items", val: stats.lowStockMaterials||0, icon:"⚠️", color:"#fff5f5", note:"Requires attention" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <span>{s.label}</span>
              <h2>{Number(s.val).toLocaleString()}</h2>
              <small>{s.note}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Production Chart */}
      <section className="dashboard-card" style={{marginBottom:20}}>
        <div className="card-header">
          <div><h3>Production Overview</h3><p>Daily production output</p></div>
          <select className="filter-select" value={selectedPeriod} onChange={e=>setSelectedPeriod(e.target.value)}>
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
        <div style={{padding:"16px 20px",display:"flex",gap:24,borderBottom:"1px solid #e2e8f0"}}>
          {[["Production", periodTotal.toLocaleString()],["Days", filteredProduction.length],
            ["Avg/Day", filteredProduction.length ? Math.round(periodTotal/filteredProduction.length).toLocaleString() : "0"]
          ].map(([k,v]) => (
            <div key={k} style={{textAlign:"center"}}>
              <div style={{fontSize:"0.8rem",color:"#718096"}}>{k}</div>
              <div style={{fontSize:"1.25rem",fontWeight:700,color:"#1a202c"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"20px"}}>
          {filteredProduction.length === 0
            ? <div className="no-results">No production data available.</div>
            : <div className="chart">
                <div className="chart-y-axis">
                  {[1,0.75,0.5,0.25,0].map(f=>(
                    <span key={f}>{Math.round(maxProduction*f).toLocaleString()}</span>
                  ))}
                </div>
                <div className="chart-area">
                  <div className="chart-lines">{[...Array(5)].map((_,i)=><span key={i}/>)}</div>
                  <div className="bars">
                    {filteredProduction.map(item=>{
                      const q = Number(item.quantity)||0;
                      const h = q===0 ? 2 : Math.max((q/maxProduction)*100,5);
                      return (
                        <div className="bar-column" key={item.date}>
                          <div className="bar-wrapper">
                            <div className="bar" style={{height:`${h}%`}} title={`${q.toLocaleString()} produced`}/>
                            <span className="bar-value">{q.toLocaleString()}</span>
                          </div>
                          <span className="bar-label">
                            {new Date(item.date).toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
          }
        </div>
      </section>

      {/* Machine Status + Work Orders */}
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div><h3>Machine Status</h3><p>Current availability</p></div>
            <span style={{fontSize:"0.8rem",color:"#718096"}}>{machines.length} machines</span>
          </div>
          <div className="machine-list">
            {machines.length===0
              ? <div className="no-results">No machines.</div>
              : machines.map(m=>(
                <div className="machine-item" key={m.machine_id}>
                  <div className="machine-name">
                    <span className={`machine-dot ${getMachineColor(m.status)}`}/>
                    <div><strong>{m.name}</strong><small>{m.type}</small></div>
                  </div>
                  <span className={`status ${getMachineColor(m.status)}-text`}>{fmt(m.status)}</span>
                </div>
              ))}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <div><h3>Recent Work Orders</h3><p>Latest production orders</p></div>
            <span style={{fontSize:"0.8rem",color:"#718096"}}>{stats.totalWorkOrders||0} total</span>
          </div>
          <div className="table-wrapper">
            {workOrders.length===0
              ? <div className="no-results">No work orders.</div>
              : <table>
                  <thead><tr><th>Order</th><th>Product</th><th>Priority</th><th>Status</th></tr></thead>
                  <tbody>{workOrders.map(o=>(
                    <tr key={o.work_order_id}>
                      <td><strong>{o.order_number}</strong></td>
                      <td>{o.product_name||"-"}</td>
                      <td><span className={`priority ${getPrioBadge(o.priority)}`}>{fmt(o.priority||"normal")}</span></td>
                      <td><span className={`order-status ${getOrderBadge(o.status)}`}>{fmt(o.status)}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </section>
      </div>

      {/* Low Stock */}
      <section className="dashboard-card" style={{marginTop:20}}>
        <div className="card-header">
          <div><h3>Inventory Alerts</h3><p>Materials below reorder level</p></div>
          <span style={{fontSize:"0.8rem",color:"#718096"}}>{lowStockMaterials.length} alerts</span>
        </div>
        <div className="alert-list">
          {lowStockMaterials.length===0
            ? <div className="no-results">No low-stock materials. 🎉</div>
            : lowStockMaterials.map(m=>(
              <div className="alert-item" key={m.material_id}>
                <div className="alert-icon">!</div>
                <div>
                  <strong>{m.name}</strong>
                  <p>Reorder level: {m.reorder_level} {m.unit}</p>
                </div>
                <span>{m.stock_qty} {m.unit}</span>
              </div>
            ))}
        </div>
      </section>

      {/* Recent Production */}
      <section className="dashboard-card" style={{marginTop:20}}>
        <div className="card-header">
          <div><h3>Recent Production</h3><p>Latest production records</p></div>
        </div>
        <div className="table-wrapper">
          {recentProduction.length===0
            ? <div className="no-results">No production records.</div>
            : <table>
                <thead><tr><th>Product</th><th>Work Order</th><th>Qty Produced</th><th>Date</th></tr></thead>
                <tbody>{recentProduction.map(r=>(
                  <tr key={r.production_record_id}>
                    <td><strong>{r.product_name||"-"}</strong></td>
                    <td>{r.order_number||"-"}</td>
                    <td>{Number(r.quantity_produced||0).toLocaleString()}</td>
                    <td>{r.production_date ? new Date(r.production_date).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      </section>
    </PageLayout>
  );
}

export default Dashboard;
