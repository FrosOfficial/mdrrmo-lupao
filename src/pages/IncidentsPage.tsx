import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { Incident, ReliefRequest, HazardType, IncidentSeverity } from "../data/types";
import { LUPAO_BARANGAYS } from "../data/barangays";
import { useAuth } from "../hooks/useAuth";
import { canReviewIncidents } from "../data/permissions";

interface IncidentsPageProps {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  reliefRequests: ReliefRequest[];
  setReliefRequests: React.Dispatch<React.SetStateAction<ReliefRequest[]>>;
  onOpenNewIncident: () => void;
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

export function IncidentsPage({
  incidents,
  setIncidents,
  reliefRequests,
  setReliefRequests,
  onOpenNewIncident,
  notify,
  logAction,
}: IncidentsPageProps) {
  const { user } = useAuth();
  const canReview = !!user && canReviewIncidents(user.role);
  const [activeTab, setActiveTab] = useState<"incidents" | "requests">(() => {
    return window.location.hash.includes("requests") ? "requests" : "incidents";
  });
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [selectedHazard, setSelectedHazard] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(() => {
    return window.location.hash.includes("modal=request");
  });

  // Form state for new relief request
  const [reqIncidentId, setReqIncidentId] = useState<number>(incidents[0]?.id || 1);
  const [reqFamilies, setReqFamilies] = useState(50);
  const [reqItems, setReqItems] = useState("Family Food Packs (50), Hygiene Kits (50)");
  const [reqUrgency, setReqUrgency] = useState<"Normal" | "High" | "Emergency">("High");

  const filteredIncidents = incidents.filter((i) => {
    if (selectedBarangay !== "all" && i.barangay !== selectedBarangay) return false;
    if (selectedHazard !== "all" && i.type !== selectedHazard) return false;
    if (selectedStatus !== "all" && i.status !== selectedStatus) return false;
    return true;
  });

  const filteredRequests = reliefRequests.filter((r) => {
    if (selectedBarangay !== "all" && r.barangay !== selectedBarangay) return false;
    if (selectedStatus !== "all" && r.status !== selectedStatus) return false;
    return true;
  });

  const updateIncidentStatus = (id: number, newStatus: Incident["status"]) => {
    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    const inc = incidents.find((i) => i.id === id);
    notify(`Incident #${id} (Brgy. ${inc?.barangay}) marked as ${newStatus}`);
    logAction("Incident Status Updated", "Incidents & Needs", `Updated incident #${id} to ${newStatus}`);
  };

  const updateRequestStatus = (id: string, newStatus: ReliefRequest["status"]) => {
    setReliefRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    notify(`Relief Request ${id} marked as ${newStatus}`);
    logAction("Relief Request Updated", "Incidents & Needs", `Request ${id} marked as ${newStatus}`);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetInc = incidents.find((i) => i.id === Number(reqIncidentId));
    const newReq: ReliefRequest = {
      id: `REQ-2026-00${reliefRequests.length + 1}`,
      incidentId: Number(reqIncidentId),
      barangay: targetInc ? targetInc.barangay : "San Roque",
      families: Number(reqFamilies),
      requestedItems: reqItems,
      status: "Pending",
      requestedBy: user?.fullName || "Barangay Official",
      requestedAt: "Just now",
      urgency: reqUrgency,
    };
    setReliefRequests((prev) => [newReq, ...prev]);
    setShowRequestModal(false);
    notify(`Requisition ${newReq.id} submitted for review`);
    logAction("Relief Request Created", "Incidents & Needs", `Created request ${newReq.id} for Brgy ${newReq.barangay}`);
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">FIELD ASSESSMENTS & REQUISITIONS</p>
          <h1>Incidents & Needs Portal</h1>
          <p>
            Monitor barangay disaster damages, manage localized needs assessments, and approve relief requisitions.
          </p>
        </div>
        <div className="header-action-group">
          {activeTab === "incidents" ? (
            <button className="primary-button" onClick={onOpenNewIncident}>
              <Icon name="plus" size={16} /> Log field incident
            </button>
          ) : (
            <button className="primary-button" onClick={() => setShowRequestModal(true)}>
              <Icon name="plus" size={16} /> New relief request
            </button>
          )}
        </div>
      </div>

      <div className="tabs-header-bar">
        <button
          className={`tab-switch-btn ${activeTab === "incidents" ? "active" : ""}`}
          onClick={() => setActiveTab("incidents")}
        >
          <Icon name="alert" size={16} />
          <span>Incident Reports ({incidents.length})</span>
        </button>
        <button
          className={`tab-switch-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <Icon name="file" size={16} />
          <span>Relief Requests ({reliefRequests.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar-card">
        <div className="filter-group">
          <label>Barangay:</label>
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <option value="all">All Barangays</option>
            {LUPAO_BARANGAYS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {activeTab === "incidents" && (
          <div className="filter-group">
            <label>Hazard Type:</label>
            <select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value)}
            >
              <option value="all">All Hazards</option>
              <option value="Flood">Flood</option>
              <option value="Typhoon">Typhoon</option>
              <option value="Fire">Fire</option>
              <option value="Landslide">Landslide</option>
              <option value="Evacuation">Evacuation</option>
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {activeTab === "incidents" ? (
              <>
                <option value="For validation">For validation</option>
                <option value="Approved">Approved</option>
                <option value="Critical">Critical</option>
                <option value="Resolved">Resolved</option>
              </>
            ) : (
              <>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Fulfilled">Fulfilled</option>
              </>
            )}
          </select>
        </div>

        <button
          className="filter-reset-btn"
          onClick={() => {
            setSelectedBarangay("all");
            setSelectedHazard("all");
            setSelectedStatus("all");
          }}
        >
          <Icon name="refresh" size={14} /> Reset
        </button>
      </div>

      {/* Tab 1: Incidents Table */}
      {activeTab === "incidents" && (
        <div className="panel table-panel-card">
          <div className="custom-table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>BARANGAY</th>
                  <th>HAZARD & SEVERITY</th>
                  <th>AFFECTED FAMILIES</th>
                  <th>ASSESSMENT NOTE</th>
                  <th>REPORTED BY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <strong>#{inc.id}</strong>
                    </td>
                    <td>
                      <strong>Brgy. {inc.barangay}</strong>
                      <small className="cell-sub">{inc.time}</small>
                    </td>
                    <td>
                      <div className="badge-hazard-group">
                        <span className={`hazard-chip ${inc.type.toLowerCase()}`}>
                          {inc.type}
                        </span>
                        <span className={`severity-chip ${inc.severity.toLowerCase()}`}>
                          {inc.severity}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong className="cell-highlight">{inc.families}</strong>
                      <small className="cell-sub">families</small>
                    </td>
                    <td className="note-cell-wide">
                      <p>{inc.note}</p>
                    </td>
                    <td>
                      <span className="reporter-name">{inc.reportedBy}</span>
                      <small className="cell-sub">{inc.contactPerson}</small>
                    </td>
                    <td>
                      <span className={`status ${inc.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-button-cluster">
                        {canReview && inc.status === "For validation" && (
                          <button
                            className="action-btn-small approve"
                            onClick={() => updateIncidentStatus(inc.id, "Approved")}
                            title="Validate & Approve incident"
                          >
                            Approve
                          </button>
                        )}
                        {canReview && inc.status === "Approved" && (
                          <button
                            className="action-btn-small resolve"
                            onClick={() => updateIncidentStatus(inc.id, "Resolved")}
                            title="Mark incident resolved"
                          >
                            Resolve
                          </button>
                        )}
                        {inc.status === "Resolved" && (
                          <span className="resolved-check">
                            <Icon name="check" size={14} /> Done
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredIncidents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-table-cell">
                      No incident reports found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Relief Requests Table */}
      {activeTab === "requests" && (
        <div className="panel table-panel-card">
          <div className="custom-table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>REQ ID</th>
                  <th>BARANGAY</th>
                  <th>LINKED INCIDENT</th>
                  <th>FAMILIES</th>
                  <th>REQUESTED SUPPLIES</th>
                  <th>URGENCY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong>{req.id}</strong>
                      <small className="cell-sub">{req.requestedAt}</small>
                    </td>
                    <td>
                      <strong>Brgy. {req.barangay}</strong>
                      <small className="cell-sub">{req.requestedBy}</small>
                    </td>
                    <td>
                      <span className="linked-incident-tag">
                        Incident #{req.incidentId}
                      </span>
                    </td>
                    <td>
                      <strong className="cell-highlight">{req.families}</strong>
                    </td>
                    <td className="note-cell-wide">
                      <strong>{req.requestedItems}</strong>
                    </td>
                    <td>
                      <span className={`urgency-pill ${req.urgency.toLowerCase()}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-button-cluster">
                        {canReview && req.status === "Pending" && (
                          <>
                            <button
                              className="action-btn-small approve"
                              onClick={() => updateRequestStatus(req.id, "Approved")}
                              title="Approve for allocation"
                            >
                              Approve
                            </button>
                            <button
                              className="action-btn-small reject"
                              onClick={() => updateRequestStatus(req.id, "Rejected")}
                              title="Reject request"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {canReview && req.status === "Approved" && (
                          <button
                            className="action-btn-small fulfill"
                            onClick={() => updateRequestStatus(req.id, "Fulfilled")}
                            title="Mark fulfilled by logistics"
                          >
                            Fulfill
                          </button>
                        )}
                        {req.status === "Fulfilled" && (
                          <span className="resolved-check">
                            <Icon name="check" size={14} /> Dispatched
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-table-cell">
                      No relief requests found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Relief Request Modal */}
      {showRequestModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowRequestModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">RELIEF REQUISITION</p>
                <h2>Create Relief Requisition</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowRequestModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Linked Active Incident</span>
                  <select
                    value={reqIncidentId}
                    onChange={(e) => setReqIncidentId(Number(e.target.value))}
                    required
                  >
                    {incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        #{inc.id} - Brgy. {inc.barangay} ({inc.type})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Affected Families Count</span>
                  <input
                    type="number"
                    min="1"
                    value={reqFamilies}
                    onChange={(e) => setReqFamilies(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Requisition Urgency</span>
                  <select
                    value={reqUrgency}
                    onChange={(e) =>
                      setReqUrgency(e.target.value as "Normal" | "High" | "Emergency")
                    }
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Requested Relief Supplies & Quantities</span>
                <textarea
                  rows={3}
                  value={reqItems}
                  onChange={(e) => setReqItems(e.target.value)}
                  placeholder="e.g. 50 Family Food Packs, 50 Hygiene Kits, 20 Water Containers"
                  required
                />
              </label>
              <div className="form-note">
                <Icon name="cloud" size={16} />
                <span>Approval will authorize warehouse packaging and truck dispatch.</span>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
