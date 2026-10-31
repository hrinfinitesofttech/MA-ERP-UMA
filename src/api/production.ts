import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR PRODUCTION & SHOP FLOOR
// ==========================================

export interface ManufacturingJobItem {
  id: string;
  job_number: string;
  jobNumber?: string;
  project_id?: string;
  projectId?: string;
  project_number?: string;
  projectNumber?: string;
  customer_id?: string;
  customerId?: string;
  customer_name?: string;
  customerName?: string;
  sales_order_id?: string;
  salesOrderId?: string;
  sales_order_number?: string;
  salesOrderNumber?: string;
  customer_po_number?: string;
  customerPoNumber?: string;
  product_name: string;
  productName?: string;
  specification?: string;
  quantity: number;
  unit?: string;
  design_id?: string;
  designId?: string;
  design_revision?: string;
  designRevision?: string;
  bom_id?: string;
  bomId?: string;
  bom_revision?: string;
  bomRevision?: string;
  project_manager?: string;
  projectManager?: string;
  production_manager?: string;
  productionManager?: string;
  planned_start_date?: string;
  plannedStartDate?: string;
  planned_completion_date?: string;
  plannedCompletionDate?: string;
  actual_start_date?: string;
  actualStartDate?: string;
  actual_completion_date?: string;
  actualCompletionDate?: string;
  production_progress: number;
  productionProgress?: number;
  status: 'Pending' | 'Planning' | 'In Production' | 'WIP' | 'Completed' | 'On Hold' | string;
  created_at?: string;
  createdAt?: string;
}

export interface WorkOrderItem {
  id: string;
  work_order_number: string;
  workOrderNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  project_id?: string;
  projectId?: string;
  customer_id?: string;
  customerId?: string;
  customer_name?: string;
  customerName?: string;
  sales_order_number?: string;
  salesOrderNumber?: string;
  design_revision?: string;
  designRevision?: string;
  bom_revision?: string;
  bomRevision?: string;
  product_name: string;
  productName?: string;
  production_quantity: number;
  productionQuantity?: number;
  completed_quantity?: number;
  completedQuantity?: number;
  pending_quantity?: number;
  pendingQuantity?: number;
  uom?: string;
  planned_start_date?: string;
  plannedStartDate?: string;
  planned_end_date?: string;
  plannedEndDate?: string;
  actual_start_date?: string;
  actualStartDate?: string;
  actual_end_date?: string;
  actualEndDate?: string;
  production_manager?: string;
  productionManager?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
  status: 'Draft' | 'Planned' | 'Released' | 'In Progress' | 'Completed' | 'On Hold' | string;
  remarks?: string;
  created_at?: string;
  createdAt?: string;
}

export interface ProductionOrderItem {
  id: string;
  production_order_number: string;
  productionOrderNumber?: string;
  work_order_id?: string;
  workOrderId?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  product_name: string;
  productName?: string;
  quantity: number;
  bom_revision?: string;
  bomRevision?: string;
  design_revision?: string;
  designRevision?: string;
  planned_start_date?: string;
  plannedStartDate?: string;
  planned_end_date?: string;
  plannedEndDate?: string;
  actual_start_date?: string;
  actualStartDate?: string;
  actual_end_date?: string;
  actualEndDate?: string;
  production_manager?: string;
  productionManager?: string;
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold' | string;
  created_at?: string;
  createdAt?: string;
}

export interface WorkCenterItem {
  id: string;
  work_center_code: string;
  workCenterCode?: string;
  work_center_name: string;
  workCenterName?: string;
  department?: string;
  machine_name?: string;
  machineName?: string;
  machine_number?: string;
  machineNumber?: string;
  location?: string;
  capacity_per_day_hours: number;
  capacityPerDayHours?: number;
  available_hours: number;
  availableHours?: number;
  efficiency_percent: number;
  efficiencyPercent?: number;
  supervisor_name?: string;
  supervisorName?: string;
  status: 'Available' | 'Running' | 'Idle' | 'Maintenance' | 'Breakdown' | string;
}

