import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR ACCOUNTING & FINANCE
// ==========================================

export interface FinancialYearItem {
  id: string;
  name: string;
  fy_code: string;
  fyCode?: string;
  start_date: string;
  startDate?: string;
  end_date: string;
  endDate?: string;
  status: 'Active' | 'Closed' | 'Previous' | string;
  closed_date?: string;
  closedDate?: string;
  closed_by?: string;
  closedBy?: string;
}

export interface ChartOfAccountItem {
  id: string;
  account_code: string;
  accountCode?: string;
  account_name: string;
  accountName?: string;
  account_group?: string;
  accountGroup?: string;
  category: 'Assets' | 'Liabilities' | 'Income' | 'Expenses' | 'Equity' | string;
  account_type: string;
  accountType?: string;
  opening_balance: number;
  openingBalance?: number;
  current_balance: number;
  currentBalance?: number;
  tax_applicability?: boolean;
  taxApplicability?: boolean;
  status: 'Active' | 'Inactive' | string;
}

export interface TaxMasterItem {
  id: string;
  tax_code: string;
  taxCode?: string;
  tax_name: string;
  taxName?: string;
  tax_type: string;
  taxType?: string;
  rate_percent: number;
  ratePercent?: number;
  cgst_rate?: number;
  cgstRate?: number;
  sgst_rate?: number;
  sgstRate?: number;
  igst_rate?: number;
  igstRate?: number;
  hsn_sac_code?: string;
  hsnSacCode?: string;
  status: 'Active' | 'Inactive' | string;
}

export interface CostCenterItem {
  id: string;
  cost_center_code: string;
  costCenterCode?: string;
  cost_center_name: string;
  costCenterName?: string;
  department?: string;
  manager_name?: string;
  managerName?: string;
  status: 'Active' | 'Inactive' | string;
}

export interface InvoiceLineItem {
  id?: string;
  item_code?: string;
  itemCode?: string;
  item_name?: string;
  itemName?: string;
  description: string;
  hsn_sac?: string;
  hsnSac?: string;
  quantity: number;
  uom?: string;
  rate: number;
  unit_price?: number;
  unitPrice?: number;
  tax_rate?: number;
  taxRate?: number;
  taxable_amount?: number;
  taxableAmount?: number;
  tax_amount?: number;
  taxAmount?: number;
  total_amount: number;
  totalAmount?: number;
}

export interface SalesInvoiceItem {
  id: string;
  invoice_number: string;
  invoiceNumber?: string;
  invoice_date: string;
  invoiceDate?: string;
  due_date: string;
  dueDate?: string;
  customer_id: string;
  customerId?: string;
  customer_code?: string;
  customerCode?: string;
  customer_name: string;
  customerName?: string;
  customer_gstin?: string;
  customerGstin?: string;
  billing_address?: string;
  billingAddress?: string;
  shipping_address?: string;
  shippingAddress?: string;
  place_of_supply?: string;
  placeOfSupply?: string;
  sales_order_number?: string;
  salesOrderNumber?: string;
  customer_po_number?: string;
  customerPoNumber?: string;
  project_id?: string;
  projectId?: string;
  job_number?: string;
  jobNumber?: string;
  payment_terms?: string;
  paymentTerms?: string;
  items?: InvoiceLineItem[];
  taxable_amount: number;
  taxableAmount?: number;
  cgst_amount?: number;
  cgstAmount?: number;
  sgst_amount?: number;
  sgstAmount?: number;
  igst_amount?: number;
  igstAmount?: number;
  tax_total?: number;
  taxTotal?: number;
  grand_total: number;
  grandTotal?: number;
  paid_amount?: number;
  paidAmount?: number;
  outstanding_amount?: number;
  outstandingAmount?: number;
  status: 'Draft' | 'Approved' | 'Posted' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | string;
  payment_status?: 'Paid' | 'Unpaid' | 'Partially Paid' | string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partially Paid' | string;
  created_by?: string;
  createdBy?: string;
  created_at?: string;
  createdAt?: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  invoice_number: string;
  invoiceNumber?: string;
  vendor_invoice_number?: string;
  vendorInvoiceNumber?: string;
  invoice_date: string;
  invoiceDate?: string;
  due_date: string;
  dueDate?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  supplier_gstin?: string;
  supplierGstin?: string;
  po_number?: string;
  poNumber?: string;
  grn_number?: string;
  grnNumber?: string;
  items?: InvoiceLineItem[];
  taxable_amount: number;
  taxableAmount?: number;
  cgst_amount?: number;
  cgstAmount?: number;
  sgst_amount?: number;
  sgstAmount?: number;
  igst_amount?: number;
  igstAmount?: number;
  grand_total: number;
  grandTotal?: number;
  paid_amount?: number;
  paidAmount?: number;
  outstanding_amount?: number;
  outstandingAmount?: number;
  status: 'Draft' | 'Posted' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | string;
  payment_status?: 'Paid' | 'Unpaid' | 'Partially Paid' | string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partially Paid' | string;
  created_by?: string;
  createdBy?: string;
  created_at?: string;
  createdAt?: string;
}

