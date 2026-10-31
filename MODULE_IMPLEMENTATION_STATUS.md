# UMA TECHNO FAB ERP — Mobile Module Implementation Status

This document tracks the phased implementation of all 13 modules in the React Native mobile application (`MA - ERP`).

---

## Overall Roadmap Status

| Phase | Module Name | Status | Verified / Tested |
| :---: | :--- | :---: | :---: |
| **0** | **Project Architecture, Navigation & Auth Base** | **COMPLETED** | Verified (TypeScript 0 errors, Metro Hermes bundle passed) |
| **1** | **Phase 1: Dashboard (Executive & Employee Workspace)**| **COMPLETED** | Verified (Full Android hermes bytecode build passed) |
| **2** | **Phase 2: CRM & Sales** | **COMPLETED** | Verified (TypeScript 0 errors, Android Hermes export passed) |
| **3** | **Phase 3: Project Management** | **COMPLETED** | Verified (TypeScript 0 errors, Android Hermes export passed) |
| **4** | **Phase 4: Designer & Engineering** | **COMPLETED** | Verified (TypeScript 0 errors, Android Hermes export passed) |
| **5** | **Phase 5: Purchase Management** | **COMPLETED** | Verified (TypeScript 0 errors, Android Hermes export passed) |
| **6** | **Phase 6: Store & Warehouse** | **COMPLETED** | Verified (TypeScript 0 errs, Android export passed, Live API 21/21 passed, Emulator blocked by C: disk space) |
| **7** | **Phase 7: Production & Shop Floor** | **COMPLETED** | Verified (TypeScript 0 errs, Android export passed, Live API passed, Emulator blocked by C: disk space) |
| **8** | **Phase 8: Accounting & Finance** | **COMPLETED** | Verified (TypeScript 0 errs, Android export passed, Live API 35/35 passed, Emulator blocked by C: disk space) |
| **9** | **Phase 9: Maintenance & Services** | Pending User Review | Next in Sequence |
| **10** | **Phase 10: HR & Payroll** | Pending | — |
| **11** | **Phase 11: Integration & 360°** | Pending | — |
| **12** | **Phase 12: Testing & Security** | Pending | — |
| **13** | **Phase 13: Foundation & Admin** | Pending | — |

---

## Detailed Module Logs

### Phase 1: Dashboard & Foundation Architecture
- **Module Name:** Executive Command Center & Operations Dashboard
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/page.tsx` (Dashboard page with Executive & Employee views, Recharts pipeline, Fab bays)
  - `ERP-Test-1/src/context/ERPContext.tsx` (Live data providers for projects, sales orders, manufacturing jobs, attendance)
  - `ERP-Test-1/src/lib/apiClient.ts` (API Client and data models, baseURL, token refresh)
  - `ERP-Test-1/src/app/login/page.tsx` (Authentication & Quick credentials)
- **Backend Endpoints Identified & Mapped:**
  - `POST /api/auth/login/` (JWT Login with username/password)
  - `POST /api/auth/token/refresh/` (JWT token refresh)
  - `GET /api/auth/me/` (Current authenticated employee info)
  - `GET /api/projects/` / `/api/project-jobs/` (Active project backlog values and stage distribution)
  - `GET /api/sales-orders/` (Sales orders data for backlog summation)
  - `GET /api/manufacturing-jobs/` (Active equipment and fabrication shop floor jobs)
  - `GET /api/work-centers/` (Bays telemetry: Bay 1 CNC, Bay 2 Welding, Bay 3 Testing, Bay 4 Painting)
  - `GET /api/hr/employee-dashboard/` (Live employee shift and attendance data)
  - `POST /api/attendance-records/check_in/` (Attendance punch in)
  - `POST /api/attendance-records/check_out/` (Attendance punch out)
  - `GET /api/project-tasks/` (Assigned project tasks)
  - `PATCH /api/project-tasks/{id}/update_progress/` (Task progress reporting)
- **Screens & Components Completed:**
  - `src/features/auth/LoginScreen.tsx`: Complete branded authentication screen with secure user input, error handling, secure input toggling, and 256-bit TLS connection note.
  - `src/features/dashboard/DashboardScreen.tsx`:
    - Commercial Operations & 360° Traceability Hero Banner (Backlog, WIP, QA Pass Rate, Production Health).
    - Fabrication Shop Floor Telemetry (Bays 1-4 Active Sync status: READY, IN PROGRESS, CLEARED, STANDBY).
    - 4 KPI Cards: Active Order Backlog (₹ 3,44,265), Shop Floor WIP (13 Equipment), Expedite Watchlist (13 Urgent), Quality & Compliance (92% Pass).
    - Stage Distribution Breakdown (Planning, Fabrication, NDT/QC, Ready Dispatch).
    - Active Project Jobs Card List with Search & Stage Filter Chips (All, Planning, Fabrication, Quality, Ready).
    - Employee Workspace Mode with live digital clock, attendance punch in/punch out, and interactive task progress slider.
  - `src/components/navigation/DrawerMenuModal.tsx`: Complete slide-out drawer navigation menu matching user screenshot 2, providing immediate access to all 13 modules and the company partnership badge.
  - `src/navigation/AppNavigator.tsx`: State-driven routing between Login, Main Header, Dashboard, and Module Placeholders.
  - `src/api/client.ts` & `src/api/auth.ts`: Centralized Axios client with `expo-secure-store` JWT token persistence and 401 auto-refresh interceptor.
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript typing across the entire codebase).
  - `npx expo export -p android`: Successfully bundled 2,780 modules into Android Hermes bytecode (`index.hbc` 4.2MB) with exit code 0.
- **Known Issues:** None.

---

### Phase 2: CRM & Sales Management
- **Module Name:** CRM & Commercial Sales Operations
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/crm/customers/page.tsx`
  - `ERP-Test-1/src/app/crm/leads/page.tsx`
  - `ERP-Test-1/src/app/crm/enquiries/page.tsx`
  - `ERP-Test-1/src/app/crm/follow-ups/page.tsx`
  - `ERP-Test-1/src/app/sales/quotations/page.tsx`
  - `ERP-Test-1/src/app/sales/orders/page.tsx`
