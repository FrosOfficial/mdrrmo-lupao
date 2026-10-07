import React, { useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { useAuth } from "../hooks/useAuth";
import { DEMO_USERS } from "../data/mock-data";

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  mobileNav: boolean;
  setMobileNav: (open: boolean) => void;
  incidentCount: number;
}

export function Sidebar({
  activeNav,
  setActiveNav,
  mobileNav,
  setMobileNav,
  incidentCount,
}: SidebarProps) {
  const { user, logout, switchUser } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const navItems = [
    { id: "Command Center", icon: "grid", label: "Command Center" },
    { id: "Incidents & Needs", icon: "alert", label: "Incidents & Needs", badge: incidentCount },
    { id: "Relief Tracking", icon: "truck", label: "Relief Tracking" },
    { id: "Warehouse", icon: "box", label: "Warehouse" },
    { id: "Verification", icon: "scan", label: "Verification" },
    { id: "Beneficiaries", icon: "users", label: "Beneficiaries" },
    { id: "Reports & DROMIC", icon: "file", label: "Reports & DROMIC" },
    { id: "Audit Log", icon: "shield", label: "Audit Log" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand">
        <Logo />
        <div>
          <strong>MDRRMO</strong>
          <span>LUPAO · NUEVA ECIJA</span>
        </div>
      </div>

      <button
        className="mobile-close"
        onClick={() => setMobileNav(false)}
        aria-label="Close menu"
      >
        <Icon name="close" />
      </button>

      <div className="operation-chip">
        <span className="pulse" />
        <div>
          <small>OPERATION STATUS</small>
          <strong>Elevated readiness</strong>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <p className="nav-label">WORKSPACE</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeNav === item.id ? "active" : ""}
            onClick={() => {
              setActiveNav(item.id);
              setMobileNav(false);
            }}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && <b>{item.badge}</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="offline-card">
          <div>
            <Icon name="cloud" />
            <span>Local-first mode</span>
          </div>
          <strong>Local storage active</strong>
          <small>Ready for offline field operations</small>
        </div>

        <div className="user-card-wrapper">
          <div
            className="user-card"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            role="button"
            tabIndex={0}
            title="Click to switch role or log out"
          >
            <div className="avatar">{user ? getInitials(user.fullName) : "GU"}</div>
            <div>
              <strong>{user?.fullName || "Guest User"}</strong>
              <span>{user?.role || "Select Account"}</span>
            </div>
            <Icon name="chevron" size={16} />
          </div>

          {showRoleMenu && (
            <div className="role-dropdown-menu">
              <div className="role-dropdown-header">SWITCH DEMO ROLE</div>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.username}
                  className={`role-option-btn ${user?.username === u.username ? "active" : ""}`}
                  onClick={() => {
                    switchUser(u.username);
                    setShowRoleMenu(false);
                  }}
                >
                  <span className="role-opt-name">{u.fullName}</span>
                  <span className="role-opt-role">{u.role}</span>
                </button>
              ))}
              <div className="role-dropdown-divider" />
              <button
                className="logout-action-btn"
                onClick={() => {
                  logout();
                  window.location.hash = "login";
                  setShowRoleMenu(false);
                }}
              >
                <Icon name="logout" size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
