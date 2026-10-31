import { apiClient } from './client';

export interface CustomerData {
  id?: string;
  customerCode?: string;
  customer_code?: string;
  companyName: string;
  company_name?: string;
  customerType?: string;
  customer_type?: string;
  industry?: string;
  gstin?: string;
  pan?: string;
  website?: string;
  contactPerson: string;
  contact_person?: string;
  designation?: string;
  mobile: string;
  email?: string;
  whatsapp?: string;
  billingAddress?: string;
  billing_address?: string;
  shippingAddress?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  paymentTerms?: string;
  payment_terms?: string;
  creditLimit?: number;
  credit_limit?: number;
  currency?: string;
  category?: 'platinum' | 'gold' | 'silver' | 'standard';
  status?: string;
  createdDate?: string;
  created_date?: string;
}

export interface LeadData {
  id?: string;
  leadNo?: string;
  lead_no?: string;
  companyName: string;
  company_name?: string;
  contactPerson?: string;
  contact_person?: string;
  mobile: string;
  email?: string;
  productName?: string;
  product_name?: string;
  machineType?: string;
  machine_type?: string;
  quantity?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
  status?: string;
  expectedDelivery?: string;
  expected_delivery?: string;
  budget?: number;
  address?: string;
  city?: string;
  state?: string;
  nextFollowUpDate?: string;
  next_follow_up_date?: string;
  remarks?: string;
  assignedSalesPersonName?: string;
  assigned_sales_person_name?: string;
}

export interface EnquiryData {
  id?: string;
  enquiryNo?: string;
  enquiry_no?: string;
  customerId?: string;
  customer_id?: string;
  customerName: string;
  customer_name?: string;
  contactPerson?: string;
  contact_person?: string;
  contactMobile?: string;
  contact_mobile?: string;
  machineProduct: string;
  machine_product?: string;
  quantity?: number;
  budget?: number;
  requirement?: string;
  specification?: string;
  status?: string;
  enquiryDate?: string;
  enquiry_date?: string;
}

export interface FollowUpData {
  id?: string;
  followUpNo?: string;
  follow_up_no?: string;
  leadOrCustomerId: string;
  lead_or_customer_id?: string;
  leadOrCustomerName: string;
  lead_or_customer_name?: string;
  entityType?: 'lead' | 'customer' | 'enquiry' | 'quotation';
  entity_type?: string;
  type?: 'call' | 'whatsapp' | 'email' | 'meeting' | 'visit';
  date: string;
  time?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  purpose?: string;
  notes?: string;
  status?: 'pending' | 'completed' | 'rescheduled' | 'cancelled';
  outcome?: string;
  nextFollowUpDate?: string;
  next_follow_up_date?: string;
}

export interface QuotationItemData {
  id?: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount: number;
}