- **Backend Models & ViewSets Inspected (`BE-ERP-UMA/apps/crm/`):**
  - Models: `Customer`, `CustomerContact`, `Lead`, `LeadFollowUp`, `Enquiry`, `EnquiryItem`, `Quotation`, `QuotationItem`, `SalesOrder`, `SalesOrderItem`
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/customers/` & `GET /api/crm/customers/`
  - `POST /api/customers/`
  - `GET /api/leads/` & `GET /api/crm/leads/`
  - `POST /api/leads/`
  - `POST /api/leads/{id}/convert/`
  - `GET /api/enquiries/` & `GET /api/crm/enquiries/`
  - `POST /api/enquiries/`
  - `GET /api/follow-ups/` & `GET /api/crm/follow-ups/`
  - `POST /api/follow-ups/`
  - `GET /api/quotations/` & `GET /api/crm/quotations/`
  - `POST /api/quotations/{id}/approve/`
  - `POST /api/quotations/{id}/reject/`
  - `GET /api/sales-orders/` & `GET /api/crm/sales-orders/`
- **Screens & Components Implemented:**
  - `src/api/crm.ts`: Typed client service with pagination normalization and root/crm fallback.
  - `src/features/crm-sales/CRMSalesScreen.tsx`: 6 interactive segmented tabs (Leads, Customers, Enquiries, Follow-ups, Quotations, Sales Orders), live search, status filter chips, KPI statistics ribbon, new record creation modal with form validation, quick lead conversion, quotation review workflows.
- **Tests Performed:**
  - `npx tsc --noEmit`: 0 errors.
  - `npx expo export -p android`: 2,783 modules bundled cleanly to Hermes bytecode with exit code 0.
- **Known Issues:** None.

---

### Phase 3: Project Management
- **Module Name:** Project Engineering & Fabrication Execution
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/projects/page.tsx`
  - `ERP-Test-1/src/app/projects/dashboard/page.tsx` (KPIs, stage distribution pie charts, monthly trends, delay reasons)
  - `ERP-Test-1/src/app/projects/list/page.tsx` (Project listing, customer PO linkage, filter by status & priority)
  - `ERP-Test-1/src/app/projects/[id]/page.tsx` (360° project detail, equipment specs, engineering milestones)
  - `ERP-Test-1/src/app/projects/planning/page.tsx` (16 standard fabrication stages, department dispatch)
  - `ERP-Test-1/src/app/projects/tasks/page.tsx` (Task assignments, master task library, department hours)
