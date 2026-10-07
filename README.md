# MDRRMO Lupao Integrated Disaster Management System

Prototype developed for ITS152 at Mapua University Makati, based on the research paper and operational workflow of the Municipal Disaster Risk Reduction and Management Office (MDRRMO) of Lupao, Nueva Ecija.

## Overview
This web application provides a disaster command and relief tracking portal featuring:
- Role-Based Access Control (RBAC) with 5 user roles
- Executive Command Dashboard with live weather alerts and KPI telemetry
- Barangay Incident & Needs Assessment logging
- 4-Stage Relief Dispatch and Real-Time Convoy Tracking
- Central Warehouse & Prepositioned Inventory management
- QR Proof-of-Delivery verification with anti-duplication protection
- Master Household & Evacuation Center census directory
- Automated DSWD DROMIC compliance report exporter
- Immutable security audit logging

## Tech Stack
- React 19
- TypeScript
- Vite
- Lucide React
- Vanilla CSS with Inter typography

## Local Development
Install dependencies and start the dev server:
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
The output will be generated in `dist/`.
