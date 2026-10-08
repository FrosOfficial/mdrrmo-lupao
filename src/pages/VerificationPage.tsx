import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { ReliefBatch, Household, BeneficiaryDistribution } from "../data/types";
import { ROLE_VERIFY_MODES } from "../data/permissions";
import { useAuth } from "../hooks/useAuth";

interface VerificationPageProps {
  batches: ReliefBatch[];
  setBatches: React.Dispatch<React.SetStateAction<ReliefBatch[]>>;
  households: Household[];
  setHouseholds: React.Dispatch<React.SetStateAction<Household[]>>;
  distributions: BeneficiaryDistribution[];
  setDistributions: React.Dispatch<React.SetStateAction<BeneficiaryDistribution[]>>;
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

type VerifyMode = "warehouse-release" | "barangay-reception" | "beneficiary-handout";

export function VerificationPage({
  batches,
  setBatches,
  households,
  setHouseholds,
  distributions,
  setDistributions,
  notify,
  logAction,
}: VerificationPageProps) {
  const { user } = useAuth();
  const allowedModes: VerifyMode[] = user ? ROLE_VERIFY_MODES[user.role] : [];
  const [mode, setMode] = useState<VerifyMode>(() => {
    let wanted: VerifyMode = "beneficiary-handout";
    if (window.location.hash.includes("warehouse")) wanted = "warehouse-release";
    else if (window.location.hash.includes("reception")) wanted = "barangay-reception";
    return allowedModes.includes(wanted) ? wanted : allowedModes[0] ?? wanted;
  });
  const [inputCode, setInputCode] = useState(households[0]?.qrCode || "");
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || "");
  const [lastVerifiedMessage, setLastVerifiedMessage] = useState<string | null>(null);

  const handleVerify = (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode).trim();
    if (!code) return;

    if (mode === "warehouse-release") {
      // Find batch by ID or QR code
      const targetBatch = batches.find(
        (b) => b.id.toLowerCase() === code.toLowerCase() || b.qrCode.toLowerCase() === code.toLowerCase()
      );
      if (!targetBatch) {
        notify(`Batch code "${code}" not found.`);
        return;
      }
      if (targetBatch.stage !== "Allocated") {
        notify(`Batch ${targetBatch.id} is already in stage: ${targetBatch.stage}`);
        return;
      }

      setBatches((prev) =>
        prev.map((b) =>
          b.id === targetBatch.id
            ? { ...b, stage: "In Transit", updated: "Just now", verifiedBy: user?.fullName }
            : b
        )
      );
      const msg = `Handover Verified: Batch ${targetBatch.id} released from warehouse to vehicle ${targetBatch.vehiclePlate}`;
      setLastVerifiedMessage(msg);
      notify(msg);
      logAction("Warehouse Release Verified", "Verification", msg);
    } else if (mode === "barangay-reception") {
      // Find batch by ID or QR code
      const targetBatch = batches.find(
        (b) => b.id.toLowerCase() === code.toLowerCase() || b.qrCode.toLowerCase() === code.toLowerCase()
      );
      if (!targetBatch) {
        notify(`Batch code "${code}" not found.`);
        return;
      }

      setBatches((prev) =>
        prev.map((b) =>
          b.id === targetBatch.id
            ? { ...b, stage: "Received", updated: "Just now", verifiedBy: user?.fullName }
            : b
        )
      );
      const msg = `Reception Confirmed: Batch ${targetBatch.id} safely received at Brgy. ${targetBatch.barangay}`;
      setLastVerifiedMessage(msg);
      notify(msg);
      logAction("Barangay Reception Verified", "Verification", msg);
    } else if (mode === "beneficiary-handout") {
      // Beneficiary QR verification
      const targetHousehold = households.find(
        (h) => h.qrCode.toLowerCase() === code.toLowerCase() || h.id.toLowerCase() === code.toLowerCase()
      );

      if (!targetHousehold) {
        notify(`Beneficiary code "${code}" not found in registered records.`);
        return;
      }

      // DUPLICATE CLAIM CHECK (FR-11)
      if (targetHousehold.status === "Claimed") {
        notify(`DUPLICATE WARNING: ${targetHousehold.headOfFamily} has ALREADY claimed relief for this disaster event.`);
        setLastVerifiedMessage(
          `FLAGGED: Household ${targetHousehold.headOfFamily} (${targetHousehold.id}) already claimed relief on record.`
        );
        logAction("Duplicate Handout Blocked", "Verification", `Blocked duplicate handover for ${targetHousehold.id}`);
        return;
      }

      // Mark household as claimed
      setHouseholds((prev) =>
        prev.map((h) =>
          h.id === targetHousehold.id ? { ...h, status: "Claimed" } : h
        )
      );

      // Append distribution record
      const targetBatch = batches.find((b) => b.id === selectedBatchId);
      const newDist: BeneficiaryDistribution = {
        id: `DIST-0${distributions.length + 1}`,
        householdId: targetHousehold.id,
        headOfFamily: targetHousehold.headOfFamily,
        barangay: targetHousehold.barangay,
        batchId: selectedBatchId,
        itemsReceived: targetBatch ? targetBatch.contents : "1 Family Food Pack",
        distributedAt: "Just now",
        distributedBy: user?.fullName || "Field Responder",
        qrVerified: true,
      };

      setDistributions((prev) => [newDist, ...prev]);
      const msg = `Relief Handover Verified: 1 Relief Pack issued to ${targetHousehold.headOfFamily} (Brgy. ${targetHousehold.barangay})`;
      setLastVerifiedMessage(msg);
      notify(msg);
      logAction("Beneficiary Handout Verified", "Verification", msg);
    }
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">PROOF OF DELIVERY & ANTI-DUPLICATION</p>
          <h1>Digital QR Verification Portal</h1>
          <p>
            Cryptographic delivery verification, reception handshakes, and duplicate-prevention beneficiary authentication.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="tabs-header-bar">
        {allowedModes.includes("beneficiary-handout") && (
        <button
          className={`tab-switch-btn ${mode === "beneficiary-handout" ? "active" : ""}`}
          onClick={() => {
            setMode("beneficiary-handout");
            setInputCode("QR-HH-LUP-001");
            setLastVerifiedMessage(null);
          }}
        >
          <Icon name="users" size={16} />
          <span>Beneficiary Handout (Anti-Duplication)</span>
        </button>
        )}
        {allowedModes.includes("warehouse-release") && (
        <button
          className={`tab-switch-btn ${mode === "warehouse-release" ? "active" : ""}`}
          onClick={() => {
            setMode("warehouse-release");
            setInputCode("LUP-26048");
            setLastVerifiedMessage(null);
          }}
        >
          <Icon name="box" size={16} />
          <span>Warehouse Release (Stage 1→2)</span>
        </button>
        )}
        {allowedModes.includes("barangay-reception") && (
        <button
          className={`tab-switch-btn ${mode === "barangay-reception" ? "active" : ""}`}
          onClick={() => {
            setMode("barangay-reception");
            setInputCode("LUP-26049");
            setLastVerifiedMessage(null);
          }}
        >
          <Icon name="truck" size={16} />
          <span>Barangay Reception (Stage 2→3)</span>
        </button>
        )}
      </div>