export interface CustomerReceiptItem {
  id: string;
  receipt_number: string;
  receiptNumber?: string;
  receipt_date: string;
  receiptDate?: string;
  date?: string;
  customer_id: string;
  customerId?: string;
  customer_name: string;
  customerName?: string;
  sales_invoice_number?: string;
  salesInvoiceNumber?: string;
  payment_mode: string;
  paymentMode?: string;
  bank_name?: string;
  bankName?: string;
  amount: number;
  amount_paid?: number;
  amountPaid?: number;
  reference_number?: string;
  referenceNumber?: string;
  tds_deducted_by_customer?: number;
  tdsDeductedByCustomer?: number;
  status: 'Received' | 'Posted' | 'Cancelled' | string;
  remarks?: string;
  created_by?: string;
  createdBy?: string;
}

export interface SupplierPaymentItem {
  id: string;
  payment_number: string;
  paymentNumber?: string;
  payment_date: string;
  paymentDate?: string;
  date?: string;
  supplier_id: string;
  supplierId?: string;
  supplier_name: string;
  supplierName?: string;
  purchase_invoice_number?: string;
  purchaseInvoiceNumber?: string;
  payment_mode: string;
  paymentMode?: string;
  bank_name?: string;
  bankName?: string;
  amount: number;
  amount_paid?: number;
  amountPaid?: number;
  reference_number?: string;
  referenceNumber?: string;
  status: 'Paid' | 'Posted' | 'Cancelled' | string;
  remarks?: string;
  created_by?: string;
  createdBy?: string;
}

export interface JournalLineItem {
  account_code: string;
  accountCode?: string;
  account_name: string;
  accountName?: string;
  debit: number;
  debit_amount?: number;
  debitAmount?: number;
  credit: number;
  credit_amount?: number;
  creditAmount?: number;
  narration?: string;
}

export interface JournalEntryItem {
  id: string;
  journal_number: string;
  journalNumber?: string;
  journal_date: string;
  journalDate?: string;
  voucher_type: 'Journal' | 'Adjustment' | 'Depreciation' | 'Opening' | string;
  voucherType?: string;
  narration: string;
  lines: JournalLineItem[];
  total_debit: number;
  totalDebit?: number;
  total_credit: number;
  totalCredit?: number;
  status: 'Draft' | 'Approved' | 'Posted' | 'Reversed' | string;
  created_by?: string;
  createdBy?: string;
}

export interface BankAccountItem {
  id: string;
  account_name?: string;
  accountName?: string;
  account_type: 'Current' | 'Savings' | 'Overdraft' | 'Cash' | string;
  accountType?: string;
  bank_name: string;
  bankName?: string;
  account_number: string;
  accountNumber?: string;
  ifsc_code?: string;
  ifscCode?: string;
  branch?: string;
  branch_name?: string;
  opening_balance: number;
  openingBalance?: number;
  current_balance: number;
  currentBalance?: number;
  status?: string;
}

