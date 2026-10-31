import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR STORE & WAREHOUSE
// ==========================================

export interface ItemMasterItem {
  id: string;
  item_code: string;
  itemCode?: string;
  item_name: string;
  itemName?: string;
  item_type?: string;
  itemType?: string;
  category: string;
  sub_category?: string;
  subCategory?: string;
  description?: string;
  specification?: string;
  drawing_number?: string;
  drawingNumber?: string;
  brand_make?: string;
  brandMake?: string;
  hsn_sac?: string;
  hsnSac?: string;
  gst_rate?: number;
  gstRate?: number;
  uom: string;
  minimum_stock?: number;
  minimumStock?: number;
  maximum_stock?: number;
  maximumStock?: number;
  reorder_level?: number;
  reorderLevel?: number;
  unit_cost?: number;
  standardCost?: number;
  current_stock?: number;
  currentStock?: number;
  status: 'Active' | 'Inactive' | string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemCategoryItem {
  id: string;
  code: string;
  categoryCode?: string;
  name: string;
  categoryName?: string;
  description?: string;
}

export interface UOMMasterItem {
  id: string;
  code: string;
  uomCode?: string;
  name: string;
  uomName?: string;
  description?: string;
}

export interface WarehouseItem {
  id: string;
  warehouse_code: string;
  warehouseCode?: string;
  name: string;
  warehouseName?: string;
  warehouse_type?: string;
  warehouseType?: string;
  location?: string;
  incharge?: string;
  status: 'Active' | 'Inactive' | string;
}

export interface WarehouseLocationItem {
  id: string;
  warehouse_id: string;
  warehouseId?: string;
  rack: string;
  bin: string;
  shelf?: string;
  code: string;
}

export interface GRNLineItem {
  id?: string;
  itemId?: string;
  item_id?: string;
  itemCode?: string;
  item_code?: string;
  itemName?: string;
  item_name?: string;
  description?: string;
  specification?: string;
  poQuantity?: number;
  po_quantity?: number;
  receivedQuantity: number;
  received_quantity?: number;
  acceptedQuantity?: number;
  accepted_quantity?: number;
  rejectedQuantity?: number;
  rejected_quantity?: number;
  uom?: string;
  unitPrice?: number;
  unit_price?: number;
  rate?: number;
  totalAmount?: number;
  total_amount?: number;
  batchLot?: string;
  batch_lot?: string;
  locationCode?: string;
  remarks?: string;
}

export interface GoodsReceiptNoteItem {
  id: string;
  grn_number: string;
  grnNumber?: string;
  date: string;
  grn_date?: string;
  grnDate?: string;
  receiptDate?: string;
  po_id?: string;
  poId?: string;
  po_number?: string;
  poNumber?: string;
  po_date?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  supplier_address?: string;
  delivery_challan_number?: string;
  deliveryChallanNumber?: string;
  challan_number?: string;
  challanNumber?: string;
  invoice_number?: string;
  invoiceNumber?: string;
  bill_number?: string;
  vehicle_number?: string;
  vehicleNumber?: string;
  transporter_name?: string;
  transporterName?: string;
  received_by: string;
  receivedBy?: string;
  warehouse_id: string;
  warehouseId?: string;
  warehouse_name?: string;
  warehouseName?: string;
  total_received_value?: number;
  totalReceivedValue?: number;
  grand_total?: number;
  grandTotal?: number;
  items: GRNLineItem[];
  status: 'Draft' | 'Received' | 'Inspection Pending' | 'Accepted' | 'Partially Accepted' | 'Rejected' | string;
  qc_status?: 'Pass' | 'Fail' | 'Pending' | string;
  qcStatus?: string;
  remarks?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QCInspectionItem {
  id: string;
  inspection_number?: string;
  inspectionNumber?: string;
  inspection_date?: string;
  inspectionDate?: string;
  grn_id?: string;
  grnId?: string;
  grn_number?: string;
  grnNumber?: string;
  inspector: string;
  inspectorName?: string;
  item_code?: string;
  itemCode?: string;
  item_name?: string;
  itemName?: string;
  lot_quantity?: number;
  sample_size?: number;
  accepted_quantity?: number;
  acceptedQuantity?: number;
  rejected_quantity?: number;
  rejectedQuantity?: number;
  overall_result: 'Pass' | 'Fail' | 'Conditional Approval' | string;
  qcResult?: string;
  remarks?: string;
  rejection_reason?: string;
  created_at?: string;
}

export interface StockBalanceItem {
  id: string;
  item_id: string;
  itemId?: string;
  item_code: string;
  itemCode?: string;
  item_name: string;
  itemName?: string;
  category?: string;
  uom?: string;
  warehouse_id: string;
  warehouseId?: string;
  warehouse_name?: string;
  warehouseName?: string;
  location?: string;
  locationCode?: string;
  batch_lot?: string;
  batchLot?: string;
  quantity: number;
  availableQty?: number;
  available_quantity?: number;
  usableQty?: number;
  reserved_quantity?: number;
  reservedQty?: number;
  unit_rate?: number;
  averageRate?: number;
  total_value?: number;
  stockValue?: number;
  updated_at?: string;
}

export interface StockReservationItem {
  id: string;
  reservation_number: string;
  reservationNumber?: string;
  project_id: string;
  projectId?: string;
  job_number: string;
  jobId?: string;
  jobNumber?: string;
  item_id: string;
  itemId?: string;
  item_code: string;
  itemCode?: string;
  item_name: string;
  itemName?: string;
  reserved_quantity: number;
  reservedQuantity?: number;
  reserved_date: string;
  reservedDate?: string;
  reserved_by: string;
  reservedBy?: string;
  status: 'Pending' | 'Reserved' | 'Released' | 'Consumed' | 'Cancelled' | string;
}

export interface MaterialIssueLineItem {
  id?: string;
  itemId?: string;
  item_id?: string;
  itemCode?: string;
  item_code?: string;
  itemName?: string;
  item_name?: string;
  requiredQuantity?: number;
  reservedQuantity?: number;
  issuedQuantity: number;
  issuedQty?: number;
  uom?: string;
  unitPrice?: number;
  rate?: number;
  totalCost?: number;
  locationCode?: string;
}

export interface MaterialIssueItem {
  id: string;
  issue_number: string;
  issueNumber?: string;
  issue_date: string;
  issueDate?: string;
  project_id?: string;
  projectId?: string;
  job_number?: string;
  jobNumber?: string;
  jobId?: string;
  work_order_number?: string;
  workOrderNumber?: string;
  bom_number?: string;
  bomRevision?: string;
  production_stage?: string;
  productionStage?: string;
  department?: string;
  issued_to: string;
  issuedTo?: string;
  requested_by?: string;
  requestedBy?: string;
  issued_by?: string;
  issuedBy?: string;
  warehouse_id?: string;
  warehouseId?: string;
  warehouse_name?: string;
  warehouseName?: string;
  total_issue_value?: number;
  totalIssueValue?: number;
  items: MaterialIssueLineItem[];
  status: 'Draft' | 'Requested' | 'Approved' | 'Partially Issued' | 'Fully Issued' | 'Cancelled' | string;
  remarks?: string;
  notes?: string;
  created_at?: string;
}

export interface MaterialReturnLineItem {
  id?: string;
  itemCode?: string;
  item_code?: string;
  itemName?: string;
  item_name?: string;
  issuedQuantity?: number;
  returnQuantity: number;
  returnQty?: number;
  uom?: string;
  condition?: string;
  unitPrice?: number;
  totalReturnValue?: number;
}

export interface MaterialReturnItem {
  id: string;
  return_number: string;
  returnNumber?: string;
  return_date: string;
  returnDate?: string;
  project_id?: string;
  projectId?: string;
  job_number?: string;
  jobNumber?: string;
  work_order_number?: string;
  material_issue_number?: string;
  materialIssueNumber?: string;
  returned_by: string;
  returnedBy?: string;
  received_by?: string;
  receivedBy?: string;
  department?: string;
  warehouse_id?: string;
  warehouseId?: string;
  warehouse_name?: string;
  warehouseName?: string;
  total_return_value?: number;
  totalReturnValue?: number;
  items: MaterialReturnLineItem[];
  status: 'Draft' | 'Completed' | string;
  remarks?: string;
  notes?: string;
  created_at?: string;
}

export interface StockTransferItem {
  id: string;
  transfer_number: string;
  transferNumber?: string;
  transfer_date: string;
  transferDate?: string;
  from_warehouse_id?: string;
  fromWarehouseId?: string;
  from_warehouse_name?: string;
  fromWarehouseName?: string;
  to_warehouse_id?: string;
  toWarehouseId?: string;
  to_warehouse_name?: string;
  toWarehouseName?: string;
  reason?: string;
  requested_by?: string;
  requestedBy?: string;
  approved_by?: string;
  approvedBy?: string;
  status: 'Draft' | 'Requested' | 'In Transit' | 'Completed' | 'Cancelled' | string;
  items?: any[];
  created_at?: string;
}

export interface StockLedgerItem {
  id: string;
  date: string;
  transaction_type: string;
  reference_number: string;
  item_id?: string;
  item_code: string;
  item_name: string;
  warehouse_id?: string;
  inward_quantity: number;
  outward_quantity: number;
  closing_quantity: number;
  unit_rate?: number;
  total_amount?: number;
  performed_by?: string;
  created_at?: string;
}

export interface StoreDashboardSummary {
  totalActiveItems: number;
  totalStockValue: number;
  lowStockCount: number;
  pendingGRNCount: number;
  pendingQCCount: number;
  totalReservationsCount: number;
  todayIssuesCount: number;
  totalTransfersCount: number;
}

// ==========================================
// CENTRALIZED INVENTORY & STORE API CLIENT
// ==========================================

export const inventoryApi = {
  // 1. Dashboard summary
  async getDashboardSummary(): Promise<StoreDashboardSummary> {
    try {
      const [items, balances, grns, qcs, res, issues, transfers] = await Promise.all([
        this.getItems().catch(() => []),
        this.getStockBalances().catch(() => []),
        this.getGoodsReceipts().catch(() => []),
        this.getQCInspections().catch(() => []),
        this.getStockReservations().catch(() => []),
        this.getMaterialIssues().catch(() => []),
        this.getStockTransfers().catch(() => []),
      ]);

      const totalActiveItems = items.length;
      let totalStockValue = 0;
      let lowStockCount = 0;

      balances.forEach((b) => {
        const val = Number(b.total_value || b.stockValue || 0);
        totalStockValue += val;
      });

      items.forEach((item) => {
        const reorder = Number(item.reorder_level || item.reorderLevel || item.minimum_stock || 0);
        const current = Number(item.current_stock || item.currentStock || 0);
        if (reorder > 0 && current <= reorder) {
          lowStockCount += 1;
        }
      });

      const pendingGRNCount = grns.filter(
        (g) => g.status === 'Inspection Pending' || g.status === 'Received' || g.status === 'Draft'
      ).length;

      const pendingQCCount = qcs.filter(
        (q) => (q.overall_result || q.qcResult || '').toLowerCase() === 'fail' || (q.overall_result || q.qcResult || '').toLowerCase() === 'pending'
      ).length;

      return {
        totalActiveItems,
        totalStockValue,
        lowStockCount,
        pendingGRNCount,
        pendingQCCount,
        totalReservationsCount: res.length,
        todayIssuesCount: issues.length,
        totalTransfersCount: transfers.length,
      };
    } catch {
      return {
        totalActiveItems: 0,
        totalStockValue: 0,
        lowStockCount: 0,
        pendingGRNCount: 0,
        pendingQCCount: 0,
        totalReservationsCount: 0,
        todayIssuesCount: 0,
        totalTransfersCount: 0,
      };
    }
  },

  // 2. Items Master
  async getItems(params?: Record<string, any>): Promise<ItemMasterItem[]> {
    try {
      const res = await apiClient.get('/store/items/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/items/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getItemById(id: string): Promise<ItemMasterItem> {
    try {
      const res = await apiClient.get(`/store/items/${id}/`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/items/${id}/`);
      return res.data;
    }
  },

  async createItem(data: Partial<ItemMasterItem>): Promise<ItemMasterItem> {
    try {
      const res = await apiClient.post('/store/items/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/items/', data);
      return res.data;
    }
  },

  async updateItem(id: string, data: Partial<ItemMasterItem>): Promise<ItemMasterItem> {
    try {
      const res = await apiClient.patch(`/store/items/${id}/`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/items/${id}/`, data);
      return res.data;
    }
  },

  // 3. Categories & UOMs
  async getCategories(): Promise<ItemCategoryItem[]> {
    try {
      const res = await apiClient.get('/store/categories/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/item-categories/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getUOMs(): Promise<UOMMasterItem[]> {
    try {
      const res = await apiClient.get('/store/uoms/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/uoms/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 4. Warehouses & Locations
  async getWarehouses(): Promise<WarehouseItem[]> {
    const res = await apiClient.get('/warehouses/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async getWarehouseLocations(): Promise<WarehouseLocationItem[]> {
    const res = await apiClient.get('/warehouse-locations/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  // 5. Goods Receipt Notes (GRN)
  async getGoodsReceipts(params?: Record<string, any>): Promise<GoodsReceiptNoteItem[]> {
    try {
      const res = await apiClient.get('/store/grns/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      try {
        const res = await apiClient.get('/grns/', { params });
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch {
        const res = await apiClient.get('/goods-receipt-notes/', { params });
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      }
    }
  },

  async getGoodsReceiptById(id: string): Promise<GoodsReceiptNoteItem> {
    try {
      const res = await apiClient.get(`/store/grns/${id}/`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/grns/${id}/`);
      return res.data;
    }
  },

  async createGoodsReceipt(data: Partial<GoodsReceiptNoteItem>): Promise<GoodsReceiptNoteItem> {
    try {
      const res = await apiClient.post('/store/grns/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/grns/', data);
      return res.data;
    }
  },

  // 6. QC Inspections
  async getQCInspections(params?: Record<string, any>): Promise<QCInspectionItem[]> {
    const res = await apiClient.get('/qc-inspections/', { params });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async createQCInspection(data: Partial<QCInspectionItem>): Promise<QCInspectionItem> {
    const res = await apiClient.post('/qc-inspections/', data);
    return res.data;
  },

  // 7. Stock Balances
  async getStockBalances(params?: Record<string, any>): Promise<StockBalanceItem[]> {
    try {
      const res = await apiClient.get('/stock-balances/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/stock/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 8. Stock Reservations
  async getStockReservations(params?: Record<string, any>): Promise<StockReservationItem[]> {
    const res = await apiClient.get('/stock-reservations/', { params });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async createStockReservation(data: Partial<StockReservationItem>): Promise<StockReservationItem> {
    const res = await apiClient.post('/stock-reservations/', data);
    return res.data;
  },

  // 9. Material Issues
  async getMaterialIssues(params?: Record<string, any>): Promise<MaterialIssueItem[]> {
    try {
      const res = await apiClient.get('/store/issues/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/material-issues/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createMaterialIssue(data: Partial<MaterialIssueItem>): Promise<MaterialIssueItem> {
    try {
      const res = await apiClient.post('/store/issues/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/material-issues/', data);
      return res.data;
    }
  },

  // 10. Material Returns
  async getMaterialReturns(params?: Record<string, any>): Promise<MaterialReturnItem[]> {
    try {
      const res = await apiClient.get('/store/returns/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/material-returns/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createMaterialReturn(data: Partial<MaterialReturnItem>): Promise<MaterialReturnItem> {
    try {
      const res = await apiClient.post('/store/returns/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/material-returns/', data);
      return res.data;
    }
  },

  // 11. Stock Transfers
  async getStockTransfers(params?: Record<string, any>): Promise<StockTransferItem[]> {
    const res = await apiClient.get('/stock-transfers/', { params });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async createStockTransfer(data: Partial<StockTransferItem>): Promise<StockTransferItem> {
    const res = await apiClient.post('/stock-transfers/', data);
    return res.data;
  },

  // 12. Stock Ledger
  async getStockLedger(params?: Record<string, any>): Promise<StockLedgerItem[]> {
    const res = await apiClient.get('/stock-ledger/', { params });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
};
