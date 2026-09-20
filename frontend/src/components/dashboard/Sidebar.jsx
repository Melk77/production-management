import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

export const navItems = [
  { section: "MAIN" },
  { to: "/dashboard", icon: "▦", label: "Dashboard" },
  { to: "/profile", icon: "◉", label: "Profile" },

  { section: "ADMIN" },
  { to: "/users", icon: "👤", label: "Users", roles: ["admin"] },
  { to: "/employees", icon: "◉", label: "Employees", roles: ["admin"] },
  { to: "/departments", icon: "◈", label: "Departments", roles: ["admin"] },

  { section: "PRODUCTION" },
  {
    to: "/work-orders",
    icon: "□",
    label: "Work Orders",
    roles: ["admin", "manager", "operator"],
  },
  {
    to: "/production",
    icon: "⚙",
    label: "Production Log",
    roles: ["admin", "manager", "operator"],
  },
  {
    to: "/machines",
    icon: "◉",
    label: "Machines",
    roles: ["admin", "manager"],
  },
  {
    to: "/maintenance",
    icon: "🔧",
    label: "Maintenance",
    roles: ["admin", "manager"],
  },
  {
    to: "/products",
    icon: "⬡",
    label: "Products & BOM",
    roles: ["admin", "manager"],
  },

  { section: "INVENTORY" },
  {
    to: "/inventory",
    icon: "◈",
    label: "Raw Materials",
    roles: ["admin", "warehouse"],
  },
  {
    to: "/finished-goods",
    icon: "◉",
    label: "Finished Goods",
    roles: ["admin", "warehouse", "manager"],
  },
  {
    to: "/stock-movements",
    icon: "⇄",
    label: "Stock Movements",
    roles: ["admin", "warehouse", "manager"],
  },

  { section: "QUALITY" },
  {
    to: "/quality",
    icon: "✓",
    label: "Quality Control",
    roles: ["admin", "inspector"],
  },

  { section: "PROCUREMENT" },
  {
    to: "/suppliers",
    icon: "♢",
    label: "Suppliers",
    roles: ["admin", "procurement", "manager"],
  },
  {
    to: "/purchase-orders",
    icon: "▤",
    label: "Purchase Orders",
    roles: ["admin", "procurement", "manager"],
  },

  { section: "SALES" },
  {
    to: "/customers",
    icon: "◎",
    label: "Customers",
    roles: ["admin", "procurement", "manager"],
  },
  {
    to: "/sales-orders",
    icon: "◻",
    label: "Sales Orders",
    roles: ["admin", "procurement", "manager"],
  },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || user?.email || "User";
  const role = user?.role?.toLowerCase() || "";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.section) return true;
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const finalNavItems = visibleNavItems.filter((item, index, array) => {
    if (!item.section) return true;

    const nextItem = array[index + 1];

    return nextItem && !nextItem.section;
  });

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙</div>

          <div>
            <h2>FactoryFlow</h2>
            <span>Production Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {finalNavItems.map((item, index) =>
            item.section ? (
              <div
                key={`section-${item.section}-${index}`}
                className="nav-section-title"
              >
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>

            <div className="sidebar-user-info">
              <strong>{displayName}</strong>
              <span>{user?.role || "User"}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