export interface ExpenseEntryItem {
  id: string;
  expense_number: string;
  expenseNumber?: string;
  expense_date: string;
  expenseDate?: string;
  category: string;
  claimed_by?: string;
  claimedBy?: string;
  vendor_name?: string;
  vendorName?: string;
  sub_total?: number;
  subTotal?: number;
  tax_amount?: number;
  taxAmount?: number;
  grand_total: number;
  grandTotal?: number;
  payment_mode?: string;
  paymentMode?: string;
  bank_cash_account_name?: string;
  status: 'Pending_Approval' | 'Approved' | 'Paid' | 'Rejected' | string;
  description?: string;
}

export interface FixedAssetItem {
  id: string;
  asset_code: string;
  assetCode?: string;
  asset_name: string;
  assetName?: string;
  category: string;
  purchase_date: string;
  purchaseDate?: string;
  purchase_cost?: number;
  purchaseCost?: number;
  useful_life_years?: number;
  usefulLifeYears?: number;
  depreciation_method?: string;
  depreciationMethod?: string;
  current_book_value: number;
  currentBookValue?: number;
  location?: string;
  status: 'Active' | 'Disposed' | string;
}

export interface AccountingDashboardMetrics {
  monthlyRevenueExpense: {
    month: string;
    Revenue: number;
    Expense: number;
    Profit: number;
  }[];
  cashFlow: {
    month: string;
    Inflow: number;
    Outflow: number;
    NetBalance: number;
  }[];
  arAging: {
    name: string;
    amount: number;
    color: string;
  }[];
  apAging: {
    name: string;
    amount: number;
    color: string;
  }[];
  expenseBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  totalSalesInvoices: number;
  totalPurchaseInvoices: number;
  totalReceipts: number;
  totalPayments: number;
}

// ==========================================
// CENTRALIZED ACCOUNTING API SERVICE CLIENT
// ==========================================

