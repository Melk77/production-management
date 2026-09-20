import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import "./Topbar.css";

function Topbar({ user, setSidebarOpen, onSearch }) {
  const [searchValue, setSearchValue] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const displayName = user?.name || user?.email || "User";
  const role = user?.role || "";
  const initial = displayName.charAt(0).toUpperCase();

  const matches = searchValue.trim()
    ? navItems.filter(
        (item) =>
          !item.section &&
          item.label.toLowerCase().includes(searchValue.trim().toLowerCase()),
      )
    : [];

  const goToResult = (to) => {
    navigate(to);
    setSearchValue("");
    setResultsOpen(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearchValue(value);
    setResultsOpen(true);

    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && matches.length > 0) {
      goToResult(matches[0].to);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setResultsOpen(false);

    if (onSearch) {
      onSearch("");
    }

    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === "Escape") {
        clearSearch();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToProfile = () => {
    setUserMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="topbar-search">
        <span className="search-icon">⌕</span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => searchValue && setResultsOpen(true)}
          onBlur={() => setTimeout(() => setResultsOpen(false), 150)}
          placeholder="Search…"
          className="search-input"
        />

        {searchValue && (
          <button
            type="button"
            className="search-clear"
            onMouseDown={clearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}

        <span className="search-shortcut">Ctrl K</span>

        {resultsOpen && searchValue.trim() && (
          <div className="search-results">
            {matches.length > 0 ? (
              matches.map((item) => (
                <button
                  type="button"
                  key={item.to}
                  className="search-result-item"
                  onMouseDown={() => goToResult(item.to)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            ) : (
              <div className="search-no-results">
                No pages match "{searchValue}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          ♢
        </button>

        <div className="topbar-divider"></div>
        <div className="topbar-user" ref={userMenuRef}>
          <button
            type="button"
            className="topbar-user-trigger"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <div className="topbar-avatar">{initial}</div>

            <div className="topbar-user-info">
              <strong>{displayName}</strong>
              <span>{role}</span>
            </div>

            <span className="topbar-arrow">▾</span>
          </button>

          {userMenuOpen && (
            <div className="topbar-user-menu">
              <button
                type="button"
                className="topbar-user-menu-item"
                onClick={goToProfile}
              >
                My Profile
              </button>
              <button
                type="button"
                className="topbar-user-menu-item"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
