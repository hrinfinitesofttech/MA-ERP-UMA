import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Scale,
  Wallet,
  Briefcase,
  Layers,
  Search,
  X,
  Info,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  accountingApi,
  SalesInvoiceItem,
  PurchaseInvoiceItem,
  CustomerReceiptItem,
  SupplierPaymentItem,
  JournalEntryItem,
  ChartOfAccountItem,
  BankAccountItem,
  ExpenseEntryItem,
  AccountingDashboardMetrics,
} from '../../api/accounting';

interface AccountingFinanceScreenProps {
  onBackToDashboard: () => void;
}

type AccountingTab =
  | 'dashboard'
  | 'sales_invoices'
  | 'purchase_invoices'
  | 'receipts_payments'
  | 'chart_of_accounts'
  | 'journal_entries';

export const AccountingFinanceScreen: React.FC<AccountingFinanceScreenProps> = ({
  onBackToDashboard,
}) => {
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<AccountingTab>('dashboard');
  const [receiptPaymentMode, setReceiptPaymentMode] = useState<'receipts' | 'payments'>('receipts');
  const [journalSubTab, setJournalSubTab] = useState<'journals' | 'expenses'>('journals');

  // Loading & State Stores
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Data Stores
  const [dashboardMetrics, setDashboardMetrics] = useState<AccountingDashboardMetrics | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceItem[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceItem[]>([]);
  const [customerReceipts, setCustomerReceipts] = useState<CustomerReceiptItem[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPaymentItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryItem[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccountItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntryItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('ALL');
  const [accountCategoryFilter, setAccountCategoryFilter] = useState('ALL');

  // Inspector & Modals
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoiceItem | PurchaseInvoiceItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<{ id: string; number: string; party: string; amount: number; isSales: boolean } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // New Sales Invoice Modal
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invCustomer, setInvCustomer] = useState('');
  const [invTaxable, setInvTaxable] = useState('');
  const [invGstRate, setInvGstRate] = useState('18');
  const [invDueDate, setInvDueDate] = useState('');
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // New Journal Entry Modal
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [journalNarration, setJournalNarration] = useState('');
  const [journalDebitAcc, setJournalDebitAcc] = useState('');
  const [journalDebitAmt, setJournalDebitAmt] = useState('');
  const [journalCreditAcc, setJournalCreditAcc] = useState('');
  const [journalCreditAmt, setJournalCreditAmt] = useState('');
  const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);

  // New Account Modal
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [accCode, setAccCode] = useState('');
  const [accName, setAccName] = useState('');
  const [accCategory, setAccCategory] = useState<'Assets' | 'Liabilities' | 'Income' | 'Expenses' | 'Equity'>('Assets');
  const [accOpening, setAccOpening] = useState('0');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch Authoritative Accounting Data
  const loadAccountingData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [metrics, si, pi, cr, sp, je, coa, ba, exp] = await Promise.all([
        accountingApi.getDashboardMetrics().catch(() => null),
        accountingApi.getSalesInvoices().catch(() => []),
        accountingApi.getPurchaseInvoices().catch(() => []),
        accountingApi.getCustomerReceipts().catch(() => []),
        accountingApi.getSupplierPayments().catch(() => []),
        accountingApi.getJournalEntries().catch(() => []),
        accountingApi.getChartOfAccounts().catch(() => []),
        accountingApi.getBankAccounts().catch(() => []),
        accountingApi.getExpenses().catch(() => []),
      ]);

      setDashboardMetrics(metrics);
      setSalesInvoices(si);
      setPurchaseInvoices(pi);
      setCustomerReceipts(cr);
      setSupplierPayments(sp);
      setJournalEntries(je);
      setChartOfAccounts(coa);
      setBankAccounts(ba);
      setExpenseEntries(exp);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sync financial data from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAccountingData();
  }, [loadAccountingData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAccountingData();
  };

  // 2. Computed Financial Totals
  const totalSalesVal = useMemo(() => {
    return salesInvoices.reduce((acc, inv) => acc + (Number(inv.grand_total || inv.grandTotal) || 0), 0);
  }, [salesInvoices]);

  const totalPurchaseVal = useMemo(() => {
    return purchaseInvoices.reduce((acc, inv) => acc + (Number(inv.grand_total || inv.grandTotal) || 0), 0);
  }, [purchaseInvoices]);

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((acc, b) => acc + (Number(b.current_balance || b.currentBalance) || 0), 0);
  }, [bankAccounts]);

  const totalAROutstanding = useMemo(() => {
    return salesInvoices.reduce((acc, inv) => {
      const out = inv.outstanding_amount !== undefined ? inv.outstanding_amount : (inv.outstandingAmount !== undefined ? inv.outstandingAmount : (inv.grand_total || inv.grandTotal || 0) - (inv.paid_amount || inv.paidAmount || 0));
      return acc + (Number(out) || 0);
    }, 0);
  }, [salesInvoices]);

  const totalAPOutstanding = useMemo(() => {
    return purchaseInvoices.reduce((acc, inv) => {
      const out = inv.outstanding_amount !== undefined ? inv.outstanding_amount : (inv.outstandingAmount !== undefined ? inv.outstandingAmount : (inv.grand_total || inv.grandTotal || 0) - (inv.paid_amount || inv.paidAmount || 0));
      return acc + (Number(out) || 0);
    }, 0);
  }, [purchaseInvoices]);

  // Filtered Sales Invoices
  const filteredSalesInvoices = useMemo(() => {
    return salesInvoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (inv.invoice_number || inv.invoiceNumber || '').toLowerCase();
      const cust = (inv.customer_name || inv.customerName || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || cust.includes(q);
      if (!matchesSearch) return false;

      if (invoiceStatusFilter === 'ALL') return true;
      const st = (inv.status || inv.payment_status || inv.paymentStatus || '').toUpperCase();
      if (invoiceStatusFilter === 'PAID') return st === 'PAID';
      if (invoiceStatusFilter === 'PARTIALLY_PAID') return st.includes('PARTIAL');
      if (invoiceStatusFilter === 'UNPAID') return st.includes('UNPAID') || st.includes('DRAFT');
      if (invoiceStatusFilter === 'POSTED') return st.includes('POST');
      return true;
    });
  }, [salesInvoices, searchQuery, invoiceStatusFilter]);

  // Filtered Purchase Invoices
  const filteredPurchaseInvoices = useMemo(() => {
    return purchaseInvoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (inv.invoice_number || inv.invoiceNumber || '').toLowerCase();
      const sup = (inv.supplier_name || inv.supplierName || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || sup.includes(q);
      if (!matchesSearch) return false;

      if (invoiceStatusFilter === 'ALL') return true;
      const st = (inv.status || inv.payment_status || inv.paymentStatus || '').toUpperCase();
      if (invoiceStatusFilter === 'PAID') return st === 'PAID';
      if (invoiceStatusFilter === 'PARTIALLY_PAID') return st.includes('PARTIAL');
      if (invoiceStatusFilter === 'UNPAID') return st.includes('UNPAID') || st.includes('DRAFT');
      if (invoiceStatusFilter === 'POSTED') return st.includes('POST');
      return true;
    });
  }, [purchaseInvoices, searchQuery, invoiceStatusFilter]);

  // Filtered Chart of Accounts
  const filteredAccounts = useMemo(() => {
    return chartOfAccounts.filter((acc) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (acc.account_code || acc.accountCode || '').toLowerCase();
      const name = (acc.account_name || acc.accountName || '').toLowerCase();
      const matchesSearch = !q || code.includes(q) || name.includes(q);
      if (!matchesSearch) return false;

      if (accountCategoryFilter === 'ALL') return true;
      return (acc.category || '').toUpperCase() === accountCategoryFilter.toUpperCase();
    });
  }, [chartOfAccounts, searchQuery, accountCategoryFilter]);

  // -------------------------------------------------------------
  // ACTION HANDLERS (STRICT VALIDATION)
  // -------------------------------------------------------------

  // Record Payment Handler
  const handleRecordPayment = async () => {
    if (!paymentTargetInvoice) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive payment amount.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const payload = {
        amount: amt,
        payment_mode: paymentMode,
        reference_number: paymentRef.trim() || `PAY-${Date.now().toString().slice(-4)}`,
        bank_name: 'HDFC Bank Corporate A/c',
      };

      if (paymentTargetInvoice.isSales) {
        await accountingApi.recordSalesInvoicePayment(paymentTargetInvoice.id, payload);
        showToast(`Receipt of ₹${amt.toLocaleString('en-IN')} recorded against ${paymentTargetInvoice.number}!`);
      } else {
        await accountingApi.recordPurchaseInvoicePayment(paymentTargetInvoice.id, payload);
        showToast(`Payment of ₹${amt.toLocaleString('en-IN')} recorded for ${paymentTargetInvoice.number}!`);
      }

      setShowPaymentModal(false);
      setPaymentTargetInvoice(null);
      setPaymentAmount('');
      setPaymentRef('');
      loadAccountingData();
    } catch (err: any) {
      Alert.alert('Payment Failed', err?.response?.data?.error || err?.message || 'Server rejected payment entry.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Create Sales Invoice Handler
  const handleCreateSalesInvoice = async () => {
    const cust = invCustomer.trim();
    const taxable = parseFloat(invTaxable);
    const gstRate = parseFloat(invGstRate) || 18;

    if (!cust || isNaN(taxable) || taxable <= 0) {
      Alert.alert('Validation Error', 'Customer name and valid taxable amount are required.');
      return;
    }

    const cgst = (taxable * (gstRate / 2)) / 100;
    const sgst = (taxable * (gstRate / 2)) / 100;
    const total = taxable + cgst + sgst;

    setIsSubmittingInvoice(true);
    try {
      const payload: Partial<SalesInvoiceItem> = {
        customer_name: cust,
        customer_id: 'CUST-001',
        customer_gstin: '24AAACU1234F1Z5',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: invDueDate.trim() || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        taxable_amount: taxable,
        cgst_amount: cgst,
        sgst_amount: sgst,
        grand_total: total,
        status: 'Posted',
        payment_status: 'Unpaid',
      };

      await accountingApi.createSalesInvoice(payload);
      showToast(`Sales Invoice created for ${cust} (₹${total.toLocaleString('en-IN')})`);
      setShowNewInvoiceModal(false);
      setInvCustomer('');
      setInvTaxable('');
      loadAccountingData();
    } catch (err: any) {
      Alert.alert('Invoice Creation Failed', err?.response?.data?.error || err?.message || 'Server rejected invoice.');
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  // Create Journal Entry Handler (Balanced Check)
  const handleCreateJournalEntry = async () => {
    const dAmt = parseFloat(journalDebitAmt);
    const cAmt = parseFloat(journalCreditAmt);

    if (!journalNarration.trim() || !journalDebitAcc.trim() || !journalCreditAcc.trim()) {
      Alert.alert('Validation Error', 'Narration, Debit Account, and Credit Account are mandatory.');
      return;
    }

    if (isNaN(dAmt) || isNaN(cAmt) || dAmt <= 0 || cAmt <= 0) {
      Alert.alert('Validation Error', 'Debit and Credit amounts must be positive numbers.');
      return;
    }

    // Strict Double-Entry Balance Guard
    if (Math.abs(dAmt - cAmt) > 0.01) {
      Alert.alert(
        'Unbalanced Journal Error',
        `Double-entry accounting requires Total Debit equal to Total Credit.\nDebit: ₹${dAmt} | Credit: ₹${cAmt}\nDifference: ₹${Math.abs(dAmt - cAmt)}`
      );
      return;
    }

    setIsSubmittingJournal(true);
    try {
      const payload: Partial<JournalEntryItem> = {
        journal_number: `JV-2026-${Date.now().toString().slice(-4)}`,
        journal_date: new Date().toISOString().split('T')[0],
        voucher_type: 'Journal',
        narration: journalNarration.trim(),
        total_debit: dAmt,
        total_credit: cAmt,
        status: 'Posted',
        lines: [
          { account_code: journalDebitAcc.trim(), account_name: journalDebitAcc.trim(), debit: dAmt, credit: 0 },
          { account_code: journalCreditAcc.trim(), account_name: journalCreditAcc.trim(), debit: 0, credit: cAmt },
        ],
      };

      await accountingApi.createJournalEntry(payload);
      showToast(`Balanced Journal Entry posted (₹${dAmt.toLocaleString('en-IN')})`);
      setShowNewJournalModal(false);
      setJournalNarration('');
      setJournalDebitAcc('');
      setJournalDebitAmt('');
      setJournalCreditAcc('');
      setJournalCreditAmt('');
      loadAccountingData();
    } catch (err: any) {
      Alert.alert('Journal Entry Failed', err?.response?.data?.error || err?.message || 'Server rejected journal voucher.');
    } finally {
      setIsSubmittingJournal(false);
    }
  };

  // Create Account Handler
  const handleCreateAccount = async () => {
    if (!accCode.trim() || !accName.trim()) {
      Alert.alert('Validation Error', 'Account Code and Account Name are required.');
      return;
    }

    setIsSubmittingAccount(true);
    try {
      const payload: Partial<ChartOfAccountItem> = {
        account_code: accCode.trim(),
        account_name: accName.trim(),
        category: accCategory,
        account_type: accCategory === 'Assets' ? 'Asset' : accCategory === 'Liabilities' ? 'Liability' : accCategory === 'Income' ? 'Income' : 'Expense',
        opening_balance: parseFloat(accOpening) || 0,
        current_balance: parseFloat(accOpening) || 0,
        status: 'Active',
      };

      await accountingApi.createChartOfAccount(payload);
      showToast(`Account ${accCode.trim()} created!`);
      setShowNewAccountModal(false);
      setAccCode('');
      setAccName('');
      setAccOpening('0');
      loadAccountingData();
    } catch (err: any) {
      Alert.alert('Account Creation Failed', err?.response?.data?.error || err?.message || 'Server rejected account.');
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Toast Notification */}
      {successToast && (
        <View style={styles.toastBanner}>
          <CheckCircle2 size={18} color={colors.textInverse} />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* Executive Financial KPI Summary Ribbon */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <TrendingUp size={16} color={colors.primary} />
            <Text style={styles.kpiValue}>₹{(totalSalesVal / 100000).toFixed(2)}L</Text>
            <Text style={styles.kpiLabel}>Sales Revenue</Text>
          </View>
          <View style={styles.kpiCard}>
            <TrendingDown size={16} color={colors.danger} />
            <Text style={[styles.kpiValue, { color: colors.danger }]}>₹{(totalPurchaseVal / 100000).toFixed(2)}L</Text>
            <Text style={styles.kpiLabel}>Purchases (AP)</Text>
          </View>
          <View style={styles.kpiCard}>
            <Wallet size={16} color={colors.success} />
            <Text style={[styles.kpiValue, { color: colors.success }]}>₹{(totalBankBalance / 100000).toFixed(2)}L</Text>
            <Text style={styles.kpiLabel}>Cash & Bank</Text>
          </View>
          <View style={styles.kpiCard}>
            <Coins size={16} color={colors.warning} />
            <Text style={[styles.kpiValue, { color: colors.warning }]}>₹{(totalAROutstanding / 100000).toFixed(2)}L</Text>
            <Text style={styles.kpiLabel}>AR Outstanding</Text>
          </View>
          <View style={styles.kpiCard}>
            <Receipt size={16} color={colors.primaryDark} />
            <Text style={styles.kpiValue}>{salesInvoices.length}</Text>
            <Text style={styles.kpiLabel}>Sales Invoices</Text>
          </View>
          <View style={styles.kpiCard}>
            <Layers size={16} color={colors.accent} />
            <Text style={styles.kpiValue}>{chartOfAccounts.length}</Text>
            <Text style={styles.kpiLabel}>Chart of Accounts</Text>
          </View>
        </ScrollView>
      </View>

      {/* Navigation Tabs (6 Segments) */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'dashboard' && styles.activeTabButton]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'sales_invoices' && styles.activeTabButton]}
            onPress={() => setActiveTab('sales_invoices')}
          >
            <Text style={[styles.tabText, activeTab === 'sales_invoices' && styles.activeTabText]}>
              Sales Invoices ({salesInvoices.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'purchase_invoices' && styles.activeTabButton]}
            onPress={() => setActiveTab('purchase_invoices')}
          >
            <Text style={[styles.tabText, activeTab === 'purchase_invoices' && styles.activeTabText]}>
              Purchase Invoices ({purchaseInvoices.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'receipts_payments' && styles.activeTabButton]}
            onPress={() => setActiveTab('receipts_payments')}
          >
            <Text style={[styles.tabText, activeTab === 'receipts_payments' && styles.activeTabText]}>
              Receipts & Payments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'chart_of_accounts' && styles.activeTabButton]}
            onPress={() => setActiveTab('chart_of_accounts')}
          >
            <Text style={[styles.tabText, activeTab === 'chart_of_accounts' && styles.activeTabText]}>
              Chart of Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'journal_entries' && styles.activeTabButton]}
            onPress={() => setActiveTab('journal_entries')}
          >
            <Text style={[styles.tabText, activeTab === 'journal_entries' && styles.activeTabText]}>
              Journal Entries
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading authoritative accounting state...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <AlertTriangle size={36} color={colors.danger} />
          <Text style={styles.errorTitle}>Synchronization Error</Text>
          <Text style={styles.errorSubtitle}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAccountingData}>
            <Text style={styles.retryButtonText}>Retry Sync</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <View style={styles.tabContent}>
              {/* Liquidity & Bank Balances */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Wallet size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Bank & Liquidity Accounts</Text>
                </View>
                {bankAccounts.length === 0 ? (
                  <Text style={styles.emptyText}>No bank accounts registered.</Text>
                ) : (
                  bankAccounts.map((b) => (
                    <View key={b.id} style={styles.bankRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankName}>{b.bank_name || b.bankName}</Text>
                        <Text style={styles.bankMeta}>
                          A/c: {b.account_number || b.accountNumber} | IFSC: {b.ifsc_code || b.ifscCode}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.bankBalance}>
                          ₹{Number(b.current_balance || b.currentBalance || 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.bankStatus}>{b.account_type || b.accountType || 'Current'}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Accounts Receivable (AR) Aging */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Accounts Receivable (AR) Aging</Text>
                </View>
                <View style={styles.agingGrid}>
                  {(dashboardMetrics?.arAging || [
                    { name: '0-30 Days', amount: 0, color: colors.success },
                    { name: '31-60 Days', amount: 0, color: colors.primary },
                    { name: '61-90 Days', amount: 0, color: colors.warning },
                    { name: '90+ Days', amount: 0, color: colors.danger },
                  ]).map((bucket) => (
                    <View key={bucket.name} style={[styles.agingCard, { borderLeftColor: bucket.color || colors.primary }]}>
                      <Text style={styles.agingLabel}>{bucket.name}</Text>
                      <Text style={styles.agingAmount}>₹{Number(bucket.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Accounts Payable (AP) Aging */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <TrendingDown size={18} color={colors.danger} />
                  <Text style={styles.sectionTitle}>Accounts Payable (AP) Aging</Text>
                </View>
                <View style={styles.agingGrid}>
                  {(dashboardMetrics?.apAging || [
                    { name: '0-30 Days', amount: 0, color: colors.success },
                    { name: '31-60 Days', amount: 0, color: colors.primary },
                    { name: '61-90 Days', amount: 0, color: colors.warning },
                    { name: '90+ Days', amount: 0, color: colors.danger },
                  ]).map((bucket) => (
                    <View key={bucket.name} style={[styles.agingCard, { borderLeftColor: bucket.color || colors.danger }]}>
                      <Text style={styles.agingLabel}>{bucket.name}</Text>
                      <Text style={styles.agingAmount}>₹{Number(bucket.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Actions Hub */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Briefcase size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Financial Operations Hub</Text>
                </View>
                <View style={styles.actionGrid}>
                  <TouchableOpacity style={styles.hubBtn} onPress={() => setShowNewInvoiceModal(true)}>
                    <Receipt size={20} color={colors.primary} />
                    <Text style={styles.hubBtnText}>Create Sales Invoice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.hubBtn} onPress={() => setShowNewJournalModal(true)}>
                    <Scale size={20} color={colors.primaryDark} />
                    <Text style={styles.hubBtnText}>Post Journal Entry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.hubBtn} onPress={() => setShowNewAccountModal(true)}>
                    <Layers size={20} color={colors.accent} />
                    <Text style={styles.hubBtnText}>Add GL Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: SALES INVOICES (AR) */}
          {activeTab === 'sales_invoices' && (
            <View style={styles.tabContent}>
              {/* Search & Actions Bar */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Search size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search invoice number or customer..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewInvoiceModal(true)}>
                  <Plus size={18} color={colors.textInverse} />
                </TouchableOpacity>
              </View>

              {/* Status Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
                {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'POSTED'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.filterChip, invoiceStatusFilter === st && styles.activeFilterChip]}
                    onPress={() => setInvoiceStatusFilter(st)}
                  >
                    <Text style={[styles.filterChipText, invoiceStatusFilter === st && styles.activeFilterChipText]}>
                      {st.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Invoices List */}
              {filteredSalesInvoices.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Receipt size={36} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Sales Invoices Found</Text>
                  <Text style={styles.emptySubtitle}>Tap the '+' button above to generate a new customer invoice.</Text>
                </View>
              ) : (
                filteredSalesInvoices.map((inv) => {
                  const num = inv.invoice_number || inv.invoiceNumber || 'INV';
                  const cust = inv.customer_name || inv.customerName || 'Customer';
                  const total = Number(inv.grand_total || inv.grandTotal || 0);
                  const paid = Number(inv.paid_amount || inv.paidAmount || 0);
                  const out = Number(inv.outstanding_amount !== undefined ? inv.outstanding_amount : (inv.outstandingAmount !== undefined ? inv.outstandingAmount : total - paid));
                  const st = inv.payment_status || inv.paymentStatus || inv.status || 'Unpaid';

                  return (
                    <View key={inv.id} style={styles.invoiceCard}>
                      <View style={styles.invTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invNumber}>{num}</Text>
                          <Text style={styles.invParty}>{cust}</Text>
                        </View>
                        <View style={[styles.statusBadge, st === 'Paid' ? styles.statusPaid : styles.statusUnpaid]}>
                          <Text style={[styles.statusBadgeText, st === 'Paid' ? styles.statusPaidText : styles.statusUnpaidText]}>
                            {st}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.invMetaRow}>
                        <Text style={styles.invDate}>Date: {inv.invoice_date || inv.invoiceDate}</Text>
                        <Text style={styles.invDate}>Due: {inv.due_date || inv.dueDate}</Text>
                      </View>

                      <View style={styles.invFinancialRow}>
                        <View>
                          <Text style={styles.finLabel}>Grand Total</Text>
                          <Text style={styles.finValue}>₹{total.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.finLabel}>Outstanding</Text>
                          <Text style={[styles.finValue, { color: out > 0 ? colors.danger : colors.success }]}>
                            ₹{out.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.invActionRow}>
                        <TouchableOpacity
                          style={styles.invDetailBtn}
                          onPress={() => setSelectedInvoice(inv)}
                        >
                          <Info size={14} color={colors.primary} />
                          <Text style={styles.invDetailBtnText}>Inspect Details</Text>
                        </TouchableOpacity>

                        {out > 0 && (
                          <TouchableOpacity
                            style={styles.invPayBtn}
                            onPress={() => {
                              setPaymentTargetInvoice({
                                id: inv.id,
                                number: num,
                                party: cust,
                                amount: out,
                                isSales: true,
                              });
                              setPaymentAmount(out.toString());
                              setShowPaymentModal(true);
                            }}
                          >
                            <CreditCard size={14} color={colors.textInverse} />
                            <Text style={styles.invPayBtnText}>Record Receipt</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: PURCHASE INVOICES (AP) */}
          {activeTab === 'purchase_invoices' && (
            <View style={styles.tabContent}>
              {/* Search Bar */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Search size={16} color={colors.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search purchase bill or supplier..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Invoices List */}
              {filteredPurchaseInvoices.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Receipt size={36} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Purchase Invoices Found</Text>
                  <Text style={styles.emptySubtitle}>Purchase invoices are recorded when GRN bills are posted.</Text>
                </View>
              ) : (
                filteredPurchaseInvoices.map((inv) => {
                  const num = inv.invoice_number || inv.invoiceNumber || 'BILL';
                  const sup = inv.supplier_name || inv.supplierName || 'Supplier';
                  const total = Number(inv.grand_total || inv.grandTotal || 0);
                  const paid = Number(inv.paid_amount || inv.paidAmount || 0);
                  const out = Number(inv.outstanding_amount !== undefined ? inv.outstanding_amount : (inv.outstandingAmount !== undefined ? inv.outstandingAmount : total - paid));
                  const st = inv.payment_status || inv.paymentStatus || inv.status || 'Unpaid';

                  return (
                    <View key={inv.id} style={styles.invoiceCard}>
                      <View style={styles.invTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invNumber}>{num}</Text>
                          <Text style={styles.invParty}>{sup}</Text>
                        </View>
                        <View style={[styles.statusBadge, st === 'Paid' ? styles.statusPaid : styles.statusUnpaid]}>
                          <Text style={[styles.statusBadgeText, st === 'Paid' ? styles.statusPaidText : styles.statusUnpaidText]}>
                            {st}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.invMetaRow}>
                        <Text style={styles.invDate}>Date: {inv.invoice_date || inv.invoiceDate}</Text>
                        <Text style={styles.invDate}>PO: {inv.po_number || inv.poNumber || 'N/A'}</Text>
                      </View>

                      <View style={styles.invFinancialRow}>
                        <View>
                          <Text style={styles.finLabel}>Bill Total</Text>
                          <Text style={styles.finValue}>₹{total.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.finLabel}>Payable Due</Text>
                          <Text style={[styles.finValue, { color: out > 0 ? colors.danger : colors.success }]}>
                            ₹{out.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.invActionRow}>
                        <TouchableOpacity
                          style={styles.invDetailBtn}
                          onPress={() => setSelectedInvoice(inv)}
                        >
                          <Info size={14} color={colors.primary} />
                          <Text style={styles.invDetailBtnText}>Inspect Bill</Text>
                        </TouchableOpacity>

                        {out > 0 && (
                          <TouchableOpacity
                            style={[styles.invPayBtn, { backgroundColor: colors.danger }]}
                            onPress={() => {
                              setPaymentTargetInvoice({
                                id: inv.id,
                                number: num,
                                party: sup,
                                amount: out,
                                isSales: false,
                              });
                              setPaymentAmount(out.toString());
                              setShowPaymentModal(true);
                            }}
                          >
                            <CreditCard size={14} color={colors.textInverse} />
                            <Text style={styles.invPayBtnText}>Issue Payment</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 4: RECEIPTS & PAYMENTS */}
          {activeTab === 'receipts_payments' && (
            <View style={styles.tabContent}>
              {/* Sub-Toggle */}
              <View style={styles.subToggleContainer}>
                <TouchableOpacity
                  style={[styles.subToggleBtn, receiptPaymentMode === 'receipts' && styles.subToggleActive]}
                  onPress={() => setReceiptPaymentMode('receipts')}
                >
                  <Text style={[styles.subToggleText, receiptPaymentMode === 'receipts' && styles.subToggleTextActive]}>
                    Customer Receipts ({customerReceipts.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subToggleBtn, receiptPaymentMode === 'payments' && styles.subToggleActive]}
                  onPress={() => setReceiptPaymentMode('payments')}
                >
                  <Text style={[styles.subToggleText, receiptPaymentMode === 'payments' && styles.subToggleTextActive]}>
                    Supplier Payments ({supplierPayments.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {receiptPaymentMode === 'receipts' ? (
                customerReceipts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Coins size={36} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Customer Receipts Yet</Text>
                    <Text style={styles.emptySubtitle}>Receipts are automatically logged when customer payments are entered.</Text>
                  </View>
                ) : (
                  customerReceipts.map((cr) => (
                    <View key={cr.id} style={styles.paymentCard}>
                      <View style={styles.paymentTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentNumber}>{cr.receipt_number || cr.receiptNumber}</Text>
                          <Text style={styles.paymentParty}>{cr.customer_name || cr.customerName}</Text>
                        </View>
                        <Text style={styles.paymentAmountInflow}>
                          +₹{Number(cr.amount || cr.amount_paid || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.paymentMeta}>
                        <Text style={styles.metaText}>Inv: {cr.sales_invoice_number || cr.salesInvoiceNumber || 'Direct'}</Text>
                        <Text style={styles.metaText}>Mode: {cr.payment_mode || cr.paymentMode}</Text>
                        <Text style={styles.metaText}>Ref: {cr.reference_number || cr.referenceNumber || 'N/A'}</Text>
                      </View>
                    </View>
                  ))
                )
              ) : supplierPayments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <CreditCard size={36} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Supplier Payments Yet</Text>
                  <Text style={styles.emptySubtitle}>Payments are recorded when purchase bills are settled.</Text>
                </View>
              ) : (
                supplierPayments.map((sp) => (
                  <View key={sp.id} style={styles.paymentCard}>
                    <View style={styles.paymentTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paymentNumber}>{sp.payment_number || sp.paymentNumber}</Text>
                        <Text style={styles.paymentParty}>{sp.supplier_name || sp.supplierName}</Text>
                      </View>
                      <Text style={styles.paymentAmountOutflow}>
                        -₹{Number(sp.amount || sp.amount_paid || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.paymentMeta}>
                      <Text style={styles.metaText}>Bill: {sp.purchase_invoice_number || sp.purchaseInvoiceNumber || 'Direct'}</Text>
                      <Text style={styles.metaText}>Mode: {sp.payment_mode || sp.paymentMode}</Text>
                      <Text style={styles.metaText}>Ref: {sp.reference_number || sp.referenceNumber || 'N/A'}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 5: CHART OF ACCOUNTS */}
          {activeTab === 'chart_of_accounts' && (
            <View style={styles.tabContent}>
              {/* Category Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
                {['ALL', 'ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSES'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, accountCategoryFilter === cat && styles.activeFilterChip]}
                    onPress={() => setAccountCategoryFilter(cat)}
                  >
                    <Text style={[styles.filterChipText, accountCategoryFilter === cat && styles.activeFilterChipText]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Accounts List */}
              {filteredAccounts.map((acc) => (
                <View key={acc.id} style={styles.accountCard}>
                  <View style={styles.accTop}>
                    <View style={styles.accCodeBadge}>
                      <Text style={styles.accCodeText}>{acc.account_code || acc.accountCode}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.accName}>{acc.account_name || acc.accountName}</Text>
                      <Text style={styles.accCategory}>
                        {acc.category} • {acc.account_group || acc.accountGroup || 'General'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.accBalance}>
                        ₹{Number(acc.current_balance || acc.currentBalance || 0).toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.accStatus}>{acc.status || 'Active'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 6: JOURNAL ENTRIES & EXPENSES */}
          {activeTab === 'journal_entries' && (
            <View style={styles.tabContent}>
              {/* Sub-Toggle */}
              <View style={styles.subToggleContainer}>
                <TouchableOpacity
                  style={[styles.subToggleBtn, journalSubTab === 'journals' && styles.subToggleActive]}
                  onPress={() => setJournalSubTab('journals')}
                >
                  <Text style={[styles.subToggleText, journalSubTab === 'journals' && styles.subToggleTextActive]}>
                    General Journal ({journalEntries.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subToggleBtn, journalSubTab === 'expenses' && styles.subToggleActive]}
                  onPress={() => setJournalSubTab('expenses')}
                >
                  <Text style={[styles.subToggleText, journalSubTab === 'expenses' && styles.subToggleTextActive]}>
                    Expenses & Overheads ({expenseEntries.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {journalSubTab === 'journals' ? (
                journalEntries.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Scale size={36} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Journal Entries Found</Text>
                    <Text style={styles.emptySubtitle}>Use the 'Post Journal Entry' action to log double-entry adjustments.</Text>
                    <TouchableOpacity style={[styles.hubBtn, { marginTop: spacing.md }]} onPress={() => setShowNewJournalModal(true)}>
                      <Text style={styles.hubBtnText}>Post Journal Entry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  journalEntries.map((je) => (
                    <View key={je.id} style={styles.journalCard}>
                      <View style={styles.journalTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.journalNumber}>{je.journal_number || je.journalNumber}</Text>
                          <Text style={styles.journalDate}>Date: {je.journal_date || je.journalDate}</Text>
                        </View>
                        <Text style={styles.journalTotal}>
                          ₹{Number(je.total_debit || je.totalDebit || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={styles.journalNarration}>{je.narration}</Text>
                      {je.lines && je.lines.length > 0 && (
                        <View style={styles.journalLines}>
                          {je.lines.map((ln, idx) => (
                            <View key={idx} style={styles.journalLineRow}>
                              <Text style={styles.lineAcc}>{ln.account_code || ln.accountCode || ln.account_name}</Text>
                              <Text style={styles.lineDr}>Dr: ₹{Number(ln.debit || ln.debit_amount || 0)}</Text>
                              <Text style={styles.lineCr}>Cr: ₹{Number(ln.credit || ln.credit_amount || 0)}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )
              ) : expenseEntries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Coins size={36} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No Factory Expense Entries</Text>
                  <Text style={styles.emptySubtitle}>Operating overheads and utility bills will appear here.</Text>
                </View>
              ) : (
                expenseEntries.map((exp) => (
                  <View key={exp.id} style={styles.paymentCard}>
                    <View style={styles.paymentTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paymentNumber}>{exp.expense_number || exp.expenseNumber}</Text>
                        <Text style={styles.paymentParty}>{exp.category} • {exp.vendor_name || exp.claimed_by}</Text>
                      </View>
                      <Text style={styles.paymentAmountOutflow}>
                        ₹{Number(exp.grand_total || exp.grandTotal || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL 1: RECORD PAYMENT / RECEIPT */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {paymentTargetInvoice?.isSales ? 'Record Customer Receipt' : 'Record Supplier Payment'}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Invoice: {paymentTargetInvoice?.number} ({paymentTargetInvoice?.party})
              </Text>

              <Text style={styles.fieldLabel}>Payment Amount (₹)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Payment Mode</Text>
              <View style={styles.modeRow}>
                {['Bank Transfer', 'NEFT', 'RTGS', 'Cheque'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeBtn, paymentMode === m && styles.modeBtnActive]}
                    onPress={() => setPaymentMode(m)}
                  >
                    <Text style={[styles.modeBtnText, paymentMode === m && styles.modeBtnTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Transaction / Reference #</Text>
              <TextInput
                style={styles.modalInput}
                value={paymentRef}
                onChangeText={setPaymentRef}
                placeholder="UTR / Cheque / Bank Ref No."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleRecordPayment}
                disabled={isSubmittingPayment}
              >
                {isSubmittingPayment ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm & Post Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: NEW SALES INVOICE */}
      <Modal visible={showNewInvoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Sales Invoice</Text>
              <TouchableOpacity onPress={() => setShowNewInvoiceModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Customer Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={invCustomer}
                onChangeText={setInvCustomer}
                placeholder="e.g. Reliance Life Sciences Ltd"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Taxable Value (₹) *</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={invTaxable}
                onChangeText={setInvTaxable}
                placeholder="Taxable amount before GST"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>GST Rate (%)</Text>
              <View style={styles.modeRow}>
                {['18', '12', '5', '0'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.modeBtn, invGstRate === r && styles.modeBtnActive]}
                    onPress={() => setInvGstRate(r)}
                  >
                    <Text style={[styles.modeBtnText, invGstRate === r && styles.modeBtnTextActive]}>{r}% GST</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Payment Due Date</Text>
              <TextInput
                style={styles.modalInput}
                value={invDueDate}
                onChangeText={setInvDueDate}
                placeholder="YYYY-MM-DD (Defaults to 30 days)"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateSalesInvoice}
                disabled={isSubmittingInvoice}
              >
                {isSubmittingInvoice ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create & Post Invoice</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: NEW JOURNAL ENTRY */}
      <Modal visible={showNewJournalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Balanced Journal Entry</Text>
              <TouchableOpacity onPress={() => setShowNewJournalModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Voucher Narration *</Text>
              <TextInput
                style={styles.modalInput}
                value={journalNarration}
                onChangeText={setJournalNarration}
                placeholder="Description of adjustment or accrual"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Debit Account *</Text>
              <TextInput
                style={styles.modalInput}
                value={journalDebitAcc}
                onChangeText={setJournalDebitAcc}
                placeholder="e.g. 1010 - Factory Equipment"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Debit Amount (₹) *</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={journalDebitAmt}
                onChangeText={setJournalDebitAmt}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Credit Account *</Text>
              <TextInput
                style={styles.modalInput}
                value={journalCreditAcc}
                onChangeText={setJournalCreditAcc}
                placeholder="e.g. 2010 - Accounts Payable"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Credit Amount (₹) *</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={journalCreditAmt}
                onChangeText={setJournalCreditAmt}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateJournalEntry}
                disabled={isSubmittingJournal}
              >
                {isSubmittingJournal ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Verify Balance & Post Voucher</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: NEW GL ACCOUNT */}
      <Modal visible={showNewAccountModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Chart of Account</Text>
              <TouchableOpacity onPress={() => setShowNewAccountModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Account Code *</Text>
              <TextInput
                style={styles.modalInput}
                value={accCode}
                onChangeText={setAccCode}
                placeholder="e.g. 1050"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Account Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={accName}
                onChangeText={setAccName}
                placeholder="e.g. Welding Electrodes Inventory"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.modeRow}>
                {(['Assets', 'Liabilities', 'Income', 'Expenses'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.modeBtn, accCategory === cat && styles.modeBtnActive]}
                    onPress={() => setAccCategory(cat)}
                  >
                    <Text style={[styles.modeBtnText, accCategory === cat && styles.modeBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Opening Balance (₹)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={accOpening}
                onChangeText={setAccOpening}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateAccount}
                disabled={isSubmittingAccount}
              >
                {isSubmittingAccount ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: 360° INVOICE INSPECTOR */}
      <Modal visible={!!selectedInvoice} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Inspector</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inspectorNumber}>
                {selectedInvoice?.invoice_number || (selectedInvoice as any)?.invoiceNumber}
              </Text>
              <Text style={styles.inspectorParty}>
                {(selectedInvoice as any)?.customer_name || (selectedInvoice as any)?.customerName || (selectedInvoice as any)?.supplier_name || (selectedInvoice as any)?.supplierName}
              </Text>

              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Invoice Date:</Text>
                <Text style={styles.inspectorValue}>
                  {selectedInvoice?.invoice_date || (selectedInvoice as any)?.invoiceDate}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Due Date:</Text>
                <Text style={styles.inspectorValue}>
                  {selectedInvoice?.due_date || (selectedInvoice as any)?.dueDate}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Taxable Amount:</Text>
                <Text style={styles.inspectorValue}>
                  ₹{Number(selectedInvoice?.taxable_amount || (selectedInvoice as any)?.taxableAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Grand Total:</Text>
                <Text style={[styles.inspectorValue, { color: colors.primary, fontWeight: '700' }]}>
                  ₹{Number(selectedInvoice?.grand_total || (selectedInvoice as any)?.grandTotal || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Paid Amount:</Text>
                <Text style={styles.inspectorValue}>
                  ₹{Number(selectedInvoice?.paid_amount || (selectedInvoice as any)?.paidAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Outstanding Balance:</Text>
                <Text style={[styles.inspectorValue, { color: colors.danger, fontWeight: '700' }]}>
                  ₹{Number(selectedInvoice?.outstanding_amount !== undefined ? selectedInvoice.outstanding_amount : (selectedInvoice as any)?.outstandingAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.inspectorRow}>
                <Text style={styles.inspectorLabel}>Payment Status:</Text>
                <Text style={styles.inspectorValue}>
                  {(selectedInvoice as any)?.payment_status || (selectedInvoice as any)?.paymentStatus || selectedInvoice?.status}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { marginTop: spacing.lg }]}
                onPress={() => setSelectedInvoice(null)}
              >
                <Text style={styles.modalSubmitBtnText}>Close Inspector</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = themedStyles(() => StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  refreshBtn: {
    padding: spacing.xs,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  toastText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },
  kpiContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  kpiScroll: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  kpiCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 105,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabBarWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  tabButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bankMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bankBalance: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  bankStatus: {
    fontSize: 11,
    color: colors.success,
  },
  agingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  agingCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
  },
  agingLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  agingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hubBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  hubBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipScroll: {
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: colors.textInverse,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.sm,
  },
  invTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  invParty: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusPaid: {
    backgroundColor: colors.successLight,
  },
  statusUnpaid: {
    backgroundColor: colors.dangerLight,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPaidText: {
    color: colors.success,
  },
  statusUnpaidText: {
    color: colors.danger,
  },
  invMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  invDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  invFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: 4,
  },
  finLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  finValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  invActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: 4,
  },
  invDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  invDetailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  invPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  invPayBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
  },
  subToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  subToggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  subToggleActive: {
    backgroundColor: colors.primary,
  },
  subToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subToggleTextActive: {
    color: colors.textInverse,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  paymentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentParty: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentAmountInflow: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  paymentAmountOutflow: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  paymentMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accCodeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  accCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  accName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accCategory: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  accBalance: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accStatus: {
    fontSize: 11,
    color: colors.success,
  },
  journalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  journalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journalNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  journalDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  journalTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  journalNarration: {
    fontSize: 13,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  journalLines: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    gap: 2,
  },
  journalLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineAcc: {
    flex: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  lineDr: {
    flex: 1,
    fontSize: 11,
    color: colors.primary,
    textAlign: 'right',
  },
  lineCr: {
    flex: 1,
    fontSize: 11,
    color: colors.success,
    textAlign: 'right',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalBody: {
    padding: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  modeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modeBtnTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  inspectorNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inspectorParty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inspectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inspectorLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  inspectorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
}));
