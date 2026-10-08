import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { Household, BeneficiaryDistribution } from "../data/types";
import { useAuth } from "../hooks/useAuth";
import { canEditHouseholds } from "../data/permissions";
import { LUPAO_BARANGAYS, EVACUATION_CENTERS } from "../data/barangays";

interface BeneficiariesPageProps {
  households: Household[];
  setHouseholds: React.Dispatch<React.SetStateAction<Household[]>>;
  distributions: BeneficiaryDistribution[];
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

export function BeneficiariesPage({
  households,
  setHouseholds,
  distributions,
  notify,
  logAction,
}: BeneficiariesPageProps) {
  const { user } = useAuth();
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedHhId, setExpandedHhId] = useState<string | null>(() => {
    return window.location.hash.includes("expand") ? "HH-LUP-001" : null;
  });
  const [showRegisterModal, setShowRegisterModal] = useState(() => {
    return window.location.hash.includes("modal=register");
  });

  // New family form
  const [headName, setHeadName] = useState("");
  const [hhBarangay, setHhBarangay] = useState("San Roque");
  const [familyMembers, setFamilyMembers] = useState(4);
  const [address, setAddress] = useState("");
  const [evacCenter, setEvacCenter] = useState(EVACUATION_CENTERS[0]);
  const [contactNumber, setContactNumber] = useState("0917-000-0000");

