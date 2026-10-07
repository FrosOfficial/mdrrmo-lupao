import {
  User,
  Incident,
  ReliefRequest,
  ReliefBatch,
  InventoryItem,
  Donation,
  Household,
  BeneficiaryDistribution,
  AuditLog,
} from "./types";

export const DEMO_USERS: User[] = [
  {
    id: 1,
    username: "admin",
    fullName: "Maria Elena Cruz",
    role: "System Administrator",
    email: "admin@lupao.gov.ph",
    phone: "0917-111-2233",
  },
  {
    id: 2,
    username: "mdrrmo",
    fullName: "Carlos D. Bautista",
    role: "MDRRMO Personnel",
    email: "mdrrmo.ops@lupao.gov.ph",
    phone: "0917-222-3344",
  },
  {
    id: 3,
    username: "brgy",
    fullName: "Eduardo Mendoza",
    role: "Barangay Official",
    barangay: "San Roque",
    email: "brgy.sanroque@lupao.gov.ph",
    phone: "0917-555-0101",
  },
  {
    id: 4,
    username: "field",
    fullName: "Arnel P. Soriano",
    role: "Field Worker / Responder",
    email: "responder.arnel@lupao.gov.ph",
    phone: "0918-333-4455",
  },
  {
    id: 5,
    username: "mayor",
    fullName: "Hon. Alex R. Gomez",
    role: "Municipal Official",
    email: "mayor.office@lupao.gov.ph",
    phone: "0919-444-5566",
  },
];

// Clean empty state for user testing
export const INITIAL_INCIDENTS: Incident[] = [];

export const INITIAL_RELIEF_REQUESTS: ReliefRequest[] = [];

export const INITIAL_BATCHES: ReliefBatch[] = [];

export const INITIAL_DONATIONS: Donation[] = [];

export const INITIAL_HOUSEHOLDS: Household[] = [];

export const INITIAL_DISTRIBUTIONS: BeneficiaryDistribution[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Clean starter inventory of 3 essential items for testing dispatches and donations
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "INV-001",
    sku: "FOOD-FP-01",
    name: "DSWD Family Food Pack",
    category: "Food",
    quantity: 100,
    unit: "packs",
    minThreshold: 20,
    expiryDate: "2027-12-31",
    lastRestocked: "Initial Stock",
  },
  {
    id: "INV-002",
    sku: "HYG-KIT-01",
    name: "Emergency Hygiene Kit",
    category: "Hygiene",
    quantity: 50,
    unit: "kits",
    minThreshold: 15,
    expiryDate: "2028-06-30",
    lastRestocked: "Initial Stock",
  },
  {
    id: "INV-003",
    sku: "WAT-CTR-05",
    name: "5-Gallon Potable Water Container",
    category: "Water",
    quantity: 30,
    unit: "units",
    minThreshold: 10,
    expiryDate: "N/A",
    lastRestocked: "Initial Stock",
  },
];

// Optional reference demo data for quick restore if needed
export const DEMO_SAMPLE_INCIDENTS: Incident[] = [
  {
    id: 1,
    barangay: "San Roque",
    type: "Flood",
    severity: "Severe",
    families: 50,
    status: "For validation",
    note: "Talavera river overflow breached Purok 3 dike.",
    reportedBy: "Hon. Eduardo Mendoza (Brgy Captain)",
    time: "45 min ago",
    contactPerson: "0917-555-0101",
  },
  {
    id: 2,
    barangay: "Mapangpang",
    type: "Typhoon",
    severity: "Moderate",
    families: 120,
    status: "Approved",
    note: "Uprooted trees damaged 14 houses in Sitio Ilang-Ilang.",
    reportedBy: "Marites Villanueva",
    time: "1 hr ago",
    contactPerson: "0918-555-0102",
  },
];

export const DEMO_SAMPLE_HOUSEHOLDS: Household[] = [
  {
    id: "HH-LUP-001",
    headOfFamily: "Juan Dela Cruz",
    barangay: "San Roque",
    membersCount: 5,
    address: "Purok 3, Riverside",
    qrCode: "QR-HH-LUP-001",
    evacuationCenter: "San Roque Covered Court",
    status: "Registered",
    contactNumber: "0917-101-0001",
  },
  {
    id: "HH-LUP-002",
    headOfFamily: "Maria Santos",
    barangay: "San Roque",
    membersCount: 4,
    address: "Purok 2, Near Chapel",
    qrCode: "QR-HH-LUP-002",
    evacuationCenter: "San Roque Covered Court",
    status: "Registered",
    contactNumber: "0917-101-0002",
  },
];
