import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { productsApi, inventoryApi } from "../../services/api";

const EMPTY_P = { name: "", sku: "", category: "", unit_price: 0 };
const EMPTY_B = { material_id: "", quantity_required: "", unit: "" };

function BOMPanel({ product, materials, reload }) {
  const [bom, setBom] = useState(product.bom || []);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_B);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setBom(product.bom || []), [product]);

  const loadBom = () =>
    productsApi
      .getById(product.product_id)
      .then((r) => setBom(r.data?.bom || []));

  const openAdd = () => {
    setEdit(null);
    setForm({ ...EMPTY_B, unit: materials[0]?.unit || "kg" });
    setError("");
    setModal(true);
  };
  const openEdit = (b) => {
    setEdit(b);
    setForm({
      material_id: b.material_id,
      quantity_required: b.quantity_required,
      unit: b.unit,
    });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (edit)
        await productsApi.updateBOMItem(edit.bom_id, {
          quantity_required: form.quantity_required,
          unit: form.unit,
        });
      else await productsApi.addBOMItem(product.product_id, form);
      setModal(false);
      loadBom();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeBom = async (id) => {
    if (!window.confirm("Remove this BOM item?")) return;
    try {
      await productsApi.deleteBOMItem(id);
      loadBom();
    } catch (e) {
      alert(e.message);
    }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div
        className="card-header"
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #e2e8f0",
          background: "#f7fafc",
        }}
      >
        <div>
          <strong style={{ fontSize: "0.85rem" }}>
            Bill of Materials — {product.name}
          </strong>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          + Add Item
        </button>
      </div>
      {bom.length === 0 ? (
        <div className="no-results" style={{ padding: 20 }}>
          No BOM items. Add materials needed for this product.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Qty Required</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((b) => (
              <tr key={b.bom_id}>
                <td>{b.material_name}</td>
                <td>
                  <strong>{b.quantity_required}</strong>
                </td>
                <td>{b.unit}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeBom(b.bom_id)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={edit ? "Edit BOM Item" : "Add BOM Item"}
        size="sm"
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          {!edit && (
            <div className="form-group">
              <label>Material *</label>
              <select
                value={form.material_id}
                onChange={f("material_id")}
                required
              >
                <option value="">— Select Material —</option>
                {materials.map((m) => (
                  <option key={m.material_id} value={m.material_id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>Quantity Required *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantity_required}
                onChange={f("quantity_required")}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <input
                value={form.unit}
                onChange={f("unit")}
                required
                placeholder="kg, pcs, m…"
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
    </>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_P);
  const [expanded, setExpanded] = useState(null);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([productsApi.getAll(), inventoryApi.getAllMaterials()])
      .then(([p, m]) => {
        setProducts(p.data || []);
        setMaterials(m.data || []);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_P);
    setError("");
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category || "",
      unit_price: p.unit_price,
    });
    setError("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await productsApi.update(editing.product_id, form);
      else await productsApi.create(form);
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
      await productsApi.delete(delId);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleBOM = async (pid) => {
    if (expanded === pid) {
      setExpanded(null);
      return;
    }
    const res = await productsApi.getById(pid);
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === pid ? { ...p, bom: res.data?.bom || [] } : p,
      ),
    );
    setExpanded(pid);
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Products & BOM</h1>
          <p>Manage finished products and their bill of materials</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-container">
            {loading ? (
              <div className="no-results">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="no-results">No products found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.flatMap((p) =>
                    [
                      <tr key={p.product_id}>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              background: "#f7fafc",
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {p.sku}
                          </span>
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>{p.category || "-"}</td>
                        <td>${Number(p.unit_price).toFixed(2)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleBOM(p.product_id)}
                            >
                              {expanded === p.product_id
                                ? "Hide BOM"
                                : "View BOM"}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEdit(p)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDelId(p.product_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>,
                      expanded === p.product_id && (
                        <tr key={`bom-${p.product_id}`}>
                          <td
                            colSpan={5}
                            style={{ padding: 0, background: "#f7fafc" }}
                          >
                            <BOMPanel
                              product={p}
                              materials={materials}
                              reload={load}
                            />
                          </td>
                        </tr>
                      ),
                    ].filter(Boolean),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Product" : "Add Product"}
      >
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                value={form.name}
                onChange={f("name")}
                required
                placeholder="Gear Housing Assembly"
              />
            </div>
            <div className="form-group">
              <label>SKU *</label>
              <input
                value={form.sku}
                onChange={f("sku")}
                required
                placeholder="GHA-001"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={f("category")}
                placeholder="Mechanical Parts"
              />
            </div>
            <div className="form-group">
              <label>Unit Price (birr)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unit_price}
                onChange={f("unit_price")}
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
        title="Delete Product"
        message="Delete this product and its BOM? This cannot be undone."
      />
    </PageLayout>
  );
}
