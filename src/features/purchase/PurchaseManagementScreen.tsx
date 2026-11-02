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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShoppingBag,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Building,
  FileText,
  IndianRupee,
  Send,
  Mail,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  FileCheck2,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  purchaseApi,
  PurchaseDashboardSummary,
  PurchaseOrderItem,
  PurchaseRequisitionItem,
  SupplierItem,
  MaterialRequirementItem,
  RequestForQuotationItem,
  SupplierQuotationItem,
  QuotationComparisonItem,
} from '../../api/purchase';

interface PurchaseManagementScreenProps {
  onBackToDashboard: () => void;
}

type PurchaseTab = 'dashboard' | 'requisitions' | 'orders' | 'rfqs_quotes' | 'suppliers' | 'mrp';

export const PurchaseManagementScreen: React.FC<PurchaseManagementScreenProps> = ({
  onBackToDashboard,
}) => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<PurchaseTab>('dashboard');

  // Loading & Refresh State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Data Stores
  const [summary, setSummary] = useState<PurchaseDashboardSummary | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [requisitions, setRequisitions] = useState<PurchaseRequisitionItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirementItem[]>([]);
  const [rfqs, setRfqs] = useState<RequestForQuotationItem[]>([]);
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuotationItem[]>([]);
  const [comparisons, setComparisons] = useState<QuotationComparisonItem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderItem | null>(null);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisitionItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve_po' | 'reject_po' | 'approve_pr' | 'reject_pr'>('approve_po');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New PO Modal
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [newPOSupplierId, setNewPOSupplierId] = useState('');
  const [newPOProject, setNewPOProject] = useState('');
  const [newPODeliveryDate, setNewPODeliveryDate] = useState('');
  const [newPOPaymentTerms, setNewPOPaymentTerms] = useState('30 Days Credit');
  const [newPOItemName, setNewPOItemName] = useState('');
  const [newPOItemQty, setNewPOItemQty] = useState('');
  const [newPOItemRate, setNewPOItemRate] = useState('');
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  // New PR Modal
  const [showNewPRModal, setShowNewPRModal] = useState(false);
  const [newPRProject, setNewPRProject] = useState('');
  const [newPRDepartment, setNewPRDepartment] = useState('Production');
  const [newPRPriority, setNewPRPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [newPRRequiredDate, setNewPRRequiredDate] = useState('');
  const [newPRItemName, setNewPRItemName] = useState('');
  const [newPRItemQty, setNewPRItemQty] = useState('');
  const [newPRItemEstRate, setNewPRItemEstRate] = useState('');
  const [isSubmittingPR, setIsSubmittingPR] = useState(false);

  // New Supplier Modal
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCategory, setNewSupplierCategory] = useState('Raw Material');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierGSTIN, setNewSupplierGSTIN] = useState('');
  const [newSupplierCity, setNewSupplierCity] = useState('');
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  // Email PO Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetPOForEmail, setTargetPOForEmail] = useState<PurchaseOrderItem | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch live purchase data
  const loadData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [sum, pos, prs, supps, mrps, rfqList, quotesList, compList] = await Promise.all([
        purchaseApi.getDashboardSummary(),
        purchaseApi.getPurchaseOrders(),
        purchaseApi.getPurchaseRequisitions(),
        purchaseApi.getSuppliers(),
        purchaseApi.getMaterialRequirements(),
        purchaseApi.getRFQs(),
        purchaseApi.getSupplierQuotations(),
        purchaseApi.getQuotationComparisons(),
      ]);

      setSummary(sum);
      setPurchaseOrders(pos);
      setRequisitions(prs);
      setSuppliers(supps);
      setMaterialRequirements(mrps);
      setRfqs(rfqList);
      setSupplierQuotes(quotesList);
      setComparisons(compList);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sync live purchase data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filtered Purchase Orders
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (po.po_number || po.poNumber || '').toLowerCase();
      const sup = (po.supplier_name || po.supplierName || '').toLowerCase();
      const prj = (po.project_id || po.projectId || po.job_code || po.jobCode || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || sup.includes(q) || prj.includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const st = (po.status || '').toLowerCase();
      if (statusFilter === 'PENDING_APPROVAL') return st.includes('pending') || st.includes('submitted') || st.includes('draft');
      if (statusFilter === 'APPROVED') return st.includes('approved') || st.includes('ordered');
      if (statusFilter === 'SENT') return st.includes('sent');
      if (statusFilter === 'PARTIALLY_RECEIVED') return st.includes('partially');
      if (statusFilter === 'COMPLETED') return st.includes('fully') || st.includes('completed') || st.includes('closed');
      return true;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  // Filtered Requisitions
  const filteredPRs = useMemo(() => {
    return requisitions.filter((pr) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (pr.pr_number || pr.prNumber || '').toLowerCase();
      const dept = (pr.department || '').toLowerCase();
      const prj = (pr.project_id || pr.projectId || pr.job_code || pr.jobId || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || dept.includes(q) || prj.includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const st = (pr.status || '').toLowerCase();
      if (statusFilter === 'PENDING_APPROVAL') return st.includes('pending') || st.includes('submitted');
      if (statusFilter === 'APPROVED') return st.includes('approved');
      if (statusFilter === 'REJECTED') return st.includes('rejected');
      if (statusFilter === 'CONVERTED') return st.includes('rfq');
      return true;
    });
  }, [requisitions, searchQuery, statusFilter]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const name = (s.name || s.supplierName || '').toLowerCase();
      const code = (s.vendor_code || s.vendorCode || s.supplier_code || '').toLowerCase();
      const cat = (s.category || '').toLowerCase();
      const gst = (s.gstin || '').toLowerCase();
      return !q || name.includes(q) || code.includes(q) || cat.includes(q) || gst.includes(q);
    });
  }, [suppliers, searchQuery]);

  // Filtered MRP Shortages
  const filteredMRPs = useMemo(() => {
    return materialRequirements.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const name = (m.item_name || m.itemName || m.material_name || '').toLowerCase();
      const code = (m.item_code || m.itemCode || '').toLowerCase();
      const prj = (m.project_id || m.projectId || m.job_id || m.jobId || '').toLowerCase();
      return !q || name.includes(q) || code.includes(q) || prj.includes(q);
    });
  }, [materialRequirements, searchQuery]);

  // -------------------------------------------------------------
  // WORKFLOW ACTION HANDLERS
  // -------------------------------------------------------------

  // Handle PO Approval / Rejection
  const triggerReviewAction = (action: 'approve_po' | 'reject_po' | 'approve_pr' | 'reject_pr', target: any) => {
    setReviewAction(action);
    setReviewNotes('');
    if (action.endsWith('_po')) {
      setSelectedPO(target);
    } else {
      setSelectedPR(target);
    }
    setShowReviewModal(true);
  };

  const submitReviewDecision = async () => {
    setIsSubmittingReview(true);
    try {
      if (reviewAction === 'approve_po' && selectedPO) {
        await purchaseApi.approvePurchaseOrder(selectedPO.id, reviewNotes);
        showToast(`PO ${selectedPO.po_number || selectedPO.poNumber} Approved Successfully`);
      } else if (reviewAction === 'reject_po' && selectedPO) {
        if (!reviewNotes.trim()) {
          Alert.alert('Rejection Reason Required', 'Please provide a reason for rejecting this PO.');
          setIsSubmittingReview(false);
          return;
        }
        await purchaseApi.rejectPurchaseOrder(selectedPO.id, reviewNotes);
        showToast(`PO ${selectedPO.po_number || selectedPO.poNumber} Rejected`);
      } else if (reviewAction === 'approve_pr' && selectedPR) {
        await purchaseApi.approvePurchaseRequisition(selectedPR.id, reviewNotes);
        showToast(`Requisition ${selectedPR.pr_number || selectedPR.prNumber} Approved`);
      } else if (reviewAction === 'reject_pr' && selectedPR) {
        if (!reviewNotes.trim()) {
          Alert.alert('Rejection Reason Required', 'Please provide a reason for rejecting this Requisition.');
          setIsSubmittingReview(false);
          return;
        }
        await purchaseApi.rejectPurchaseRequisition(selectedPR.id, reviewNotes);
        showToast(`Requisition ${selectedPR.pr_number || selectedPR.prNumber} Rejected`);
      }
      setShowReviewModal(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Workflow Error', err?.response?.data?.error || err?.message || 'Action could not be executed.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Convert Requisition to RFQ
  const handleConvertToRFQ = async (pr: PurchaseRequisitionItem) => {
    Alert.alert(
      'Convert to RFQ',
      `Create official Request for Quotation from Requisition ${pr.pr_number || pr.prNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              await purchaseApi.convertPRToRFQ(pr.id, {
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              });
              showToast(`RFQ created from ${pr.pr_number || pr.prNumber}`);
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not convert requisition.');
            }
          },
        },
      ]
    );
  };

  // Submit New Purchase Order
  const handleCreatePO = async () => {
    if (!newPOSupplierId.trim() || !newPOItemName.trim() || !newPOItemQty.trim() || !newPOItemRate.trim()) {
      Alert.alert('Validation Error', 'Please specify Supplier, Item Name, Quantity, and Unit Rate.');
      return;
    }

    setIsSubmittingPO(true);
    try {
      const selectedSup = suppliers.find((s) => s.id === newPOSupplierId || s.vendor_code === newPOSupplierId);
      const qty = parseFloat(newPOItemQty) || 1;
      const rate = parseFloat(newPOItemRate) || 0;
      const subTotal = qty * rate;
      const taxAmount = subTotal * 0.18; // 18% standard GST
      const grandTotal = subTotal + taxAmount;

      const poPayload: Partial<PurchaseOrderItem> = {
        supplier_id: selectedSup?.id || newPOSupplierId,
        supplier_name: selectedSup?.name || selectedSup?.supplierName || '',
        contact_person: selectedSup?.contact_person || selectedSup?.contactPerson || '',
        supplier_gstin: selectedSup?.gstin || '',
        supplier_address: selectedSup?.address || '',
        project_id: newPOProject.trim() || '',
        job_code: newPOProject.trim() || '',
        delivery_date: newPODeliveryDate.trim() || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        payment_terms: newPOPaymentTerms,
        sub_total: subTotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: 'Submitted',
        items: [
          {
            item_name: newPOItemName.trim(),
            itemName: newPOItemName.trim(),
            specification: 'Commercial standard grade',
            ordered_quantity: qty,
            orderedQuantity: qty,
            unit_of_measure: 'NOS',
            unit: 'NOS',
            unit_price: rate,
            rate: rate,
            total_price: subTotal,
            totalPrice: subTotal,
            tax: taxAmount,
            hsn_code: '73089090',
          },
        ],
      };

      await purchaseApi.createPurchaseOrder(poPayload);
      showToast('New Purchase Order Created Successfully');
      setShowNewPOModal(false);
      setNewPOSupplierId('');
      setNewPOProject('');
      setNewPODeliveryDate('');
      setNewPOItemName('');
      setNewPOItemQty('');
      setNewPOItemRate('');
      loadData();
    } catch (err: any) {
      Alert.alert('PO Creation Failed', err?.response?.data?.error || err?.message || 'Server rejected order creation');
    } finally {
      setIsSubmittingPO(false);
    }
  };

  // Submit New Purchase Requisition
  const handleCreatePR = async () => {
    if (!newPRItemName.trim() || !newPRItemQty.trim()) {
      Alert.alert('Validation Error', 'Please enter Item Name and Quantity.');
      return;
    }

    setIsSubmittingPR(true);
    try {
      const qty = parseFloat(newPRItemQty) || 1;
      const estRate = parseFloat(newPRItemEstRate) || 0;
      const estTotal = qty * estRate;

      const prPayload: Partial<PurchaseRequisitionItem> = {
        project_id: newPRProject.trim() || '',
        job_code: newPRProject.trim() || '',
        department: newPRDepartment,
        priority: newPRPriority,
        required_by_date: newPRRequiredDate.trim() || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        total_estimated_cost: estTotal,
        estimatedCost: estTotal,
        status: 'Submitted',
        items: [
          {
            item_name: newPRItemName.trim(),
            itemName: newPRItemName.trim(),
            specification: 'Engineering grade component',
            required_quantity: qty,
            requiredQuantity: qty,
            unit_of_measure: 'NOS',
            unit: 'NOS',
            estimated_unit_price: estRate,
            estimatedUnitPrice: estRate,
            estimated_total_price: estTotal,
            estimatedTotalPrice: estTotal,
          },
        ],
      };

      await purchaseApi.createPurchaseRequisition(prPayload);
      showToast('New Purchase Requisition Created');
      setShowNewPRModal(false);
      setNewPRProject('');
      setNewPRItemName('');
      setNewPRItemQty('');
      setNewPRItemEstRate('');
      loadData();
    } catch (err: any) {
      Alert.alert('Requisition Failed', err?.message || 'Could not submit requisition.');
    } finally {
      setIsSubmittingPR(false);
    }
  };

  // Submit New Supplier
  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) {
      Alert.alert('Validation Error', 'Supplier Name is required.');
      return;
    }

    setIsSubmittingSupplier(true);
    try {
      const supPayload: Partial<SupplierItem> = {
        name: newSupplierName.trim(),
        supplierName: newSupplierName.trim(),
        category: newSupplierCategory,
        contact_person: newSupplierContact.trim() || '',
        phone: newSupplierPhone.trim(),
        mobile: newSupplierPhone.trim(),
        email: newSupplierEmail.trim(),
        gstin: newSupplierGSTIN.trim(),
        city: newSupplierCity.trim(),
        country: 'India',
        credit_period_days: 30,
        payment_terms: '30 Days Credit',
        status: 'Approved',
      };

      await purchaseApi.createSupplier(supPayload);
      showToast('Supplier Registered Successfully');
      setShowNewSupplierModal(false);
      setNewSupplierName('');
      setNewSupplierContact('');
      setNewSupplierPhone('');
      setNewSupplierEmail('');
      setNewSupplierGSTIN('');
      setNewSupplierCity('');
      loadData();
    } catch (err: any) {
      Alert.alert('Supplier Registration Failed', err?.message || 'Could not register supplier.');
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  // Trigger Email Modal
  const openEmailModalForPO = (po: PurchaseOrderItem) => {
    setTargetPOForEmail(po);
    const supEmail =
      po.supplier_id && suppliers.find((s) => s.id === po.supplier_id || s.vendor_code === po.supplier_id)?.email;
    setEmailRecipient(supEmail || '');
    setShowEmailModal(true);
  };

  const handleSendPOEmail = async () => {
    if (!targetPOForEmail) return;
    if (!emailRecipient.trim() || !emailRecipient.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid supplier email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await purchaseApi.sendPOEmail(targetPOForEmail.id, {
        recipientEmail: emailRecipient.trim(),
        po: targetPOForEmail,
      });
      showToast(`PO ${targetPOForEmail.po_number || targetPOForEmail.poNumber} sent to ${emailRecipient}`);
      setShowEmailModal(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Email Dispatch Failed', err?.response?.data?.error || err?.message || 'Failed to send PO email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bg = colors.borderLight;
    let text = colors.textSecondary;
    let border = colors.borderDark;

    if (s.includes('approved') || s.includes('sufficient') || s.includes('completed') || s.includes('active')) {
      bg = colors.successLight;
      text = colors.success;
      border = colors.successBorder;
    } else if (s.includes('pending') || s.includes('submitted') || s.includes('ordered') || s.includes('draft') || s.includes('partially')) {
      bg = colors.warningLight;
      text = colors.warning;
      border = colors.warningBorder;
    } else if (s.includes('shortage') || s.includes('rejected') || s.includes('cancelled') || s.includes('blacklisted')) {
      bg = colors.dangerLight;
      text = colors.danger;
      border = colors.dangerBorder;
    } else if (s.includes('sent')) {
      bg = colors.accentLight;
      text = colors.accentDark;
      border = colors.accent;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{status || 'Active'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 2. Success Toast */}
      {successToast && (
        <View style={styles.toastContainer}>
          <CheckCircle2 size={16} color={colors.success} />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* 3. Error Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <AlertTriangle size={18} color={colors.danger} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Executive KPI Ribbon */}
      <View style={styles.kpiRibbon}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.primarySubtle }]}>
              <FileText size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.openRequisitionsCount ?? requisitions.length}</Text>
              <Text style={styles.kpiLabel}>Open Indents</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.warningLight }]}>
              <Clock size={18} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.pendingPOApprovalCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>POs Pending</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.accentLight }]}>
              <Truck size={18} color={colors.accentDark} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.awaitingDeliveryCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>Awaiting Delivery</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.dangerLight }]}>
              <AlertTriangle size={18} color={colors.danger} />
            </View>
            <View>
              <Text style={[styles.kpiValue, { color: colors.danger }]}>{summary?.overdueDeliveriesCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>Overdue</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.successLight }]}>
              <IndianRupee size={18} color={colors.success} />
            </View>
            <View>
              <Text style={styles.kpiValue}>
                ₹{((summary?.totalPOValue || 0) / 100000).toFixed(1)}L
              </Text>
              <Text style={styles.kpiLabel}>Total PO Spend</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.purpleLight }]}>
              <Package size={18} color={colors.purple} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.mrpShortageCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>MRP Shortages</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 5. Segmented Navigation Tabs */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'dashboard' && styles.tabButtonActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'dashboard' && styles.tabButtonTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'orders' && styles.tabButtonTextActive]}>
              Orders ({purchaseOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requisitions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('requisitions')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'requisitions' && styles.tabButtonTextActive]}>
              Indents ({requisitions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'rfqs_quotes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('rfqs_quotes')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'rfqs_quotes' && styles.tabButtonTextActive]}>
              RFQs & Quotes ({rfqs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'suppliers' && styles.tabButtonActive]}
            onPress={() => setActiveTab('suppliers')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'suppliers' && styles.tabButtonTextActive]}>
              Suppliers ({suppliers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'mrp' && styles.tabButtonActive]}
            onPress={() => setActiveTab('mrp')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'mrp' && styles.tabButtonTextActive]}>
              MRP Shortages ({materialRequirements.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 6. Search Bar & Status Filter Chips (For List Tabs) */}
      {activeTab !== 'dashboard' && (
        <View style={styles.searchFilterSection}>
          <View style={styles.searchBarContainer}>
            <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${activeTab}...`}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {activeTab === 'orders' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'COMPLETED'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                  onPress={() => setStatusFilter(st)}
                >
                  <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                    {st.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {activeTab === 'requisitions' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CONVERTED'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                  onPress={() => setStatusFilter(st)}
                >
                  <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                    {st.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* 7. Main Tab Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading live procurement data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.contentScrollContent}
        >
          {/* TAB 1: DASHBOARD / WORKFLOW */}
          {activeTab === 'dashboard' && (
            <View>
              {/* Procurement Workflow Pipeline */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Procurement Lifecycle Pipeline</Text>
                  <Text style={styles.cardMeta}>6 Standard Stages</Text>
                </View>
                <View style={styles.workflowGrid}>
                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.purpleLight }]}>
                      <Package size={16} color={colors.purple} />
                    </View>
                    <Text style={styles.stageTitle}>1. MRP Shortage</Text>
                    <Text style={styles.stageCount}>{materialRequirements.length} Items</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.primarySubtle }]}>
                      <FileText size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.stageTitle}>2. Indent PR</Text>
                    <Text style={styles.stageCount}>{requisitions.length} Indents</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.accentLight }]}>
                      <Send size={16} color={colors.accentDark} />
                    </View>
                    <Text style={styles.stageTitle}>3. RFQ Tender</Text>
                    <Text style={styles.stageCount}>{rfqs.length} Sent</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.warningLight }]}>
                      <Clock size={16} color={colors.warning} />
                    </View>
                    <Text style={styles.stageTitle}>4. Comparison</Text>
                    <Text style={styles.stageCount}>{supplierQuotes.length} Quotes</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.successLight }]}>
                      <IndianRupee size={16} color={colors.success} />
                    </View>
                    <Text style={styles.stageTitle}>5. Official PO</Text>
                    <Text style={styles.stageCount}>{purchaseOrders.length} Orders</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.bronzeLight }]}>
                      <Truck size={16} color={colors.bronze} />
                    </View>
                    <Text style={styles.stageTitle}>6. Delivery/GRN</Text>
                    <Text style={styles.stageCount}>Goods receipt</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.primaryActionButton} onPress={() => setShowNewPOModal(true)}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionButtonText}>New Purchase Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryActionButton} onPress={() => setShowNewPRModal(true)}>
                  <Plus size={18} color={colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>Raise Indent</Text>
                </TouchableOpacity>
              </View>

              {/* Pending Approvals Queue */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pending Approvals Queue</Text>
                  <Text style={styles.cardMeta}>Authorizations Required</Text>
                </View>

                {purchaseOrders.filter((po) => po.status?.toLowerCase().includes('pending') || po.status?.toLowerCase().includes('submitted')).length === 0 &&
                requisitions.filter((pr) => pr.status?.toLowerCase().includes('pending') || pr.status?.toLowerCase().includes('submitted')).length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <CheckCircle2 size={36} color={colors.success} />
                    <Text style={styles.emptyText}>All purchase documents and orders are up to date.</Text>
                  </View>
                ) : (
                  <View>
                    {purchaseOrders
                      .filter((po) => po.status?.toLowerCase().includes('pending') || po.status?.toLowerCase().includes('submitted'))
                      .slice(0, 3)
                      .map((po) => (
                        <View key={po.id} style={styles.approvalItemCard}>
                          <View style={styles.approvalItemTop}>
                            <View>
                              <Text style={styles.approvalItemNumber}>{po.po_number || po.poNumber}</Text>
                              <Text style={styles.approvalItemSub}>Supplier: {po.supplier_name || po.supplierName}</Text>
                            </View>
                            <Text style={styles.approvalItemAmount}>₹{(po.grand_total || po.grandTotal || 0).toLocaleString('en-IN')}</Text>
                          </View>
                          <View style={styles.approvalItemActions}>
                            <TouchableOpacity
                              style={[styles.miniActionBtn, styles.approveBtn]}
                              onPress={() => triggerReviewAction('approve_po', po)}
                            >
                              <CheckCircle2 size={14} color="#FFFFFF" />
                              <Text style={styles.miniActionBtnText}>Approve PO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.miniActionBtn, styles.rejectBtn]}
                              onPress={() => triggerReviewAction('reject_po', po)}
                            >
                              <XCircle size={14} color="#FFFFFF" />
                              <Text style={styles.miniActionBtnText}>Reject</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                    {requisitions
                      .filter((pr) => pr.status?.toLowerCase().includes('pending') || pr.status?.toLowerCase().includes('submitted'))
                      .slice(0, 3)
                      .map((pr) => (
                        <View key={pr.id} style={styles.approvalItemCard}>
                          <View style={styles.approvalItemTop}>
                            <View>
                              <Text style={styles.approvalItemNumber}>{pr.pr_number || pr.prNumber}</Text>
                              <Text style={styles.approvalItemSub}>Dept: {pr.department} • Requester: {pr.requested_by || pr.requestedBy}</Text>
                            </View>
                            <Text style={styles.approvalItemAmount}>₹{(pr.total_estimated_cost || pr.estimatedCost || 0).toLocaleString('en-IN')}</Text>
                          </View>
                          <View style={styles.approvalItemActions}>
                            <TouchableOpacity
                              style={[styles.miniActionBtn, styles.approveBtn]}
                              onPress={() => triggerReviewAction('approve_pr', pr)}
                            >
                              <CheckCircle2 size={14} color="#FFFFFF" />
                              <Text style={styles.miniActionBtnText}>Approve Indent</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.miniActionBtn, styles.rejectBtn]}
                              onPress={() => triggerReviewAction('reject_pr', pr)}
                            >
                              <XCircle size={14} color="#FFFFFF" />
                              <Text style={styles.miniActionBtnText}>Reject</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 2: PURCHASE ORDERS */}
          {activeTab === 'orders' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredPOs.length} Purchase Orders</Text>
                <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewPOModal(true)}>
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addInlineBtnText}>New PO</Text>
                </TouchableOpacity>
              </View>

              {filteredPOs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ShoppingBag size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No Purchase Orders match your query.</Text>
                </View>
              ) : (
                filteredPOs.map((po) => (
                  <TouchableOpacity
                    key={po.id}
                    style={styles.entityCard}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPO(po)}
                  >
                    <View style={styles.entityCardHeader}>
                      <View style={styles.entityCardTitleCol}>
                        <Text style={styles.entityCode}>{po.po_number || po.poNumber}</Text>
                        <Text style={styles.entitySupplierName}>{po.supplier_name || po.supplierName}</Text>
                      </View>
                      {renderStatusBadge(po.status)}
                    </View>

                    <View style={styles.entityMetaGrid}>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Order Total</Text>
                        <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '700' }]}>
                          ₹{(po.grand_total || po.grandTotal || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Order Date</Text>
                        <Text style={styles.metaVal}>{po.date || po.poDate || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Delivery Date</Text>
                        <Text style={styles.metaVal}>{po.delivery_date || po.expectedDeliveryDate || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Project Ref</Text>
                        <Text style={styles.metaVal}>{po.project_id || po.job_code || 'General'}</Text>
                      </View>
                    </View>

                    {/* Quick PO Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => openEmailModalForPO(po)}
                      >
                        <Mail size={14} color={colors.accentDark} />
                        <Text style={[styles.actionPillText, { color: colors.accentDark }]}>Send PDF</Text>
                      </TouchableOpacity>

                      {(po.status?.toLowerCase().includes('pending') || po.status?.toLowerCase().includes('submitted')) && (
                        <TouchableOpacity
                          style={[styles.actionPill, { backgroundColor: colors.successLight }]}
                          onPress={() => triggerReviewAction('approve_po', po)}
                        >
                          <CheckCircle2 size={14} color={colors.success} />
                          <Text style={[styles.actionPillText, { color: colors.success }]}>Approve</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => setSelectedPO(po)}
                      >
                        <Eye size={14} color={colors.primary} />
                        <Text style={[styles.actionPillText, { color: colors.primary }]}>Inspect</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* TAB 3: REQUISITIONS (INDENTS) */}
          {activeTab === 'requisitions' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredPRs.length} Indents</Text>
                <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewPRModal(true)}>
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addInlineBtnText}>Raise Indent</Text>
                </TouchableOpacity>
              </View>

              {filteredPRs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FileText size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No Purchase Requisitions found.</Text>
                </View>
              ) : (
                filteredPRs.map((pr) => (
                  <View key={pr.id} style={styles.entityCard}>
                    <View style={styles.entityCardHeader}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.entityCode}>{pr.pr_number || pr.prNumber}</Text>
                        <Text style={styles.entitySub}>Dept: {pr.department} • Ref: {pr.project_id || pr.job_code || 'General'}</Text>
                      </View>
                      {renderStatusBadge(pr.status)}
                    </View>

                    <View style={styles.entityMetaGrid}>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Requester</Text>
                        <Text style={styles.metaVal}>{pr.requested_by || pr.requestedBy || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Priority</Text>
                        <Text style={[styles.metaVal, { color: colors.danger, fontWeight: '700' }]}>{pr.priority || 'High'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Required Date</Text>
                        <Text style={styles.metaVal}>{pr.required_by_date || pr.requiredByDate || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Est. Cost</Text>
                        <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '700' }]}>
                          ₹{(pr.total_estimated_cost || pr.estimatedCost || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* PR Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => handleConvertToRFQ(pr)}
                      >
                        <Send size={14} color={colors.accentDark} />
                        <Text style={[styles.actionPillText, { color: colors.accentDark }]}>Convert to RFQ</Text>
                      </TouchableOpacity>

                      {(pr.status?.toLowerCase().includes('pending') || pr.status?.toLowerCase().includes('submitted')) && (
                        <TouchableOpacity
                          style={[styles.actionPill, { backgroundColor: colors.successLight }]}
                          onPress={() => triggerReviewAction('approve_pr', pr)}
                        >
                          <CheckCircle2 size={14} color={colors.success} />
                          <Text style={[styles.actionPillText, { color: colors.success }]}>Approve</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => setSelectedPR(pr)}
                      >
                        <Eye size={14} color={colors.primary} />
                        <Text style={[styles.actionPillText, { color: colors.primary }]}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: RFQS & QUOTATIONS */}
          {activeTab === 'rfqs_quotes' && (
            <View>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Requests for Quotation (RFQs)</Text>
                  <Text style={styles.cardMeta}>{rfqs.length} Active</Text>
                </View>

                {rfqs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Send size={36} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No RFQs floated yet.</Text>
                  </View>
                ) : (
                  rfqs.map((rfq) => (
                    <View key={rfq.id} style={styles.rfqCard}>
                      <View style={styles.entityCardHeader}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.entityCode}>{rfq.rfq_number || rfq.rfqNumber}</Text>
                          <Text style={styles.entitySub}>Date: {rfq.rfq_date || rfq.rfqDate} • Due: {rfq.due_date || rfq.dueDate || '7 Days'}</Text>
                        </View>
                        {renderStatusBadge(rfq.status)}
                      </View>
                      <Text style={styles.rfqSubject}>{rfq.subject || '—'}</Text>
                      <View style={styles.rfqFooter}>
                        <Text style={styles.rfqMetaText}>Location: {rfq.delivery_location || rfq.deliveryLocation || 'RAJPUR Works'}</Text>
                        <Text style={styles.rfqMetaText}>{rfq.items?.length || 0} Items</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Quotation Comparisons */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Supplier Quotation Comparisons</Text>
                  <Text style={styles.cardMeta}>{comparisons.length} Evaluations</Text>
                </View>

                {comparisons.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <SlidersHorizontal size={36} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No quotation comparisons registered.</Text>
                  </View>
                ) : (
                  comparisons.map((c) => (
                    <View key={c.id} style={styles.comparisonCard}>
                      <View style={styles.entityCardHeader}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.entityCode}>CS for {c.rfq_id || c.rfqId}</Text>
                          <Text style={styles.entitySub}>Evaluated on: {c.comparison_date || c.comparisonDate}</Text>
                        </View>
                        {renderStatusBadge(c.status || 'Approved')}
                      </View>
                      <View style={styles.recommendBox}>
                        <ShieldCheck size={16} color={colors.success} />
                        <Text style={styles.recommendText}>
                          Recommended: <Text style={{ fontWeight: '700' }}>{c.recommended_supplier_name || c.recommendedSupplierName || 'Supplier'}</Text>
                        </Text>
                      </View>
                      {!!(c.recommendation_reason || c.recommendationReason) && (
                        <Text style={styles.recommendReason}>
                          Reason: {c.recommendation_reason || c.recommendationReason}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* TAB 5: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredSuppliers.length} Suppliers</Text>
                <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewSupplierModal(true)}>
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addInlineBtnText}>Add Supplier</Text>
                </TouchableOpacity>
              </View>

              {filteredSuppliers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Building size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No suppliers match search criteria.</Text>
                </View>
              ) : (
                filteredSuppliers.map((s) => (
                  <View key={s.id} style={styles.entityCard}>
                    <View style={styles.entityCardHeader}>
                      <View style={styles.entityCardTitleCol}>
                        <Text style={styles.entitySupplierName}>{s.name || s.supplierName}</Text>
                        <Text style={styles.entitySub}>Code: {s.vendor_code || s.supplier_code || s.id} • Category: {s.category}</Text>
                      </View>
                      {renderStatusBadge(s.status || 'Active')}
                    </View>

                    <View style={styles.supplierDetailsGrid}>
                      <View style={styles.supplierDetailRow}>
                        <User size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>Contact: {s.contact_person || s.contactPerson || 'Direct'}</Text>
                      </View>
                      <View style={styles.supplierDetailRow}>
                        <Phone size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>Mobile: {s.phone || s.mobile || '—'}</Text>
                      </View>
                      <View style={styles.supplierDetailRow}>
                        <Mail size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>Email: {s.email || '—'}</Text>
                      </View>
                      <View style={styles.supplierDetailRow}>
                        <FileCheck2 size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>GSTIN: {s.gstin || 'Unregistered'}</Text>
                      </View>
                      <View style={styles.supplierDetailRow}>
                        <MapPin size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>City/State: {s.city || 'Vadodara'}, {s.state || 'Gujarat'}</Text>
                      </View>
                      <View style={styles.supplierDetailRow}>
                        <Clock size={14} color={colors.textMuted} />
                        <Text style={styles.supplierDetailText}>Terms: {s.payment_terms || s.paymentTerms || '30 Days Credit'}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 6: MRP SHORTAGES */}
          {activeTab === 'mrp' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredMRPs.length} Material Requirements</Text>
              </View>

              {filteredMRPs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <CheckCircle2 size={40} color={colors.success} />
                  <Text style={styles.emptyText}>No material shortages detected in the system.</Text>
                </View>
              ) : (
                filteredMRPs.map((m) => {
                  const reqQty = Number(m.required_quantity || m.requiredQuantity || 0);
                  const availStock = Number(m.available_stock || m.availableStock || 0);
                  const shortage = Number(m.shortage_quantity || m.shortageQuantity || (reqQty - availStock));
                  const uom = m.unit_of_measure || m.unitOfMeasure || m.unit || 'NOS';

                  return (
                    <View key={m.id} style={styles.entityCard}>
                      <View style={styles.entityCardHeader}>
                        <View style={styles.entityCardTitleCol}>
                          <Text style={styles.entityCode}>{m.item_code || m.itemCode || m.id}</Text>
                          <Text style={styles.entitySupplierName}>{m.item_name || m.itemName || m.material_name}</Text>
                        </View>
                        {renderStatusBadge(shortage > 0 ? 'Shortage' : 'Sufficient')}
                      </View>

                      {!!m.specification && <Text style={styles.mrpSpec}>{m.specification}</Text>}

                      <View style={styles.mrpQtyBar}>
                        <View style={styles.mrpQtyCol}>
                          <Text style={styles.mrpQtyLabel}>Required</Text>
                          <Text style={styles.mrpQtyVal}>{reqQty} {uom}</Text>
                        </View>
                        <View style={styles.mrpQtyCol}>
                          <Text style={styles.mrpQtyLabel}>Available</Text>
                          <Text style={[styles.mrpQtyVal, { color: colors.success }]}>{availStock} {uom}</Text>
                        </View>
                        <View style={styles.mrpQtyCol}>
                          <Text style={styles.mrpQtyLabel}>Shortage</Text>
                          <Text style={[styles.mrpQtyVal, { color: colors.danger, fontWeight: '800' }]}>
                            {shortage > 0 ? shortage : 0} {uom}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.mrpFooter}>
                        <Text style={styles.mrpFooterText}>Project: {m.project_id || m.projectId || 'General'}</Text>
                        <Text style={styles.mrpFooterText}>BOM: {m.bom_number || m.bomId || 'Standard'}</Text>
                        <Text style={styles.mrpFooterText}>Needed by: {m.required_by_date || m.requiredByDate || 'Immediate'}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MODAL: PO 360° DETAIL INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={!!selectedPO && !showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedPO?.po_number || selectedPO?.poNumber}</Text>
                <Text style={styles.modalSubTitle}>{selectedPO?.supplier_name || selectedPO?.supplierName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPO(null)}>
                <X size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionHeader}>Order Overview</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  {selectedPO && renderStatusBadge(selectedPO.status)}
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PO Date:</Text>
                  <Text style={styles.detailVal}>{selectedPO?.date || selectedPO?.poDate || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Date:</Text>
                  <Text style={styles.detailVal}>{selectedPO?.delivery_date || selectedPO?.expectedDeliveryDate || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Linked Project:</Text>
                  <Text style={styles.detailVal}>{selectedPO?.project_id || selectedPO?.job_code || 'General'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Terms:</Text>
                  <Text style={styles.detailVal}>{selectedPO?.payment_terms || selectedPO?.paymentTerms || '30 Days Credit'}</Text>
                </View>
              </View>

              {/* Line Items */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionHeader}>Ordered Line Items ({selectedPO?.items?.length || 0})</Text>
                {selectedPO?.items && selectedPO.items.length > 0 ? (
                  selectedPO.items.map((item, idx) => (
                    <View key={idx} style={styles.lineItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lineItemName}>{item.item_name || item.itemName || '—'}</Text>
                        <Text style={styles.lineItemSpec}>{item.specification || item.dimensions || '—'}</Text>
                        <Text style={styles.lineItemRate}>
                          Qty: {item.ordered_quantity || item.orderedQuantity || item.quantity || 1} {item.unit_of_measure || item.unit || 'NOS'} @ ₹{(item.unit_price || item.rate || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={styles.lineItemAmount}>
                        ₹{(item.total_price || item.totalPrice || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No item rows specified.</Text>
                )}
              </View>

              {/* Cost Summary */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionHeader}>Financial Summary</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sub Total:</Text>
                  <Text style={styles.detailVal}>₹{(selectedPO?.sub_total || selectedPO?.subTotal || 0).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>GST Taxes (18%):</Text>
                  <Text style={styles.detailVal}>₹{(selectedPO?.tax_amount || selectedPO?.taxTotal || 0).toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.borderDark, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={[styles.detailLabel, { fontWeight: '800', color: colors.textPrimary }]}>Grand Total:</Text>
                  <Text style={[styles.detailVal, { fontWeight: '800', color: colors.primary, fontSize: 16 }]}>
                    ₹{(selectedPO?.grand_total || selectedPO?.grandTotal || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  if (selectedPO) openEmailModalForPO(selectedPO);
                }}
              >
                <Mail size={16} color={colors.accentDark} />
                <Text style={styles.modalSecondaryBtnText}>Email PO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setSelectedPO(null)}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL: APPROVAL / REJECTION REVIEW */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showReviewModal} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {reviewAction.startsWith('approve') ? 'Authorize & Sign-off' : 'Reject Document'}
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.reviewPromptText}>
                {reviewAction.startsWith('approve')
                  ? `Please confirm authorized sign-off for ${
                      reviewAction === 'approve_po'
                        ? `Purchase Order ${selectedPO?.po_number || selectedPO?.poNumber}`
                        : `Requisition ${selectedPR?.pr_number || selectedPR?.prNumber}`
                    }.`
                  : `Please provide a mandatory reason for rejecting ${
                      reviewAction === 'reject_po'
                        ? `Purchase Order ${selectedPO?.po_number || selectedPO?.poNumber}`
                        : `Requisition ${selectedPR?.pr_number || selectedPR?.prNumber}`
                    }.`}
              </Text>

              <Text style={styles.formInputLabel}>
                {reviewAction.startsWith('approve') ? 'Approval Notes (Optional):' : 'Rejection Reason (Required):'}
              </Text>
              <TextInput
                style={[styles.formTextInput, { height: 90, textAlignVertical: 'top' }]}
                multiline
                placeholder={reviewAction.startsWith('approve') ? 'Enter comments or audit notes...' : 'Specify reasons for rejection...'}
                placeholderTextColor={colors.textMuted}
                value={reviewNotes}
                onChangeText={setReviewNotes}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowReviewModal(false)}
                disabled={isSubmittingReview}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  reviewAction.startsWith('reject') && { backgroundColor: colors.danger },
                ]}
                onPress={submitReviewDecision}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>
                    {reviewAction.startsWith('approve') ? 'Confirm Approval' : 'Confirm Rejection'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 10. MODAL: NEW PURCHASE ORDER */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewPOModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Purchase Order</Text>
              <TouchableOpacity onPress={() => setShowNewPOModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Supplier *</Text>
              <View style={styles.pickerBox}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                  {suppliers.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.pickerChip,
                        newPOSupplierId === s.id && styles.pickerChipSelected,
                      ]}
                      onPress={() => setNewPOSupplierId(s.id)}
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          newPOSupplierId === s.id && styles.pickerChipTextSelected,
                        ]}
                      >
                        {s.name || s.supplierName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.formInputLabel}>Project Reference</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. PRJ-2026-0001 or JOB-2026"
                placeholderTextColor={colors.textMuted}
                value={newPOProject}
                onChangeText={setNewPOProject}
              />

              <Text style={styles.formInputLabel}>Committed Delivery Date</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={newPODeliveryDate}
                onChangeText={setNewPODeliveryDate}
              />

              <Text style={styles.formInputLabel}>Payment Terms</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. 30 Days Credit"
                placeholderTextColor={colors.textMuted}
                value={newPOPaymentTerms}
                onChangeText={setNewPOPaymentTerms}
              />

              <View style={styles.formDivider} />
              <Text style={styles.sectionHeader}>Line Item Details</Text>

              <Text style={styles.formInputLabel}>Material Item Description *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. MS Plates IS 2062 Gr.B 12mm"
                placeholderTextColor={colors.textMuted}
                value={newPOItemName}
                onChangeText={setNewPOItemName}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formInputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 10"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newPOItemQty}
                    onChangeText={setNewPOItemQty}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formInputLabel}>Unit Rate (₹) *</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 68.50"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newPOItemRate}
                    onChangeText={setNewPOItemRate}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowNewPOModal(false)}
                disabled={isSubmittingPO}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreatePO}
                disabled={isSubmittingPO}
              >
                {isSubmittingPO ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Generate PO</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 11. MODAL: NEW PURCHASE REQUISITION */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewPRModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raise Purchase Requisition</Text>
              <TouchableOpacity onPress={() => setShowNewPRModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Project Reference</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. PRJ-2026-0001"
                placeholderTextColor={colors.textMuted}
                value={newPRProject}
                onChangeText={setNewPRProject}
              />

              <Text style={styles.formInputLabel}>Requesting Department</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Production / Planning / Stores"
                placeholderTextColor={colors.textMuted}
                value={newPRDepartment}
                onChangeText={setNewPRDepartment}
              />

              <Text style={styles.formInputLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['Urgent', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityPill, newPRPriority === p && styles.priorityPillActive]}
                    onPress={() => setNewPRPriority(p)}
                  >
                    <Text style={[styles.priorityPillText, newPRPriority === p && styles.priorityPillTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formInputLabel}>Required By Date</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={newPRRequiredDate}
                onChangeText={setNewPRRequiredDate}
              />

              <View style={styles.formDivider} />
              <Text style={styles.sectionHeader}>Requested Item Details</Text>

              <Text style={styles.formInputLabel}>Item Description *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Fasteners SS 304 M16 x 60mm"
                placeholderTextColor={colors.textMuted}
                value={newPRItemName}
                onChangeText={setNewPRItemName}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formInputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 100"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newPRItemQty}
                    onChangeText={setNewPRItemQty}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formInputLabel}>Est. Rate (₹)</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 45"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newPRItemEstRate}
                    onChangeText={setNewPRItemEstRate}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowNewPRModal(false)}
                disabled={isSubmittingPR}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreatePR}
                disabled={isSubmittingPR}
              >
                {isSubmittingPR ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Submit Indent</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 12. MODAL: NEW SUPPLIER */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewSupplierModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Supplier</Text>
              <TouchableOpacity onPress={() => setShowNewSupplierModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Company Name *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Steel Authority of India Ltd."
                placeholderTextColor={colors.textMuted}
                value={newSupplierName}
                onChangeText={setNewSupplierName}
              />

              <Text style={styles.formInputLabel}>Supply Category</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Raw Material / Hardware / Machining"
                placeholderTextColor={colors.textMuted}
                value={newSupplierCategory}
                onChangeText={setNewSupplierCategory}
              />

              <Text style={styles.formInputLabel}>Contact Person</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Rajesh Sharma"
                placeholderTextColor={colors.textMuted}
                value={newSupplierContact}
                onChangeText={setNewSupplierContact}
              />

              <Text style={styles.formInputLabel}>Phone / Mobile</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. +91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
                value={newSupplierPhone}
                onChangeText={setNewSupplierPhone}
              />

              <Text style={styles.formInputLabel}>Email</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. sales@vendor.com"
                keyboardType="email-address"
                placeholderTextColor={colors.textMuted}
                value={newSupplierEmail}
                onChangeText={setNewSupplierEmail}
              />

              <Text style={styles.formInputLabel}>GSTIN</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. 24AAACU1234F1Z5"
                placeholderTextColor={colors.textMuted}
                value={newSupplierGSTIN}
                onChangeText={setNewSupplierGSTIN}
              />

              <Text style={styles.formInputLabel}>City / Location</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Vadodara / Ahmedabad"
                placeholderTextColor={colors.textMuted}
                value={newSupplierCity}
                onChangeText={setNewSupplierCity}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowNewSupplierModal(false)}
                disabled={isSubmittingSupplier}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreateSupplier}
                disabled={isSubmittingSupplier}
              >
                {isSubmittingSupplier ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 13. MODAL: SEND PO EMAIL */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showEmailModal} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispatch Purchase Order PDF</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.reviewPromptText}>
                Send official engineering Purchase Order ({targetPOForEmail?.po_number || targetPOForEmail?.poNumber}) directly to supplier via SMTP.
              </Text>

              <Text style={styles.formInputLabel}>Recipient Email *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="supplier@domain.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
                value={emailRecipient}
                onChangeText={setEmailRecipient}
              />

              <View style={styles.smtpNoticeBox}>
                <Mail size={16} color={colors.accentDark} />
                <Text style={styles.smtpNoticeText}>
                  Includes official letterhead, items table, supply compliance terms, and auto-generated PDF attachment.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowEmailModal(false)}
                disabled={isSendingEmail}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleSendPOEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ==========================================
// STYLESHEET
// ==========================================

const styles = themedStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  topBarTitleContainer: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  refreshBtn: {
    padding: spacing.xs,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.danger,
    marginLeft: 6,
  },
  retryBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiRibbon: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  kpiScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    minWidth: 130,
    gap: 10,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabsRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 6,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  searchFilterSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
    gap: spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  workflowGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageNode: {
    alignItems: 'center',
    width: 80,
  },
  stageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stageCount: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stageArrow: {
    paddingTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    gap: 6,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    gap: 6,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  approvalItemCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  approvalItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  approvalItemNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  approvalItemSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  approvalItemAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  approvalItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  miniActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.danger,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  listHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primarySubtle,
    gap: 4,
  },
  addInlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  entityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  entityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entityCardTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  entityCode: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  entitySupplierName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  entitySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  entityMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: 6,
    gap: 8,
    marginBottom: 8,
  },
  metaCell: {
    width: '47%',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rfqCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  rfqSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  rfqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rfqMetaText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  comparisonCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  recommendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 6,
    borderRadius: 4,
    gap: 6,
    marginVertical: 4,
  },
  recommendText: {
    fontSize: 12,
    color: colors.success,
  },
  recommendReason: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  supplierDetailsGrid: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: 8,
    gap: 4,
  },
  supplierDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supplierDetailText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mrpSpec: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  mrpQtyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  mrpQtyCol: {
    alignItems: 'center',
  },
  mrpQtyLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  mrpQtyVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  mrpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 4,
  },
  mrpFooterText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '88%',
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubTitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalBody: {
    paddingVertical: spacing.sm,
  },
  detailSection: {
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lineItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lineItemSpec: {
    fontSize: 10,
    color: colors.textMuted,
  },
  lineItemRate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lineItemAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  modalSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalPrimaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewPromptText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  formInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 6,
  },
  formTextInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  formRow: {
    flexDirection: 'row',
  },
  formDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  pickerBox: {
    marginBottom: 6,
  },
  pickerScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  pickerChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  pickerChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityPillActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  priorityPillText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  priorityPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  smtpNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: 8,
    borderRadius: borderRadius.sm,
    gap: 8,
    marginTop: spacing.sm,
  },
  smtpNoticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.accentDark,
    lineHeight: 15,
  },
}));