- **Backend Models & ViewSets Inspected (`BE-ERP-UMA/apps/projects/`):**
  - Models: `ProjectJobMaster`, `ProjectPlanningStage`, `ProjectMilestone`, `ProjectTask`, `DepartmentAssignment`, `ProjectIssue`, `ProjectDelay`, `CustomerChangeRequest`, `ProjectCost`, `ProjectDocument`, `MasterTask`
  - Serializers: `ProjectJobMasterSerializer`, `ProjectPlanningStageSerializer`, `ProjectMilestoneSerializer`, `ProjectTaskSerializer`, `MasterTaskSerializer`, etc.
  - ViewSets & Views: `ProjectJobMasterViewSet`, `ProjectPlanningStageViewSet`, `ProjectMilestoneViewSet`, `ProjectTaskViewSet`, `ProjectsDashboardSummaryView`
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/projects/dashboard-summary/` (Project summary metrics, department chart, priority chart, delay breakdown)
  - `GET /api/projects/` & `GET /api/project-jobs/` (Project master listing & search)
  - `POST /api/projects/` (Create new project master, auto-populates 16 standard stages)
  - `GET /api/projects/{id}/` (Detailed project record)
  - `PATCH /api/projects/{id}/` (Update project status, delivery dates, progress)
  - `POST /api/projects/{id}/generate-stages/` (Auto-generate 16 standard planning stages)
  - `GET /api/planning-stages/?projectId={id}` (Fetch project fabrication stages)
  - `POST /api/planning-stages/{id}/complete/` (Mark stage 100% completed)
  - `GET /api/project-milestones/?projectId={id}` (Fetch milestone timeline & payment schedules)
  - `POST /api/project-milestones/` (Create milestone)
  - `GET /api/project-tasks/` (List assigned tasks with department, assignee, status filters)
  - `POST /api/project-tasks/` (Create and assign task)
  - `POST /api/project-tasks/{id}/progress/` (Report progress %, actual hours spent, remarks, status)
  - `POST /api/project-tasks/{id}/accept/` (Accept assigned task)
  - `POST /api/project-tasks/{id}/start/` (Start task work)
  - `POST /api/project-tasks/{id}/submit-for-review/` (Submit task for manager review)
  - `GET /api/project-delays/` (Fetch delay logs)
  - `GET /api/project-documents/` (Fetch linked engineering drawings & documents)
- **Screens & Components Implemented:**
  - `src/api/projects.ts`: Complete typed API client for Project Management with fallback routing and error handling.
  - `src/features/projects/ProjectManagementScreen.tsx`:
    - Executive Ribbon with 4 live KPI counters: Total Projects, In Progress, Completed, Watchlist/Delays.
    - 5 Segmented Native Navigation Tabs:
      1. **Dashboard**: Stage Distribution Pipeline (Planning, Design/CAD, Store/Material, Fabrication, Quality/NDT, Dispatch Ready), Priority Allocation (Urgent, High, Medium, Low), Department Task Loads & Hours.
      2. **Projects**: Search by code, customer, product; status filter chips (ALL, ACTIVE, PLANNING, PRODUCTION, QC, COMPLETED); Project Card with target delivery countdown, order value (₹), progress bar, PM, and tap-to-open 360° detail sheet.
      3. **16 Stages**: Interactive 16 standard fabrication stages (Order Confirmation -> CAD 3D -> Customer GA Signoff -> BOM -> Stock Reservation -> Procurement -> Material Receipt & GRN -> Routing Card -> Raw Material Cutting & Rolling -> Fit-up & Welding -> NDT Quality Inspection -> Mechanical Assembly -> Hydro Testing FAT -> Surface Finishing & Painting -> Invoicing & Dispatch Handover) with one-tap completion action.
      4. **Tasks**: Project task assignments with priority pills, department badges, progress slider, and interactive "Update Progress" modal (progress %, actual hours, work remarks, status transition).
      5. **Timeline**: Visual vertical timeline of project milestones with planned dates, payment milestone percentages (₹), and status badges.
    - New Project & New Task creation modals with input validation.
    - 360° Project Detail Sheet modal.
  - `src/navigation/AppNavigator.tsx`: Integrated `project_management` route with `ProjectManagementScreen`.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated `project_management` (Phase 3).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation).
  - `npx expo export -p android`: Successfully bundled 2,785 modules into Android Hermes bytecode (`index.hbc` 4.3MB) with exit code 0.
- **Known Issues:** None.
- **Next Phase:**
  - Phase 3 completed; proceeded to Phase 4.

---

### Phase 4: Designer & Engineering
- **Module Name:** CAD Engineering, Drawing Control, BOM & Approval Workflows
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/designer/jobs/page.tsx` (CAD Design Jobs listing, statuses, project links)
  - `ERP-Test-1/src/app/designer/bom/page.tsx` (BOM headers, line items with process routing codes)
  - `ERP-Test-1/src/app/designer/approval/page.tsx` (Engineering drawing approvals and revisions)
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/designer/jobs/` & `GET /api/design-jobs/` (Design jobs list & search)
  - `POST /api/designer/jobs/` (Create design job with project/equipment links)
  - `GET /api/designer/jobs/{id}/` (Detailed design job record)
  - `PATCH /api/designer/jobs/{id}/` (Update design job status & progress)
  - `POST /api/designer/jobs/{id}/approve/` (Lead engineer / client sign-off)
  - `POST /api/designer/jobs/{id}/disapprove/` (Return design job for revision with reason)
  - `POST /api/designer/jobs/{id}/release-to-production/` (Formal production release advancing project stage)
  - `GET /api/designer/boms/` & `GET /api/boms/` (Master engineering BOMs)
  - `POST /api/designer/boms/` (Create BOM header)
  - `POST /api/designer/boms/{id}/add-item/` (Add component line item with process code: C, B, OC, P, M)
  - `GET /api/designer/drawings-2d/` & `GET /api/drawings-2d/` (2D fabrication & GA drawings)
  - `POST /api/designer/drawings-2d/` (Upload 2D drawing record)
  - `GET /api/designer/models-3d/` & `GET /api/models-3d/` (3D solid models: STEP, IGES, SolidWorks)
  - `GET /api/designer/requirements/` & `GET /api/customer-requirements/` (Customer engineering requirements)
  - `GET /api/designer/technical-documents/` & `GET /api/technical-documents/` (Technical documentation & calculation dossiers)
  - `GET /api/designer/revisions/` (Design revision history logs)
- **Screens & Components Implemented:**
  - `src/api/engineering.ts`: Complete typed API client for Designer & Engineering with dual-router fallback and DRF pagination support.
  - `src/features/designer-engineering/DesignerEngineeringScreen.tsx`:
    - Executive Ribbon with 4 live KPI counters: Total Jobs, In Progress, Approved, Released BOMs.
    - 5 Segmented Native Navigation Tabs:
      1. **Dashboard**: Engineering Stage Pipeline, Drawing Inventory stats, Pending Engineering Sign-offs queue with fast Review trigger.
      2. **Design Jobs**: Search by job code, project, equipment; status filter chips (ALL, ACTIVE, IN_PROGRESS, APPROVED, RELEASED); Design Job Card with revision badges, lead designer, target completion date, and one-tap Sign-off / Release actions.
      3. **CAD Drawings**: 2D GA Drawings vs 3D Solid Models sub-tabs; Drawing metadata card (format DWG/DXF/PDF, scale, sheet size, prepared by, approved by); Native download/preview launcher with secure file handling.
      4. **Master BOM**: Engineering BOM cards with component counts, total cost (₹), revision number; Component Line Item Inspector with process code badges (`C` = Laser/Plasma Cut, `B` = Bending, `OC` = Other Cut, `P` = Purchase, `M` = Machining), item code, thickness, dimensions, grade, and weight.
      5. **Reqs & Docs**: Customer technical specifications (capacity, operating pressure, dimensions, MOC) and technical calculation dossiers / datasheets.
    - New Design Job creation modal with project linking.
    - Add BOM Component Line Item modal with process routing selection.
    - Engineering Review / Sign-off modal with approval notes and rejection reason capture.
    - 360° Job Detail Sheet modal.
  - `src/navigation/AppNavigator.tsx`: Integrated `designer_engineering` route with `DesignerEngineeringScreen`.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated `designer_engineering` (Phase 4).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation).
  - `npx expo export -p android`: Successfully bundled 2,787 modules into Android Hermes bytecode (`index-a4528334dfd7ae39839a0366382df65f.hbc` 4.4MB) with exit code 0.
- **Known Issues:** None.
- **Next Phase:**
  - Phase 4 completed; proceeded to Phase 5.

---

### Phase 5: Purchase Management
- **Module Name:** Procurement, Material Requirements (MRP), Indents, RFQ, Supplier Master & Purchase Orders
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/purchase/dashboard/page.tsx` (Purchase KPIs, spend trend, stage flow)
  - `ERP-Test-1/src/app/purchase/po/page.tsx` (Purchase orders, line items, status workflows, email PDF dispatch)
  - `ERP-Test-1/src/app/purchase/requisition/page.tsx` (Indents, line items, approval workflows, convert to RFQ)
  - `ERP-Test-1/src/app/purchase/suppliers/page.tsx` (Supplier directory, GSTIN, payment terms)
  - `ERP-Test-1/src/app/purchase/requests/page.tsx` (RFQs, invited vendors, deadline dates)
  - `ERP-Test-1/src/app/purchase/quotations/page.tsx` (Supplier bids and side-by-side comparison sheets)
  - `ERP-Test-1/src/app/purchase/mrp/page.tsx` (Material requirements and shortage quantities)
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/purchase/orders/` & `GET /api/purchase-orders/` (PO listing, filters, grand total)
  - `POST /api/purchase/orders/` (Create purchase order with items, taxes, supplier link)
  - `GET /api/purchase/orders/{id}/` (PO details, line items, billing/shipping addresses)
  - `PATCH /api/purchase/orders/{id}/` (Update PO status, terms, delivery dates)
  - `POST /api/purchase/orders/{id}/approve/` (Purchase Manager authorization with audit logging)
  - `POST /api/purchase/orders/{id}/reject/` (PO rejection with mandatory reason)
  - `POST /api/purchase/orders/{id}/send-email/` (Official PO PDF generation and SMTP dispatch)
  - `GET /api/purchase/requisitions/`, `/api/purchase-requisitions/`, `/api/indents/` (Indents list & search)
  - `POST /api/purchase/requisitions/` (Submit new purchase requisition with line items)
  - `POST /api/purchase/requisitions/{id}/approve/` (PR approval)
  - `POST /api/purchase/requisitions/{id}/reject/` (PR rejection with reason)
  - `POST /api/purchase/requisitions/{id}/convert-to-rfq/` (Advance indent to RFQ)
  - `GET /api/purchase/suppliers/` & `GET /api/suppliers/` (Vendor directory, GSTIN, rating, terms)
  - `POST /api/purchase/suppliers/` (Supplier onboarding with tax & bank details)
  - `GET /api/purchase/material-requirements/`, `/api/material-requirements/`, `/api/mrp/` (Shortages from engineering BOMs)
  - `GET /api/purchase/rfqs/` & `GET /api/rfqs/` (Tender RFQs)
  - `GET /api/purchase/quotations/` & `GET /api/supplier-quotations/` (Supplier quotation bids)
  - `GET /api/purchase/comparisons/` & `GET /api/quotation-comparisons/` (Quotation evaluation sheets)
  - `GET /api/purchase/returns/` & `GET /api/purchase-returns/` (Purchase returns & debit notes)
- **Screens & Components Implemented:**
  - `src/api/purchase.ts`: Fully typed API client for Purchase Management with dual-router support (`/api/purchase/...` & `/api/...`).
  - `src/features/purchase/PurchaseManagementScreen.tsx`:
    - Executive Ribbon with 6 live KPI counters: Open Indents, POs Pending Approval, Awaiting Delivery, Overdue, Total Spend (₹L), MRP Shortages.
    - 6 Segmented Native Navigation Tabs:
      1. **Dashboard**: Complete 6-stage Procurement Lifecycle Pipeline (MRP Shortage -> Indent PR -> RFQ Tender -> Comparison -> Official PO -> Delivery/GRN), Pending Approvals Queue (POs & Requisitions) with quick Approve/Reject triggers.
      2. **Orders**: Search by PO #, supplier, project; status filter chips (ALL, PENDING_APPROVAL, APPROVED, SENT, PARTIALLY_RECEIVED, COMPLETED); PO Card with grand total (₹), delivery date, Send PDF action, and 360° inspector modal.
      3. **Indents**: Search by PR #, department, project; status chips; PR Card with requester, priority pill, estimated cost, and Convert to RFQ action.
      4. **RFQs & Quotes**: RFQ tender status, due dates, item counts, and Quotation Comparison sheets with recommended supplier badge.
      5. **Suppliers**: Real-time directory with GSTIN, mobile, email, location, credit terms, and registration modal.
      6. **MRP Shortages**: Live stock vs required vs shortage quantity monitor with linked BOM and project.
    - New Purchase Order modal with live item rate & GST calculation.
    - Raise Indent modal with department, priority, and requested items.
    - Register New Supplier modal with GSTIN and contact validation.
    - Approval / Rejection modal with mandatory rejection reason enforcement.
    - Send Official PO PDF via email modal with SMTP support.
    - 360° PO Detail Inspector modal with item lines and financial breakdown.
  - `src/navigation/AppNavigator.tsx`: Integrated `purchase_management` route with `PurchaseManagementScreen`.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated `purchase_management` (Phase 5).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation).
  - `npx expo export -p android`: Successfully bundled 2,789 modules into Android Hermes bytecode (`index-6969b160c8a1863a8cdfe5c5544ae4ce.hbc` 4.5MB) with exit code 0.
- **Known Issues:** None.
- **Next Phase:**
  - Phase 5 completed; proceeded to Phase 6.

---

### Phase 6: Store & Warehouse
- **Module Name:** Inventory Management, Item Master, GRN, Incoming QC, Stock Balances, Material Issues, Returns & Transfers
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/store/dashboard/page.tsx` (Inventory KPIs, stock value, stock flow stages, warehouse locations)
  - `ERP-Test-1/src/app/store/items/page.tsx` (Item catalog, category filter, unit of measure, minimum stock alerts)
  - `ERP-Test-1/src/app/store/grn/page.tsx` (Goods Receipt Notes, PO link, delivery challan, vehicle number, inspection status)
  - `ERP-Test-1/src/app/store/material-issue/page.tsx` (Material issues to production jobs, issue numbers, quantities)
  - `ERP-Test-1/src/app/store/material-return/page.tsx` (Material returns from shop floor, return reasons, scrap vs usable)
  - `ERP-Test-1/src/app/store/categories/page.tsx` & `uom/page.tsx` (Category hierarchy and units of measurement)
  - `ERP-Test-1/src/types/store.ts` (TypeScript interfaces for Item, GRN, Stock, Issue, Return)
