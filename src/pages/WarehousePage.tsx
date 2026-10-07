import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { InventoryItem, Donation, InventoryCategory } from "../data/types";
import { useAuth } from "../hooks/useAuth";

interface WarehousePageProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  donations: Donation[];
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
  notify: (msg: string) => void;
  logAction: (action: string, module: string, details: string) => void;
}

export function WarehousePage({
  inventory,
  setInventory,
  donations,
  setDonations,
  notify,
  logAction,
}: WarehousePageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"inventory" | "donations">(() => {
    return window.location.hash.includes("donations") ? "donations" : "inventory";
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(() => {
    return window.location.hash.includes("modal=donation");
  });

  // New item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>("Food");
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemUnit, setNewItemUnit] = useState("packs");
  const [newItemThreshold, setNewItemThreshold] = useState(25);
  const [newItemExpiry, setNewItemExpiry] = useState("2027-12-31");

  // New donation form
  const [donorName, setDonorName] = useState("");
  const [donorType, setDonorType] = useState<Donation["donorType"]>("Corporate");
  const [donatedItemId, setDonatedItemId] = useState(inventory[0]?.id || "INV-001");
  const [donatedQty, setDonatedQty] = useState(50);
  const [donationNotes, setDonationNotes] = useState("");

  const filteredInventory = inventory.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    return true;
  });

  const totalStockCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minThreshold);
  const totalDonationUnits = donations.reduce((sum, d) => sum + d.quantity, 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: `INV-0${inventory.length + 1}`,
      sku: `${newItemCategory.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      name: newItemName,
      category: newItemCategory,
      quantity: Number(newItemQty),
      unit: newItemUnit,
      minThreshold: Number(newItemThreshold),
      expiryDate: newItemExpiry || "N/A",
      lastRestocked: "Just now",
    };
    setInventory((prev) => [newItem, ...prev]);
    setShowItemModal(false);
    notify(`Added ${newItem.name} to warehouse inventory`);
    logAction("Inventory Item Added", "Warehouse", `Added item ${newItem.name} (${newItem.quantity} ${newItem.unit})`);
    setNewItemName("");
  };

  const handleRecordDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = inventory.find((i) => i.id === donatedItemId);
    const itemName = targetItem ? targetItem.name : "Relief Goods";
    const itemUnit = targetItem ? targetItem.unit : "units";

    const newDonation: Donation = {
      id: `DON-2026-00${donations.length + 1}`,
      donorName,
      donorType,
      itemId: donatedItemId,
      itemName,
      quantity: Number(donatedQty),
      unit: itemUnit,
      dateReceived: new Date().toISOString().slice(0, 10),
      loggedBy: user?.fullName || "Warehouse Officer",
      notes: donationNotes || "Civic donation recorded",
    };

    // Auto-increment warehouse inventory stock (FR-06)
    setInventory((prev) =>
      prev.map((item) =>
        item.id === donatedItemId
          ? {
              ...item,
              quantity: item.quantity + Number(donatedQty),
              lastRestocked: "Just now",
            }
          : item
      )
    );

    setDonations((prev) => [newDonation, ...prev]);
    setShowDonationModal(false);
    notify(`Donation recorded and ${donatedQty} ${itemUnit} added to inventory`);
    logAction(
      "Donation Recorded",
      "Warehouse",
      `Received ${donatedQty} ${itemUnit} of ${itemName} from ${donorName}`
    );
    setDonorName("");
    setDonationNotes("");
  };

  const quickRestock = (itemId: string, addQty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: item.quantity + addQty,
              lastRestocked: "Just now",
            }
          : item
      )
    );
    const target = inventory.find((i) => i.id === itemId);
    notify(`Restocked +${addQty} units for ${target?.name}`);
    logAction("Inventory Restocked", "Warehouse", `Restocked +${addQty} units for ${target?.name}`);
  };

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">WAREHOUSE & PREPOSITIONING</p>
          <h1>Central Warehouse & Inventory</h1>
          <p>
            Track relief assets, monitor safety reorder thresholds, and manage incoming humanitarian donations.
          </p>
        </div>
        <div className="header-action-group">
          {activeTab === "inventory" ? (
            <button className="primary-button" onClick={() => setShowItemModal(true)}>
              <Icon name="plus" size={16} /> Add Inventory Item
            </button>
          ) : (
            <button className="primary-button" onClick={() => setShowDonationModal(true)}>
              <Icon name="plus" size={16} /> Record Inbound Donation
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Overview KPIs */}
      <div className="metrics warehouse-metrics">
        <div className="metric-card green">
          <div className="metric-icon">
            <Icon name="box" />
          </div>
          <div className="metric-copy">
            <p>Total Stocked Units</p>
            <strong>{totalStockCount.toLocaleString()}</strong>
            <span>Across {inventory.length} item categories</span>
          </div>
        </div>
        <div className={`metric-card ${lowStockItems.length > 0 ? "red" : "green"}`}>
          <div className="metric-icon">
            <Icon name="alert" />
          </div>
          <div className="metric-copy">
            <p>Low Stock Alerts</p>
            <strong>{lowStockItems.length} items</strong>
            <span>Below safety reorder threshold</span>
          </div>
        </div>
        <div className="metric-card blue">
          <div className="metric-icon">
            <Icon name="download" />
          </div>
          <div className="metric-copy">
            <p>Donations Logged</p>
            <strong>{donations.length} records</strong>
            <span>{totalDonationUnits.toLocaleString()} units augmented</span>
          </div>
        </div>
        <div className="metric-card amber">
          <div className="metric-icon">
            <Icon name="shield" />
          </div>
          <div className="metric-copy">
            <p>Storage Condition</p>
            <strong>Prepositioned</strong>
            <span>Lupao Central Warehouse #1</span>
          </div>
        </div>
      </div>

      {/* Low stock warning banner if any item below threshold */}
      {lowStockItems.length > 0 && (
        <div className="alert-banner warning-tone">
          <div className="alert-symbol red-symbol">
            <Icon name="alert" />
          </div>
          <div>
            <strong>Reorder Alert: {lowStockItems.map((i) => i.name).join(", ")}</strong>
            <p>
              Stock levels have dropped below emergency safety buffer. Requisition replenishment or request donor allocation.
            </p>
          </div>
          <button onClick={() => setSelectedCategory("all")}>
            Review stock <Icon name="arrow" size={16} />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="tabs-header-bar">
        <button
          className={`tab-switch-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          <Icon name="box" size={16} />
          <span>Active Inventory ({inventory.length})</span>
        </button>
        <button
          className={`tab-switch-btn ${activeTab === "donations" ? "active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          <Icon name="download" size={16} />
          <span>Donations Inflow ({donations.length})</span>
        </button>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === "inventory" && (
        <>
          <div className="filter-toolbar-card">
            <div className="filter-group">
              <label>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Food">Food</option>
                <option value="Hygiene">Hygiene</option>
                <option value="Water">Water</option>
                <option value="Medical">Medical</option>
                <option value="Shelter">Shelter</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
            <span className="filter-hint">
              Thresholds ensure relief packs are ready before storm landfall.
            </span>
          </div>

          <div className="panel table-panel-card">
            <div className="custom-table-responsive">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>SKU & NAME</th>
                    <th>CATEGORY</th>
                    <th>STOCK LEVEL</th>
                    <th>QUANTITY</th>
                    <th>SAFETY BUFFER</th>
                    <th>EXPIRY DATE</th>
                    <th>RESTOCK ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    const stockPercent = Math.min(
                      100,
                      Math.round((item.quantity / (item.minThreshold * 3)) * 100)
                    );
                    return (
                      <tr key={item.id} className={isLow ? "row-low-stock" : ""}>
                        <td>
                          <strong>{item.name}</strong>
                          <small className="cell-sub">{item.sku}</small>
                        </td>
                        <td>
                          <span className={`category-tag cat-${item.category.toLowerCase()}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="stock-meter-cell">
                          <div className="stock-level-bar">
                            <i
                              style={{ width: `${stockPercent}%` }}
                              className={isLow ? "critical-bar" : "healthy-bar"}
                            />
                          </div>
                          <small className="cell-sub">
                            {isLow ? "LOW STOCK" : "OPTIMAL"}
                          </small>
                        </td>
                        <td>
                          <strong className={isLow ? "text-danger" : "cell-highlight"}>
                            {item.quantity} {item.unit}
                          </strong>
                        </td>
                        <td>
                          <span className="threshold-pill">
                            Min: {item.minThreshold} {item.unit}
                          </span>
                        </td>
                        <td>
                          <span className="cell-sub">{item.expiryDate}</span>
                        </td>
                        <td>
                          <div className="restock-btn-group">
                            <button
                              className="action-btn-small restock"
                              onClick={() => quickRestock(item.id, 50)}
                              title="Add +50 units"
                            >
                              +50 units
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No inventory items found matching selected category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Donations Inflow */}
      {activeTab === "donations" && (
        <div className="panel table-panel-card">
          <div className="custom-table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>DONATION ID</th>
                  <th>DONOR & TYPE</th>
                  <th>ITEMS CONTRIBUTED</th>
                  <th>QUANTITY</th>
                  <th>DATE LOGGED</th>
                  <th>RECORDED BY</th>
                  <th>MEMORANDUM / NOTES</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((don) => (
                  <tr key={don.id}>
                    <td>
                      <strong>{don.id}</strong>
                    </td>
                    <td>
                      <strong>{don.donorName}</strong>
                      <small className="cell-sub">{don.donorType}</small>
                    </td>
                    <td>
                      <span className="cell-highlight">{don.itemName}</span>
                    </td>
                    <td>
                      <strong>
                        {don.quantity} {don.unit}
                      </strong>
                    </td>
                    <td>
                      <span className="cell-sub">{don.dateReceived}</span>
                    </td>
                    <td>
                      <span className="reporter-name">{don.loggedBy}</span>
                    </td>
                    <td className="note-cell-wide">
                      <p>{don.notes}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Inventory Item Modal */}
      {showItemModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowItemModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">WAREHOUSE CATALOG</p>
                <h2>Register New Inventory Item</h2>
              </div>
              <button className="icon-button" onClick={() => setShowItemModal(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Item Name</span>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. High-Energy Biscuits (Box)"
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                  >
                    <option value="Food">Food</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="Water">Water</option>
                    <option value="Medical">Medical</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Clothing">Clothing</option>
                  </select>
                </label>
                <label>
                  <span>Initial Stock Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Packaging Unit</span>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="e.g. packs, boxes, kits"
                    required
                  />
                </label>
                <label>
                  <span>Minimum Safety Threshold</span>
                  <input
                    type="number"
                    min="1"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Expiry Date</span>
                  <input
                    type="date"
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Item to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Donation Modal */}
      {showDonationModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowDonationModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">HUMANITARIAN DONATIONS</p>
                <h2>Record Inbound Donation</h2>
              </div>
              <button className="icon-button" onClick={() => setShowDonationModal(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleRecordDonation} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Donor Name / Organization</span>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. GMA Kapuso Foundation"
                    required
                  />
                </label>
                <label>
                  <span>Donor Classification</span>
                  <select
                    value={donorType}
                    onChange={(e) =>
                      setDonorType(e.target.value as Donation["donorType"])
                    }
                  >
                    <option value="Individual">Individual</option>
                    <option value="NGO">NGO / Civic Club</option>
                    <option value="Corporate">Corporate / Private Enterprise</option>
                    <option value="Government Agency">Government Agency (Provincial/National)</option>
                  </select>
                </label>
                <label>
                  <span>Target Warehouse Item</span>
                  <select
                    value={donatedItemId}
                    onChange={(e) => setDonatedItemId(e.target.value)}
                    required
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Donated Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={donatedQty}
                    onChange={(e) => setDonatedQty(Number(e.target.value))}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Donation Remarks / Memorandum of Agreement</span>
                <textarea
                  rows={3}
                  value={donationNotes}
                  onChange={(e) => setDonationNotes(e.target.value)}
                  placeholder="Note official receipt number or specific relief condition..."
                />
              </label>
              <div className="form-note">
                <Icon name="check" size={16} />
                <span>
                  Recording will automatically augment warehouse stock counts for the selected item.
                </span>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowDonationModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Record & Augment Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Inventory Item */}
      {showItemModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowItemModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">PREPOSITIONED INVENTORY</p>
                <h2>Add Inventory Item</h2>
              </div>
              <button className="icon-button" onClick={() => setShowItemModal(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="incident-form">
              <div className="form-grid">
                <label>
                  <span>Item Name</span>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Standard Family Food Pack"
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                  >
                    <option value="Food">Food</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="Water">Water</option>
                    <option value="Medical">Medical</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Clothing">Clothing</option>
                  </select>
                </label>
                <label>
                  <span>Initial Quantity</span>
                  <input
                    type="number"
                    min="0"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Unit of Measurement</span>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="packs, kits, units, boxes, etc."
                    required
                  />
                </label>
                <label>
                  <span>Minimum Safety Threshold</span>
                  <input
                    type="number"
                    min="1"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  <span>Expiry Date (Optional)</span>
                  <input
                    type="date"
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Inventory Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
