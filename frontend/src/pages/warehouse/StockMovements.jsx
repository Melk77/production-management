import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { inventoryApi } from "../../services/api";

const TYPE_COLORS = {
  in:         { bg: "#f0fff4", color: "#38a169", border: "#c6f6d5" },
  out:        { bg: "#fff5f5", color: "#e53e3e", border: "#fed7d7" },
  adjustment: { bg: "#fffff0", color: "#d69e2e", border: "#fefcbf" },
  receipt:    { bg: "#ebf8ff", color: "#3182ce", border: "#bee3f8" },
};

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = () => {
    setLoading(true);
    inventoryApi.getStockMovements()
      .then(r => setMovements(r.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const types = [...new Set(movements.map(m => m.movement_type).filter(Boolean))];

  const filtered = movements.filter(m => {
    const q = search.toLowerCase();
    const match = !q || m.material_name?.toLowerCase().includes(q) || m.reference?.toLowerCase().includes(q) || m.notes?.toLowerCase().includes(q);
    const tp = !typeFilter || m.movement_type === typeFilter;
    return match && tp;
  });

  const totalIn  = movements.filter(m => m.movement_type === "in"  || m.movement_type === "receipt").reduce((s, m) => s + Number(m.quantity || 0), 0);
  const totalOut = movements.filter(m => m.movement_type === "out").reduce((s, m) => s + Number(m.quantity || 0), 0);

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Stock Movements</h1>
          <p>Track all inventory ins, outs and adjustments</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          ["Total Movements",  movements.length, "#e8f0fb", "📊"],
          ["Total Stock In",   totalIn,          "#f0fff4", "📥"],
          ["Total Stock Out",  totalOut,         "#fff5f5", "📤"],
        ].map(([l, v, bg, icon]) => (
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="stat-info"><span>{l}</span><h2>{typeof v === "number" ? v.toLocaleString() : v}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search movements…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No stock movements found.</div> :
            <table>
              <thead><tr><th>#</th><th>Date</th><th>Material</th><th>Type</th><th>Quantity</th><th>Reference</th><th>Notes</th></tr></thead>
              <tbody>{filtered.map((m, i) => {
                const style = TYPE_COLORS[m.movement_type] || { bg: "#f7fafc", color: "#718096", border: "#e2e8f0" };
                return (
                  <tr key={m.movement_id || i}>
                    <td>{m.movement_id || i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{m.created_at ? new Date(m.created_at).toLocaleString() : "—"}</td>
                    <td><strong>{m.material_name || "—"}</strong></td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700,
                        background: style.bg, color: style.color, border: `1px solid ${style.border}`, textTransform: "capitalize" }}>
                        {m.movement_type || "—"}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>{Number(m.quantity || 0).toLocaleString()}</span> {m.unit}</td>
                    <td>{m.reference || "—"}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#718096", fontSize: "0.82rem" }}>{m.notes || "—"}</td>
                  </tr>
                );
              })}</tbody>
            </table>}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