export interface QuotationData {
  id?: string;
  quotationNumber?: string;
  quotation_number?: string;
  currentRevision?: string;
  current_revision?: string;
  date: string;
  validUntil?: string;
  valid_until?: string;
  customerId?: string;
  customer_id?: string;
  customerName: string;
  customer_name?: string;
  contactPerson?: string;
  contact_person?: string;
  contactEmail?: string;
  contact_email?: string;
  contactMobile?: string;
  contact_mobile?: string;
  machineProduct?: string;
  machine_product?: string;
  items?: QuotationItemData[];
  subtotal?: number;
  taxAmount?: number;
  tax_amount?: number;
  grandTotal?: number;
  grand_total?: number;
  status?: 'draft' | 'approved' | 'sent' | 'rejected' | 'expired';
  approvedBy?: string;
  approved_by?: string;
  rejectionReason?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface SalesOrderItemData {
  id?: string;
  productName: string;
  specification?: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount: number;
}

export interface SalesOrderData {
  id?: string;
  salesOrderNumber?: string;
  sales_order_number?: string;
  customerId?: string;
  customer_id?: string;
  customerName: string;
  customer_name?: string;
  customerPoNumber?: string;
  customer_po_number?: string;
  quotationNumber?: string;
  quotation_number?: string;
  orderDate?: string;
  order_date?: string;
  deliveryDate?: string;
  delivery_date?: string;
  targetDeliveryDate?: string;
  target_delivery_date?: string;
  items?: SalesOrderItemData[];
  totalAmount?: number;
  total_amount?: number;
  grandTotal?: number;
  grand_total?: number;
  status?: 'confirmed' | 'in_production' | 'completed' | 'cancelled';
  paymentTerms?: string;
  payment_terms?: string;
}

export const crmApi = {
  // 1. Customers
  getCustomers: async (search?: string, status?: string): Promise<CustomerData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/customers/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createCustomer: async (customer: CustomerData): Promise<CustomerData> => {
    const payload = {
      ...customer,
      company_name: customer.companyName || customer.company_name,
      contact_person: customer.contactPerson || customer.contact_person,
      customer_code: customer.customerCode || customer.customer_code,
      billing_address: customer.billingAddress || customer.billing_address,
      payment_terms: customer.paymentTerms || customer.payment_terms || '30% advance, balance against PI',
      credit_limit: customer.creditLimit || customer.credit_limit || 0,
      status: customer.status || 'active',
      created_date: new Date().toISOString().split('T')[0],
    };
    const res = await apiClient.post<CustomerData>('/customers/', payload);
    return res.data;
  },

  updateCustomer: async (id: string, updates: Partial<CustomerData>): Promise<CustomerData> => {
    const res = await apiClient.patch<CustomerData>(`/customers/${id}/`, updates);
    return res.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}/`);
  },

  // 2. Leads
  getLeads: async (search?: string, status?: string): Promise<LeadData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/leads/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createLead: async (lead: LeadData): Promise<LeadData> => {
    const payload = {
      ...lead,
      company_name: lead.companyName || lead.company_name,
      contact_person: lead.contactPerson || lead.contact_person,
      product_name: lead.productName || lead.product_name || 'Industrial Equipment',
      machine_type: lead.machineType || lead.machine_type || 'Process Equipment',
      quantity: lead.quantity || 1,
      priority: lead.priority || 'medium',
      source: lead.source || 'mobile_app',
      status: lead.status || 'new',
      created_date: new Date().toISOString().split('T')[0],
    };
    const res = await apiClient.post<LeadData>('/leads/', payload);
    return res.data;
  },

  updateLead: async (id: string, updates: Partial<LeadData>): Promise<LeadData> => {
    const res = await apiClient.patch<LeadData>(`/leads/${id}/`, updates);
    return res.data;
  },

  convertLeadToCustomer: async (leadId: string): Promise<any> => {
    const res = await apiClient.post(`/leads/${leadId}/convert/`);
    return res.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}/`);
  },

  // 3. Enquiries
  getEnquiries: async (search?: string, status?: string): Promise<EnquiryData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/enquiries/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createEnquiry: async (enquiry: EnquiryData): Promise<EnquiryData> => {
    const payload = {
      ...enquiry,
      customer_name: enquiry.customerName || enquiry.customer_name,
      machine_product: enquiry.machineProduct || enquiry.machine_product,
      requirement: enquiry.requirement || 'Commercial Machinery Requirement',
      specification: enquiry.specification || enquiry.requirement || '',
      quantity: enquiry.quantity || 1,
      enquiry_date: enquiry.enquiryDate || enquiry.enquiry_date || new Date().toISOString().split('T')[0],
      status: enquiry.status || 'new',
    };
    const res = await apiClient.post<EnquiryData>('/enquiries/', payload);
    return res.data;
  },

  updateEnquiry: async (id: string, updates: Partial<EnquiryData>): Promise<EnquiryData> => {
    const res = await apiClient.patch<EnquiryData>(`/enquiries/${id}/`, updates);
    return res.data;
  },

  // 4. Follow-ups
  getFollowUps: async (search?: string, status?: string): Promise<FollowUpData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/followups/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createFollowUp: async (followup: FollowUpData): Promise<FollowUpData> => {
    const payload = {
      ...followup,
      lead_or_customer_name: followup.leadOrCustomerName || followup.lead_or_customer_name,
      lead_or_customer_id: followup.leadOrCustomerId || followup.lead_or_customer_id || 'REF-001',
      entity_type: followup.entityType || followup.entity_type || 'lead',
      type: followup.type || 'call',
      date: followup.date || new Date().toISOString().split('T')[0],
      status: followup.status || 'pending',
      priority: followup.priority || 'medium',
    };
    const res = await apiClient.post<FollowUpData>('/followups/', payload);
    return res.data;
  },

  updateFollowUp: async (id: string, updates: Partial<FollowUpData>): Promise<FollowUpData> => {
    const res = await apiClient.patch<FollowUpData>(`/followups/${id}/`, updates);
    return res.data;
  },

  // 5. Quotations
  getQuotations: async (search?: string, status?: string): Promise<QuotationData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/quotations/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createQuotation: async (quotation: QuotationData): Promise<QuotationData> => {
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);
    const sub = quotation.subtotal || quotation.items?.reduce((s, it) => s + (it.amount || it.rate * it.quantity), 0) || 0;
    const tax = quotation.taxAmount || quotation.tax_amount || Math.round(sub * 0.18);
    const total = quotation.grandTotal || quotation.grand_total || (sub + tax);

    const payload = {
      ...quotation,
      customer_name: quotation.customerName || quotation.customer_name,
      contact_person: quotation.contactPerson || quotation.contact_person,
      machine_product: quotation.machineProduct || quotation.machine_product || 'Process Equipment',
      date: quotation.date || new Date().toISOString().split('T')[0],
      valid_until: quotation.validUntil || quotation.valid_until || validUntilDate.toISOString().split('T')[0],
      current_revision: quotation.currentRevision || quotation.current_revision || 'Rev-00',
      status: quotation.status || 'draft',
      subtotal: sub,
      tax_amount: tax,
      grand_total: total,
      total_amount: total,
    };
    const res = await apiClient.post<QuotationData>('/quotations/', payload);
    return res.data;
  },

  approveQuotation: async (id: string, approvedBy?: string, comment?: string): Promise<QuotationData> => {
    const res = await apiClient.post<QuotationData>(`/quotations/${id}/approve/`, {
      approvedBy: approvedBy || 'Admin User',
      comment: comment || 'Approved via Mobile App',
    });
    return res.data;
  },

  rejectQuotation: async (id: string, reason: string): Promise<QuotationData> => {
    const res = await apiClient.post<QuotationData>(`/quotations/${id}/reject/`, {
      reason: reason || 'Commercial or technical adjustment required',
    });
    return res.data;
  },

  // 6. Sales Orders
  getSalesOrders: async (search?: string, status?: string): Promise<SalesOrderData[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get('/sales-orders/', { params });
    const data = res.data?.results || res.data;
    return Array.isArray(data) ? data : [];
  },

  createSalesOrder: async (order: SalesOrderData): Promise<SalesOrderData> => {
    const targetDelivery = new Date();
    targetDelivery.setDate(targetDelivery.getDate() + 45);

    const payload = {
      ...order,
      customer_name: order.customerName || order.customer_name,
      customer_po_number: order.customerPoNumber || order.customer_po_number || 'DIRECT-PO',
      order_date: order.orderDate || order.order_date || new Date().toISOString().split('T')[0],
      target_delivery_date: order.targetDeliveryDate || order.target_delivery_date || targetDelivery.toISOString().split('T')[0],
      grand_total: order.grandTotal || order.grand_total || order.totalAmount || 0,
      total_amount: order.totalAmount || order.total_amount || order.grandTotal || 0,
      status: order.status || 'confirmed',
      payment_terms: order.paymentTerms || order.payment_terms || '30% Advance, 70% on Dispatch',
    };
    const res = await apiClient.post<SalesOrderData>('/sales-orders/', payload);
    return res.data;
  },

  updateSalesOrder: async (id: string, updates: Partial<SalesOrderData>): Promise<SalesOrderData> => {
    const res = await apiClient.patch<SalesOrderData>(`/sales-orders/${id}/`, updates);
    return res.data;
  },
};