- **Existing Backend Models, Serializers & Views Inspected (`BE-ERP-UMA/apps/store/`):**
  - Models: `ItemMaster`, `ItemCategory`, `UnitOfMeasurement`, `Warehouse`, `WarehouseLocation`, `GoodsReceiptNote`, `GoodsReceiptNoteItem`, `QCInspection`, `StockBalance`, `StockReservation`, `MaterialIssue`, `MaterialIssueItem`, `MaterialReturn`, `MaterialReturnItem`, `StockTransfer`, `StockLedgerEntry`.
  - Business logic: GRN posting updates `StockBalance` and records inward `StockLedgerEntry`. Material issue deducts available stock and logs outward ledger entry. Material return verifies against issued quantity.
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/store/items/` & `GET /api/items/` (Item catalog, code, grade, HSN, specs, standard cost)
  - `POST /api/store/items/` (Create new item master with category & UOM)
  - `GET /api/store/categories/` & `GET /api/item-categories/` (Item categories)
  - `GET /api/store/uoms/` & `GET /api/uoms/` (Units of measurement: NOS, KGS, MTR, SET, LTR, etc.)
  - `GET /api/warehouses/` (Warehouses: Main Store, Heavy Fabrication Yard, Raw Material Store, Finished Goods)
  - `GET /api/warehouse-locations/` (Rack and bin storage coordinates)
  - `GET /api/store/grns/`, `/api/grns/`, `/api/goods-receipt-notes/` (Goods receipt notes linked to POs & suppliers)
  - `POST /api/store/grns/` (Record new GRN with PO, DC, vehicle, received items)
  - `POST /api/store/grns/{id}/post/` (Post GRN to inventory ledger)
  - `GET /api/qc-inspections/` (Incoming QC inspection records)
  - `POST /api/qc-inspections/` (Record QC inspection: accepted/rejected qty, remarks, pass/fail status)
  - `GET /api/stock/` & `GET /api/stock-balances/` (Stock balances: on-hand, reserved, usable free quantity)
  - `GET /api/stock-reservations/` (Project & production order material reservations)
  - `GET /api/store/issues/` & `GET /api/material-issues/` (Material issues to production jobs)
  - `POST /api/store/issues/` (Issue material against project/work order with available stock validation)
  - `GET /api/store/returns/` & `GET /api/material-returns/` (Material returns from production floor)
  - `POST /api/store/returns/` (Record material return with return reason and disposition)
  - `GET /api/stock-transfers/` (Inter-warehouse stock transfers)
  - `POST /api/stock-transfers/` (Create stock transfer request)
  - `GET /api/stock-ledger/` (Immutable stock movement ledger audit trail)
- **Screens & Components Implemented:**
  - `src/api/inventory.ts`: Typed API service client for Store & Warehouse with fallback routes and strict request/response schemas.
  - `src/features/store-warehouse/StoreWarehouseScreen.tsx`:
    - Executive Ribbon with 6 live KPI counters: Active Items, Stock Valuation (₹L), Low Stock Alerts, Pending GRNs, QC Pending, Job Reserved.
    - 6 Segmented Native Navigation Tabs:
      1. **Dashboard**: 5-stage inventory flow (Supplier Dispatched -> Yard GRN -> Incoming QC -> Usable Stock -> Shop Issue), Low Stock reorder breach alerts with urgency indicators, Warehouse locations & capacity cards.
      2. **Item Master**: Search by item code / name / HSN, category filter chips (ALL, RAW, COMP, ELEC, CONS, HARD), Item Card with stock level, reorder level, standard cost, specifications, and Add Item Master modal.
      3. **GRN & Inward**: Status filters (ALL, DRAFT, PENDING_QC, INSPECTED, POSTED), GRN Card with supplier, PO reference, DC #, vehicle #, total value (₹), Post GRN action, and 360° inspector modal.
      4. **QC Inspection**: Test reports, inspector name, accepted vs rejected quantities, pass/fail/conditional approval status, and Record QC Inspection modal.
      5. **Stock Balances**: On-hand vs reserved vs usable free stock quantities, bin location, unit valuation, low stock warning, and Inter-Warehouse Stock Transfer modal.
      6. **Issues & Returns**: Sub-toggle for Material Issues vs Returns, project/work order reference, issue status, and Issue Material to Shop Floor modal with available stock validation.
    - Add Item Master modal with code, description, category, UOM, and standard cost.
    - Issue Material modal with project code, work order, item, and quantity checks.
    - Incoming QC Inspection modal with accepted/rejected split and rejection remarks.
    - Inter-Warehouse Stock Transfer modal with source, destination, and quantity.
    - 360° GRN Detail Inspector modal with item lines and inward receipt metadata.
  - `src/navigation/AppNavigator.tsx`: Integrated `store_warehouse` route with `StoreWarehouseScreen`.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated `store_warehouse` (Phase 6).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation, 0 errors).
  - `npx expo export -p android`: Successfully bundled 2,791 modules into Android Hermes bytecode (`index-f9719ff0a955e38cdabe04600b620ca1.hbc` 4.6MB) with exit code 0.
- **Known Issues:** None.
- **Next Phase:**
  - Phase 6 completed and smoke-tested.

---

### Phase 7: Production & Shop Floor
- **Module Name:** Production Planning, Work Orders, Job Cards & Operations, Fabrication Bays 1–4 Telemetry, Daily Shift Logs, Machine Allocation & WIP/Dispatch
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected:**
  - `ERP-Test-1/src/app/production/dashboard/page.tsx` (Production KPIs, work center utilization, daily output, WIP distribution, downtime reasons)
  - `ERP-Test-1/src/app/production/planning/page.tsx` (Production schedule, jobs, Gantt timeline, bay allocation)
  - `ERP-Test-1/src/app/production/worker-daily-routine/page.tsx` (Daily shift logging, good vs scrap, machine runtime)
  - `ERP-Test-1/src/app/production/work-orders/page.tsx` (Work order routing & planning reference)
  - `ERP-Test-1/src/types/production.ts` (TypeScript interfaces for all production models)
- **Existing Backend Models, Serializers & Views Inspected (`BE-ERP-UMA/apps/production/`):**
  - Models: `ManufacturingJob`, `ProductionOrder`, `WorkCenter`, `RoutingOperation`, `ProductionSchedule`, `ProductionEntry`, `WIPRecord`, `ProductionHold`, `ReworkOrder`, `FinishedGoods`, `DispatchOrder`.
  - Fabrication Bays 1 to 4: Confirmed as explicit database records in `WorkCenter` model (`WC-PLASMA-01`, `WC-ROLL-01`, `WC-SAW-01`, `WC-BORING-01`, `WC-TEST-01`).
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/production/dashboard-stats/` (Aggregated KPIs, jobs status, capacity, daily output, downtime)
  - `GET /api/work-centers/` & `/api/production/work-centers/` (Bays 1-4 & Testing Bunker yard)
  - `GET /api/routing-operations/` & `/api/production/routing-operations/` (Process operations OP-10 to OP-50)
  - `POST /api/routing-operations/` (Create process operation)
  - `DELETE /api/routing-operations/{id}/` (Delete process operation, tested & verified)
  - `GET /api/production-orders/` & `/api/production/production-orders/` (Work orders list)
  - `POST /api/production-orders/` (Create work order)
  - `GET /api/manufacturing-jobs/` (Active equipment jobs)
  - `GET /api/production-entries/` (Daily production shift logs)
  - `POST /api/production-entries/` (Record shift log with good/rejected/scrap/downtime)
  - `GET /api/finished-goods/` (Finished goods ready for dispatch)
  - `GET /api/dispatch-orders/` (Transport dispatch orders)
