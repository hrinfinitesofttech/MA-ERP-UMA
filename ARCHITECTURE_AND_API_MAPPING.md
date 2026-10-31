# UMA TECHNO FAB ERP — Mobile Application Architecture & API Mapping

**Document Version:** 1.0.0  
**Project:** UMA TECHNO FAB Manufacturing ERP Mobile App  
**Target Platform:** Android (Primary) & iOS (Cross-platform compatible)  
**Technology Stack:** React Native, Expo, TypeScript, React Navigation  
**Backend API:** Django REST Framework + SimpleJWT  
**Production API Base URL:** `https://erpuma.pythonanywhere.com/api`  
**Development/Local Fallback:** Configurable via environment / `API_BASE_URL`  

---

## 1. Executive Summary & Technology Stack

| Layer | Web Application (`ERP-Test-1`) | Backend Service (`BE-ERP-UMA`) | Mobile Application (`MA - ERP`) |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 15.1.7 (React 19) | Django 4.2+ / Django REST Framework | React Native (Expo SDK 52+, TypeScript) |
| **Styling / UI** | Tailwind CSS 3.4 + Framer Motion | Django Jazzmin Admin UI | StyleSheet / React Native Styled Design System |
| **Design Tokens**| Professional Blue/White & Industrial Bronze (`#1E40AF`, `#0284C7`, `#0F172A`, `#F8FAFC`) | Python Data Models & Serializers | Exact match tokens (Blue, Slate, Emerald, Amber, Rose) |
| **State / Cache**| React Context (`ERPContext`) + LocalStorage + Inflight deduplication | SQLite (Local/PA) + JWT Token blacklist | React Context (`AuthContext`, `ERPContext`) + `expo-secure-store` |
| **Icons** | `lucide-react` | FontAwesome / Jazzmin icons | `lucide-react-native` / Vector icons |
| **Data Flow** | Axios/Fetch wrapper (`apiClient.ts`) with camelCase normalization | DRF ModelViewSet + `djangorestframework-camel-case` | Typed Axios Client (`src/api/client.ts`) with token auto-refresh |

---

## 2. Global Design System & Theme Specification

### 2.1 Color Palette (Modern Blue & White Enterprise Theme)
- **Primary Brand Blue:** `#1E40AF` (Deep Enterprise Blue)
- **Accent Blue:** `#0284C7` (Sky Fabrication Blue)
- **Background App:** `#F8FAFC` (Clean Crisp Light Slate)
- **Card / Surface:** `#FFFFFF` (Pure White with subtle `#E2E8F0` border and soft shadow)
- **Primary Text:** `#0F172A` (Slate 900)
- **Muted / Secondary Text:** `#64748B` (Slate 500)
- **Success / Cleared:** `#059669` (Emerald 600) / `#ECFDF5` (Emerald Tint)
- **Warning / In Progress:** `#D97706` (Amber 600) / `#FFFBEB` (Amber Tint)
- **Urgent / Expedite / Error:** `#DC2626` (Rose 600) / `#FEF2F2` (Rose Tint)
- **Planning / Engineering:** `#7C3AED` (Violet 600) / `#F5F3FF` (Violet Tint)

### 2.2 Typography & Spacing
- Font family: System Sans-Serif (`Inter` / Android `Roboto`)
- Heading 1: 22px Bold, Heading 2: 18px SemiBold, Body: 14px Regular, Caption/Meta: 12px Medium
- Spacing scale: 4, 8, 12, 16, 20, 24, 32

---

## 3. Module Hierarchy & Phased Delivery Roadmap

The 13 modules follow the exact operational sequence requested:

```
[Phase 1: Dashboard] (Current Focus)
  │
  ├── [Phase 2: CRM & Sales]
  │     ├── Leads, Enquiries, Site Visits, Quotations, Customer POs, Sales Orders
  │
  ├── [Phase 3: Project Management]
  │     ├── Project Jobs, Planning Stages, Milestones, Master Tasks, Department Assignments
  │
  ├── [Phase 4: Designer & Engineering]
  │     ├── Design Jobs, 2D/3D Drawings, Multi-Revision BOMs, Engineering Documents
  │
  ├── [Phase 5: Purchase Management]
  │     ├── Material Requirements (MRP), Suppliers, Requisitions/Indents, RFQs, POs
  │
  ├── [Phase 6: Store & Warehouse]
  │     ├── Item Master, GRN & QC Inspection, Stock Balances, Material Issues & Returns
  │
  ├── [Phase 7: Production & Shop Floor]
  │     ├── Manufacturing Jobs, Work Centers, Bays Status, Routing Operations, WIP
  │
  ├── [Phase 8: Accounting & Finance]
  │     ├── Sales/Purchase Invoices, Receipts, Payments, Expenses, Cost Centers
  │
  ├── [Phase 9: Maintenance & Services]
  │     ├── Internal Assets, Customer Machines, Service Requests, PM Plans, Breakdowns
  │
  ├── [Phase 10: HR & Payroll]
  │     ├── Employee Directory, Attendance Punch In/Out, Leave Requests, Salary Slips
  │
  ├── [Phase 11: Integration & 360°]
  │     ├── 360° Job Traceability Suite, Central Approvals, Cross-Module Alerts
  │
  ├── [Phase 12: Testing & Security]
  │     ├── System Health, Server Latency, Audit Trail, Active Sessions
  │
  └── [Phase 13: Foundation & Admin]
        ├── Users & Roles, RBAC Scoping, Departments, Master Numbering Settings
```