      <div className="verification-layout-grid">
        {/* Scanner & Code Input Card */}
        <div className="panel scanner-main-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">OPTICAL & DIGITAL HANDSHAKE</p>
              <h2>
                {mode === "beneficiary-handout" && "Scan Household QR Code"}
                {mode === "warehouse-release" && "Scan Warehouse Batch Barcode"}
                {mode === "barangay-reception" && "Scan Barangay Delivery Manifest"}
              </h2>
            </div>
            <span className="live">
              <i /> CAMERA ACTIVE
            </span>
          </div>

          <div className="scanner-frame-wrapper">
            <div className="scan-frame">
              <i className="scan-laser-line" />
              <div className="scan-target-box">
                <Icon name="scan" size={68} />
                <span>Align QR code within digital guide</span>
              </div>
            </div>
          </div>

          <div className="verification-form-section">
            {mode === "beneficiary-handout" && (
              <div className="form-group-batch-select">
                <label>Select Dispensing Batch Manifest:</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - Brgy. {b.barangay} ({b.contents})
                    </option>
                  ))}
                  {batches.length === 0 && (
                    <option value="">No dispatched batches available</option>
                  )}
                </select>
              </div>
            )}

            <div className="scan-divider">
              <span>MANUAL CODE ENTRY / ONE-CLICK TEST</span>
            </div>

            <div className="manual-verify-controls">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter QR or Batch Identifier..."
                className="verify-input"
              />
              <button
                type="button"
                className="primary-button"
                onClick={() => handleVerify()}
              >
                <Icon name="checkCircle" size={16} /> Authenticate Code
              </button>
            </div>

            {/* Quick Sample Click Chips for Demo */}
            <div className="quick-test-chips">
              <small>Click sample to test:</small>
              {mode === "beneficiary-handout" ? (
                households.length > 0 ? (
                  households.slice(0, 3).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      className={`chip-btn ${h.status === "Claimed" ? "chip-warn" : ""}`}
                      onClick={() => {
                        setInputCode(h.qrCode);
                        handleVerify(h.qrCode);
                      }}
                    >
                      {h.headOfFamily} ({h.status})
                    </button>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-sub)", fontStyle: "italic" }}>
                    No households registered yet. Register a household in Beneficiaries tab.
                  </span>
                )
              ) : (
                batches.length > 0 ? (
                  batches.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className="chip-btn"
                      onClick={() => {
                        setInputCode(b.id);
                        handleVerify(b.id);
                      }}
                    >
                      Batch {b.id} ({b.barangay})
                    </button>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-sub)", fontStyle: "italic" }}>
                    No batches dispatched yet. Create a batch in Relief Tracking.
                  </span>
                )
              )}
            </div>

            {lastVerifiedMessage && (
              <div
                className={`verify-result-banner ${lastVerifiedMessage.includes("FLAGGED") ? "flagged" : "success"}`}
              >
                <Icon
                  name={lastVerifiedMessage.includes("FLAGGED") ? "alert" : "check"}
                  size={18}
                />
                <span>{lastVerifiedMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification History Log Sidebar */}
        <div className="panel verify-log-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">AUDIT RECORD</p>
              <h2>Recent Handover Log</h2>
            </div>
            <span className="badge-count">{distributions.length} records</span>
          </div>

          <div className="verify-feed-list">
            {distributions.slice(0, 8).map((dist) => (
              <div key={dist.id} className="verify-feed-item">
                <div className="verify-feed-icon">
                  <Icon name="check" size={15} />
                </div>
                <div className="verify-feed-content">
                  <strong>{dist.headOfFamily}</strong>
                  <p>
                    Brgy. {dist.barangay} · Batch {dist.batchId}
                  </p>
                  <small>
                    Verified by {dist.distributedBy} · {dist.distributedAt}
                  </small>
                </div>
                <span className="qr-badge">QR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
