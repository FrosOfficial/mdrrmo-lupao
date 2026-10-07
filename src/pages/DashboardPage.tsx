import React from "react";
import { Icon } from "../components/Icon";
import { MetricCard } from "../components/MetricCard";
import { Incident, ReliefBatch, InventoryItem } from "../data/types";
import { useAuth } from "../hooks/useAuth";

interface DashboardPageProps {
  incidents: Incident[];
  batches: ReliefBatch[];
  inventory: InventoryItem[];
  query: string;
  onOpenNewIncident: () => void;
  onOpenVerify: () => void;
  onExportDromic: () => void;
  onAdvanceBatch: (id: string) => void;
  onNavigate: (page: string) => void;
  notify: (msg: string) => void;
}

export function DashboardPage({
  incidents,
  batches,
  inventory,
  query,
  onOpenNewIncident,
  onOpenVerify,
  onExportDromic,
  onAdvanceBatch,
  onNavigate,
  notify,
}: DashboardPageProps) {
  const { user } = useAuth();
  const stages = ["Allocated", "In Transit", "Received", "Distributed"] as const;

  const totalFamilies = incidents.reduce((sum, item) => sum + item.families, 1042);
  const activeIncidentsCount = incidents.filter((i) => i.status !== "Resolved").length;
  const inTransitCount = batches.filter((b) => b.stage === "In Transit").length;
  
  // Total inventory units & dynamic warehouse capacity percentage (3,100 units nominal benchmark)
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const WAREHOUSE_CAPACITY = 3100;
  const capacityPct = Math.min(100, Math.max(0, Math.round((totalUnits / WAREHOUSE_CAPACITY) * 100)));
  const isHealthy = capacityPct >= 40;
  const capacityLabel =
    capacityPct >= 75
      ? "Healthy capacity"
      : capacityPct >= 40
      ? "Adequate capacity"
      : "Low stock reserve";

  // Dynamic monitored stock items
  const foodPackItem = inventory.find(
    (i) => i.id === "INV-001" || i.sku === "FOOD-FP-01" || i.name.toLowerCase().includes("food pack")
  );
  const hygieneItem = inventory.find(
    (i) => i.id === "INV-002" || i.sku === "HYG-KIT-01" || i.name.toLowerCase().includes("hygiene")
  );
  const waterItem = inventory.find(
    (i) => i.id === "INV-003" || i.sku === "WAT-CTR-05" || i.name.toLowerCase().includes("water")
  );

  const monitoredItems = [
    {
      name: "Family food packs",
      item: foodPackItem,
      quantity: foodPackItem?.quantity ?? 450,
      targetMax: 600,
      dotClass: "dot-0",
    },
    {
      name: "Hygiene kits",
      item: hygieneItem,
      quantity: hygieneItem?.quantity ?? 280,
      targetMax: 400,
      dotClass: "dot-1",
    },
    {
      name: "Water containers",
      item: waterItem,
      quantity: waterItem?.quantity ?? 12,
      targetMax: 60,
      dotClass: "dot-2",
    },
  ];

  const filteredIncidents = incidents.filter((item) =>
    `${item.barangay} ${item.type} ${item.note}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="content">
      <section className="page-intro">
        <div>
          <p className="eyebrow">MUNICIPAL COMMAND CENTER</p>
          <h1>Good day, {user?.fullName || "Commander"}.</h1>
          <p>
            Here is Lupao’s disaster response situation as of <strong>Tuesday, 9:41 AM</strong>.
          </p>
        </div>
        <div className="weather">
          <span className="weather-icon">28°</span>
          <div>
            <strong>Heavy rainfall</strong>
            <small>PAGASA Orange Warning</small>
          </div>
        </div>
      </section>

      <section className="alert-banner">
        <div className="alert-symbol">
          <Icon name="radio" />
        </div>
        <div>
          <strong>Elevated monitoring is active</strong>
          <p>
            Continuous rainfall may affect low-lying barangays along the Talavera River. Field teams are on standby with prepositioned relief assets.
          </p>
        </div>
        <button onClick={() => notify("PAGASA Situation Bulletin #4 viewed")}>
          View bulletin <Icon name="arrow" size={16} />
        </button>
      </section>

      <section className="metrics" aria-label="Situation overview">
        <MetricCard
          icon="alert"
          label="Affected families"
          value={totalFamilies.toLocaleString()}
          detail="+124 in the last 24 hours"
          tone="blue"
        />
        <MetricCard
          icon="radio"
          label="Active incidents"
          value={String(activeIncidentsCount)}
          detail="3 marked critical severity"
          tone="red"
        />
        <MetricCard
          icon="truck"
          label="Batches in transit"
          value={String(inTransitCount + 2)}
          detail="Dispatched to evacuation hubs"
          tone="amber"
        />
        <MetricCard
          icon="box"
          label="Warehouse capacity"
          value={`${capacityPct}%`}
          detail={`${totalUnits.toLocaleString()} units stocked`}
          tone={capacityPct < 30 ? "red" : capacityPct < 60 ? "amber" : "green"}
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel incident-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">FIELD REPORTS</p>
              <h2>Active incidents & needs</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Incidents & Needs")}
            >
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="incident-list">
            {filteredIncidents.slice(0, 4).map((incident) => {
              const statusClass = incident.status.toLowerCase().replace(/\s+/g, "-");
              return (
                <article className="incident-row" key={incident.id}>
                  <div className={`incident-type ${statusClass}`}>
                    <Icon name={incident.status === "Critical" ? "alert" : "radio"} />
                  </div>
                  <div className="incident-main">
                    <div className="incident-title">
                      <strong>Barangay {incident.barangay}</strong>
                      <span className={`status ${statusClass}`}>{incident.status}</span>
                    </div>
                    <p>{incident.note}</p>
                    <small>
                      {incident.type} · {incident.families} families · Reported {incident.time}
                    </small>
                  </div>
                  <button
                    className="row-button"
                    onClick={() => onNavigate("Incidents & Needs")}
                    aria-label={`Open ${incident.barangay} report`}
                  >
                    <Icon name="arrow" size={18} />
                  </button>
                </article>
              );
            })}
            {filteredIncidents.length === 0 && (
              <div className="empty-state">
                <Icon name="search" />
                <strong>No matching reports</strong>
                <span>Try a barangay or hazard name.</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel inventory-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">WAREHOUSE 01</p>
              <h2>Inventory pulse</h2>
            </div>
            <button
              className="more-button"
              onClick={() => onNavigate("Warehouse")}
              aria-label="More inventory options"
            >
              •••
            </button>
          </div>
          <div className="capacity">
            <div
              className="capacity-ring"
              style={{
                background: `conic-gradient(var(--teal) ${capacityPct}%, #e8eeee 0)`,
              }}
            >
              <span>
                {capacityPct}<small>%</small>
              </span>
            </div>
            <div>
              <strong>{totalUnits.toLocaleString()} units</strong>
              <p>Available relief items</p>
              <span className={isHealthy ? "safe" : "danger"}>
                <Icon name={isHealthy ? "check" : "alert"} size={13} /> {capacityLabel}
              </span>
            </div>
          </div>
          <div className="stock-list">
            {monitoredItems.map((m) => {
              const level = Math.min(100, Math.round((m.quantity / m.targetMax) * 100));
              const isLow = m.item ? m.quantity <= m.item.minThreshold : m.quantity <= 15;
              return (
                <div className="stock-row" key={m.name}>
                  <div>
                    <span className={`stock-dot ${m.dotClass}`} />
                    <strong>{m.name}</strong>
                    <small>{m.quantity.toLocaleString()} units</small>
                  </div>
                  <div className="bar">
                    <i
                      style={{
                        width: `${level}%`,
                        background: isLow ? "var(--red)" : undefined,
                      }}
                    />
                  </div>
                  {isLow && <b>LOW</b>}
                </div>
              );
            })}
          </div>
          <button
            className="secondary-button"
            onClick={() => onNavigate("Warehouse")}
          >
            Manage inventory <Icon name="arrow" size={16} />
          </button>
        </section>

        <section className="panel tracker-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">LIVE LOGISTICS</p>
              <h2>Relief delivery tracker</h2>
            </div>
            <span className="live">
              <i /> LIVE
            </span>
          </div>
          <div className="tracker-table">
            <div className="table-head">
              <span>BATCH & DESTINATION</span>
              <span>CONTENTS</span>
              <span>PROGRESS</span>
              <span>LAST UPDATE</span>
              <span />
            </div>
            {batches.slice(0, 5).map((batch) => {
              const stageIndex = stages.indexOf(batch.stage);
              return (
                <div className="batch-row" key={batch.id}>
                  <div>
                    <strong>{batch.id}</strong>
                    <small>Brgy. {batch.barangay}</small>
                  </div>
                  <span>{batch.contents}</span>
                  <div className="progress-cell">
                    <div className="progress-track">
                      {stages.map((stage, index) => (
                        <i key={stage} className={index <= stageIndex ? "done" : ""} />
                      ))}
                    </div>
                    <strong>{batch.stage}</strong>
                  </div>
                  <span className="updated">{batch.updated}</span>
                  <button
                    className="advance-button"
                    disabled={stageIndex === stages.length - 1}
                    onClick={() => onAdvanceBatch(batch.id)}
                    title={stageIndex === stages.length - 1 ? "Fully distributed" : "Advance stage"}
                  >
                    {stageIndex === stages.length - 1 ? (
                      <Icon name="check" size={16} />
                    ) : (
                      "Advance"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="quick-panel">
          <div className="quick-head">
            <p className="eyebrow">SHORTCUTS</p>
            <h2>Quick actions</h2>
          </div>
          <button onClick={onOpenNewIncident}>
            <span className="quick-icon coral">
              <Icon name="plus" />
            </span>
            <div>
              <strong>Log field incident</strong>
              <small>Create a barangay needs report</small>
            </div>
            <Icon name="arrow" size={17} />
          </button>
          <button onClick={onOpenVerify}>
            <span className="quick-icon blue">
              <Icon name="scan" />
            </span>
            <div>
              <strong>Verify handover</strong>
              <small>Scan delivery or beneficiary code</small>
            </div>
            <Icon name="arrow" size={17} />
          </button>
          <button onClick={onExportDromic}>
            <span className="quick-icon green">
              <Icon name="download" />
            </span>
            <div>
              <strong>Export DROMIC</strong>
              <small>Generate certified local report</small>
            </div>
            <Icon name="arrow" size={17} />
          </button>
        </aside>
      </div>
    </div>
  );
}
