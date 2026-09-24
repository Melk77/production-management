import "./StatusBadge.css";

const colorMap = {
  pass: "green",
  available: "green",
  completed: "green",
  active: "green",
  accepted: "green",
  fulfilled: "green",
  confirmed: "green",
  delivered: "green",
  received: "green",
  in_progress: "blue",
  checked: "blue",
  ordered: "blue",
  in_use: "blue",
  processing: "blue",
  shipped: "blue",
  planned: "gray",
  pending: "gray",
  draft: "gray",
  scheduled: "gray",
  retired: "gray",
  fail: "red",
  cancelled: "red",
  rejected: "red",
  urgent: "red",
  out_of_stock: "red",
  rework: "orange",
  high: "orange",
  under_maintenance: "orange",
  maintenance: "orange",
  low: "yellow",
};

const fmt = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

function StatusBadge({ status }) {
  const color = colorMap[String(status).toLowerCase()] || "gray";
  return <span className={`badge badge-${color}`}>{fmt(status)}</span>;
}

export default StatusBadge;