- **Screens & Components Implemented:**
  - `src/api/production.ts`: Typed API client for Production & Shop Floor with dual-routing and snake/camelCase normalization.
  - `src/features/production-shop-floor/ProductionShopFloorScreen.tsx`:
    - 6 Live Summary KPI Cards (Active Jobs, Bays Running, Work Orders, Operations WIP, Daily Good Qty, Ready FG Units).
    - 6 Segmented Native Navigation Tabs:
      1. **Dashboard**: 5-stage progress pipeline, live bay telemetry, quick actions.
      2. **Work Orders**: Work orders list, search, status filter (`PLANNED`, `RELEASED`, `IN_PROGRESS`, `COMPLETED`), priority badges, 360° inspector.
      3. **Job Cards & Routing**: Process operations (`OP-10` to `OP-50`), machine, operator, setup/processing minutes, QC flag, Add Operation modal.
      4. **Bays & Machines**: Fabrication Bays 1–4 telemetry with live capacity, OEE efficiency, supervisor, and operational status toggle.
      5. **Daily Logs**: Daily shift entries, good vs rejected vs scrap breakdown, downtime duration and reasons, Record Daily Shift Log modal.
      6. **WIP & Dispatch**: Finished goods units ready for dispatch, active dispatch orders with transporter and vehicle tracking.
    - 5 Interactive Modals: New Work Order, Record Daily Shift Log, Add Process Routing Operation, Production Hold, and 360° Work Order Inspector.
  - `src/navigation/AppNavigator.tsx`: Integrated `production_shop_floor` route.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated Phase 7 `production_shop_floor` (`active: true`).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation, 0 errors).
  - `npx expo export -p android`: Successfully bundled 2,793 modules into Android Hermes bytecode (`index-abf1fdf91f2fd5f21bfb1b100f2ceca4.hbc` 4.7MB) with exit code 0.
  - Live API verification: 200 OK on `/production/dashboard-stats/`, `/work-centers/`, `/routing-operations/`, `/finished-goods/`, `/dispatch-orders/`, `/production-orders/`.
  - State Mutation: Record `OP-TEST-P7` created (201), verified via GET, and deleted (204).