---

## 4. Phase 1 — Dashboard API & Screen Mapping

### 4.1 Screen Component Breakdown
1. **Executive Header:**
   - Company Branding (`UMA TECHNO FAB — Manufacturing ERP`).
   - Active User Badge (`Super Admin Hardik`, System Administrator, Avatar).
   - Mode Toggle: `Executive Command` vs `My Workspace (Employee Mode)`.
   - Live Connection Status indicator (Online/Synced with PythonAnywhere).

2. **Heavy Fabrication & Operations Overview Banner:**
   - Title: *Heavy Fabrication & Process Equipment Operations*
   - Subtitle: *Commercial Operations & 360° Job Traceability | ISO 9001:2015 Verified*
   - Live High-Level Metrics:
     - **Live Backlog:** Sum of active project order values (`₹ 3,44,265`)
     - **Active Bay WIP:** Active equipment in shop floor (`13 Equipment`)
     - **QA Pass Rate:** Quality & Compliance pass percent (`92% Pass`)
     - **Production Health:** Overall shop floor status (`Nominal`)

3. **Fabrication Shop Floor Live Telemetry (Bays 1-4 Active Sync):**
   - **Bay 1: CNC Cutting & Rolling** (Status: `READY` / Green)
   - **Bay 2: SAW / TIG Welding** (Status: `IN PROGRESS` / Blue)
   - **Bay 3: Hydro Test & NDT** (Status: `CLEARED` / Purple)
   - **Bay 4: Blast & Painting** (Status: `STANDBY` / Amber)
   - CTA: *Open 360° Traceability Suite* button

4. **4 Operational KPI Cards:**
   - **Active Order Backlog:** Currency formatted value (`₹ 3,44,265`), total active jobs.
   - **Shop Floor WIP:** Active manufacturing jobs in fabrication (`13 Equipment`).
   - **Expedite Watchlist:** Urgent priority jobs requiring attention (`13 Urgent Jobs`).
   - **Quality & Compliance:** QA inspection pass rate (`92% Pass`).

5. **Stage Distribution & Pipeline Summary:**
   - Planning & BOM Engineering
   - Fabrication & Welding Bays
   - NDT & Hydro Testing (QC)
   - Finished & Ready for Dispatch

6. **Recent Active Jobs Card List with Filter Chips:**
   - Filters: `All`, `Planning`, `Fabrication`, `Quality`, `Dispatch`.
   - Search bar: Search by Job #, Customer, or Equipment.
   - Job Card: Job ID, Customer Name, Equipment, Order Value, Delivery Date, Progress Bar.

7. **Employee Mode Dashboard (Accessible via Toggle):**
   - Live Digital Attendance Punch In / Punch Out with GPS/timestamp recording.
   - Today's shift hours, status (Present/Late/Half-day).
   - My Assigned Project Tasks with interactive stage progress updates (0% to 100%).