export const accountingApi = {
  // 1. Dashboard Metrics
  async getDashboardMetrics(): Promise<AccountingDashboardMetrics | null> {
    try {
      const res = await apiClient.get('/accounting/dashboard-metrics/');
      return res.data;
    } catch {
      return null;
    }
  },

  // 2. Chart of Accounts
  async getChartOfAccounts(params?: Record<string, any>): Promise<ChartOfAccountItem[]> {
    try {
      const res = await apiClient.get('/chart-of-accounts/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/chart-of-accounts/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createChartOfAccount(data: Partial<ChartOfAccountItem>): Promise<ChartOfAccountItem> {
    try {
      const res = await apiClient.post('/chart-of-accounts/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/chart-of-accounts/', data);
      return res.data;
    }
  },

  // 3. Financial Years
  async getFinancialYears(): Promise<FinancialYearItem[]> {
    try {
      const res = await apiClient.get('/financial-years/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/financial-years/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 4. Tax Master (GST Rates)
  async getTaxes(): Promise<TaxMasterItem[]> {
    try {
      const res = await apiClient.get('/taxes/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/taxes/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 5. Cost Centers
  async getCostCenters(): Promise<CostCenterItem[]> {
    try {
      const res = await apiClient.get('/cost-centers/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/cost-centers/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  // 6. Sales Invoices (Accounts Receivable)
  async getSalesInvoices(params?: Record<string, any>): Promise<SalesInvoiceItem[]> {
    try {
      const res = await apiClient.get('/sales-invoices/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/sales-invoices/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createSalesInvoice(data: Partial<SalesInvoiceItem>): Promise<SalesInvoiceItem> {
    try {
      const res = await apiClient.post('/sales-invoices/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/sales-invoices/', data);
      return res.data;
    }
  },

  async recordSalesInvoicePayment(
    invoiceId: string,
    payload: { amount: number; payment_mode?: string; reference_number?: string; bank_name?: string }
  ): Promise<any> {
    try {
      const res = await apiClient.post(`/sales-invoices/${invoiceId}/record-payment/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/accounting/sales-invoices/${invoiceId}/record-payment/`, payload);
      return res.data;
    }
  },

  async postSalesInvoice(invoiceId: string): Promise<SalesInvoiceItem> {
    const res = await apiClient.post(`/sales-invoices/${invoiceId}/post/`);
    return res.data;
  },

  // 7. Purchase Invoices (Accounts Payable)
  async getPurchaseInvoices(params?: Record<string, any>): Promise<PurchaseInvoiceItem[]> {
    try {
      const res = await apiClient.get('/purchase-invoices/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/purchase-invoices/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createPurchaseInvoice(data: Partial<PurchaseInvoiceItem>): Promise<PurchaseInvoiceItem> {
    try {
      const res = await apiClient.post('/purchase-invoices/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/purchase-invoices/', data);
      return res.data;
    }
  },

  async recordPurchaseInvoicePayment(
    invoiceId: string,
    payload: { amount: number; payment_mode?: string; reference_number?: string; bank_name?: string }
  ): Promise<any> {
    try {
      const res = await apiClient.post(`/purchase-invoices/${invoiceId}/record-payment/`, payload);
      return res.data;
    } catch {
      const res = await apiClient.post(`/accounting/purchase-invoices/${invoiceId}/record-payment/`, payload);
      return res.data;
    }
  },

  // 8. Customer Receipts
  async getCustomerReceipts(params?: Record<string, any>): Promise<CustomerReceiptItem[]> {
    try {
      const res = await apiClient.get('/customer-receipts/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/customer-receipts/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createCustomerReceipt(data: Partial<CustomerReceiptItem>): Promise<CustomerReceiptItem> {
    try {
      const res = await apiClient.post('/customer-receipts/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/customer-receipts/', data);
      return res.data;
    }
  },

  // 9. Supplier Payments
  async getSupplierPayments(params?: Record<string, any>): Promise<SupplierPaymentItem[]> {
    try {
      const res = await apiClient.get('/supplier-payments/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/supplier-payments/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createSupplierPayment(data: Partial<SupplierPaymentItem>): Promise<SupplierPaymentItem> {
    try {
      const res = await apiClient.post('/supplier-payments/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/supplier-payments/', data);
      return res.data;
    }
  },

  // 10. Journal Entries (General Ledger)
  async getJournalEntries(params?: Record<string, any>): Promise<JournalEntryItem[]> {
    try {
      const res = await apiClient.get('/journal-entries/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/journal-entries/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createJournalEntry(data: Partial<JournalEntryItem>): Promise<JournalEntryItem> {
    try {
      const res = await apiClient.post('/journal-entries/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/journal-entries/', data);
      return res.data;
    }
  },

  // 11. Bank Accounts
  async getBankAccounts(): Promise<BankAccountItem[]> {
    try {
      const res = await apiClient.get('/bank-accounts/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/bank-accounts/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createBankAccount(data: Partial<BankAccountItem>): Promise<BankAccountItem> {
    try {
      const res = await apiClient.post('/bank-accounts/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/bank-accounts/', data);
      return res.data;
    }
  },

  // 12. Expenses
  async getExpenses(params?: Record<string, any>): Promise<ExpenseEntryItem[]> {
    try {
      const res = await apiClient.get('/expenses/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/expenses/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },

  async createExpense(data: Partial<ExpenseEntryItem>): Promise<ExpenseEntryItem> {
    try {
      const res = await apiClient.post('/expenses/', data);
      return res.data;
    } catch {
      const res = await apiClient.post('/accounting/expenses/', data);
      return res.data;
    }
  },

  // 13. Fixed Assets
  async getFixedAssets(params?: Record<string, any>): Promise<FixedAssetItem[]> {
    try {
      const res = await apiClient.get('/fixed-assets/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    } catch {
      const res = await apiClient.get('/accounting/fixed-assets/', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  },
};
