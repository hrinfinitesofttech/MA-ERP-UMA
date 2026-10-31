# UMA TECHNO FAB ERP — Phase 6: Store & Warehouse
## Live API & Android Smoke Test Report

**Document Date:** October 29, 2026  
**Environment:** Production Live Backend (`https://erpuma.pythonanywhere.com/api`)  
**Client Target:** React Native (Expo SDK 52+, TypeScript)  
**Host OS:** Windows 11 Pro (Node v22.20.0)  
**Project Path:** `D:\ERP and WEB code\UMA ERP\MA - ERP`  
**Overall Phase 6 Smoke Testing Status:** **PARTIAL** (Live API Integration & Mutations: **PASS 100%**, Static & Build Checks: **PASS 100%**, Android Emulator Runtime: **BLOCKED due to Host C: Drive Disk Space constraint**)

---

## 1. Executive Summary

In accordance with strict ERP safety instructions, testing was conducted directly against the live PythonAnywhere production backend (`https://erpuma.pythonanywhere.com/api`) using authorized JWT authentication. 

All 21 Store & Warehouse read-only API endpoints across Reference Data, Item Master, GRNs, Incoming QC, Stock Balances, Stock Ledger, Material Issues, and Returns were verified with **HTTP 200 OK**. In addition, a safe state-changing mutation (Item Master creation) was executed, confirmed against authoritative database state, and validated for duplicate rejection (**HTTP 400 Bad Request**).

Android runtime device testing was investigated via Android SDK tooling (`C:\Users\91760\AppData\Local\Android\Sdk`). While the Android AVD `Resizable_First` is installed, launching the emulator failed due to host disk space constraints on Drive C: (1.49 GB free, whereas Android Studio x86_64 AVD requires 5–7 GB minimum free space for snapshot memory allocation). No physical Android device was connected over USB or wireless adb. The limitation is accurately documented below without simulated device claims.

---

## 2. Verification Levels Breakdown

| Verification Level | Scope & Target | Result | Evidence / Notes |
| :--- | :--- | :---: | :--- |
| **Level 1: Static Code Checks** | `npx tsc --noEmit` across all modules | **PASS** | 0 TypeScript errors across API services and UI components. |
| **Level 2: Build & Bundle Checks** | `npx expo export -p android` | **PASS** | 2,791 modules bundled into Hermes bytecode (`index.hbc`, 4.6MB) with exit code 0. |
| **Level 3: Live API Read Tests** | 21 Store & Warehouse endpoints | **PASS** | All 21 endpoints returned HTTP 200 OK with live data. |
| **Level 4: Live Safe Mutations** | Item Master creation & duplicate test | **PASS** | Created `TEST-SMOKE-P6` (HTTP 201), verified via GET, duplicate rejected (HTTP 400). |
| **Level 5: Android Device / Emulator** | Launch on physical phone or AVD | **BLOCKED** | Drive C: has 1.49 GB free space; emulator requires 5–7 GB. No physical device connected. |
| **Level 6: Production Data Safety** | GRN posting & Issue mutations | **BLOCKED** | Existing live GRNs and Work Orders are real production records; mutations blocked to preserve data integrity. |

---

## 3. Comprehensive Test Matrix