export interface RoutingOperationItem {
  id: string;
  operation_number: number;
  operationNumber?: number;
  operation_name: string;
  operationName?: string;
  sequence: number;
  work_center_code?: string;
  workCenterCode?: string;
  work_center_name?: string;
  workCenterName?: string;
  machine_name?: string;
  machineName?: string;
  department?: string;
  planned_setup_minutes: number;
  plannedSetupMinutes?: number;
  planned_processing_minutes: number;
  plannedProcessingMinutes?: number;
  total_planned_minutes: number;
  totalPlannedMinutes?: number;
  assigned_operator?: string;
  assignedOperator?: string;
  qc_required: boolean;
  qcRequired?: boolean;
  instructions?: string;
  status: 'Pending' | 'Ready' | 'In Progress' | 'Completed' | 'QC Pending' | string;
}

export interface ProductionScheduleItem {
  id: string;
  schedule_number: string;
  scheduleNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  operation_name: string;
  operationName?: string;
  work_center_code?: string;
  workCenterCode?: string;
  work_center_name?: string;
  workCenterName?: string;
  machine_name?: string;
  machineName?: string;
  assigned_operator?: string;
  assignedOperator?: string;
  planned_start?: string;
  plannedStart?: string;
  planned_end?: string;
  plannedEnd?: string;
  actual_start?: string;
  actualStart?: string;
  actual_end?: string;
  actualEnd?: string;
  delay_hours?: number;
  delayHours?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | string;
}

export interface ProductionEntryItem {
  id: string;
  production_entry_number: string;
  productionEntryNumber?: string;
  entry_date: string;
  entryDate?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  production_order_number?: string;
  productionOrderNumber?: string;
  operation_name: string;
  operationName?: string;
  work_center_name?: string;
  workCenterName?: string;
  machine_name?: string;
  machineName?: string;
  operator_name?: string;
  operatorName?: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
  planned_quantity: number;
  plannedQuantity?: number;
  produced_quantity: number;
  producedQuantity?: number;
  rejected_quantity: number;
  rejectedQuantity?: number;
  rework_quantity?: number;
  reworkQuantity?: number;
  scrap_quantity?: number;
  scrapQuantity?: number;
  good_quantity: number;
  goodQuantity?: number;
  downtime_minutes: number;
  downtimeMinutes?: number;
  downtime_reason?: string;
  downtimeReason?: string;
  remarks?: string;
  created_by?: string;
  createdBy?: string;
}

export interface WIPRecordItem {
  id: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  production_order_number?: string;
  productionOrderNumber?: string;
  current_operation_name: string;
  currentOperationName?: string;
  completed_operations_count: number;
  completedOperationsCount?: number;
  total_operations_count: number;
  totalOperationsCount?: number;
  wip_quantity: number;
  wipQuantity?: number;
  uom?: string;
  location?: string;
  responsible_department?: string;
  responsibleDepartment?: string;
  start_date?: string;
  startDate?: string;
  expected_completion_date?: string;
  expectedCompletionDate?: string;
  delay_days?: number;
  delayDays?: number;
  status: 'In Progress' | 'Delayed' | 'On Hold' | 'QC Pending' | string;
}

export interface ProductionHoldItem {
  id: string;
  hold_number: string;
  holdNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  operation_name?: string;
  operationName?: string;
  reason: string;
  description?: string;
  start_date: string;
  startDate?: string;
  expected_resume_date?: string;
  expectedResumeDate?: string;
  approved_by?: string;
  approvedBy?: string;
  resume_date?: string;
  resumeDate?: string;
  status: 'Active Hold' | 'Resumed' | 'Cancelled' | string;
  remarks?: string;
}

export interface ReworkOrderItem {
  id: string;
  rework_number: string;
  reworkNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  production_entry_number?: string;
  productionEntryNumber?: string;
  operation_name?: string;
  operationName?: string;
  item_code?: string;
  itemCode?: string;
  item_name?: string;
  itemName?: string;
  quantity: number;
  uom?: string;
  reason?: string;
  responsible_department?: string;
  responsibleDepartment?: string;
  rework_instructions?: string;
  reworkInstructions?: string;
  assigned_operator?: string;
  assignedOperator?: string;
  start_date?: string;
  startDate?: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed' | string;
}

