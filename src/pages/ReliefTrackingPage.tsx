import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { ProgressTrack } from "../components/ProgressTrack";
import { ReliefBatch, BatchStage, InventoryItem } from "../data/types";
import { LUPAO_BARANGAYS, EVACUATION_CENTERS } from "../data/barangays";

interface ReliefTrackingPageProps {
  batches: ReliefBatch[];
  setBatches: React.Dispatch<React.SetStateAction<ReliefBatch[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

const STAGES: BatchStage[] = ["Allocated", "In Transit", "Received", "Distributed"];

export function ReliefTrackingPage({
  batches,
  setBatches,
  inventory,
  setInventory,
  notify,
  logAction,
}: ReliefTrackingPageProps) {
  const [filterStage, setFilterStage] = useState<string>("all");
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(() => {
    return window.location.hash.includes("expand") ? "LUP-26049" : null;
  });
  const [showDispatchModal, setShowDispatchModal] = useState(() => {
    return window.location.hash.includes("modal=dispatch");
  });

  // New dispatch batch form state
  const [destBarangay, setDestBarangay] = useState("San Roque");
  const [destEvacCenter, setDestEvacCenter] = useState(EVACUATION_CENTERS[0]);
  const [vehiclePlate, setVehiclePlate] = useState("SAA-4821");
  const [driverName, setDriverName] = useState("Arnel P. Soriano");
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || "INV-001");
  const [itemQuantity, setItemQuantity] = useState(50);

  const filteredBatches = batches.filter((b) => {
    if (filterStage !== "all" && b.stage !== filterStage) return false;
    return true;
  });

  const advanceBatch = (id: string) => {
    setBatches((current) =>
      current.map((batch) => {
        if (batch.id !== id) return batch;
        const index = STAGES.indexOf(batch.stage);
        if (index === STAGES.length - 1) return batch;
        const nextStage = STAGES[index + 1];
        notify(`Batch ${batch.id} advanced to ${nextStage}`);
        logAction("Batch Stage Advanced", "Relief Tracking", `Batch ${batch.id} advanced to ${nextStage}`);
        return { ...batch, stage: nextStage, updated: "Just now" };
      })
    );
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const inventoryItem = inventory.find((i) => i.id === selectedItemId);
    const itemName = inventoryItem ? inventoryItem.name : "Relief Pack";
    const itemUnit = inventoryItem ? inventoryItem.unit : "units";

    const newBatchId = `LUP-${Math.floor(26050 + Math.random() * 50)}`;
    const newBatch: ReliefBatch = {
      id: newBatchId,
      barangay: destBarangay,
      evacuationCenter: destEvacCenter,
      contents: `${itemQuantity} ${itemUnit} of ${itemName}`,
      stage: "Allocated",
      updated: "Just now",
      vehiclePlate,
      driverName,
      qrCode: `${newBatchId}-${destBarangay.replace(/\s+/g, "").toUpperCase()}`,
      items: [
        {
          itemId: selectedItemId,
          itemName,
          quantity: Number(itemQuantity),
          unit: itemUnit,
        },
      ],
    };

    // Auto-decrement inventory stock (FR-06)
    setInventory((prev) =>
      prev.map((item) =>
        item.id === selectedItemId
          ? { ...item, quantity: Math.max(0, item.quantity - Number(itemQuantity)) }
          : item
      )
    );

    setBatches((prev) => [newBatch, ...prev]);
    setShowDispatchModal(false);
    notify(`Batch ${newBatch.id} allocated & stock deducted from warehouse`);
    logAction(
      "Relief Batch Allocated",
      "Relief Tracking",
      `Dispatched ${newBatch.id} to Brgy. ${destBarangay} (${itemQuantity} ${itemUnit})`
    );
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">END-TO-END SUPPLY CHAIN</p>
          <h1>Relief Delivery & Progress Tracker</h1>
          <p>
            Monitor dispatched relief convoys across all four stages: Allocated, In Transit, Received, and Distributed.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowDispatchModal(true)}
        >
          <Icon name="truck" size={16} /> Dispatch New Batch
        </button>
      </div>

      {/* Stage KPI Cards */}
      <div className="stage-kpi-grid">
        {STAGES.map((stage) => {
          const count = batches.filter((b) => b.stage === stage).length;
          const stageLower = stage.toLowerCase().replace(/\s+/g, "-");
          return (
            <div
              key={stage}
              className={`stage-card ${stageLower} ${filterStage === stage ? "active" : ""}`}
              onClick={() => setFilterStage(filterStage === stage ? "all" : stage)}
              role="button"
              tabIndex={0}
            >
              <div className="stage-card-head">
                <span className={`stage-indicator-dot ${stageLower}`} />
                <span className="stage-name-label">{stage}</span>
              </div>
              <strong className="stage-count-num">{count}</strong>
              <small className="stage-sub-label">batches active</small>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar-card">
        <div className="filter-group">
          <label>Filter by Stage:</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
          >
            <option value="all">All Stages ({batches.length})</option>
            {STAGES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <span className="filter-hint">
          Click any batch to inspect detailed item manifests and QR codes.
        </span>
      </div>

      {/* Batches Table / Cards */}
      <div className="panel table-panel-card">
        <div className="custom-table-responsive">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>BATCH ID & QR</th>
                <th>DESTINATION</th>
                <th>MANIFEST CONTENTS</th>
                <th>LIFECYCLE STAGE</th>
                <th>TRANSPORT & DRIVER</th>
                <th>LAST UPDATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => {
                const stageIndex = STAGES.indexOf(batch.stage);
                const isExpanded = expandedBatchId === batch.id;
                return (
                  <React.Fragment key={batch.id}>
                    <tr
                      className={`table-row-interactive ${isExpanded ? "expanded-row" : ""}`}
                      onClick={() =>
                        setExpandedBatchId(isExpanded ? null : batch.id)
                      }
                    >
                      <td>
                        <strong>{batch.id}</strong>
                        <div className="batch-qr-pill" title="Security Handshake QR">
                          <Icon name="scan" size={12} />
                          <code>{batch.qrCode}</code>
                        </div>
                      </td>
                      <td>
                        <strong>Brgy. {batch.barangay}</strong>
                        <small className="cell-sub">
                          {batch.evacuationCenter || "Barangay Hall"}
                        </small>
                      </td>
                      <td>
                        <span className="manifest-text">{batch.contents}</span>
                      </td>
                      <td>
                        <ProgressTrack currentStage={batch.stage} />
                      </td>
                      <td>
                        <div className="transport-info">
                          <span>
                            <Icon name="truck" size={13} /> {batch.vehiclePlate}
                          </span>
                          <small className="cell-sub">{batch.driverName}</small>
                        </div>
                      </td>
                      <td>
                        <span className="updated-text">{batch.updated}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="advance-button"
                          disabled={stageIndex === STAGES.length - 1}
                          onClick={() => advanceBatch(batch.id)}
                          title={
                            stageIndex === STAGES.length - 1
                              ? "Completed"
                              : `Advance to ${STAGES[stageIndex + 1]}`
                          }
                        >
                          {stageIndex === STAGES.length - 1 ? (
                            <Icon name="check" size={16} />
                          ) : (
                            "Advance"
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable items detail row (BATCH_ITEMS_LINK) */}
                    {isExpanded && (
                      <tr className="expansion-detail-row">
                        <td colSpan={7}>
                          <div className="expansion-inner-container">
                            <div className="manifest-detail-head">
                              <div>
                                <h4>
                                  Batch Manifest: {batch.id} → Brgy. {batch.barangay}
                                </h4>
                                <p>
                                  Evacuation Destination:{" "}
                                  <strong>{batch.evacuationCenter || "Barangay Hall"}</strong>
                                </p>
                              </div>
                              <div className="driver-manifest-tag">
                                Driver: <strong>{batch.driverName}</strong> (Plate:{" "}
                                <strong>{batch.vehiclePlate}</strong>)
                              </div>
                            </div>
                            <div className="batch-items-grid">
                              {batch.items && batch.items.length > 0 ? (
                                batch.items.map((it, idx) => (
                                  <div key={idx} className="batch-item-chip">
                                    <Icon name="box" size={16} />
                                    <div>
                                      <strong>{it.itemName}</strong>
                                      <span>
                                        Quantity: {it.quantity} {it.unit}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="batch-item-chip">
                                  <Icon name="box" size={16} />
                                  <div>
                                    <strong>{batch.contents}</strong>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No batches found for selected stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch New Batch Modal */}
      {showDispatchModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowDispatchModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">WAREHOUSE LOGISTICS</p>
                <h2>Dispatch New Relief Batch</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowDispatchModal(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleCreateDispatch} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Destination Barangay</span>
                  <select
                    value={destBarangay}
                    onChange={(e) => setDestBarangay(e.target.value)}
                    required
                  >
                    {LUPAO_BARANGAYS.map((b) => (
                      <option key={b.id} value={b.name}>
                        Brgy. {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Evacuation Center / Receiving Hub</span>
                  <select
                    value={destEvacCenter}
                    onChange={(e) => setDestEvacCenter(e.target.value)}
                    required
                  >
                    {EVACUATION_CENTERS.map((ec) => (
                      <option key={ec} value={ec}>
                        {ec}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Select Stock Item from Warehouse</span>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit} available)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Quantity to Allocate</span>
                  <input
                    type="number"
                    min="1"
                    max={inventory.find((i) => i.id === selectedItemId)?.quantity || 500}
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Dispatch Vehicle Plate</span>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="e.g. SAA-4821"
                    required
                  />
                </label>
                <label>
                  <span>Designated Driver / Field Escort</span>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Arnel P. Soriano"
                    required
                  />
                </label>
              </div>

              <div className="form-note">
                <Icon name="box" size={16} />
                <span>
                  Allocating this batch will automatically deduct {itemQuantity} units from active warehouse stock (FR-06).
                </span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowDispatchModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Authorize & Dispatch Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
