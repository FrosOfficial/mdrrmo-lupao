export type RoleName = 
  | "System Administrator"
  | "MDRRMO Personnel"
  | "Barangay Official"
  | "Field Worker / Responder"
  | "Municipal Official";

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: RoleName;
  barangay?: string;
  email: string;
  phone: string;
}

export interface BarangayInfo {
  id: number;
  name: string;
  district: string;
  captain: string;
  contactNumber: string;
  evacuationCenters: string[];
}

export type HazardType = "Flood" | "Typhoon" | "Fire" | "Landslide" | "Evacuation" | "Earthquake";
export type IncidentSeverity = "Low" | "Moderate" | "Severe" | "Critical";
export type IncidentStatus = "For validation" | "Approved" | "Critical" | "Resolved";

export interface Incident {
  id: number;
  barangay: string;
  type: HazardType;
  severity: IncidentSeverity;
  families: number;
  status: IncidentStatus;
  note: string;
  reportedBy: string;
  time: string;
  contactPerson: string;
}

export type ReliefRequestStatus = "Pending" | "Approved" | "Fulfilled" | "Rejected";

export interface ReliefRequest {
  id: string;
  incidentId: number;
  barangay: string;
  families: number;
  requestedItems: string;
  status: ReliefRequestStatus;
  requestedBy: string;
  requestedAt: string;
  urgency: "Normal" | "High" | "Emergency";
}

export type BatchStage = "Allocated" | "In Transit" | "Received" | "Distributed";

export interface BatchItemLink {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface ReliefBatch {
  id: string; // e.g. LUP-26049
  requestId?: string;
  barangay: string;
  evacuationCenter?: string;
  contents: string;
  stage: BatchStage;
  updated: string;
  vehiclePlate: string;
  driverName: string;
  items: BatchItemLink[];
  qrCode: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export type InventoryCategory = "Food" | "Hygiene" | "Medical" | "Water" | "Shelter" | "Clothing";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate: string;
  lastRestocked: string;
}

export interface Donation {
  id: string;
  donorName: string;
  donorType: "Individual" | "NGO" | "Corporate" | "Government Agency";
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  dateReceived: string;
  loggedBy: string;
  notes: string;
}

export interface Household {
  id: string;
  headOfFamily: string;
  barangay: string;
  membersCount: number;
  address: string;
  qrCode: string;
  evacuationCenter?: string;
  status: "Registered" | "Claimed" | "Pending";
  contactNumber: string;
}

export interface BeneficiaryDistribution {
  id: string;
  householdId: string;
  headOfFamily: string;
  barangay: string;
  batchId: string;
  itemsReceived: string;
  distributedAt: string;
  distributedBy: string;
  qrVerified: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: RoleName;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}