export interface FinishedGoodsItem {
  id: string;
  finished_goods_number: string;
  finishedGoodsNumber?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  product_name: string;
  productName?: string;
  specification?: string;
  quantity: number;
  uom?: string;
  serial_number?: string;
  serialNumber?: string;
  batch_number?: string;
  batchNumber?: string;
  warehouse_id?: string;
  warehouseId?: string;
  warehouse_name?: string;
  warehouseName?: string;
  location_bin?: string;
  locationBin?: string;
  completion_date?: string;
  completionDate?: string;
  qc_status?: string;
  qcStatus?: string;
  status: string;
  created_at?: string;
}

export interface DispatchOrderItem {
  id: string;
  dispatch_number: string;
  dispatchNumber?: string;
  dispatch_date: string;
  dispatchDate?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  customer_name?: string;
  customerName?: string;
  destination_city?: string;
  destinationCity?: string;
  product_name: string;
  productName?: string;
  quantity: number;
  uom?: string;
  transporter_name?: string;
  transporterName?: string;
  vehicle_number?: string;
  vehicleNumber?: string;
  lr_number?: string;
  lrNumber?: string;
  status: string;
}

export interface ProductionDashboardStats {
  jobStatusData: { name: string; value: number }[];
  workCenterCapacity: {
    name: string;
    Capacity: number;
    Available: number;
    Efficiency: number;
  }[];
  dailyOutput: {
    day: string;
    GoodQty: number;
    Rejected: number;
    Scrap: number;
  }[];
  wipDistribution: {
    job: string;
    OperationsDone: number;
    RemainingOps: number;
  }[];
  downtimeReasons: { name: string; value: number }[];
  totalJobsCount: number;
  workCentersCount: number;
  entriesCount: number;
  wipCount: number;
}

// ==========================================
// CENTRALIZED PRODUCTION API CLIENT
// ==========================================

