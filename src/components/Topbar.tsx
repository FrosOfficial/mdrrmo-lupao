import React from "react";
import { Icon } from "./Icon";
import { useAuth } from "../hooks/useAuth";

interface TopbarProps {
  query: string;
  setQuery: (q: string) => void;
  setMobileNav: (open: boolean) => void;
  onNewIncident: () => void;
  notify: (msg: string) => void;
  lastSync: string;
  setLastSync: (s: string) => void;
  onClearData?: () => void;
}

export function Topbar({
  query,
  setQuery,
  setMobileNav,
  onNewIncident,
  notify,
  lastSync,
  setLastSync,
  onClearData,
}: TopbarProps) {
  const { user } = useAuth();
  const isReadOnly = user?.role === "Municipal Official";

  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={() => setMobileNav(true)}
        aria-label="Open menu"
      >
        <Icon name="menu" />
      </button>

      <div className="search">
        <Icon name="search" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search incidents, barangays, batches, relief supplies..."
        />
      </div>

      <div className="top-actions">
        {isReadOnly && (
          <span className="readonly-badge" title="Municipal Executive Read-Only Access">
            EXECUTIVE VIEW (READ-ONLY)
          </span>
        )}

        <button
          className="sync-status"
          onClick={() => {
            setLastSync("just now");
            notify("Local records synchronized successfully");
          }}
          title="Click to simulate synchronization"
        >
          <span />
          <div>
            <small>SYNCED</small>
            <strong>{lastSync}</strong>
          </div>
        </button>

        <button
          className="secondary-button"
          style={{ height: "36px", padding: "0 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          onClick={() => {
            if (window.confirm("Clear all data to test with a clean blank slate?")) {
              onClearData?.();
            }
          }}
          title="Wipe data to start fresh"
        >
          <Icon name="refresh" size={13} />
          <span>Clear Data</span>
        </button>

        <button
          className="icon-button notification"
          aria-label="Notifications"
          onClick={() => notify("Notification: 3 pending validation reports from San Roque & Balbalungao")}
        >
          <Icon name="bell" />
          <i />
        </button>

        {!isReadOnly && (
          <button className="primary-button" onClick={onNewIncident}>
            <Icon name="plus" size={18} />
            <span>New incident</span>
          </button>
        )}
      </div>
    </header>
  );
}