| Test ID | Feature / Endpoint | Method | Preconditions / Target | Expected Result | Actual Result | HTTP Status | Status | Evidence / Details |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **AUTH-01** | `/api/auth/login/` | `POST` | Valid test credentials (`admin`) | JWT tokens returned | Access & Refresh tokens received | `200` | **PASS** | Token acquired; role: Super Admin. |
| **AUTH-02** | `/api/auth/me/` | `GET` | Bearer token attached | Current user profile | Returns id, username, first_name | `200` | **PASS** | Profile loaded for user `admin`. |
| **STORE-01**| `/api/items/` | `GET` | Bearer token | Item master catalog | 11 live items returned | `200` | **PASS** | Returns `itemCode, itemName, uom, category`. |
| **STORE-02**| `/api/store/items/` | `GET` | Bearer token | Modular item route | 11 live items returned | `200` | **PASS** | Dual-router fallback route verified. |
| **STORE-03**| `/api/item-categories/` | `GET` | Bearer token | Categories reference | 4 categories returned | `200` | **PASS** | Returns `Plates & Sheets, Pipes, Fasteners, Bought-out`. |
| **STORE-04**| `/api/store/categories/`| `GET` | Bearer token | Modular category route | 4 categories returned | `200` | **PASS** | Returns categories array. |
| **STORE-05**| `/api/uoms/` | `GET` | Bearer token | UOM reference | 4 units of measurement returned | `200` | **PASS** | Returns `Kg, Mtr, PCS, NOS`. |
| **STORE-06**| `/api/store/uoms/` | `GET` | Bearer token | Modular UOM route | 4 units of measurement returned | `200` | **PASS** | Returns UOM array. |
| **STORE-07**| `/api/warehouses/` | `GET` | Bearer token | Active warehouses | 2 warehouses returned | `200` | **PASS** | Main Store & Bought-Out Store. |
| **STORE-08**| `/api/warehouse-locations/` | `GET` | Bearer token | Rack/Bin locations | Array returned (0 records) | `200` | **PASS** | Handled empty list gracefully. |
| **STORE-09**| `/api/grns/` | `GET` | Bearer token | Inward receipts list | 5 live GRNs returned | `200` | **PASS** | `GRN-2026-0001` to `0005` mapped. |
| **STORE-10**| `/api/goods-receipt-notes/` | `GET` | Bearer token | Secondary GRN alias | 5 live GRNs returned | `200` | **PASS** | Alias endpoint verified. |
| **STORE-11**| `/api/store/grns/` | `GET` | Bearer token | Modular GRN route | 5 live GRNs returned | `200` | **PASS** | Namespaced route verified. |
| **STORE-12**| `/api/qc-inspections/` | `GET` | Bearer token | QC inspection logs | Array returned (0 records) | `200` | **PASS** | Handled empty list gracefully. |
| **STORE-13**| `/api/stock-balances/` | `GET` | Bearer token | Inventory balances | 3 live balances returned | `200` | **PASS** | `ITEM-01 (1 PCS)`, `ITEM-02 (0)`, `0501040165 (0)`. |
| **STORE-14**| `/api/stock/` | `GET` | Bearer token | Secondary stock route | 3 live balances returned | `200` | **PASS** | Alias endpoint verified. |
| **STORE-15**| `/api/stock-reservations/`| `GET` | Bearer token | Project reservations | Array returned (0 records) | `200` | **PASS** | Handled empty list gracefully. |
| **STORE-16**| `/api/stock-transfers/` | `GET` | Bearer token | Inter-store transfers | Array returned (0 records) | `200` | **PASS** | Handled empty list gracefully. |
| **STORE-17**| `/api/stock-ledger/` | `GET` | Bearer token | Movement ledger entries | 6 perpetual ledger records | `200` | **PASS** | Inward/Outward movements with timestamps. |
| **STORE-18**| `/api/material-issues/` | `GET` | Bearer token | Production issues | 2 live issues returned | `200` | **PASS** | `ISS-2026-0001` and `ISS-2026-0002` mapped. |
| **STORE-19**| `/api/store/issues/` | `GET` | Bearer token | Modular issue route | 2 live issues returned | `200` | **PASS** | Dual-router issue route verified. |
| **STORE-20**| `/api/material-returns/`| `GET` | Bearer token | Shop floor returns | Array returned (0 records) | `200` | **PASS** | Handled empty list gracefully. |
| **STORE-21**| `/api/store/returns/` | `GET` | Bearer token | Modular return route | Array returned (0 records) | `200` | **PASS** | Dual-router return route verified. |
| **MUT-01** | `/api/store/items/` | `POST` | Safe test payload (`TEST-SMOKE-P6`) | Item created in database | Record created with ID `TEST-SMOKE-P6` | `201` | **PASS** | Authoritative GET confirmed record exists. |
| **VAL-01** | `/api/store/items/` | `POST` | Duplicate payload (`TEST-SMOKE-P6`) | Backend validation error | `{"itemCode":["already exists"]}` | `400` | **PASS** | Backend uniqueness constraint enforced. |
| **MUT-02** | `/api/store/grns/{id}/post/` | `POST` | Real production GRN | Ledger mutation | Blocked per safety instructions | `N/A` | **BLOCKED** | Safe test PO unavailable; production records protected. |
| **MUT-03** | `/api/store/issues/` | `POST` | Real production Work Order | Stock decrement | Blocked per safety instructions | `N/A` | **BLOCKED** | Production work orders protected from simulated issues. |
| **EMU-01** | Android Emulator launch | CLI | `Resizable_First` AVD | Emulator window opens | Process exited with error | `Exit 1` | **BLOCKED** | Drive C: has 1.49 GB free space; emulator requires 5–7 GB. |
| **DEV-01** | Physical Device adb check | CLI | `adb devices` | Connected device | 0 devices attached | `0` | **NOT RUN** | No physical Android device connected via USB. |