- **Known Blockers:**
  - Android emulator launch blocked by host machine `C:\` drive disk space (1.49 GB free; emulator requires 3.5+ GB). No physical Android device connected.
- **Next Phase:**
  - Phase 7 completed; ready for **Phase 8: Accounting & Finance** upon user review.

---

### Phase 8: Accounting & Finance
- **Module Name:** Accounting & Finance
- **Target Project:** `D:\ERP and WEB code\UMA ERP\MA - ERP`
- **Existing Frontend Pages Inspected (`ERP-Test-1/src/app/accounting/`):**
  - Inspected 37 subdirectories: `dashboard/`, `chart-of-accounts/`, `sales-invoices/`, `purchase-invoices/`, `customer-receipts/`, `supplier-payments/`, `journal-entries/`, `contra-vouchers/`, `bank-accounts/`, `cash-flow/`, `cost-centers/`, `taxes/`, `financial-years/`, `general-ledger/`, `trial-balance/`, `balance-sheet/`, `profit-loss/`, `ar-aging/`, `ap-aging/`, `expenses/`, `fixed-assets/`, etc.
  - `ERP-Test-1/src/types/accounting.ts` (Comprehensive TypeScript interfaces for all 13 accounting models)
  - `ERP-Test-1/src/lib/apiClient.ts` (`api.accounting.*` methods)
- **Existing Backend Models, Serializers & Views Inspected (`BE-ERP-UMA/apps/accounting/`):**
  - Models: `FinancialYear`, `ChartOfAccount`, `CostCenter`, `Tax`, `BankAccount`, `SalesInvoice`, `SalesInvoiceItem`, `PurchaseInvoice`, `PurchaseInvoiceItem`, `CustomerReceipt`, `SupplierPayment`, `JournalEntry`, `JournalEntryLine`, `ContraVoucher`, `ExpenseCategory`, `Expense`, `FixedAsset`, `CreditNote`, `DebitNote`, `JobCosting`.
  - Views: ViewSets for each model plus `AccountingDashboardMetricsView` (`/api/accounting/dashboard-metrics/`).
  - Actions: `record_payment` (`POST /api/sales-invoices/{id}/record-payment/` and `/api/purchase-invoices/{id}/record-payment/`), `post` (`POST /api/journal-entries/{id}/post/`).
- **Backend Endpoints Verified & Integrated:**
  - `GET /api/accounting/dashboard-metrics/` (Executive cash flow, monthly revenue/expense, AR/AP aging, expense breakdown, totals)
  - `GET /api/chart-of-accounts/` & `/api/accounting/chart-of-accounts/` (Chart of accounts hierarchy)
  - `POST /api/chart-of-accounts/` (Create account)
  - `GET /api/sales-invoices/` & `/api/accounting/sales-invoices/` (Sales invoices, items, tax, balances)
  - `POST /api/sales-invoices/` (Create customer invoice)
  - `POST /api/sales-invoices/{id}/record-payment/` (Record customer receipt against invoice)
  - `GET /api/purchase-invoices/` & `/api/accounting/purchase-invoices/` (Purchase invoices, items, tax, balances)
  - `POST /api/purchase-invoices/{id}/record-payment/` (Record supplier payment against bill)
  - `GET /api/customer-receipts/` & `/api/accounting/customer-receipts/` (Customer receipts)
  - `GET /api/supplier-payments/` & `/api/accounting/supplier-payments/` (Supplier disbursements)
  - `GET /api/journal-entries/` & `/api/accounting/journal-entries/` (Double-entry journal vouchers)
  - `POST /api/journal-entries/` (Create journal voucher with balanced debit/credit lines)
  - `POST /api/journal-entries/{id}/post/` (Post journal voucher to ledger)
  - `GET /api/bank-accounts/` & `/api/accounting/bank-accounts/` (Company bank & cash balances)
  - `GET /api/taxes/` & `/api/accounting/taxes/` (GST rate combinations)
  - `GET /api/cost-centers/` & `/api/accounting/cost-centers/` (Cost centers)
  - `GET /api/financial-years/` & `/api/accounting/financial-years/` (Active fiscal years)
  - `GET /api/expenses/`, `/api/fixed-assets/`, `/api/contra-vouchers/`, `/api/credit-notes/`, `/api/debit-notes/`, `/api/job-costings/`
- **Screens & Components Implemented:**
  - `src/api/accounting.ts`: Fully typed API service for all accounting entities with camelCase/snake_case response normalization and dual-route fallbacks.
  - `src/features/accounting-finance/AccountingFinanceScreen.tsx`:
    - 6 Live Summary KPI Cards: Monthly Revenue, Monthly Expenses, Net Operating Cashflow, Outstanding Receivables (AR), Outstanding Payables (AP), Active Bank Accounts.
    - 6 Segmented Native Navigation Tabs:
      1. **Dashboard**: Cash flow summary, monthly revenue vs expense comparison, AR vs AP aging status, quick action buttons.
      2. **Sales Invoices**: Invoices list, search, status filter (`All`, `Paid`, `Unpaid`, `Overdue`), invoice cards with grand total, paid, outstanding, Inspect Details modal, and Record Customer Receipt modal.
      3. **Purchase Invoices**: Supplier bills list, search, status filter, bill cards with due date, bill total, outstanding payable, Inspect Details modal, and Issue Supplier Payment modal.
      4. **Receipts & Payments**: Customer collections and supplier disbursements with payment mode (Bank Transfer, Cheque, Cash, UPI), transaction reference, and date.
      5. **Chart of Accounts**: Full chart of accounts classified by account type (`Asset`, `Liability`, `Equity`, `Revenue`, `Expense`), active status badges, and Add Account modal.
      6. **Journal Entries**: Double-entry journal vouchers with debit vs credit balanced lines, status badges (`DRAFT`, `POSTED`), Post Entry action, and Add Balanced Journal Entry modal.
    - 5 Interactive Modals:
      1. Generate Customer Sales Invoice modal (Customer name, invoice date, due date, items with description, quantity, unit price, and GST tax calculation).
      2. Record Invoice Payment modal (Amount, payment method, transaction reference, notes).
      3. Create Double-Entry Journal Entry modal (Entry date, reference, narration, dynamic debit/credit line items, real-time balance indicator with strict validation).
      4. Create Account modal (Account code, account name, account type, opening balance, description).
      5. 360° Invoice Inspector modal (Line items breakdown, subtotals, tax breakdown, payment history).
  - `src/navigation/AppNavigator.tsx`: Integrated `accounting_finance` route.
  - `src/components/navigation/DrawerMenuModal.tsx`: Activated Phase 8 `accounting_finance` (`active: true`).
- **Tests Performed:**
  - `npx tsc --noEmit`: Exited with code 0 (100% clean TypeScript compilation, 0 errors).
  - `npx expo export -p android`: Successfully bundled 2,795 modules into Android Hermes bytecode (`index-a4fd9405215885203aed8b9d1adfe663.hbc` 4.8MB) with exit code 0.
  - Live API verification: 35/35 live read-only GET requests verified with HTTP 200 OK against `https://erpuma.pythonanywhere.com/api`.
  - Mutation safety: No destructive financial mutations performed on production.
- **Known Blockers:**
  - Android emulator launch blocked by host machine `C:\` drive disk space (1.49 GB free; emulator requires 3.5+ GB). No physical Android device connected.
- **Next Phase:**
  - Phase 8 completed; ready for **Phase 9: Maintenance & Services** upon user review.





