import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { Incident, ReliefBatch, InventoryItem, Household, BeneficiaryDistribution } from "../data/types";

interface ReportsPageProps {
  incidents: Incident[];
  batches: ReliefBatch[];
  inventory: InventoryItem[];
  households: Household[];
  distributions: BeneficiaryDistribution[];
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

export function ReportsPage({
  incidents,
  batches,
  inventory,
  households,
  distributions,
  notify,
  logAction,
}: ReportsPageProps) {
  const [reportType, setReportType] = useState<"dromic" | "pdrrmo">("dromic");
  const [period, setPeriod] = useState("24-hours");

  const totalFamilies = incidents.reduce((sum, item) => sum + item.families, 1042);
  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const distributedBatches = batches.filter((b) => b.stage === "Distributed").length;
  const inTransitBatches = batches.filter((b) => b.stage === "In Transit").length;

  const handleExportDromic = () => {
    const reportText = [
      "==================================================================",
      "             REPUBLIC OF THE PHILIPPINES                          ",
      " DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT (DSWD)              ",
      " DISASTER RESPONSE OPERATIONS MONITORING & INFORMATION CENTER    ",
      "                 DROMIC SITUATION REPORT #04                     ",
      "==================================================================",
      "Location: Municipality of Lupao, Province of Nueva Ecija",
      `Report Date/Time: ${new Date().toLocaleString()}`,
      `Monitoring Period: ${period.toUpperCase()}`,
      "Incident: Heavy Inundation & Southwest Monsoon Surge (Talavera River)",
      "",
      "I. SITUATION OVERVIEW",
      `Total Affected Families: ${totalFamilies.toLocaleString()}`,
      `Total Registered Evacuee Households: ${households.length}`,
      `Active Incident Reports Logged: ${incidents.length}`,
      `Critical Severity Incidents: ${incidents.filter((i) => i.status === "Critical").length}`,
      "",
      "II. BARANGAY CASUALTY & IMPACT MATRIX",
      ...incidents.map(
        (i) =>
          `* Brgy. ${i.barangay.padEnd(16)} | Hazard: ${i.type.padEnd(10)} | Families: ${String(i.families).padStart(4)} | Status: ${i.status}`
      ),
      "",
      "III. LOGISTICS & RELIEF DISPATCH SUMMARY",
      `Total Relief Batches Dispatched: ${batches.length}`,
      `Batches In Transit: ${inTransitBatches}`,
      `Batches Fully Distributed: ${distributedBatches}`,
      `Verified Individual Beneficiary Claims: ${distributions.length}`,
      "",
      "IV. DELIVERY MANIFEST BREAKDOWN",
      ...batches.map(
        (b) =>
          `[${b.id}] Dest: Brgy. ${b.barangay.padEnd(15)} | ${b.contents} | Stage: ${b.stage} | Vehicle: ${b.vehiclePlate}`
      ),
      "",
      "V. WAREHOUSE RELIEF INVENTORY RESERVE",
      `Total Available Units in Stock: ${totalStock.toLocaleString()}`,
      ...inventory.map(
        (it) =>
          `- ${it.sku.padEnd(12)} | ${it.name.padEnd(36)}: ${String(it.quantity).padStart(4)} ${it.unit}`
      ),
      "",
      "VI. CERTIFICATION",
      "Certified Prepared by: MDRRMO Operations Center, Lupao, Nueva Ecija",
      "Approved for Transmission to: PDRRMO Palayan City & DSWD Field Office III",
      "==================================================================",
    ].join("\n");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DSWD-DROMIC-Lupao-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    notify("DSWD DROMIC situation report downloaded");
    logAction("Report Exported", "Reports & DROMIC", "Exported official DSWD DROMIC text report");
  };

  const handleExportPdrrmo = () => {
    const pdrrmoText = [
      "==================================================================",
      "   PROVINCIAL DISASTER RISK REDUCTION & MANAGEMENT COUNCIL (PDRRMC)",
      "              PALAYAN CITY, NUEVA ECIJA                          ",
      "         MUNICIPALITY OF LUPAO - FLASH SITUATION REPORT           ",
      "==================================================================",
      `Date/Time Filed: ${new Date().toLocaleString()}`,
      `Filing Authority: MDRRMO Lupao Command Operations Center`,
      "",
      "1. SUMMARY OF EVACUATION CENTERS OCCUPANCY",
      `Total Active Centers: 4 (Lupao Central School, Municipal Gym, San Roque Court, Mapangpang Hall)`,
      `Total Evacuated Families: ${totalFamilies.toLocaleString()}`,
      "",
      "2. DISPATCH FLEET STATUS",
      ...batches.map(
        (b) => `Batch ${b.id} -> Dest: ${b.barangay} | Escort: ${b.driverName} (${b.vehiclePlate}) | Status: ${b.stage}`
      ),
      "",
      "3. REQUEST FOR PROVINCIAL AUGMENTATION",
      "- 200 sacks of NFA rice requested from Provincial Warehouse Palayan City",
      "- 1 Rescue boat asset requested on standby for Talavera River basin",
      "==================================================================",
    ].join("\n");

    const blob = new Blob([pdrrmoText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PDRRMO-NuevaEcija-Lupao-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    notify("PDRRMO provincial report downloaded");
    logAction("Report Exported", "Reports & DROMIC", "Exported PDRRMO Provincial Flash Report");
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">STATUTORY COMPLIANCE & ANALYTICS</p>
          <h1>Reports & DROMIC Compiler</h1>
          <p>
            Generate certified DSWD DROMIC reports and Provincial DRRMO bulletins with live operational manifests.
          </p>
        </div>
        <div className="header-action-group">
          <button
            className="secondary-button"
            onClick={() => window.print()}
            title="Print or export as PDF"
          >
            <Icon name="printer" size={16} /> Print Official Form
          </button>
          <button className="primary-button" onClick={handleExportDromic}>
            <Icon name="download" size={16} /> Export DSWD DROMIC (.txt)
          </button>
        </div>
      </div>

      {/* Report Controls & Format Bar */}
      <div className="filter-toolbar-card">
        <div className="filter-group">
          <label>Standard Format:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as "dromic" | "pdrrmo")}
          >
            <option value="dromic">DSWD DROMIC Standard Report (National)</option>
            <option value="pdrrmo">PDRRMO Nueva Ecija Flash Bulletin (Provincial)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Reporting Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Today's Shift (0800H - 1700H)</option>
            <option value="24-hours">Last 24 Hours Rolling</option>
            <option value="cumulative">Cumulative Incident Period</option>
          </select>
        </div>

        <button
          className="action-btn-small"
          onClick={reportType === "dromic" ? handleExportDromic : handleExportPdrrmo}
        >
          <Icon name="download" size={14} /> Download Selected Format
        </button>
      </div>

      {/* Live Form Preview Sheet */}
      <div className="dromic-report-sheet">
        <div className="dromic-sheet-header">
          <div className="gov-header-emblem">
            <span className="ph-seal-badge">PH</span>
          </div>
          <div className="gov-header-text">
            <h5>Republic of the Philippines</h5>
            <h4>DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT</h4>
            <h3>DISASTER RESPONSE OPERATIONS MONITORING AND INFORMATION CENTER</h3>
            <h2>DROMIC REPORT #04 · MUNICIPALITY OF LUPAO</h2>
            <small>
              Date: {new Date().toLocaleDateString()} | Time: 09:41 AM PST | Classification: FOR OFFICIAL DISTRIBUTION
            </small>
          </div>
        </div>

        <div className="dromic-section">
          <h3>1. Executive Incident Summary</h3>
          <p>
            Due to sustained heavy precipitation caused by the enhanced southwest monsoon, multiple barangays within the Municipality of Lupao, Nueva Ecija have experienced heightened flood levels along the Talavera River basin. Prepositioned relief resources have been mobilized across 8 operational barangays.
          </p>
          <div className="dromic-kpi-summary">
            <div>
              <strong>{totalFamilies.toLocaleString()}</strong>
              <span>Affected Families</span>
            </div>
            <div>
              <strong>{batches.length}</strong>
              <span>Dispatched Batches</span>
            </div>
            <div>
              <strong>{distributedBatches}</strong>
              <span>Distributed Batches</span>
            </div>
            <div>
              <strong>{totalStock.toLocaleString()}</strong>
              <span>Reserve Stock Units</span>
            </div>
          </div>
        </div>

        <div className="dromic-section">
          <h3>2. Barangay Impact Assessment</h3>
          <table className="dromic-preview-table">
            <thead>
              <tr>
                <th>Barangay</th>
                <th>Hazard Type</th>
                <th>Severity</th>
                <th>Affected Families</th>
                <th>Assessment Findings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <strong>Brgy. {inc.barangay}</strong>
                  </td>
                  <td>{inc.type}</td>
                  <td>
                    <span className={`severity-chip ${inc.severity.toLowerCase()}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td>
                    <strong>{inc.families}</strong>
                  </td>
                  <td className="note-cell-wide">{inc.note}</td>
                  <td>{inc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dromic-section">
          <h3>3. Relief Delivery Manifest & Audit Tracking</h3>
          <table className="dromic-preview-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Destination</th>
                <th>Manifest Details</th>
                <th>Transit Stage</th>
                <th>Vehicle / Plate</th>
                <th>Escort Officer</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <code>{b.id}</code>
                  </td>
                  <td>Brgy. {b.barangay}</td>
                  <td>{b.contents}</td>
                  <td>
                    <span className="cell-highlight">{b.stage}</span>
                  </td>
                  <td>{b.vehiclePlate}</td>
                  <td>{b.driverName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dromic-sheet-footer">
          <div className="sign-off-block">
            <p>Prepared by:</p>
            <strong>CARLOS D. BAUTISTA</strong>
            <small>Operations Officer, MDRRMO Lupao</small>
          </div>
          <div className="sign-off-block">
            <p>Approved & Certified by:</p>
            <strong>HON. ALEX R. GOMEZ</strong>
            <small>Municipal Mayor / Chairman, MDRRMC Lupao</small>
          </div>
        </div>
      </div>
    </div>
  );
}