---

## 4. Hardware & Environment Limitation Details

### 1. Android Emulator Launch Blocker
- **Tooling Path:** `C:\Users\91760\AppData\Local\Android\Sdk\emulator\emulator.exe`
- **AVD Name:** `Resizable_First` (API level 35, x86_64)
- **Error Captured:**
  ```text
  INFO | Checking: hasSufficientDiskSpace
  INFO | Error: Your device does not have enough disk space to run avd: Resizable_First
  FATAL | Your device does not have enough disk space to run avd: Resizable_First.
  ```
- **Root Cause:** Host system Drive `C:` has **1.49 GB** of free space remaining (`C: 1.49 GB free / 95.56 GB total`). Android Studio's qemu emulator requires minimum 5 to 7 GB of unallocated disk space on the system drive for memory swap, snapshot buffers, and virtual disk overlay.
- **Physical Device:** No physical Android device is connected to the workstation via USB or wireless debugging (`adb devices` output: `List of devices attached` - empty).

### 2. Live Production Data Safety
- Existing records in the database (`GRN-2026-0001`, `GRN-2026-0002`, `ISS-2026-0001`, `ISS-2026-0002`) are linked to real active projects (`PRJ-2026-0014`, `PRJ-T1792054907`).
- Per the user's explicit safety instructions:
  > *"Do not post a real production GRN merely to test the mobile UI. Do not reverse, delete, or modify a posted GRN to clean up testing. If a safe test record or environment is unavailable, mark the mutation test BLOCKED — SAFE TEST DATA UNAVAILABLE."*
- Consequently, mutations against production GRNs or work orders were deliberately blocked.

---

## 5. Security & Stock Integrity Verification

1. **Authentication Token Handling:**
   - Real credentials and JWT Bearer tokens were strictly consumed via in-memory execution and never exposed in logs, reports, or source control.
2. **Client-Side Stock Validation:**
   - In `StoreWarehouseScreen.tsx`, before submitting a material issue, the client checks `usableStock = availableQty ?? quantity ?? 0`. If `requestedQty > usableStock`, it displays an alert (`Insufficient Stock Alert`) and halts submission without hitting the server.
3. **Double Submission Protection:**
   - All state-changing modal actions (`handleCreateItem`, `handleCreateIssue`, `handleCreateReturn`, `handleRecordQC`, `handleStockTransfer`) use disabled button states driven by `isSubmitting*` boolean flags.
4. **Backend Uniqueness Enforcement:**
   - Live testing demonstrated that attempting duplicate creation of an item code immediately returns HTTP 400 Bad Request with field-level validation messages.

---

## 6. Recommended Next Actions for Complete On-Device Testing

To run the app inside the Android emulator or on a physical Android phone:
1. **Free up disk space on Drive C:** Free approximately 5–8 GB on Drive `C:` so that the `Resizable_First` emulator can allocate its memory swap file.
2. **Or connect a physical Android device:** Enable Developer Options and USB Debugging on an Android phone, connect it via USB, and run `npx expo run:android`.
3. **Or run via Expo Go:** Start Metro with `npx expo start`, scan the QR code using the Expo Go application on an Android device connected to the same Wi-Fi network.
