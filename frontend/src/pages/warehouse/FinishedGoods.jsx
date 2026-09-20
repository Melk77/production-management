import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { productsApi } from "../../services/api";

export default function FinishedGoods() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const load = () => {
    setLoading(true);
    productsApi.getAll()
      .then(r => setProducts(r.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  const totalValue = filtered.reduce((sum, p) => sum + (Number(p.quantity_in_stock || 0) * Number(p.unit_price || 0)), 0);
  const inStock    = filtered.filter(p => Number(p.quantity_in_stock || 0) > 0);

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Finished Goods</h1>
          <p>View finished products available in inventory</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          ["Total Products",    products.length, "#e8f0fb", "📦"],
          ["In Stock",          inStock.length,  "#f0fff4", "✅"],
          ["Inventory Value",   `$${totalValue.toFixed(2)}`, "#fffff0", "💰"],
        ].map(([l, v, bg, icon]) => (
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="stat-info"><span>{l}</span><h2 style={{ fontSize: typeof v === "string" && v.length > 8 ? "1.2rem" : undefined }}>{v}</h2></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input className="search-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            {loading ? <div className="no-results">Loading…</div> :
            filtered.length === 0 ? <div className="no-results">No products found.</div> :
            <table>
              <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Qty in Stock</th><th>Unit Price</th><th>Stock Value</th><th>Status</th></tr></thead>
              <tbody>{filtered.map(p => {
                const qty   = Number(p.quantity_in_stock || 0);
                const price = Number(p.unit_price || 0);
                const val   = qty * price;
                const hasStock = qty > 0;
                return (
                  <tr key={p.product_id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", background: "#f7fafc", padding: "2px 8px", borderRadius: 4 }}>{p.sku}</span></td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category || "—"}</td>
                    <td><span style={{ fontWeight: 700, color: hasStock ? "#38a169" : "#e53e3e" }}>{qty.toLocaleString()}</span></td>
                    <td>${price.toFixed(2)}</td>
                    <td><strong>${val.toFixed(2)}</strong></td>
                    <td>
                      <span style={{
                        padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700,
                        background: hasStock ? "#f0fff4" : "#fff5f5",
                        color: hasStock ? "#38a169" : "#e53e3e",
                        border: `1px solid ${hasStock ? "#c6f6d5" : "#fed7d7"}`,
                      }}>
                        {hasStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
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
