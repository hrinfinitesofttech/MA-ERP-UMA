import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR PURCHASE MANAGEMENT
// ==========================================

export interface SupplierItem {
  id: string;
  vendor_code: string;
  vendorCode?: string;
  supplier_code?: string;
  supplierCode?: string;
  name: string;
  supplierName?: string;
  category: string;
  supplier_type?: string;
  supplierType?: string;
  contact_person: string;
  contactPerson?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  pinCode?: string;
  gstin?: string;
  pan?: string;
  panNumber?: string;
  bank_name?: string;
  bankName?: string;
  bank_account_number?: string;
  bankAccountNumber?: string;
  ifsc_code?: string;
  ifscCode?: string;
  credit_period_days?: number;
  creditDays?: number;
  payment_terms?: string;
  paymentTerms?: string;
  rating?: number;
  status: 'active' | 'blacklisted' | 'pending_verification' | 'Approved' | 'Pending Verification' | 'Blacklisted' | string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialRequirementItem {
  id: string;
  project_id: string;
  projectId?: string;
  job_id?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  customer_name?: string;
  customerName?: string;
  design_job_id?: string;
  bom_id?: string;
  bomId?: string;
  bom_number?: string;
  bomNumber?: string;
  bom_revision?: string;
  bomRevision?: string;
  part_number?: string;
  partNumber?: string;
  item_code: string;
  itemCode?: string;
  item_name: string;
  itemName?: string;
  material_name?: string;
  materialName?: string;
  specification?: string;
  category: string;
  required_quantity: number;
  requiredQuantity?: number;
  unit_of_measure: string;
  unitOfMeasure?: string;
  unit?: string;
  available_stock: number;
  availableStock?: number;
  reserved_stock?: number;
  reservedStock?: number;
  on_order_quantity?: number;
  onOrderQuantity?: number;
  shortage_quantity: number;
  shortageQuantity?: number;
  required_by_date?: string;
  requiredByDate?: string;
  procurement_type?: string;
  procurementType?: string;
  procurement_status?: string;
  procurementStatus?: string;
  drawing_number?: string;
  drawingNumber?: string;
  status: 'shortage' | 'sufficient' | 'ordered' | 'pr_created' | string;
  created_at?: string;
}

export interface PRLineItem {
  id?: string;
  itemCode?: string;
  item_code?: string;
  itemName?: string;
  item_name?: string;
  materialName?: string;
  specification?: string;
  category?: string;
  quantity?: number;
  requiredQuantity?: number;
  required_quantity?: number;
  unitOfMeasure?: string;
  unit_of_measure?: string;
  unit?: string;
  estimatedUnitPrice?: number;
  estimated_unit_price?: number;
  rate?: number;
  estimatedTotalPrice?: number;
  estimated_total_price?: number;
  amount?: number;
  requiredByDate?: string;
  remarks?: string;
}

export interface PurchaseRequisitionItem {
  id: string;
  pr_number: string;
  prNumber?: string;
  project_id: string;
  projectId?: string;
  job_code?: string;
  jobId?: string;
  job_number?: string;
  jobNumber?: string;
  bom_number?: string;
  bomId?: string;
  requested_by: string;
  requestedBy?: string;
  department: string;
  request_date: string;
  requisitionDate?: string;
  prDate?: string;
  required_by_date: string;
  requiredByDate?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_rfq' | 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to RFQ' | string;
  items: PRLineItem[];
  total_estimated_cost?: number;
  estimatedCost?: number;
  totalItems?: number;
  remarks?: string;
  approved_by?: string;
  approvedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RFQLineItem {
  id?: string;
  itemCode?: string;
  itemName?: string;
  description?: string;
  specification?: string;
  quantity?: number;
  requiredQuantity?: number;
  unitOfMeasure?: string;
  unit?: string;
  targetPrice?: number;
  remarks?: string;
}

export interface RequestForQuotationItem {
  id: string;
  rfq_number: string;
  rfqNumber?: string;
  pr_id?: string;
  prId?: string;
  rfq_date: string;
  rfqDate?: string;
  due_date?: string;
  dueDate?: string;
  supplier_id?: string;
  supplierId?: string;
  supplier_name?: string;
  supplierName?: string;
  supplier_mobile?: string;
  supplierMobile?: string;
  supplier_email?: string;
  supplierEmail?: string;
  supplier_address?: string;
  supplierAddress?: string;
  supplier_gstin?: string;
  supplierGstin?: string;
  project_id?: string;
  projectId?: string;
  subject?: string;
  special_note?: string;
  specialNote?: string;
  delivery_location?: string;
  deliveryLocation?: string;
  suppliers?: any[];
  items: RFQLineItem[];
  status: 'draft' | 'sent' | 'closed' | 'Draft' | 'Sent to Suppliers' | 'Quotation Received' | 'Closed' | string;
  terms_and_conditions?: string;
  termsAndConditions?: string;
  created_at?: string;
}

export interface SupplierQuotationItem {
  id: string;
  quotation_number: string;
  quotationNumber?: string;
  rfq_id?: string;
  rfqId?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  date?: string;
  quotationDate?: string;
  valid_until?: string;
  validityDate?: string;
  items?: any[];
  sub_total?: number;
  subTotal?: number;
  tax_amount?: number;
  taxTotal?: number;
  grand_total: number;
  grandTotal?: number;
  delivery_lead_time?: string;
  deliveryLeadTime?: string;
  payment_terms?: string;
  paymentTerms?: string;
  status: string;
  created_at?: string;
}

export interface QuotationComparisonItem {
  id: string;
  rfq_id: string;
  rfqId?: string;
  comparison_date: string;
  comparisonDate?: string;
  items?: any[];
  supplier_quotations?: any[];
  suppliersEvaluated?: any[];
  recommended_supplier_id?: string;
  recommendedSupplierId?: string;
  recommended_supplier_name?: string;
  recommendedSupplierName?: string;
  recommendation_reason?: string;
  recommendationReason?: string;
  prepared_by: string;
  preparedBy?: string;
  approved_by?: string;
  approvedBy?: string;
  status: string;
  created_at?: string;
}

export interface POLineItem {
  id?: string;
  itemCode?: string;
  item_code?: string;
  itemName?: string;
  item_name?: string;
  description?: string;
  specification?: string;
  dimensions?: string;
  category?: string;
  quantity?: number;
  orderedQuantity?: number;
  ordered_quantity?: number;
  receivedQuantity?: number;
  received_quantity?: number;
  pendingQuantity?: number;
  unitOfMeasure?: string;
  unit_of_measure?: string;
  unit?: string;
  rate?: number;
  unitPrice?: number;
  unit_price?: number;
  totalPrice?: number;
  total_price?: number;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxAmount?: number;
  gstPercentage?: number;
  netPrice?: number;
  hsnCode?: string;
  hsn_code?: string;
  drawingNumber?: string;
  remarks?: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_number: string;
  poNumber?: string;
  revision_number?: string;
  revisionNumber?: string | number;
  date: string;
  poDate?: string;
  pr_number?: string;
  prNumber?: string;
  indent_number?: string;
  indentNumber?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  contact_person?: string;
  contactPerson?: string;
  supplier_gstin?: string;
  supplierGstin?: string;
  supplier_address?: string;
  supplierAddress?: string;
  billing_address?: string;
  billingAddress?: string;
  shipping_address?: string;
  shippingAddress?: string;
  delivery_terms?: string;
  deliveryTerms?: string;
  dispatch_mode?: string;
  dispatchMode?: string;
  project_id?: string;
  projectId?: string;
  job_code?: string;
  jobCode?: string;
  job_number?: string;
  jobNumber?: string;
  delivery_date: string;
  expectedDeliveryDate?: string;
  payment_terms?: string;
  paymentTerms?: string;
  currency?: string;
  items: POLineItem[];
  sub_total?: number;
  subTotal?: number;
  discount_amount?: number;
  discountTotal?: number;
  tax_amount?: number;
  taxTotal?: number;
  freight_charges?: number;
  freightCharges?: number;
  other_charges?: number;
  grand_total: number;
  grandTotal?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_supplier' | 'partially_received' | 'fully_received' | 'closed' | 'cancelled' | 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Ordered' | 'Sent to Supplier' | 'Partially Received' | 'Completed' | 'Cancelled' | string;
  terms_and_conditions?: string;
  remarks?: string;
  prepared_by?: string;
  preparedBy?: string;
  approved_by?: string;
  approvedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseReturnItem {
  id: string;
  return_number: string;
  returnNumber?: string;
  po_id?: string;
  poId?: string;
  po_number?: string;
  poNumber?: string;
  grn_id?: string;
  grn_number?: string;
  grnNumber?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  date: string;
  reason: string;
  items?: any[];
  total_amount?: number;
  totalAmount?: number;
  status: string;
  debit_note_number?: string;
  debitNoteNumber?: string;
  created_at?: string;
}

export interface PurchaseDashboardSummary {
  openRequisitionsCount: number;
  pendingRFQCount: number;
  pendingPOApprovalCount: number;
  awaitingDeliveryCount: number;
  overdueDeliveriesCount: number;
  totalPOValue: number;
  activeSuppliersCount: number;
  mrpShortageCount: number;
}

// ==========================================
// CENTRALIZED PURCHASE API CLIENT
// ==========================================

export const purchaseApi = {
  // 1. Dashboard KPI summary
  async getDashboardSummary(): Promise<PurchaseDashboardSummary> {
    try {
      const [pos, prs, rfqs, mrps, supps] = await Promise.all([
        this.getPurchaseOrders().catch(() => []),
        this.getPurchaseRequisitions().catch(() => []),
        this.getRFQs().catch(() => []),
        this.getMaterialRequirements().catch(() => []),
        this.getSuppliers().catch(() => []),
      ]);

      const openRequisitionsCount = prs.filter(
        (p) => p.status === 'Draft' || p.status === 'Submitted' || p.status === 'pending_approval' || p.status === 'Pending Approval'
      ).length;

      const pendingRFQCount = rfqs.filter(
        (r) => r.status === 'draft' || r.status === 'sent' || r.status === 'Draft' || r.status === 'Sent to Suppliers'
      ).length;

      const pendingPOApprovalCount = pos.filter(
        (po) => po.status === 'Draft' || po.status === 'Submitted' || po.status === 'pending_approval' || po.status === 'Pending Approval'
      ).length;

      const now = new Date();
      let awaitingDeliveryCount = 0;
      let overdueDeliveriesCount = 0;
      let totalPOValue = 0;

      pos.forEach((po) => {
        const val = Number(po.grand_total || po.grandTotal || 0);
        if (po.status !== 'cancelled' && po.status !== 'Cancelled') {
          totalPOValue += val;
        }

        const isPendingReceipt =
          po.status === 'Approved' ||
          po.status === 'approved' ||
          po.status === 'Ordered' ||
          po.status === 'sent_to_supplier' ||
          po.status === 'Sent to Supplier' ||
          po.status === 'Partially Received' ||
          po.status === 'partially_received';

        if (isPendingReceipt) {
          awaitingDeliveryCount += 1;
          const dueStr = po.delivery_date || po.expectedDeliveryDate;
          if (dueStr) {
            const dueDate = new Date(dueStr);
            if (!isNaN(dueDate.getTime()) && dueDate < now) {
              overdueDeliveriesCount += 1;
            }
          }
        }
      });

      const mrpShortageCount = mrps.filter(
        (m) => Number(m.shortage_quantity || m.shortageQuantity || 0) > 0 || m.status === 'shortage'
      ).length;

      return {
        openRequisitionsCount,
        pendingRFQCount,
        pendingPOApprovalCount,
        awaitingDeliveryCount,
        overdueDeliveriesCount,
        totalPOValue,
        activeSuppliersCount: supps.length,
        mrpShortageCount,
      };
    } catch {
      return {
        openRequisitionsCount: 0,
        pendingRFQCount: 0,
        pendingPOApprovalCount: 0,
        awaitingDeliveryCount: 0,
        overdueDeliveriesCount: 0,
        totalPOValue: 0,
        activeSuppliersCount: 0,
        mrpShortageCount: 0,
      };
    }
  },

  // 2. Material Requirements (MRP)
  async getMaterialRequirements(params?: Record<string, any>): Promise<MaterialRequirementItem[]> {
    try {
      const res = await apiClient.get('/purchase/material-requirements/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      try {
        const fallback = await apiClient.get('/material-requirements/', { params });
        return Array.isArray(fallback.data) ? fallback.data : (fallback.data?.results || []);
      } catch {
        const mrp = await apiClient.get('/mrp/', { params }).catch(() => ({ data: [] }));
        return Array.isArray(mrp.data) ? mrp.data : (mrp.data?.results || []);
      }
    }
  },

  async createMaterialRequirement(data: Partial<MaterialRequirementItem>): Promise<MaterialRequirementItem> {
    try {
      const res = await apiClient.post('/purchase/material-requirements/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/material-requirements/', data);
      return res.data;
    }
  },

  // 3. Supplier Master
  async getSuppliers(params?: Record<string, any>): Promise<SupplierItem[]> {
    try {
      const res = await apiClient.get('/purchase/suppliers/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/suppliers/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getSupplierById(id: string): Promise<SupplierItem> {
    try {
      const res = await apiClient.get(`/purchase/suppliers/${id}/`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/suppliers/${id}/`);
      return res.data;
    }
  },

  async createSupplier(data: Partial<SupplierItem>): Promise<SupplierItem> {
    try {
      const res = await apiClient.post('/purchase/suppliers/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/suppliers/', data);
      return res.data;
    }
  },

  async updateSupplier(id: string, data: Partial<SupplierItem>): Promise<SupplierItem> {
    try {
      const res = await apiClient.patch(`/purchase/suppliers/${id}/`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/suppliers/${id}/`, data);
      return res.data;
    }
  },

  // 4. Purchase Requisitions / Indents
  async getPurchaseRequisitions(params?: Record<string, any>): Promise<PurchaseRequisitionItem[]> {
    try {
      const res = await apiClient.get('/purchase/requisitions/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      try {
        const res = await apiClient.get('/purchase-requisitions/', { params });
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      } catch {
        const res = await apiClient.get('/indents/', { params }).catch(() => ({ data: [] }));
        return Array.isArray(res.data) ? res.data : (res.data?.results || []);
      }
    }
  },

  async getPurchaseRequisitionById(id: string): Promise<PurchaseRequisitionItem> {
    try {
      const res = await apiClient.get(`/purchase/requisitions/${id}/`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/purchase-requisitions/${id}/`);
      return res.data;
    }
  },

  async createPurchaseRequisition(data: Partial<PurchaseRequisitionItem>): Promise<PurchaseRequisitionItem> {
    try {
      const res = await apiClient.post('/purchase/requisitions/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/purchase-requisitions/', data);
      return res.data;
    }
  },

  async updatePurchaseRequisition(id: string, data: Partial<PurchaseRequisitionItem>): Promise<PurchaseRequisitionItem> {
    try {
      const res = await apiClient.patch(`/purchase/requisitions/${id}/`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/purchase-requisitions/${id}/`, data);
      return res.data;
    }
  },

  async approvePurchaseRequisition(id: string, notes?: string): Promise<PurchaseRequisitionItem> {
    const payload = { approvalNotes: notes || 'Requisition approved via Mobile App' };
    try {
      const res = await apiClient.post(`/purchase/requisitions/${id}/approve/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-requisitions/${id}/approve/`, payload);
      return res.data;
    }
  },

  async rejectPurchaseRequisition(id: string, reason: string): Promise<PurchaseRequisitionItem> {
    const payload = { rejectionReason: reason || 'Requisition rejected via Mobile App' };
    try {
      const res = await apiClient.post(`/purchase/requisitions/${id}/reject/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-requisitions/${id}/reject/`, payload);
      return res.data;
    }
  },

  async convertPRToRFQ(id: string, data?: { dueDate?: string; suppliers?: any[] }): Promise<RequestForQuotationItem> {
    try {
      const res = await apiClient.post(`/purchase/requisitions/${id}/convert-to-rfq/`, data || {});
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-requisitions/${id}/convert-to-rfq/`, data || {});
      return res.data;
    }
  },

  // 5. Request for Quotation (RFQ)
  async getRFQs(params?: Record<string, any>): Promise<RequestForQuotationItem[]> {
    try {
      const res = await apiClient.get('/purchase/rfqs/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/rfqs/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createRFQ(data: Partial<RequestForQuotationItem>): Promise<RequestForQuotationItem> {
    try {
      const res = await apiClient.post('/purchase/rfqs/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/rfqs/', data);
      return res.data;
    }
  },

  async sendRFQEmail(id: string, data?: { recipientEmail?: string; rfq?: any }): Promise<any> {
    try {
      const res = await apiClient.post(`/purchase/rfqs/${id}/send-email/`, data || {});
      return res.data;
    } catch {
      const res = await apiClient.post(`/rfqs/${id}/send-email/`, data || {});
      return res.data;
    }
  },

  // 6. Supplier Quotations & Comparisons
  async getSupplierQuotations(params?: Record<string, any>): Promise<SupplierQuotationItem[]> {
    try {
      const res = await apiClient.get('/purchase/quotations/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/supplier-quotations/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getQuotationComparisons(params?: Record<string, any>): Promise<QuotationComparisonItem[]> {
    try {
      const res = await apiClient.get('/purchase/comparisons/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/quotation-comparisons/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 7. Purchase Orders (PO)
  async getPurchaseOrders(params?: Record<string, any>): Promise<PurchaseOrderItem[]> {
    try {
      const res = await apiClient.get('/purchase/orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/purchase-orders/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderItem> {
    try {
      const res = await apiClient.get(`/purchase/orders/${id}/`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/purchase-orders/${id}/`);
      return res.data;
    }
  },

  async createPurchaseOrder(data: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem> {
    try {
      const res = await apiClient.post('/purchase/orders/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/purchase-orders/', data);
      return res.data;
    }
  },

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem> {
    try {
      const res = await apiClient.patch(`/purchase/orders/${id}/`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/purchase-orders/${id}/`, data);
      return res.data;
    }
  },

  async approvePurchaseOrder(id: string, notes?: string): Promise<PurchaseOrderItem> {
    const payload = { approvalNotes: notes || 'PO approved via Mobile App' };
    try {
      const res = await apiClient.post(`/purchase/orders/${id}/approve/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-orders/${id}/approve/`, payload);
      return res.data;
    }
  },

  async rejectPurchaseOrder(id: string, reason: string): Promise<PurchaseOrderItem> {
    const payload = { rejectionReason: reason || 'PO rejected via Mobile App' };
    try {
      const res = await apiClient.post(`/purchase/orders/${id}/reject/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-orders/${id}/reject/`, payload);
      return res.data;
    }
  },

  async sendPOEmail(id: string, data?: { recipientEmail?: string; po?: any }): Promise<any> {
    try {
      const res = await apiClient.post(`/purchase/orders/${id}/send-email/`, data || {});
      return res.data;
    } catch {
      const res = await apiClient.post(`/purchase-orders/${id}/send-email/`, data || {});
      return res.data;
    }
  },

  // 8. Purchase Returns
  async getPurchaseReturns(params?: Record<string, any>): Promise<PurchaseReturnItem[]> {
    try {
      const res = await apiClient.get('/purchase/returns/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/purchase-returns/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },
};