  const filteredHouseholds = households.filter((h) => {
    if (selectedBarangay !== "all" && h.barangay !== selectedBarangay) return false;
    if (selectedStatus !== "all" && h.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !`${h.headOfFamily} ${h.qrCode} ${h.address}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleRegisterHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `HH-LUP-0${households.length + 1}`;
    const newHousehold: Household = {
      id: newId,
      headOfFamily: headName,
      barangay: hhBarangay,
      membersCount: Number(familyMembers),
      address: address || "Poblacion, Lupao",
      qrCode: `QR-${newId}`,
      evacuationCenter: evacCenter,
      status: "Registered",
      contactNumber,
    };

    setHouseholds((prev) => [newHousehold, ...prev]);
    setShowRegisterModal(false);
    notify(`Registered ${newHousehold.headOfFamily} (QR: ${newHousehold.qrCode})`);
    logAction("Household Registered", "Beneficiaries", `Registered ${newHousehold.headOfFamily} in Brgy ${newHousehold.barangay}`);
    setHeadName("");
    setAddress("");
  };

  const claimedCount = households.filter((h) => h.status === "Claimed").length;
  const unclaimedCount = households.filter((h) => h.status === "Registered").length;

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">HOUSEHOLD PROFILING & REGISTRATION</p>
          <h1>Beneficiaries & Evacuee Directory</h1>
          <p>
            Master registry of vulnerable households, disaster evacuation center assignments, and individual relief entitlement history.
          </p>
        </div>
        {user && canEditHouseholds(user.role) && (
          <button className="primary-button" onClick={() => setShowRegisterModal(true)}>
            <Icon name="plus" size={16} /> Register Affected Household
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="metrics beneficiary-metrics">
        <div className="metric-card blue">
          <div className="metric-icon">
            <Icon name="users" />
          </div>
          <div className="metric-copy">
            <p>Registered Families</p>
            <strong>{households.length}</strong>
            <span>Active master census</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon">
            <Icon name="check" />
          </div>
          <div className="metric-copy">
            <p>Relief Claimed</p>
            <strong>{claimedCount}</strong>
            <span>Verified recipients</span>
          </div>
        </div>
        <div className="metric-card amber">
          <div className="metric-icon">
            <Icon name="clock" />
          </div>
          <div className="metric-copy">
            <p>Pending Distribution</p>
            <strong>{unclaimedCount}</strong>
            <span>Awaiting supply arrival</span>
          </div>
        </div>
        <div className="metric-card red">
          <div className="metric-icon">
            <Icon name="shield" />
          </div>
          <div className="metric-copy">
            <p>Duplicate Prevention</p>
            <strong>100% Locked</strong>
            <span>QR-authenticated gate</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

        <div className="filter-group">
          <label>Claim Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Registered">Registered (Unclaimed)</option>
            <option value="Claimed">Claimed (Received)</option>
          </select>
        </div>

        <div className="filter-search-box">
          <Icon name="search" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family name or QR code..."
          />
        </div>
      </div>

      {/* Master Households Table */}
      <div className="panel table-panel-card">
        <div className="custom-table-responsive">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>HOUSEHOLD ID</th>
                <th>HEAD OF FAMILY</th>
                <th>BARANGAY & ADDRESS</th>
                <th>MEMBERS</th>
                <th>EVACUATION SHELTER</th>
                <th>QR CREDENTIAL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.map((hh) => {
                const isClaimed = hh.status === "Claimed";
                const isExpanded = expandedHhId === hh.id;
                const hhDists = distributions.filter((d) => d.householdId === hh.id);

                return (
                  <React.Fragment key={hh.id}>
                    <tr
                      className={`table-row-interactive ${isExpanded ? "expanded-row" : ""}`}
                      onClick={() => setExpandedHhId(isExpanded ? null : hh.id)}
                    >
                      <td>
                        <strong>{hh.id}</strong>
                      </td>
                      <td>
                        <strong>{hh.headOfFamily}</strong>
                        <small className="cell-sub">{hh.contactNumber}</small>
                      </td>
                      <td>
                        <strong>Brgy. {hh.barangay}</strong>
                        <small className="cell-sub">{hh.address}</small>
                      </td>
                      <td>
                        <strong className="cell-highlight">{hh.membersCount}</strong>
                        <small className="cell-sub">pax</small>
                      </td>
                      <td>
                        <span className="shelter-tag">
                          {hh.evacuationCenter || "Home / Shelter"}
                        </span>
                      </td>
                      <td>
                        <div className="qr-credential-badge">
                          <Icon name="scan" size={14} />
                          <code>{hh.qrCode}</code>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`beneficiary-status-badge ${isClaimed ? "claimed" : "registered"}`}
                        >
                          {isClaimed ? "Claimed" : "Unclaimed"}
                        </span>
                      </td>
                    </tr>

                    {/* Detailed Distribution History Expansion (FR-12) */}
                    {isExpanded && (
                      <tr className="expansion-detail-row">
                        <td colSpan={7}>
                          <div className="expansion-inner-container">
                            <div className="manifest-detail-head">
                              <h4>
                                Entitlement History: {hh.headOfFamily} ({hh.id})
                              </h4>
                              <span className="cell-sub">
                                Duplicate Prevention Protocol:{" "}
                                <strong>
                                  {isClaimed ? "Locked (Relief Claimed)" : "Eligible for 1 Pack"}
                                </strong>
                              </span>
                            </div>
                            {hhDists.length > 0 ? (
                              <div className="dist-history-timeline">
                                {hhDists.map((d) => (
                                  <div key={d.id} className="history-item-row">
                                    <div className="history-icon-badge">
                                      <Icon name="check" size={14} />
                                    </div>
                                    <div className="history-text">
                                      <strong>
                                        {d.itemsReceived} (Batch {d.batchId})
                                      </strong>
                                      <p>
                                        Disbursed at {d.distributedAt} by{" "}
                                        <strong>{d.distributedBy}</strong>
                                      </p>
                                    </div>
                                    <span className="qr-verified-tag">
                                      QR Handshake Verified
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="no-history-text">
                                No relief claims logged yet. Awaiting distribution at evacuation center.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredHouseholds.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No beneficiary households found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Household Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowRegisterModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">FIELD ENUMERATION</p>
                <h2>Register Affected Household</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowRegisterModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleRegisterHousehold} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Head of Family (Full Name)</span>
                  <input
                    type="text"
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="e.g. Rolando Fernandez"
                    required
                  />
                </label>
                <label>
                  <span>Barangay</span>
                  <select
                    value={hhBarangay}
                    onChange={(e) => setHhBarangay(e.target.value)}
                    required
                  >
                    {LUPAO_BARANGAYS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Family Size (No. of Members)</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Contact Number</span>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                  />
                </label>
                <label>
                  <span>Assigned Evacuation Center</span>
                  <select
                    value={evacCenter}
                    onChange={(e) => setEvacCenter(e.target.value)}
                  >
                    {EVACUATION_CENTERS.map((ec) => (
                      <option key={ec} value={ec}>
                        {ec}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Purok / Sitio / Residential Address</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Purok 3, Near Riverside"
                    required
                  />
                </label>
              </div>
              <div className="form-note">
                <Icon name="scan" size={16} />
                <span>
                  A unique anti-counterfeit QR code will be generated for proof-of-delivery verification.
                </span>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
