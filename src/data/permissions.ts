import { RoleName } from "./types";

// Role-based access derived from the paper's Use Case Diagram and Security Architecture (RBAC table).
export type PageName =
  | "Command Center"
  | "Incidents & Needs"
  | "Relief Tracking"
  | "Warehouse"
  | "Verification"
  | "Beneficiaries"
  | "Reports & DROMIC"
  | "Audit Log";

export type VerifyModeName = "warehouse-release" | "barangay-reception" | "beneficiary-handout";

export const ROLE_PAGES: Record<RoleName, PageName[]> = {
  // Full access & administration
  "System Administrator": [
    "Command Center",
    "Incidents & Needs",
    "Relief Tracking",
    "Warehouse",
    "Verification",
    "Beneficiaries",
    "Reports & DROMIC",
    "Audit Log",
  ],
  // Track inventory, allocate & dispatch batches, monitor dashboard, export reports
  "MDRRMO Personnel": [
    "Command Center",
    "Incidents & Needs",
    "Relief Tracking",
    "Warehouse",
    "Verification",
    "Beneficiaries",
    "Reports & DROMIC",
  ],
  // Submit incident & damage assessment, submit population & resource needs, scan at reception
  "Barangay Official": ["Incidents & Needs", "Verification", "Beneficiaries"],
  // Scan QR / proof of delivery, log beneficiary handout & verification
  "Field Worker / Responder": ["Verification", "Beneficiaries"],
  // Monitor command dashboard and export reports (read-only)
  "Municipal Official": ["Command Center", "Reports & DROMIC"],
};

export const ROLE_VERIFY_MODES: Record<RoleName, VerifyModeName[]> = {
  "System Administrator": ["beneficiary-handout", "warehouse-release", "barangay-reception"],
  "MDRRMO Personnel": ["warehouse-release", "barangay-reception"],
  "Barangay Official": ["barangay-reception"],
  "Field Worker / Responder": ["beneficiary-handout", "barangay-reception"],
  "Municipal Official": [],
};

export function canAccessPage(role: RoleName, page: PageName): boolean {
  return ROLE_PAGES[role].includes(page);
}

export function homePage(role: RoleName): PageName {
  return ROLE_PAGES[role][0];
}

export const canReviewIncidents = (role: RoleName) =>
  role === "System Administrator" || role === "MDRRMO Personnel";

export const canSubmitIncident = (role: RoleName) =>
  role === "System Administrator" || role === "MDRRMO Personnel" || role === "Barangay Official";

export const canEditHouseholds = (role: RoleName) =>
  role === "System Administrator" || role === "MDRRMO Personnel" || role === "Barangay Official";

export const isAdmin = (role: RoleName) => role === "System Administrator";
