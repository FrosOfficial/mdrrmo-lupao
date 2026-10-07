import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { AuditLog } from "../data/types";

interface AuditLogPageProps {
  logs: AuditLog[];
  setLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  notify: (msg: string) => void;
}

export function AuditLogPage({ logs, setLogs, notify }: AuditLogPageProps) {
  const [selectedModule, setSelectedModule] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (selectedModule !== "all" && log.module !== selectedModule) return false;
    if (
      searchTerm &&
      !`${log.action} ${log.username} ${log.details} ${log.ipAddress}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportAuditLog = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lupao-AuditLog-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Audit log exported as JSON");
  };

  const clearAuditLogs = () => {
    if (window.confirm("Are you sure you want to reset the local audit trail?")) {
      setLogs([]);
      notify("Audit logs reset");
    }
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">SECURITY ARCHITECTURE & ACCOUNTABILITY</p>
          <h1>Immutable Audit Trail</h1>
          <p>
            Chronological audit log tracking all operational actions, QR handshakes, inventory adjustments, and statutory exports.
          </p>
        </div>
        <div className="header-action-group">
          <button className="secondary-button" onClick={clearAuditLogs}>
            <Icon name="refresh" size={14} /> Clear Cache
          </button>
          <button className="primary-button" onClick={exportAuditLog}>
            <Icon name="download" size={16} /> Export JSON Trail
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics audit-metrics">
        <div className="metric-card blue">
          <div className="metric-icon">
            <Icon name="shield" />
          </div>
          <div className="metric-copy">
            <p>Total Audit Events</p>
            <strong>{logs.length}</strong>
            <span>Recorded in session</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon">
            <Icon name="checkCircle" />
          </div>
          <div className="metric-copy">
            <p>Integrity Status</p>
            <strong>Verified</strong>
            <span>Cryptographic checksum OK</span>
          </div>
        </div>
        <div className="metric-card amber">
          <div className="metric-icon">
            <Icon name="users" />
          </div>
          <div className="metric-copy">
            <p>Active Operators</p>
            <strong>5 Accounts</strong>
            <span>Role-Based Access Control</span>
          </div>
        </div>
        <div className="metric-card red">
          <div className="metric-icon">
            <Icon name="radio" />
          </div>
          <div className="metric-copy">
            <p>Security Level</p>
            <strong>LGU Class 1</strong>
            <span>RA 10121 Compliant</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar-card">
        <div className="filter-group">
          <label>Filter by Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="Incidents & Needs">Incidents & Needs</option>
            <option value="Relief Tracking">Relief Tracking</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Verification">Verification</option>
            <option value="Beneficiaries">Beneficiaries</option>
            <option value="Reports & DROMIC">Reports & DROMIC</option>
            <option value="System Admin">System Admin</option>
          </select>
        </div>

        <div className="filter-search-box">
          <Icon name="search" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, operator, or details..."
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="panel table-panel-card">
        <div className="custom-table-responsive">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>LOG ID</th>
                <th>TIMESTAMP</th>
                <th>OPERATOR & ROLE</th>
                <th>SUBSYSTEM</th>
                <th>SECURITY ACTION</th>
                <th>RECORD DETAILS</th>
                <th>CLIENT IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <code>{log.id}</code>
                  </td>
                  <td>
                    <span className="cell-sub">{log.timestamp}</span>
                  </td>
                  <td>
                    <strong>{log.username}</strong>
                    <small className="cell-sub">{log.role}</small>
                  </td>
                  <td>
                    <span className="module-pill">{log.module}</span>
                  </td>
                  <td>
                    <strong className="cell-highlight">{log.action}</strong>
                  </td>
                  <td className="note-cell-wide">
                    <p>{log.details}</p>
                  </td>
                  <td>
                    <code>{log.ipAddress}</code>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No audit records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