export const productionApi = {
  // 1. Production Dashboard Stats
  async getDashboardStats(): Promise<ProductionDashboardStats | null> {
    try {
      const res = await apiClient.get('/production/dashboard-stats/');
      return res.data;
    } catch {
      return null;
    }
  },

  // 2. Manufacturing Jobs
  async getJobs(params?: Record<string, any>): Promise<ManufacturingJobItem[]> {
    try {
      const res = await apiClient.get('/manufacturing-jobs/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/manufacturing-jobs/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async updateJobProgress(id: string, progress: number): Promise<ManufacturingJobItem> {
    const res = await apiClient.post(`/manufacturing-jobs/${id}/update-progress/`, { progress });
    return res.data;
  },

  // 3. Work Orders & Production Orders
  async getWorkOrders(params?: Record<string, any>): Promise<WorkOrderItem[]> {
    try {
      const res = await apiClient.get('/production-orders/', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      return rawList.map((po: any) => ({
        id: po.id,
        work_order_number: po.workOrderNumber || po.work_order_number || po.productionOrderNumber || po.production_order_number || po.id,
        workOrderNumber: po.workOrderNumber || po.work_order_number || po.productionOrderNumber || po.production_order_number || po.id,
        job_number: po.jobNumber || po.job_number || '',
        jobNumber: po.jobNumber || po.job_number || '',
        customer_name: po.customerName || po.customer_name || 'UMA Client',
        customerName: po.customerName || po.customer_name || 'UMA Client',
        product_name: po.productName || po.product_name || 'Heavy Equipment',
        productName: po.productName || po.product_name || 'Heavy Equipment',
        production_quantity: Number(po.quantity || po.productionQuantity || po.production_quantity || 1),
        productionQuantity: Number(po.quantity || po.productionQuantity || po.production_quantity || 1),
        completed_quantity: Number(po.completedQuantity || po.completed_quantity || 0),
        completedQuantity: Number(po.completedQuantity || po.completed_quantity || 0),
        pending_quantity: Math.max(0, Number(po.quantity || 1) - Number(po.completedQuantity || 0)),
        pendingQuantity: Math.max(0, Number(po.quantity || 1) - Number(po.completedQuantity || 0)),
        priority: po.priority || 'High',
        status: po.status || 'In Progress',
        planned_start_date: po.plannedStartDate || po.planned_start_date || '',
        plannedStartDate: po.plannedStartDate || po.planned_start_date || '',
        planned_end_date: po.plannedEndDate || po.planned_end_date || '',
        plannedEndDate: po.plannedEndDate || po.planned_end_date || '',
        uom: po.uom || 'Nos',
        remarks: po.remarks || '',
      }));
    } catch {
      return [];
    }
  },

  async createWorkOrder(data: Partial<WorkOrderItem>): Promise<any> {
    try {
      const res = await apiClient.post('/production-orders/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/production/production-orders/', data);
      return res.data;
    }
  },

  async releaseWorkOrder(id: string): Promise<any> {
    try {
      const res = await apiClient.post(`/work-orders/${id}/release/`);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/production-orders/${id}/`, { status: 'In Progress' });
      return res.data;
    }
  },

  // 4. Work Centers (Fabrication Bays 1-4 & Testing Bunker)
  async getWorkCenters(params?: Record<string, any>): Promise<WorkCenterItem[]> {
    try {
      const res = await apiClient.get('/work-centers/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/work-centers/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async updateWorkCenterStatus(id: string, status: string): Promise<WorkCenterItem> {
    const res = await apiClient.patch(`/work-centers/${id}/`, { status });
    return res.data;
  },

  // 5. Routing Operations (Job Cards & Operations)
  async getRoutingOperations(params?: Record<string, any>): Promise<RoutingOperationItem[]> {
    try {
      const res = await apiClient.get('/routing-operations/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/routing-operations/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createRoutingOperation(data: Partial<RoutingOperationItem>): Promise<RoutingOperationItem> {
    try {
      const res = await apiClient.post('/routing-operations/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/production/routing-operations/', data);
      return res.data;
    }
  },

  async updateOperationStatus(id: string, status: string): Promise<RoutingOperationItem> {
    const res = await apiClient.patch(`/routing-operations/${id}/`, { status });
    return res.data;
  },

  // 6. Production Entries (Daily Production Logs)
  async getProductionEntries(params?: Record<string, any>): Promise<ProductionEntryItem[]> {
    try {
      const res = await apiClient.get('/production-entries/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/production-entries/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createProductionEntry(data: Partial<ProductionEntryItem>): Promise<ProductionEntryItem> {
    try {
      const res = await apiClient.post('/production-entries/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/production/production-entries/', data);
      return res.data;
    }
  },

  // 7. WIP Records
  async getWIPRecords(params?: Record<string, any>): Promise<WIPRecordItem[]> {
    try {
      const res = await apiClient.get('/wip-records/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/wip-records/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 8. Production Holds
  async getProductionHolds(params?: Record<string, any>): Promise<ProductionHoldItem[]> {
    try {
      const res = await apiClient.get('/production-holds/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/production-holds/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createProductionHold(data: Partial<ProductionHoldItem>): Promise<ProductionHoldItem> {
    try {
      const res = await apiClient.post('/production-holds/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/production/production-holds/', data);
      return res.data;
    }
  },

  async resumeHold(id: string): Promise<any> {
    const res = await apiClient.post(`/production-holds/${id}/resume/`);
    return res.data;
  },

  // 9. Rework Orders
  async getReworkOrders(params?: Record<string, any>): Promise<ReworkOrderItem[]> {
    try {
      const res = await apiClient.get('/rework-orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/rework-orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 10. Finished Goods & Dispatch
  async getFinishedGoods(params?: Record<string, any>): Promise<FinishedGoodsItem[]> {
    try {
      const res = await apiClient.get('/finished-goods/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/finished-goods/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getDispatchOrders(params?: Record<string, any>): Promise<DispatchOrderItem[]> {
    try {
      const res = await apiClient.get('/dispatch-orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/production/dispatch-orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },
};