### 4.2 Backend API Mapping Table for Phase 1

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth/login/` | `POST` | `apps.authentication.views.LoginView` |
| **Current User Profile** | `/api/auth/me/` | `GET` | `apps.authentication.views.CurrentUserView` |
| **Token Refresh** | `/api/auth/token/refresh/` | `POST` | `rest_framework_simplejwt.views.TokenRefreshView` |
| **Active Backlog & Projects**| `/api/projects/` | `GET` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Sales Orders (Financial)**| `/api/sales-orders/` | `GET` | `apps.crm.views.SalesOrderViewSet` |
| **Shop Floor Manufacturing**| `/api/manufacturing-jobs/`| `GET` | `apps.production.views.ManufacturingJobViewSet` |
| **Work Centers / Bays** | `/api/work-centers/` | `GET` | `apps.production.views.WorkCenterViewSet` |
| **Employee Dashboard** | `/api/hr/employee-dashboard/` | `GET` | `apps.hr.views.EmployeeDashboardView` |
| **Attendance Check-In** | `/api/attendance-records/check_in/` | `POST` | `apps.hr.views.AttendanceRecordViewSet` |
| **Attendance Check-Out** | `/api/attendance-records/check_out/` | `POST` | `apps.hr.views.AttendanceRecordViewSet` |
| **Assigned Tasks** | `/api/project-tasks/` | `GET` | `apps.projects.views.ProjectTaskViewSet` |
| **Update Task Progress** | `/api/project-tasks/{id}/update_progress/` | `PATCH` | `apps.projects.views.ProjectTaskViewSet` |
| **360° Traceability Query**| `/api/job-360/{jobNumber}/` | `GET` | `apps.integration.views.Job360APIView` |

---

## 5. Phase 2 — CRM & Sales API & Screen Mapping

### 5.1 Screen Component Breakdown
1. **Executive KPI Ribbon:** Active Leads, Total Customers, Open Enquiries, Pending Quotations.
2. **Segmented Tabs:** Leads, Customers, Enquiries, Follow-ups, Quotations, Sales Orders.
3. **Core Workflows:**
   - Lead Qualification & One-Click Convert to Customer (`POST /api/leads/{id}/convert/`).
   - Customer PO and Sales Order linkage.
   - Quotation Review & Authorization (`POST /api/quotations/{id}/approve/`, `POST /api/quotations/{id}/reject/`).

### 5.2 Backend API Mapping Table for Phase 2

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Customer Listing & Search** | `/api/customers/` | `GET` | `apps.crm.views.CustomerViewSet` |
| **Create Customer** | `/api/customers/` | `POST` | `apps.crm.views.CustomerViewSet` |
| **Lead Tracking & Pipeline** | `/api/leads/` | `GET` | `apps.crm.views.LeadViewSet` |
| **Create Lead** | `/api/leads/` | `POST` | `apps.crm.views.LeadViewSet` |
| **Convert Lead to Customer** | `/api/leads/{id}/convert/` | `POST` | `apps.crm.views.LeadViewSet` |
| **Technical Enquiries** | `/api/enquiries/` | `GET` | `apps.crm.views.EnquiryViewSet` |
| **Follow-up Interaction Logs**| `/api/follow-ups/` | `GET` | `apps.crm.views.FollowUpViewSet` |
| **Log New Follow-up** | `/api/follow-ups/` | `POST` | `apps.crm.views.FollowUpViewSet` |
| **Quotations Financials** | `/api/quotations/` | `GET` | `apps.crm.views.QuotationViewSet` |
| **Approve Quotation** | `/api/quotations/{id}/approve/` | `POST` | `apps.crm.views.QuotationViewSet` |
| **Reject Quotation** | `/api/quotations/{id}/reject/` | `POST` | `apps.crm.views.QuotationViewSet` |
| **Confirmed Sales Orders** | `/api/sales-orders/` | `GET` | `apps.crm.views.SalesOrderViewSet` |

---

## 6. Phase 3 — Project Management API & Screen Mapping

### 6.1 Screen Component Breakdown
1. **Executive KPI Ribbon:** Total Projects, In Progress, Completed, Watchlist/Delays.
2. **5 Segmented Native Tabs:**
   - **Dashboard:** Stage Distribution Pipeline (Planning, Design/CAD, Store/Material, Fabrication, Quality/NDT, Dispatch Ready), Priority Breakdown (Urgent, High, Medium, Low), Department Task Loads & Hours.
   - **Projects List:** Search by code, customer, product; status filter chips (ALL, ACTIVE, PLANNING, PRODUCTION, QC, COMPLETED); Project Card with target delivery countdown, order value (₹), progress bar, PM, and tap-to-open 360° detail sheet.
   - **16 Stages:** 16 standard fabrication stages (Order Confirmation -> CAD 3D -> Customer GA Signoff -> BOM -> Stock Reservation -> Procurement -> Material Receipt & GRN -> Routing Card -> Raw Material Cutting & Rolling -> Fit-up & Welding -> NDT Quality Inspection -> Mechanical Assembly -> Hydro Testing FAT -> Surface Finishing & Painting -> Invoicing & Dispatch Handover) with one-tap completion action.
   - **Tasks & Assignments:** Assigned project tasks with department badges, priority pills, progress slider, and interactive "Update Progress" modal (progress %, actual hours, work remarks, status transition).
   - **Milestones & Timeline:** Visual vertical timeline of project milestones with planned dates, payment milestone percentages (₹), and status badges.
3. **Creation Modals:**
   - New Project Master modal with field validation.
   - New Project Task assignment modal.
4. **360° Detail Sheet Modal:**
   - Deep inspection of linked customer, sales order #, customer PO #, order value, target vs actual dates, assigned PM, equipment specs.

### 6.2 Backend API Mapping Table for Phase 3

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Project Summary Dashboard** | `/api/projects/dashboard-summary/` | `GET` | `apps.projects.views.ProjectsDashboardSummaryView` |
| **Project Master Listing** | `/api/projects/` | `GET` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Create Project Master** | `/api/projects/` | `POST` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Project Details** | `/api/projects/{id}/` | `GET` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Update Project** | `/api/projects/{id}/` | `PATCH` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Generate 16 Stages** | `/api/projects/{id}/generate-stages/` | `POST` | `apps.projects.views.ProjectJobMasterViewSet` |
| **Planning Stages** | `/api/planning-stages/?projectId={id}` | `GET` | `apps.projects.views.ProjectPlanningStageViewSet` |
| **Mark Stage Completed** | `/api/planning-stages/{id}/complete/` | `POST` | `apps.projects.views.ProjectPlanningStageViewSet` |
| **Project Milestones** | `/api/project-milestones/?projectId={id}`| `GET` | `apps.projects.views.ProjectMilestoneViewSet` |
| **Create Milestone** | `/api/project-milestones/` | `POST` | `apps.projects.views.ProjectMilestoneViewSet` |
| **Project Tasks** | `/api/project-tasks/` | `GET` | `apps.projects.views.ProjectTaskViewSet` |
| **Create Task** | `/api/project-tasks/` | `POST` | `apps.projects.views.ProjectTaskViewSet` |
| **Report Task Progress** | `/api/project-tasks/{id}/progress/` | `POST` | `apps.projects.views.ProjectTaskViewSet` |
| **Accept Task** | `/api/project-tasks/{id}/accept/` | `POST` | `apps.projects.views.ProjectTaskViewSet` |
| **Start Task** | `/api/project-tasks/{id}/start/` | `POST` | `apps.projects.views.ProjectTaskViewSet` |
| **Submit Task for Review** | `/api/project-tasks/{id}/submit-for-review/`| `POST`| `apps.projects.views.ProjectTaskViewSet` |
| **Project Delays** | `/api/project-delays/` | `GET` | `apps.projects.views.ProjectDelayViewSet` |
| **Project Documents** | `/api/project-documents/` | `GET` | `apps.projects.views.ProjectDocumentViewSet` |

---

## 7. Phase 4 — Designer & Engineering Architecture & API Mapping

### 7.1 Screen Component Breakdown
1. **Executive KPI Ribbon:** Total Jobs, In Progress, Approved, Released BOMs.
2. **5 Segmented Native Tabs:**
   - **Dashboard:** Engineering Stage Pipeline (Planning, CAD Drafting, 3D Modeling, Review, Released), Drawing Inventory counts (2D GA, 3D Models, Engineering BOMs, Tech Docs), Pending Engineering Sign-offs queue with fast Review trigger.
   - **Design Jobs List:** Search by job code, project, equipment; status filter chips (ALL, ACTIVE, IN_PROGRESS, APPROVED, RELEASED); Design Job Card with revision badges, lead designer, target completion countdown, and one-tap Sign-off / Release actions.
   - **CAD Drawings:** 2D GA Drawings vs 3D Solid Models sub-tabs; Drawing metadata card (format DWG/DXF/PDF/STEP, scale, sheet size, prepared by, approved by); Native download/preview launcher with secure file handling.
   - **Master BOM:** Engineering BOM cards with component counts, total cost (₹), revision number; Component Line Item Inspector with process code badges (`C` = Laser/Plasma Cut, `B` = Bending, `OC` = Other Cut, `P` = Purchase, `M` = Machining), item code, thickness, dimensions, grade, and weight.
   - **Reqs & Docs:** Customer technical specifications (capacity, operating pressure, dimensions, MOC) and technical calculation dossiers / datasheets.
3. **Creation Modals:**
   - New Design Job creation modal with project and equipment linking.
   - Add BOM Component Line Item modal with process routing selection.
4. **Action & Inspection Modals:**
   - Engineering Review / Sign-off modal with approval notes and rejection reason capture.
   - 360° Job Detail Sheet modal.

### 7.2 Backend API Mapping Table for Phase 4

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Design Jobs List & Search** | `/api/designer/jobs/` or `/api/design-jobs/` | `GET` | `apps.designer.views.DesignJobViewSet` |
| **Create Design Job** | `/api/designer/jobs/` | `POST` | `apps.designer.views.DesignJobViewSet` |
| **Design Job Details** | `/api/designer/jobs/{id}/` | `GET` | `apps.designer.views.DesignJobViewSet` |
| **Update Design Job** | `/api/designer/jobs/{id}/` | `PATCH` | `apps.designer.views.DesignJobViewSet` |
| **Approve Design Job** | `/api/designer/jobs/{id}/approve/` | `POST` | `apps.designer.views.DesignJobViewSet` |
| **Disapprove Design Job** | `/api/designer/jobs/{id}/disapprove/` | `POST` | `apps.designer.views.DesignJobViewSet` |
| **Release to Production** | `/api/designer/jobs/{id}/release-to-production/` | `POST` | `apps.designer.views.DesignJobViewSet` |
| **Master BOMs List** | `/api/designer/boms/` or `/api/boms/` | `GET` | `apps.designer.views.BOMHeaderViewSet` |
| **Create BOM Header** | `/api/designer/boms/` | `POST` | `apps.designer.views.BOMHeaderViewSet` |
| **Add BOM Line Item** | `/api/designer/boms/{id}/add-item/` | `POST` | `apps.designer.views.BOMHeaderViewSet` |
| **2D Drawings List** | `/api/designer/drawings-2d/` or `/api/drawings-2d/` | `GET` | `apps.designer.views.Drawing2DViewSet` |
| **Upload 2D Drawing** | `/api/designer/drawings-2d/` | `POST` | `apps.designer.views.Drawing2DViewSet` |
| **3D Models List** | `/api/designer/models-3d/` or `/api/models-3d/` | `GET` | `apps.designer.views.Design3DModelViewSet` |
| **Customer Requirements** | `/api/designer/requirements/` or `/api/customer-requirements/` | `GET` | `apps.designer.views.CustomerRequirementViewSet` |
| **Technical Documents** | `/api/designer/technical-documents/` or `/api/technical-documents/` | `GET` | `apps.designer.views.TechnicalDocumentViewSet` |
| **Revision History Logs** | `/api/designer/revisions/` or `/api/design-revisions/` | `GET` | `apps.designer.views.DesignRevisionLogViewSet` |

---

## 8. Phase 5 — Purchase Management Architecture & API Mapping

### 8.1 Screen Component Breakdown
1. **Executive KPI Ribbon:** Open Indents, POs Pending Approval, Awaiting Delivery, Overdue, Total Spend (₹L), MRP Shortages.
2. **6 Segmented Native Tabs:**
   - **Dashboard:** 6-stage Procurement Lifecycle Pipeline (MRP Shortage -> Indent PR -> RFQ Tender -> Comparison -> Official PO -> Delivery/GRN), Pending Approvals Queue (POs & Requisitions) with one-tap Approve/Reject action.
   - **Orders:** Search by PO #, supplier, project; status filter chips (ALL, PENDING_APPROVAL, APPROVED, SENT, PARTIALLY_RECEIVED, COMPLETED); PO Card with grand total (₹), delivery date, Send PDF action, and 360° inspector modal.
   - **Indents:** Search by PR #, department, project; status chips; PR Card with requester, priority pill, estimated cost, and Convert to RFQ action.
   - **RFQs & Quotes:** RFQ tender status, due dates, item counts, and Quotation Comparison sheets with recommended supplier badge.
   - **Suppliers:** Real-time directory with GSTIN, mobile, email, location, credit terms, and registration modal.
   - **MRP Shortages:** Live stock vs required vs shortage quantity monitor with linked BOM and project.
3. **Creation Modals:**
   - New Purchase Order modal with live item rate & GST calculation.
   - Raise Indent modal with department, priority, and requested items.
   - Register New Supplier modal with GSTIN and contact validation.
4. **Action & Inspection Modals:**
   - Approval / Rejection modal with mandatory rejection reason enforcement.
   - Send Official PO PDF via email modal with SMTP support.
   - 360° PO Detail Inspector modal with item lines and financial breakdown.

### 8.2 Backend API Mapping Table for Phase 5

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Purchase Orders List & Search** | `/api/purchase/orders/` or `/api/purchase-orders/` | `GET` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Create Purchase Order** | `/api/purchase/orders/` or `/api/purchase-orders/` | `POST` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Purchase Order Details** | `/api/purchase/orders/{id}/` | `GET` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Update Purchase Order** | `/api/purchase/orders/{id}/` | `PATCH` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Approve Purchase Order** | `/api/purchase/orders/{id}/approve/` | `POST` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Reject Purchase Order** | `/api/purchase/orders/{id}/reject/` | `POST` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Send Official PO Email (PDF)** | `/api/purchase/orders/{id}/send-email/` | `POST` | `apps.purchase.views.PurchaseOrderViewSet` |
| **Purchase Requisitions List** | `/api/purchase/requisitions/` or `/api/indents/` | `GET` | `apps.purchase.views.PurchaseRequisitionViewSet` |
| **Create Requisition / Indent** | `/api/purchase/requisitions/` | `POST` | `apps.purchase.views.PurchaseRequisitionViewSet` |
| **Approve Requisition** | `/api/purchase/requisitions/{id}/approve/` | `POST` | `apps.purchase.views.PurchaseRequisitionViewSet` |
| **Reject Requisition** | `/api/purchase/requisitions/{id}/reject/` | `POST` | `apps.purchase.views.PurchaseRequisitionViewSet` |
| **Convert PR to RFQ** | `/api/purchase/requisitions/{id}/convert-to-rfq/` | `POST` | `apps.purchase.views.PurchaseRequisitionViewSet` |
| **Suppliers Directory** | `/api/purchase/suppliers/` or `/api/suppliers/` | `GET` | `apps.purchase.views.SupplierViewSet` |
| **Register Supplier** | `/api/purchase/suppliers/` or `/api/suppliers/` | `POST` | `apps.purchase.views.SupplierViewSet` |
| **Material Requirements (MRP)** | `/api/purchase/material-requirements/` or `/api/mrp/` | `GET` | `apps.purchase.views.MaterialRequirementViewSet` |
| **RFQs List & Float** | `/api/purchase/rfqs/` or `/api/rfqs/` | `GET` / `POST` | `apps.purchase.views.RequestForQuotationViewSet` |
| **Supplier Quotations** | `/api/purchase/quotations/` or `/api/supplier-quotations/` | `GET` | `apps.purchase.views.SupplierQuotationViewSet` |
| **Quotation Comparisons** | `/api/purchase/comparisons/` or `/api/quotation-comparisons/` | `GET` | `apps.purchase.views.QuotationComparisonViewSet` |
| **Purchase Returns** | `/api/purchase/returns/` or `/api/purchase-returns/` | `GET` | `apps.purchase.views.PurchaseReturnViewSet` |

---

## 9. Phase 6 — Store & Warehouse Architecture & API Mapping

### 9.1 Screen Component Breakdown
1. **Executive KPI Ribbon:** Active Items, Stock Valuation (₹L), Low Stock Alerts, Pending GRNs, QC Pending, Job Reserved.
2. **6 Segmented Native Tabs:**
   - **Dashboard:** 5-stage inventory flow (Supplier Dispatched -> Yard GRN -> Incoming QC -> Usable Stock -> Shop Issue), Low Stock reorder breach alerts with urgency indicators, Warehouse locations & capacity cards.
   - **Item Master:** Search by item code / name / HSN, category filter chips (ALL, RAW, COMP, ELEC, CONS, HARD), Item Card with stock level, reorder level, standard cost, specifications, and Add Item Master modal.
   - **GRN & Inward:** Status filters (ALL, DRAFT, PENDING_QC, INSPECTED, POSTED), GRN Card with supplier, PO reference, DC #, vehicle #, total value (₹), Post GRN action, and 360° inspector modal.
   - **QC Inspection:** Test reports, inspector name, accepted vs rejected quantities, pass/fail/conditional approval status, and Record QC Inspection modal.
   - **Stock Balances:** On-hand vs reserved vs usable free stock quantities, bin location, unit valuation, low stock warning, and Inter-Warehouse Stock Transfer modal.
   - **Issues & Returns:** Sub-toggle for Material Issues vs Returns, project/work order reference, issue status, and Issue Material to Shop Floor modal with available stock validation.
3. **Creation & Action Modals:**
   - Add Item Master modal with code, description, category, UOM, and standard cost.
   - Issue Material modal with project code, work order, item, and quantity checks.
   - Incoming QC Inspection modal with accepted/rejected split and rejection remarks.
   - Inter-Warehouse Stock Transfer modal with source, destination, and quantity.
   - 360° GRN Detail Inspector modal with item lines and inward receipt metadata.

### 9.2 Backend API Mapping Table for Phase 6

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Item Master List & Search** | `/api/store/items/` or `/api/items/` | `GET` | `apps.store.views.ItemMasterViewSet` |
| **Create Item Master** | `/api/store/items/` or `/api/items/` | `POST` | `apps.store.views.ItemMasterViewSet` |
| **Item Categories List** | `/api/store/categories/` or `/api/item-categories/` | `GET` | `apps.store.views.ItemCategoryViewSet` |
| **Units of Measurement** | `/api/store/uoms/` or `/api/uoms/` | `GET` | `apps.store.views.UnitOfMeasurementViewSet` |
| **Warehouses List** | `/api/warehouses/` | `GET` | `apps.store.views.WarehouseViewSet` |
| **Warehouse Locations (Bins)** | `/api/warehouse-locations/` | `GET` | `apps.store.views.WarehouseLocationViewSet` |
| **Goods Receipt Notes (GRN)** | `/api/store/grns/` or `/api/grns/` | `GET` | `apps.store.views.GoodsReceiptNoteViewSet` |
| **Create Goods Receipt Note** | `/api/store/grns/` or `/api/grns/` | `POST` | `apps.store.views.GoodsReceiptNoteViewSet` |
| **Post GRN to Stock Ledger** | `/api/store/grns/{id}/post/` | `POST` | `apps.store.views.GoodsReceiptNoteViewSet` |
| **QC Inspections List** | `/api/qc-inspections/` | `GET` | `apps.store.views.QCInspectionViewSet` |
| **Record QC Inspection** | `/api/qc-inspections/` | `POST` | `apps.store.views.QCInspectionViewSet` |
| **Stock Balances** | `/api/stock/` or `/api/stock-balances/` | `GET` | `apps.store.views.StockBalanceViewSet` |
| **Material Reservations** | `/api/stock-reservations/` | `GET` | `apps.store.views.StockReservationViewSet` |
| **Material Issues List** | `/api/store/issues/` or `/api/material-issues/` | `GET` | `apps.store.views.MaterialIssueViewSet` |
| **Issue Material to Production** | `/api/store/issues/` or `/api/material-issues/` | `POST` | `apps.store.views.MaterialIssueViewSet` |
| **Material Returns List** | `/api/store/returns/` or `/api/material-returns/` | `GET` | `apps.store.views.MaterialReturnViewSet` |
| **Record Material Return** | `/api/store/returns/` or `/api/material-returns/` | `POST` | `apps.store.views.MaterialReturnViewSet` |
| **Stock Transfers** | `/api/stock-transfers/` | `GET` / `POST` | `apps.store.views.StockTransferViewSet` |
| **Stock Movement Ledger** | `/api/stock-ledger/` | `GET` | `apps.store.views.StockLedgerEntryViewSet` |

---

## 10. Phase 7: Production & Shop Floor Architecture & API Mapping

### 10.1 Feature Modules & Native Screens
1. **API Service (`src/api/production.ts`):**
   - High-performance typed client with camelCase/snake_case bidirectional normalization.
   - Dual-path routing for ViewSets mounted at both root `/api/...` and prefixed `/api/production/...`.
   - Work Orders endpoint fallback: resolves `/api/production-orders/` with seamless query mapping.
2. **Production Screen (`src/features/production-shop-floor/ProductionShopFloorScreen.tsx`):**
   - **Executive KPI Ribbon:** 6 summary metrics (Active Jobs, Bays Running, Work Orders, Operations WIP, Daily Good Qty, Ready FG Units).
   - **6 Native Segmented Tabs:**
     - **Dashboard Tab:** 5-stage manufacturing progress bar, live bay telemetry cards, quick actions hub.
     - **Work Orders Tab:** Order cards, search, status filters (`PLANNED`, `RELEASED`, `IN_PROGRESS`, `COMPLETED`), priority badges, 360° inspector modal.
     - **Job Cards & Routing Tab:** Process operations (`OP-10` to `OP-50`), machine, operator, setup/processing minutes, QC flag, Add Operation modal.
     - **Bays & Machines Tab:** Fabrication Bays 1 to 4 telemetry with live capacity, OEE efficiency, supervisor, and operational status toggle.
     - **Daily Logs Tab:** Daily shift entries, good vs rejected vs scrap breakdown, downtime duration and reasons, Record Daily Shift Log modal.
     - **WIP & Dispatch Tab:** Finished goods units ready for dispatch, active dispatch orders with transporter and vehicle tracking.
   - **5 Interactive Modals:** New Work Order, Record Daily Shift Log, Add Process Routing Operation, Production Hold / Pause, and 360° Work Order Inspector.

### 10.2 Backend API Mapping Table for Phase 7

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Production Dashboard Stats** | `/api/production/dashboard-stats/` | `GET` | `apps.production.views.ProductionDashboardStatsView` |
| **Fabrication Bays / Work Centers** | `/api/work-centers/` or `/api/production/work-centers/` | `GET` | `apps.production.views.WorkCenterViewSet` |
| **Process Routing Operations** | `/api/routing-operations/` or `/api/production/routing-operations/` | `GET` / `POST` | `apps.production.views.RoutingOperationViewSet` |
| **Delete Routing Operation** | `/api/routing-operations/{id}/` | `DELETE` | `apps.production.views.RoutingOperationViewSet` |
| **Work Orders / Production Orders** | `/api/production-orders/` or `/api/production/production-orders/` | `GET` / `POST` | `apps.production.views.ProductionOrderViewSet` |
| **Active Manufacturing Jobs** | `/api/manufacturing-jobs/` | `GET` | `apps.production.views.ManufacturingJobViewSet` |
| **Daily Production Shift Logs** | `/api/production-entries/` | `GET` / `POST` | `apps.production.views.ProductionEntryViewSet` |
| **Finished Goods Inventory** | `/api/finished-goods/` | `GET` | `apps.production.views.FinishedGoodsViewSet` |
| **Transport Dispatch Orders** | `/api/dispatch-orders/` | `GET` | `apps.production.views.DispatchOrderViewSet` |
| **Production Holds / Delays** | `/api/production-holds/` | `GET` / `POST` | `apps.production.views.ProductionHoldViewSet` |

---

## 11. Phase 8 — Accounting & Finance Architecture & API Mapping

### Data Models & Relationships (`BE-ERP-UMA/apps/accounting/models.py`)
1. **ChartOfAccount**: Core nominal ledger account (`account_code`, `account_name`, `account_type`, `parent_account`, `opening_balance`, `current_balance`, `is_active`).
2. **SalesInvoice**: Customer invoice with line items, tax, status (`DRAFT`, `POSTED`, `PAID`, `CANCELLED`), `paid_amount`, and `outstanding_amount`.
3. **PurchaseInvoice**: Supplier bill linked to purchase orders, tax, status, `paid_amount`, and `outstanding_amount`.
4. **CustomerReceipt**: Cash/bank receipt from client with allocation to specific sales invoices (`receipt_number`, `customer`, `amount`, `payment_method`, `transaction_reference`).
5. **SupplierPayment**: Payment voucher to vendor against purchase invoices (`payment_number`, `supplier`, `amount`, `payment_method`, `bank_account`).
6. **JournalEntry & Line**: Double-entry journal voucher (`entry_number`, `entry_date`, `narration`, `status`) with balanced lines (`account`, `debit`, `credit`, `cost_center`).
7. **BankAccount**: Company cash and bank ledger balances (`account_name`, `bank_name`, `account_number`, `current_balance`).
8. **Tax**: GST rates and tax structures (`name`, `rate`, `tax_type`).
9. **CostCenter**: Analytical tracking for departmental and project costs.
10. **FinancialYear**: Fiscal year bounds (`name`, `start_date`, `end_date`, `is_current`).

### Backend Endpoint Mapping

| Component / Action | Backend Endpoint | Method | DRF ViewSet / View |
| :--- | :--- | :--- | :--- |
| **Accounting Dashboard Metrics** | `/api/accounting/dashboard-metrics/` | `GET` | `apps.accounting.views.AccountingDashboardMetricsView` |
| **Chart of Accounts** | `/api/chart-of-accounts/` or `/api/accounting/chart-of-accounts/` | `GET` / `POST` | `apps.accounting.views.ChartOfAccountViewSet` |
| **Sales Invoices List & Detail** | `/api/sales-invoices/` or `/api/accounting/sales-invoices/` | `GET` / `POST` | `apps.accounting.views.SalesInvoiceViewSet` |
| **Record Customer Invoice Payment** | `/api/sales-invoices/{id}/record-payment/` | `POST` | `apps.accounting.views.SalesInvoiceViewSet.record_payment` |
| **Purchase Invoices List & Detail** | `/api/purchase-invoices/` or `/api/accounting/purchase-invoices/` | `GET` / `POST` | `apps.accounting.views.PurchaseInvoiceViewSet` |
| **Record Supplier Bill Payment** | `/api/purchase-invoices/{id}/record-payment/` | `POST` | `apps.accounting.views.PurchaseInvoiceViewSet.record_payment` |
| **Customer Receipts** | `/api/customer-receipts/` or `/api/accounting/customer-receipts/` | `GET` | `apps.accounting.views.CustomerReceiptViewSet` |
| **Supplier Payments** | `/api/supplier-payments/` or `/api/accounting/supplier-payments/` | `GET` | `apps.accounting.views.SupplierPaymentViewSet` |
| **Journal Entries (Vouchers)** | `/api/journal-entries/` or `/api/accounting/journal-entries/` | `GET` / `POST` | `apps.accounting.views.JournalEntryViewSet` |
| **Post Journal Entry to Ledger** | `/api/journal-entries/{id}/post/` | `POST` | `apps.accounting.views.JournalEntryViewSet.post` |
| **Bank Accounts** | `/api/bank-accounts/` or `/api/accounting/bank-accounts/` | `GET` | `apps.accounting.views.BankAccountViewSet` |
| **Taxes / GST Rates** | `/api/taxes/` or `/api/accounting/taxes/` | `GET` | `apps.accounting.views.TaxViewSet` |
| **Cost Centers** | `/api/cost-centers/` or `/api/accounting/cost-centers/` | `GET` | `apps.accounting.views.CostCenterViewSet` |
| **Financial Years** | `/api/financial-years/` or `/api/accounting/financial-years/` | `GET` | `apps.accounting.views.FinancialYearViewSet` |

---

## 12. Mobile Security & Financial Safety Architecture

1. **Token Storage:**
   - Access and Refresh tokens stored in Android KeyStore / iOS Keychain via `expo-secure-store`.
   - Real passwords and secret credentials are never exposed in logs, prompts, or source code.
2. **Auto-Refresh Interceptor:**
   - The API client intercepts HTTP 401 Unauthorized responses.
   - Attempts a single-flight token refresh with SimpleJWT.
   - Re-runs failed requests seamlessly without user interruption.
   - Dispatches a logout event if refresh token is expired or revoked.
3. **Double-Entry & Financial Transaction Integrity:**
   - Double-entry balance check: The client strictly validates that total debits equal total credits (`|Debit - Credit| < 0.01`) before permitting journal voucher submission.
   - Authoritative Totals: Server-calculated grand totals, tax amounts, paid amounts, and outstanding amounts are treated as authoritative.
   - Idempotency & Duplicate Guards: UI buttons are disabled during active network mutation requests to prevent accidental duplicate voucher posting or double receipts.
   - All state mutations execute within atomic backend database transactions with standard DRF permission verification.
4. **Network Resilience & Fallback:**
   - In case of network timeout, cached state is displayed with an amber "Offline Cache" badge and a "Pull to Refresh" action.



