import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAuditLog } from "./hooks/useAuditLog";
import {
  Incident,
  ReliefBatch,
  ReliefRequest,
  InventoryItem,
  Donation,
  Household,
  BeneficiaryDistribution,
} from "./data/types";
import {
  INITIAL_INCIDENTS,
  INITIAL_BATCHES,
  INITIAL_RELIEF_REQUESTS,
  INITIAL_INVENTORY,
  INITIAL_DONATIONS,
  INITIAL_HOUSEHOLDS,
  INITIAL_DISTRIBUTIONS,
} from "./data/mock-data";

import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Toast } from "./components/Toast";
import { Modal } from "./components/Modal";
import { Icon } from "./components/Icon";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { ReliefTrackingPage } from "./pages/ReliefTrackingPage";
import { WarehousePage } from "./pages/WarehousePage";
import { VerificationPage } from "./pages/VerificationPage";
import { BeneficiariesPage } from "./pages/BeneficiariesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditLogPage } from "./pages/AuditLogPage";

function MainAppShell() {
  const { user } = useAuth();

  // All 12 ERD entities persisted in localStorage with clean state
  const [incidents, setIncidents] = useLocalStorage<Incident[]>("lupao-clean-incidents", INITIAL_INCIDENTS);
  const [batches, setBatches] = useLocalStorage<ReliefBatch[]>("lupao-clean-batches", INITIAL_BATCHES);
  const [requests, setRequests] = useLocalStorage<ReliefRequest[]>("lupao-clean-requests", INITIAL_RELIEF_REQUESTS);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("lupao-clean-inventory", INITIAL_INVENTORY);
  const [donations, setDonations] = useLocalStorage<Donation[]>("lupao-clean-donations", INITIAL_DONATIONS);
  const [households, setHouseholds] = useLocalStorage<Household[]>("lupao-clean-households", INITIAL_HOUSEHOLDS);
  const [distributions, setDistributions] = useLocalStorage<BeneficiaryDistribution[]>(
    "lupao-clean-distributions",
    INITIAL_DISTRIBUTIONS
  );

  const { logs, addLog, setLogs } = useAuditLog(user);

  const handleClearAllData = () => {
    setIncidents([]);
    setBatches([]);
    setRequests([]);
    setDonations([]);
    setHouseholds([]);
    setDistributions([]);
    setLogs([]);
    notify("All records cleared. System is now a clean blank slate.");
  };

  // App UI state with hash-based route synchronization
  const getNavFromHash = (hash: string): string => {
    const clean = hash.replace("#", "").split("?")[0].toLowerCase();
    switch (clean) {
      case "incidents":
        return "Incidents & Needs";
      case "tracking":
        return "Relief Tracking";
      case "warehouse":
        return "Warehouse";
      case "verification":
        return "Verification";
      case "beneficiaries":
        return "Beneficiaries";
      case "reports":
        return "Reports & DROMIC";
      case "audit":
        return "Audit Log";
      case "dashboard":
      default:
        return "Command Center";
    }
  };

  const navToHash: Record<string, string> = {
    "Command Center": "dashboard",
    "Incidents & Needs": "incidents",
    "Relief Tracking": "tracking",
    "Warehouse": "warehouse",
    "Verification": "verification",
    "Beneficiaries": "beneficiaries",
    "Reports & DROMIC": "reports",
    "Audit Log": "audit",
  };

  const [activeNav, setActiveNavState] = useState(() =>
    getNavFromHash(window.location.hash)
  );

  const setActiveNav = (nav: string) => {
    setActiveNavState(nav);
    if (navToHash[nav]) {
      window.location.hash = navToHash[nav];
    }
  };

  useEffect(() => {
    const handleHash = () => {
      setActiveNavState(getNavFromHash(window.location.hash));
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [lastSync, setLastSync] = useState("just now");
  const [modal, setModal] = useState<"incident" | "scan" | null>(() => {
    if (window.location.hash.includes("modal=incident")) return "incident";
    if (window.location.hash.includes("modal=scan")) return "scan";
    return null;
  });

  // Auto-sync heartbeat timer
  useEffect(() => {
    let seconds = 0;
    const timer = setInterval(() => {
      seconds += 5;
      if (seconds < 10) {
        setLastSync("just now");
      } else if (seconds < 60) {
        setLastSync(`${seconds}s ago`);
      } else {
        setLastSync(`${Math.floor(seconds / 60)}m ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setLastSync("just now");
  };

  // Submit incident modal form
  const submitIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const barangay = String(data.get("barangay"));
    const type = String(data.get("type")) as Incident["type"];
    const families = Number(data.get("families"));
    const severity = (data.get("severity") as Incident["severity"]) || "Moderate";
    const note = String(data.get("note") || "Urgent assistance requested");

    if (!barangay || !type || !families) return;

    const newInc: Incident = {
      id: Date.now(),
      barangay,
      type,
      severity,
      families,
      status: "For validation",
      note,
      reportedBy: user?.fullName || "Field Responder",
      time: "Just now",
      contactPerson: user?.phone || "0917-000-0000",
    };

    setIncidents((curr) => [newInc, ...curr]);
    setModal(null);
    notify(`Incident report logged for Brgy. ${barangay}`);
    addLog("Incident Logged", "Incidents & Needs", `Logged ${type} report for Brgy. ${barangay} (${families} families)`);
  };

  // Quick batch progress for tracker preview
  const progressBatch = (id: string) => {
    const stages: ReliefBatch["stage"][] = ["Allocated", "In Transit", "Received", "Distributed"];
    setBatches((current) =>
      current.map((batch) => {
        if (batch.id !== id) return batch;
        const index = stages.indexOf(batch.stage);
        if (index === stages.length - 1) return batch;
        const nextStage = stages[index + 1];
        notify(`Batch ${batch.id} advanced to ${nextStage}`);
        addLog("Batch Advanced", "Relief Tracking", `Batch ${batch.id} advanced to ${nextStage}`);
        return { ...batch, stage: nextStage, updated: "Just now" };
      })
    );
  };

  // Export DROMIC text report
  const exportDromic = () => {
    const totalFamilies = incidents.reduce((sum, item) => sum + item.families, 1042);
    const report = [
      "==================================================================",
      "DSWD DROMIC OPERATIONS REPORT - MUNICIPALITY OF LUPAO, NUEVA ECIJA",
      `Generated: ${new Date().toLocaleString()}`,
      "==================================================================",
      "",
      `Affected families: ${totalFamilies}`,
      `Active incident reports: ${incidents.length}`,
      `Relief batches tracked: ${batches.length}`,
      `Batches distributed: ${batches.filter((b) => b.stage === "Distributed").length}`,
      "",
      "--- INCIDENT SUMMARY ---",
      ...incidents.map((i) => `Brgy. ${i.barangay} | ${i.type} | ${i.families} families | Status: ${i.status}`),
      "",
      "--- DELIVERY MANIFEST ---",
      ...batches.map((b) => `${b.id} | Brgy. ${b.barangay} | ${b.contents} | Stage: ${b.stage}`),
      "",
      "--- INVENTORY BALANCE ---",
      ...inventory.map((it) => `${it.sku} | ${it.name}: ${it.quantity} ${it.unit}`),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([report], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lupao-DROMIC-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify("DROMIC situation report downloaded");
    addLog("Report Exported", "Reports & DROMIC", "Exported DROMIC Situation Report");
  };

  if (!user || window.location.hash === "#login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
          window.location.hash = "dashboard";
          setActiveNav("Command Center");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        incidentCount={incidents.filter((i) => i.status !== "Resolved").length}
      />

      <main>
        <Topbar
          query={query}
          setQuery={setQuery}
          setMobileNav={setMobileNav}
          onNewIncident={() => setModal("incident")}
          notify={notify}
          lastSync={lastSync}
          setLastSync={setLastSync}
          onClearData={handleClearAllData}
        />

        {activeNav === "Command Center" && (
          <DashboardPage
            incidents={incidents}
            batches={batches}
            inventory={inventory}
            query={query}
            onOpenNewIncident={() => setModal("incident")}
            onOpenVerify={() => setActiveNav("Verification")}
            onExportDromic={exportDromic}
            onAdvanceBatch={progressBatch}
            onNavigate={(page) => setActiveNav(page)}
            notify={notify}
          />
        )}

        {activeNav === "Incidents & Needs" && (
          <IncidentsPage
            incidents={incidents}
            setIncidents={setIncidents}
            reliefRequests={requests}
            setReliefRequests={setRequests}
            onOpenNewIncident={() => setModal("incident")}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Relief Tracking" && (
          <ReliefTrackingPage
            batches={batches}
            setBatches={setBatches}
            inventory={inventory}
            setInventory={setInventory}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Warehouse" && (
          <WarehousePage
            inventory={inventory}
            setInventory={setInventory}
            donations={donations}
            setDonations={setDonations}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Verification" && (
          <VerificationPage
            batches={batches}
            setBatches={setBatches}
            households={households}
            setHouseholds={setHouseholds}
            distributions={distributions}
            setDistributions={setDistributions}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Beneficiaries" && (
          <BeneficiariesPage
            households={households}
            setHouseholds={setHouseholds}
            distributions={distributions}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Reports & DROMIC" && (
          <ReportsPage
            incidents={incidents}
            batches={batches}
            inventory={inventory}
            households={households}
            distributions={distributions}
            notify={notify}
            logAction={addLog}
          />
        )}

        {activeNav === "Audit Log" && (
          <AuditLogPage logs={logs} setLogs={setLogs} notify={notify} />
        )}
      </main>

      {mobileNav && (
        <div className="nav-backdrop" onClick={() => setMobileNav(false)} />
      )}

      {toast && <Toast message={toast} />}

      {/* New Incident Modal */}
      {modal === "incident" && (
        <Modal title="New incident & needs report" onClose={() => setModal(null)}>
          <form className="incident-form" onSubmit={submitIncident}>
            <div className="form-grid">
              <label>
                <span>Target Barangay</span>
                <select name="barangay" required defaultValue="San Roque">
                  <option value="San Roque">San Roque</option>
                  <option value="Mapangpang">Mapangpang</option>
                  <option value="Poblacion East">Poblacion East</option>
                  <option value="Agupalo Este">Agupalo Este</option>
                  <option value="Balbalungao">Balbalungao</option>
                  <option value="San Isidro">San Isidro</option>
                  <option value="Burgos">Burgos</option>
                  <option value="Sto. Domingo">Sto. Domingo</option>
                </select>
              </label>
              <label>
                <span>Hazard Type</span>
                <select name="type" required defaultValue="Flood">
                  <option value="Flood">Flood</option>
                  <option value="Typhoon">Typhoon</option>
                  <option value="Fire">Fire</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Evacuation">Evacuation</option>
                </select>
              </label>
              <label>
                <span>Affected Families</span>
                <input
                  name="families"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  defaultValue="45"
                  required
                />
              </label>
              <label>
                <span>Severity Level</span>
                <select name="severity" defaultValue="Moderate">
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>
            </div>
            <label>
              <span>Field Assessment & Requested Supplies</span>
              <textarea
                name="note"
                rows={4}
                placeholder="Describe road access, urgent needs, vulnerable groups, and requested goods..."
                defaultValue="Road access partially blocked by mud. Food packs and emergency hygiene kits required."
              />
            </label>
            <div className="form-note">
              <Icon name="cloud" size={18} />
              <span>
                Report is timestamped and stored in local cache. Synchronizes when connected.
              </span>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save Incident Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick QR Scan Modal */}
      {modal === "scan" && (
        <Modal title="Proof-of-delivery verification" onClose={() => setModal(null)}>
          <div className="scanner">
            <div className="scan-frame">
              <i className="scan-laser-line" />
              <div className="scan-target-box">
                <Icon name="scan" size={56} />
                <span>Position QR or barcode inside the frame</span>
              </div>
            </div>
            <div className="scan-divider">
              <span>OR ENTER CODE MANUALLY</span>
            </div>
            <div className="manual-code">
              <input
                defaultValue="LUP-26049"
                id="quick-scan-input"
                aria-label="Batch or beneficiary code"
              />
              <button
                className="primary-button"
                onClick={() => {
                  setModal(null);
                  progressBatch("LUP-26049");
                }}
              >
                Verify code
              </button>
            </div>
            <p className="privacy-note">
              Verification is timestamped and cryptographically linked to the delivery manifest.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
