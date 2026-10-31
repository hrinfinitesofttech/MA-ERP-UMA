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
  Warehouse,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Building,
  FileText,
  IndianRupee,
  Layers,
  Send,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  FileCheck2,
  User,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  RotateCcw,
  Boxes,
  ArrowRightLeft,
  QrCode,
  Tag,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  inventoryApi,
  StoreDashboardSummary,
  ItemMasterItem,
  GoodsReceiptNoteItem,
  QCInspectionItem,
  StockBalanceItem,
  StockReservationItem,
  MaterialIssueItem,
  MaterialReturnItem,
  StockTransferItem,
  WarehouseItem,
  ItemCategoryItem,
  UOMMasterItem,
} from '../../api/inventory';

interface StoreWarehouseScreenProps {
  onBackToDashboard: () => void;
}

type StoreTab = 'dashboard' | 'items' | 'grn' | 'qc' | 'stock' | 'issues';

export const StoreWarehouseScreen: React.FC<StoreWarehouseScreenProps> = ({
  onBackToDashboard,
}) => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<StoreTab>('dashboard');

  // Loading & Refresh State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Data Stores
  const [summary, setSummary] = useState<StoreDashboardSummary | null>(null);
  const [items, setItems] = useState<ItemMasterItem[]>([]);
  const [grns, setGrns] = useState<GoodsReceiptNoteItem[]>([]);
  const [qcInspections, setQcInspections] = useState<QCInspectionItem[]>([]);
  const [stockBalances, setStockBalances] = useState<StockBalanceItem[]>([]);
  const [reservations, setReservations] = useState<StockReservationItem[]>([]);
  const [materialIssues, setMaterialIssues] = useState<MaterialIssueItem[]>([]);
  const [materialReturns, setMaterialReturns] = useState<MaterialReturnItem[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransferItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [categories, setCategories] = useState<ItemCategoryItem[]>([]);
  const [uoms, setUoms] = useState<UOMMasterItem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [issueSubTab, setIssueSubTab] = useState<'issues' | 'returns'>('issues');

  // Modal States
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceiptNoteItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemMasterItem | null>(null);

  // New Item Modal
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Raw Material');
  const [newItemUOM, setNewItemUOM] = useState('Kg');
  const [newItemReorder, setNewItemReorder] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemSpec, setNewItemSpec] = useState('');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // New Material Issue Modal
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [issueProject, setIssueProject] = useState('');
  const [issueWorkOrder, setIssueWorkOrder] = useState('');
  const [issueDepartment, setIssueDepartment] = useState('Production');
  const [issueTo, setIssueTo] = useState('');
  const [issueItemCode, setIssueItemCode] = useState('');
  const [issueQty, setIssueQty] = useState('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // New Material Return Modal
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [returnProject, setReturnProject] = useState('');
  const [returnIssueRef, setReturnIssueRef] = useState('');
  const [returnBy, setReturnBy] = useState('');
  const [returnItemCode, setReturnItemCode] = useState('');
  const [returnQty, setReturnQty] = useState('');
  const [returnReason, setReturnReason] = useState('Excess Material');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Quick QC Modal
  const [showQCModal, setShowQCModal] = useState(false);
  const [qcTargetGRN, setQcTargetGRN] = useState<GoodsReceiptNoteItem | null>(null);
  const [qcDecision, setQcDecision] = useState<'Pass' | 'Fail' | 'Conditional Approval'>('Pass');
  const [qcRemarks, setQcRemarks] = useState('');
  const [isSubmittingQC, setIsSubmittingQC] = useState(false);

  // Stock Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFromWH, setTransferFromWH] = useState('wh-main');
  const [transferToWH, setTransferToWH] = useState('wh-scrap');
  const [transferItemCode, setTransferItemCode] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [transferReason, setTransferReason] = useState('Damaged Stock / Segregation');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch live inventory data
  const loadData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [sum, itms, grnList, qcList, balances, resList, issList, retList, trnList, whList, catList, uomList] =
        await Promise.all([
          inventoryApi.getDashboardSummary(),
          inventoryApi.getItems(),
          inventoryApi.getGoodsReceipts(),
          inventoryApi.getQCInspections(),
          inventoryApi.getStockBalances(),
          inventoryApi.getStockReservations(),
          inventoryApi.getMaterialIssues(),
          inventoryApi.getMaterialReturns(),
          inventoryApi.getStockTransfers(),
          inventoryApi.getWarehouses(),
          inventoryApi.getCategories(),
          inventoryApi.getUOMs(),
        ]);

      setSummary(sum);
      setItems(itms);
      setGrns(grnList);
      setQcInspections(qcList);
      setStockBalances(balances);
      setReservations(resList);
      setMaterialIssues(issList);
      setMaterialReturns(retList);
      setStockTransfers(trnList);
      setWarehouses(whList);
      setCategories(catList);
      setUoms(uomList);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sync live inventory data');
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

  // Filtered Item Master
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (item.item_code || item.itemCode || '').toLowerCase();
      const name = (item.item_name || item.itemName || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const brand = (item.brand_make || item.brandMake || '').toLowerCase();
      const matchesSearch = !q || code.includes(q) || name.includes(q) || cat.includes(q) || brand.includes(q);

      if (!matchesSearch) return false;
      if (categoryFilter === 'ALL') return true;

      return (item.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    });
  }, [items, searchQuery, categoryFilter]);

  // Filtered GRNs
  const filteredGRNs = useMemo(() => {
    return grns.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (g.grn_number || g.grnNumber || '').toLowerCase();
      const sup = (g.supplier_name || g.supplierName || '').toLowerCase();
      const po = (g.po_number || g.poNumber || '').toLowerCase();
      const ch = (g.delivery_challan_number || g.challan_number || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || sup.includes(q) || po.includes(q) || ch.includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const st = (g.status || '').toLowerCase();
      if (statusFilter === 'RECEIVED') return st.includes('received') || st.includes('draft');
      if (statusFilter === 'PENDING_QC') return st.includes('pending') || st.includes('inspection');
      if (statusFilter === 'ACCEPTED') return st.includes('accepted') || st.includes('closed');
      if (statusFilter === 'REJECTED') return st.includes('rejected');
      return true;
    });
  }, [grns, searchQuery, statusFilter]);

  // Filtered Stock Balances
  const filteredBalances = useMemo(() => {
    return stockBalances.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (b.item_code || b.itemCode || '').toLowerCase();
      const name = (b.item_name || b.itemName || '').toLowerCase();
      const wh = (b.warehouse_name || b.warehouseName || b.warehouse_id || '').toLowerCase();
      const loc = (b.location || b.locationCode || '').toLowerCase();
      return !q || code.includes(q) || name.includes(q) || wh.includes(q) || loc.includes(q);
    });
  }, [stockBalances, searchQuery]);

  // Filtered Material Issues
  const filteredIssues = useMemo(() => {
    return materialIssues.filter((iss) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (iss.issue_number || iss.issueNumber || '').toLowerCase();
      const to = (iss.issued_to || iss.issuedTo || '').toLowerCase();
      const prj = (iss.project_id || iss.job_number || '').toLowerCase();
      return !q || num.includes(q) || to.includes(q) || prj.includes(q);
    });
  }, [materialIssues, searchQuery]);

  // Filtered Material Returns
  const filteredReturns = useMemo(() => {
    return materialReturns.filter((ret) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (ret.return_number || ret.returnNumber || '').toLowerCase();
      const by = (ret.returned_by || ret.returnedBy || '').toLowerCase();
      const prj = (ret.project_id || ret.job_number || '').toLowerCase();
      return !q || num.includes(q) || by.includes(q) || prj.includes(q);
    });
  }, [materialReturns, searchQuery]);

  // -------------------------------------------------------------
  // WORKFLOW ACTION HANDLERS
  // -------------------------------------------------------------

  // Create Item Master
  const handleCreateItem = async () => {
    if (!newItemCode.trim() || !newItemName.trim()) {
      Alert.alert('Validation Error', 'Item Code and Item Name are required.');
      return;
    }

    setIsSubmittingItem(true);
    try {
      const payload: Partial<ItemMasterItem> = {
        item_code: newItemCode.trim(),
        itemCode: newItemCode.trim(),
        item_name: newItemName.trim(),
        itemName: newItemName.trim(),
        category: newItemCategory,
        uom: newItemUOM,
        reorder_level: parseFloat(newItemReorder) || 0,
        reorderLevel: parseFloat(newItemReorder) || 0,
        unit_cost: parseFloat(newItemCost) || 0,
        standardCost: parseFloat(newItemCost) || 0,
        specification: newItemSpec.trim(),
        status: 'Active',
      };

      await inventoryApi.createItem(payload);
      showToast(`Item ${newItemCode.trim()} created successfully`);
      setShowNewItemModal(false);
      setNewItemCode('');
      setNewItemName('');
      setNewItemReorder('');
      setNewItemCost('');
      setNewItemSpec('');
      loadData();
    } catch (err: any) {
      Alert.alert('Item Creation Failed', err?.response?.data?.error || err?.message || 'Server rejected item creation.');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Submit QC Decision
  const handleRecordQC = async () => {
    if (!qcTargetGRN) return;

    setIsSubmittingQC(true);
    try {
      const payload: Partial<QCInspectionItem> = {
        grn_id: qcTargetGRN.id,
        grn_number: qcTargetGRN.grn_number || qcTargetGRN.grnNumber,
        inspector: 'Suresh Patel (Sr. QC Lead)',
        overall_result: qcDecision,
        qcResult: qcDecision,
        remarks: qcRemarks.trim(),
      };

      await inventoryApi.createQCInspection(payload);
      showToast(`QC Recorded for ${qcTargetGRN.grn_number || qcTargetGRN.grnNumber}: ${qcDecision}`);
      setShowQCModal(false);
      setQcRemarks('');
      loadData();
    } catch (err: any) {
      Alert.alert('QC Submission Failed', err?.message || 'Could not record inspection.');
    } finally {
      setIsSubmittingQC(false);
    }
  };

  // Issue Material to Shop Floor
  const handleCreateIssue = async () => {
    if (!issueItemCode.trim() || !issueQty.trim()) {
      Alert.alert('Validation Error', 'Please specify Item Code and Issued Quantity.');
      return;
    }

    const qty = parseFloat(issueQty) || 0;
    if (qty <= 0) {
      Alert.alert('Validation Error', 'Issue quantity must be greater than zero.');
      return;
    }

    // Client-side Stock Balance sanity check
    const stockBal = stockBalances.find(
      (b) =>
        (b.item_code || b.itemCode || '').toLowerCase() === issueItemCode.toLowerCase().trim() ||
        (b.item_name || b.itemName || '').toLowerCase().includes(issueItemCode.toLowerCase().trim())
    );
    const usable = stockBal?.usableQty ?? stockBal?.availableQty ?? stockBal?.quantity ?? 0;

    if (stockBal && qty > usable) {
      Alert.alert(
        'Insufficient Stock Alert',
        `Requested quantity (${qty}) exceeds current usable stock (${usable} ${stockBal.uom || 'units'}). Please adjust quantity.`
      );
      return;
    }

    setIsSubmittingIssue(true);
    try {
      const payload: Partial<MaterialIssueItem> = {
        project_id: issueProject.trim() || 'PRJ-2026-0001',
        work_order_number: issueWorkOrder.trim() || 'WO-2026-001',
        department: issueDepartment,
        issued_to: issueTo.trim() || 'Production Floor',
        status: 'Fully Issued',
        items: [
          {
            item_code: stockBal?.item_code || issueItemCode.trim(),
            itemCode: stockBal?.item_code || issueItemCode.trim(),
            item_name: stockBal?.item_name || 'Material Item',
            itemName: stockBal?.item_name || 'Material Item',
            issuedQuantity: qty,
            issuedQty: qty,
            uom: stockBal?.uom || 'NOS',
            unitPrice: stockBal?.unit_rate || stockBal?.averageRate || 0,
            rate: stockBal?.unit_rate || stockBal?.averageRate || 0,
            totalCost: qty * (stockBal?.unit_rate || stockBal?.averageRate || 0),
          },
        ],
      };

      await inventoryApi.createMaterialIssue(payload);
      showToast(`Material Issued successfully (${qty} units)`);
      setShowNewIssueModal(false);
      setIssueProject('');
      setIssueWorkOrder('');
      setIssueTo('');
      setIssueItemCode('');
      setIssueQty('');
      loadData();
    } catch (err: any) {
      Alert.alert('Material Issue Failed', err?.response?.data?.error || err?.message || 'Server rejected issue transaction.');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Return Material from Production
  const handleCreateReturn = async () => {
    if (!returnItemCode.trim() || !returnQty.trim()) {
      Alert.alert('Validation Error', 'Please specify Item Code and Return Quantity.');
      return;
    }

    const qty = parseFloat(returnQty) || 0;
    if (qty <= 0) {
      Alert.alert('Validation Error', 'Return quantity must be greater than zero.');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const payload: Partial<MaterialReturnItem> = {
        project_id: returnProject.trim() || 'PRJ-2026-0001',
        material_issue_number: returnIssueRef.trim() || 'ISS-2026-001',
        returned_by: returnBy.trim() || 'Ketan Parmar (Shop Supervisor)',
        status: 'Completed',
        notes: `Reason: ${returnReason}`,
        items: [
          {
            item_code: returnItemCode.trim(),
            itemCode: returnItemCode.trim(),
            returnQuantity: qty,
            returnQty: qty,
            condition: 'Usable',
            uom: 'NOS',
            unitPrice: 0,
          },
        ],
      };

      await inventoryApi.createMaterialReturn(payload);
      showToast(`Material Returned (${qty} units)`);
      setShowNewReturnModal(false);
      setReturnProject('');
      setReturnIssueRef('');
      setReturnBy('');
      setReturnItemCode('');
      setReturnQty('');
      loadData();
    } catch (err: any) {
      Alert.alert('Material Return Failed', err?.response?.data?.error || err?.message || 'Server rejected return.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Stock Transfer between Warehouses
  const handleCreateTransfer = async () => {
    if (!transferItemCode.trim() || !transferQty.trim()) {
      Alert.alert('Validation Error', 'Please specify Item Code and Transfer Quantity.');
      return;
    }

    const qty = parseFloat(transferQty) || 0;
    if (qty <= 0) {
      Alert.alert('Validation Error', 'Transfer quantity must be greater than zero.');
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const fromWHObj = warehouses.find((w) => w.id === transferFromWH);
      const toWHObj = warehouses.find((w) => w.id === transferToWH);

      const payload: Partial<StockTransferItem> = {
        from_warehouse_id: transferFromWH,
        from_warehouse_name: fromWHObj?.name || fromWHObj?.warehouseName || 'Main Store',
        to_warehouse_id: transferToWH,
        to_warehouse_name: toWHObj?.name || toWHObj?.warehouseName || 'Secondary Store',
        reason: transferReason,
        status: 'Completed',
        items: [
          {
            item_code: transferItemCode.trim(),
            itemCode: transferItemCode.trim(),
            quantity: qty,
            uom: 'NOS',
          },
        ],
      };

      await inventoryApi.createStockTransfer(payload);
      showToast(`Stock Transferred (${qty} units)`);
      setShowTransferModal(false);
      setTransferItemCode('');
      setTransferQty('');
      loadData();
    } catch (err: any) {
      Alert.alert('Transfer Failed', err?.message || 'Could not post transfer.');
    } finally {
      setIsSubmittingTransfer(false);
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

    if (s.includes('accepted') || s.includes('pass') || s.includes('active') || s.includes('completed') || s.includes('fully issued')) {
      bg = colors.successLight;
      text = colors.success;
      border = colors.successBorder;
    } else if (s.includes('pending') || s.includes('received') || s.includes('inspection') || s.includes('draft') || s.includes('partially') || s.includes('conditional')) {
      bg = colors.warningLight;
      text = colors.warning;
      border = colors.warningBorder;
    } else if (s.includes('fail') || s.includes('rejected') || s.includes('cancelled') || s.includes('shortage')) {
      bg = colors.dangerLight;
      text = colors.danger;
      border = colors.dangerBorder;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{status || 'Active'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Sub-Header with Back & Quick Action */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTitleContainer}>
          <Text style={styles.topBarTitle}>Store & Warehouse</Text>
          <Text style={styles.topBarSubtitle}>Item Master • GRN • QC • Balances • Issues</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <RefreshCw size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

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

      {/* 4. Executive Inventory KPI Ribbon */}
      <View style={styles.kpiRibbon}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.primarySubtle }]}>
              <Package size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.totalActiveItems ?? items.length}</Text>
              <Text style={styles.kpiLabel}>Active Items</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.successLight }]}>
              <IndianRupee size={18} color={colors.success} />
            </View>
            <View>
              <Text style={styles.kpiValue}>
                ₹{((summary?.totalStockValue || 0) / 100000).toFixed(1)}L
              </Text>
              <Text style={styles.kpiLabel}>Stock Valuation</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.dangerLight }]}>
              <AlertTriangle size={18} color={colors.danger} />
            </View>
            <View>
              <Text style={[styles.kpiValue, { color: colors.danger }]}>{summary?.lowStockCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>Low Stock Items</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.accentLight }]}>
              <Truck size={18} color={colors.accentDark} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.pendingGRNCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>Pending GRN</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.warningLight }]}>
              <ShieldCheck size={18} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.pendingQCCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>QC Pending</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: colors.purpleLight }]}>
              <Boxes size={18} color={colors.purple} />
            </View>
            <View>
              <Text style={styles.kpiValue}>{summary?.totalReservationsCount ?? reservations.length}</Text>
              <Text style={styles.kpiLabel}>Job Reserved</Text>
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
            style={[styles.tabButton, activeTab === 'items' && styles.tabButtonActive]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'items' && styles.tabButtonTextActive]}>
              Item Master ({items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'grn' && styles.tabButtonActive]}
            onPress={() => setActiveTab('grn')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'grn' && styles.tabButtonTextActive]}>
              GRN & Inward ({grns.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'qc' && styles.tabButtonActive]}
            onPress={() => setActiveTab('qc')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'qc' && styles.tabButtonTextActive]}>
              QC Inspection ({qcInspections.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'stock' && styles.tabButtonActive]}
            onPress={() => setActiveTab('stock')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'stock' && styles.tabButtonTextActive]}>
              Stock Balances ({stockBalances.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'issues' && styles.tabButtonActive]}
            onPress={() => setActiveTab('issues')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'issues' && styles.tabButtonTextActive]}>
              Issues & Returns
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 6. Search Bar & Status Filter Chips */}
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

          {activeTab === 'items' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['ALL', 'Raw Material', 'Hardware', 'Fasteners', 'Bought-out', 'Consumables'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {activeTab === 'grn' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
              {['ALL', 'RECEIVED', 'PENDING_QC', 'ACCEPTED', 'REJECTED'].map((st) => (
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
          <Text style={styles.loadingText}>Loading live inventory data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.contentScrollContent}
        >
          {/* TAB 1: DASHBOARD / LIFECYCLE */}
          {activeTab === 'dashboard' && (
            <View>
              {/* Inward-Outward Lifecycle Flow */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Inward-Outward Inventory Flow</Text>
                  <Text style={styles.cardMeta}>Rajpur Works Store</Text>
                </View>
                <View style={styles.workflowGrid}>
                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.accentLight }]}>
                      <Truck size={16} color={colors.accentDark} />
                    </View>
                    <Text style={styles.stageTitle}>1. Gate / GRN</Text>
                    <Text style={styles.stageCount}>{grns.length} Inwards</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.warningLight }]}>
                      <ShieldCheck size={16} color={colors.warning} />
                    </View>
                    <Text style={styles.stageTitle}>2. QC Check</Text>
                    <Text style={styles.stageCount}>{qcInspections.length} Tests</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.primarySubtle }]}>
                      <Warehouse size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.stageTitle}>3. Put-away</Text>
                    <Text style={styles.stageCount}>Racks & Bins</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.purpleLight }]}>
                      <Boxes size={16} color={colors.purple} />
                    </View>
                    <Text style={styles.stageTitle}>4. Reservation</Text>
                    <Text style={styles.stageCount}>{reservations.length} Jobs</Text>
                  </View>
                  <View style={styles.stageArrow}>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>

                  <View style={styles.stageNode}>
                    <View style={[styles.stageIconBox, { backgroundColor: colors.successLight }]}>
                      <Send size={16} color={colors.success} />
                    </View>
                    <Text style={styles.stageTitle}>5. Shop Issue</Text>
                    <Text style={styles.stageCount}>{materialIssues.length} Slips</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.primaryActionButton} onPress={() => setShowNewItemModal(true)}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionButtonText}>New Item Master</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryActionButton} onPress={() => setShowNewIssueModal(true)}>
                  <Send size={18} color={colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>Issue to Shop</Text>
                </TouchableOpacity>
              </View>

              {/* Low Stock Warning Card */}
              {items.filter((i) => Number(i.reorder_level || i.reorderLevel || 0) > 0 && Number(i.current_stock || i.currentStock || 0) <= Number(i.reorder_level || i.reorderLevel || 0)).length > 0 && (
                <View style={[styles.card, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerLight }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={18} color={colors.danger} />
                      <Text style={[styles.cardTitle, { color: colors.danger }]}>Reorder Level Breach</Text>
                    </View>
                    <Text style={[styles.cardMeta, { color: colors.danger }]}>Urgent Inward Required</Text>
                  </View>

                  {items
                    .filter((i) => Number(i.reorder_level || i.reorderLevel || 0) > 0 && Number(i.current_stock || i.currentStock || 0) <= Number(i.reorder_level || i.reorderLevel || 0))
                    .slice(0, 3)
                    .map((item) => (
                      <View key={item.id} style={styles.lowStockRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lowStockCode}>{item.item_code || item.itemCode}</Text>
                          <Text style={styles.lowStockName}>{item.item_name || item.itemName}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.lowStockVal}>Stock: {item.current_stock || item.currentStock || 0} {item.uom}</Text>
                          <Text style={styles.lowStockReorder}>Reorder Min: {item.reorder_level || item.reorderLevel} {item.uom}</Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}

              {/* Warehouses Capacity Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Warehouse Locations & Bays</Text>
                  <Text style={styles.cardMeta}>{warehouses.length} Facilities</Text>
                </View>

                {warehouses.map((w) => (
                  <View key={w.id} style={styles.warehouseRow}>
                    <View style={styles.warehouseIconCol}>
                      <Building size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.warehouseName}>{w.name || w.warehouseName}</Text>
                      <Text style={styles.warehouseSub}>Code: {w.warehouse_code || w.warehouseCode} • In-charge: {w.incharge || 'Store Manager'}</Text>
                      <Text style={styles.warehouseLoc}>Site: {w.location || 'Makarpura Works Unit 1'}</Text>
                    </View>
                    {renderStatusBadge(w.status || 'Active')}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: ITEM MASTER */}
          {activeTab === 'items' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredItems.length} Materials</Text>
                <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewItemModal(true)}>
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addInlineBtnText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Package size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No items match your criteria.</Text>
                </View>
              ) : (
                filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.entityCard}
                    activeOpacity={0.8}
                    onPress={() => setSelectedItem(item)}
                  >
                    <View style={styles.entityCardHeader}>
                      <View style={styles.entityCardTitleCol}>
                        <Text style={styles.entityCode}>{item.item_code || item.itemCode}</Text>
                        <Text style={styles.entityTitle}>{item.item_name || item.itemName}</Text>
                      </View>
                      {renderStatusBadge(item.status || 'Active')}
                    </View>

                    {!!item.specification && (
                      <Text style={styles.itemSpecText}>{item.specification}</Text>
                    )}

                    <View style={styles.entityMetaGrid}>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Category</Text>
                        <Text style={styles.metaVal}>{item.category || 'General'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Current Stock</Text>
                        <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '800' }]}>
                          {item.current_stock ?? item.currentStock ?? 0} {item.uom}
                        </Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Reorder Min</Text>
                        <Text style={styles.metaVal}>{item.reorder_level || item.reorderLevel || 0} {item.uom}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Std Cost</Text>
                        <Text style={styles.metaVal}>₹{(item.unit_cost || item.standardCost || 0).toLocaleString('en-IN')}</Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <Text style={styles.hsnText}>HSN: {item.hsn_sac || item.hsnSac || '7219'} ({item.gst_rate || item.gstRate || 18}% GST)</Text>
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => setSelectedItem(item)}
                      >
                        <Eye size={14} color={colors.primary} />
                        <Text style={[styles.actionPillText, { color: colors.primary }]}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* TAB 3: GOODS RECEIPT NOTES (GRN) */}
          {activeTab === 'grn' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredGRNs.length} GRNs</Text>
              </View>

              {filteredGRNs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Truck size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No Goods Receipt Notes registered.</Text>
                </View>
              ) : (
                filteredGRNs.map((g) => (
                  <View key={g.id} style={styles.entityCard}>
                    <View style={styles.entityCardHeader}>
                      <View style={styles.entityCardTitleCol}>
                        <Text style={styles.entityCode}>{g.grn_number || g.grnNumber}</Text>
                        <Text style={styles.entityTitle}>{g.supplier_name || g.supplierName}</Text>
                      </View>
                      {renderStatusBadge(g.status || 'Received')}
                    </View>

                    <View style={styles.entityMetaGrid}>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>PO Number</Text>
                        <Text style={styles.metaVal}>{g.po_number || g.poNumber || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Challan No</Text>
                        <Text style={styles.metaVal}>{g.delivery_challan_number || g.challan_number || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Receipt Date</Text>
                        <Text style={styles.metaVal}>{g.date || g.grn_date || '—'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Total Value</Text>
                        <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '700' }]}>
                          ₹{(g.total_received_value || g.grand_total || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionPill, { backgroundColor: colors.warningLight }]}
                        onPress={() => {
                          setQcTargetGRN(g);
                          setShowQCModal(true);
                        }}
                      >
                        <ShieldCheck size={14} color={colors.warning} />
                        <Text style={[styles.actionPillText, { color: colors.warning }]}>Record QC</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => setSelectedGRN(g)}
                      >
                        <Eye size={14} color={colors.primary} />
                        <Text style={[styles.actionPillText, { color: colors.primary }]}>Inspect</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: QC INSPECTION */}
          {activeTab === 'qc' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {qcInspections.length} QC Inspection Reports</Text>
              </View>

              {qcInspections.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ShieldCheck size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No QC inspection reports filed.</Text>
                </View>
              ) : (
                qcInspections.map((qc) => (
                  <View key={qc.id} style={styles.entityCard}>
                    <View style={styles.entityCardHeader}>
                      <View>
                        <Text style={styles.entityCode}>{qc.inspection_number || qc.inspectionNumber || qc.id}</Text>
                        <Text style={styles.entitySub}>GRN: {qc.grn_number || qc.grnNumber} • Inspector: {qc.inspector || qc.inspectorName}</Text>
                      </View>
                      {renderStatusBadge(qc.overall_result || qc.qcResult || 'Pass')}
                    </View>

                    <View style={styles.entityMetaGrid}>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Item Inspected</Text>
                        <Text style={styles.metaVal}>{qc.item_name || qc.itemName || qc.item_code || 'Material'}</Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Accepted Qty</Text>
                        <Text style={[styles.metaVal, { color: colors.success, fontWeight: '700' }]}>
                          {qc.accepted_quantity || qc.acceptedQuantity || 0}
                        </Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Rejected Qty</Text>
                        <Text style={[styles.metaVal, { color: colors.danger, fontWeight: '700' }]}>
                          {qc.rejected_quantity || qc.rejectedQuantity || 0}
                        </Text>
                      </View>
                      <View style={styles.metaCell}>
                        <Text style={styles.metaLabel}>Test Date</Text>
                        <Text style={styles.metaVal}>{qc.inspection_date || qc.inspectionDate || '—'}</Text>
                      </View>
                    </View>

                    {!!(qc.remarks || qc.rejection_reason) && (
                      <Text style={styles.qcRemarkText}>
                        Notes: {qc.remarks || qc.rejection_reason}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 5: STOCK BALANCES */}
          {activeTab === 'stock' && (
            <View>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderCount}>Showing {filteredBalances.length} Warehouse Stock Balances</Text>
                <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowTransferModal(true)}>
                  <ArrowRightLeft size={16} color={colors.primary} />
                  <Text style={styles.addInlineBtnText}>Transfer</Text>
                </TouchableOpacity>
              </View>

              {filteredBalances.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Boxes size={40} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No stock balances recorded.</Text>
                </View>
              ) : (
                filteredBalances.map((b) => {
                  const qty = Number(b.quantity || b.availableQty || b.available_quantity || 0);
                  const res = Number(b.reserved_quantity || b.reservedQty || 0);
                  const usable = Number(b.usableQty || Math.max(0, qty - res));
                  const uom = b.uom || 'Kg';

                  return (
                    <View key={b.id} style={styles.entityCard}>
                      <View style={styles.entityCardHeader}>
                        <View style={styles.entityCardTitleCol}>
                          <Text style={styles.entityCode}>{b.item_code || b.itemCode}</Text>
                          <Text style={styles.entityTitle}>{b.item_name || b.itemName}</Text>
                        </View>
                        {renderStatusBadge(usable > 0 ? 'In Stock' : 'Out of Stock')}
                      </View>

                      <View style={styles.stockQtyMatrix}>
                        <View style={styles.stockMatrixCol}>
                          <Text style={styles.stockMatrixLabel}>On-Hand</Text>
                          <Text style={styles.stockMatrixVal}>{qty} {uom}</Text>
                        </View>
                        <View style={styles.stockMatrixCol}>
                          <Text style={styles.stockMatrixLabel}>Reserved</Text>
                          <Text style={[styles.stockMatrixVal, { color: colors.warning }]}>{res} {uom}</Text>
                        </View>
                        <View style={styles.stockMatrixCol}>
                          <Text style={styles.stockMatrixLabel}>Usable Free</Text>
                          <Text style={[styles.stockMatrixVal, { color: colors.success, fontWeight: '800' }]}>
                            {usable} {uom}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stockFooterRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color={colors.textMuted} />
                          <Text style={styles.stockFooterLoc}>
                            {b.warehouse_name || b.warehouseName || 'Main Store'} • Bin: {b.location || b.locationCode || 'RACK-01'}
                          </Text>
                        </View>
                        <Text style={styles.stockValuationText}>
                          Value: ₹{(b.total_value || b.stockValue || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 6: MATERIAL ISSUES & RETURNS */}
          {activeTab === 'issues' && (
            <View>
              {/* Sub-Tabs: Issues vs Returns */}
              <View style={styles.subToggleContainer}>
                <TouchableOpacity
                  style={[styles.subToggleBtn, issueSubTab === 'issues' && styles.subToggleBtnActive]}
                  onPress={() => setIssueSubTab('issues')}
                >
                  <Text style={[styles.subToggleBtnText, issueSubTab === 'issues' && styles.subToggleBtnTextActive]}>
                    Material Issues ({materialIssues.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subToggleBtn, issueSubTab === 'returns' && styles.subToggleBtnActive]}
                  onPress={() => setIssueSubTab('returns')}
                >
                  <Text style={[styles.subToggleBtnText, issueSubTab === 'returns' && styles.subToggleBtnTextActive]}>
                    Material Returns ({materialReturns.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {issueSubTab === 'issues' ? (
                <View>
                  <View style={styles.listHeaderRow}>
                    <Text style={styles.listHeaderCount}>Showing {filteredIssues.length} Material Issue Slips</Text>
                    <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewIssueModal(true)}>
                      <Plus size={16} color={colors.primary} />
                      <Text style={styles.addInlineBtnText}>Issue Slip</Text>
                    </TouchableOpacity>
                  </View>

                  {filteredIssues.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Send size={40} color={colors.textMuted} />
                      <Text style={styles.emptyText}>No material issues recorded.</Text>
                    </View>
                  ) : (
                    filteredIssues.map((iss) => (
                      <View key={iss.id} style={styles.entityCard}>
                        <View style={styles.entityCardHeader}>
                          <View>
                            <Text style={styles.entityCode}>{iss.issue_number || iss.issueNumber}</Text>
                            <Text style={styles.entitySub}>
                              Issued To: {iss.issued_to || iss.issuedTo} • Project: {iss.project_id || 'General'}
                            </Text>
                          </View>
                          {renderStatusBadge(iss.status || 'Fully Issued')}
                        </View>

                        <View style={styles.entityMetaGrid}>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Work Order</Text>
                            <Text style={styles.metaVal}>{iss.work_order_number || 'WO-2026'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Issue Date</Text>
                            <Text style={styles.metaVal}>{iss.issue_date || iss.issueDate || '—'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Store In-charge</Text>
                            <Text style={styles.metaVal}>{iss.issued_by || iss.issuedBy || 'Store Head'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Items Count</Text>
                            <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '700' }]}>
                              {iss.items?.length || 1} Items
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ) : (
                <View>
                  <View style={styles.listHeaderRow}>
                    <Text style={styles.listHeaderCount}>Showing {filteredReturns.length} Material Return Slips</Text>
                    <TouchableOpacity style={styles.addInlineBtn} onPress={() => setShowNewReturnModal(true)}>
                      <Plus size={16} color={colors.primary} />
                      <Text style={styles.addInlineBtnText}>Return Slip</Text>
                    </TouchableOpacity>
                  </View>

                  {filteredReturns.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <RotateCcw size={40} color={colors.textMuted} />
                      <Text style={styles.emptyText}>No material returns recorded.</Text>
                    </View>
                  ) : (
                    filteredReturns.map((ret) => (
                      <View key={ret.id} style={styles.entityCard}>
                        <View style={styles.entityCardHeader}>
                          <View>
                            <Text style={styles.entityCode}>{ret.return_number || ret.returnNumber}</Text>
                            <Text style={styles.entitySub}>
                              Returned By: {ret.returned_by || ret.returnedBy} • Project: {ret.project_id || 'General'}
                            </Text>
                          </View>
                          {renderStatusBadge(ret.status || 'Completed')}
                        </View>

                        <View style={styles.entityMetaGrid}>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Issue Ref</Text>
                            <Text style={styles.metaVal}>{ret.material_issue_number || '—'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Return Date</Text>
                            <Text style={styles.metaVal}>{ret.return_date || ret.returnDate || '—'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Received By</Text>
                            <Text style={styles.metaVal}>{ret.received_by || ret.receivedBy || 'Store Head'}</Text>
                          </View>
                          <View style={styles.metaCell}>
                            <Text style={styles.metaLabel}>Items Count</Text>
                            <Text style={[styles.metaVal, { color: colors.success, fontWeight: '700' }]}>
                              {ret.items?.length || 1} Items
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MODAL: GRN 360° DETAIL INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={!!selectedGRN} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedGRN?.grn_number || selectedGRN?.grnNumber}</Text>
                <Text style={styles.modalSubTitle}>{selectedGRN?.supplier_name || selectedGRN?.supplierName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedGRN(null)}>
                <X size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionHeader}>Inward Document Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  {selectedGRN && renderStatusBadge(selectedGRN.status)}
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>GRN Date:</Text>
                  <Text style={styles.detailVal}>{selectedGRN?.date || selectedGRN?.grnDate || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PO Reference:</Text>
                  <Text style={styles.detailVal}>{selectedGRN?.po_number || selectedGRN?.poNumber || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Challan:</Text>
                  <Text style={styles.detailVal}>{selectedGRN?.delivery_challan_number || selectedGRN?.challan_number || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vehicle No:</Text>
                  <Text style={styles.detailVal}>{selectedGRN?.vehicle_number || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Received By:</Text>
                  <Text style={styles.detailVal}>{selectedGRN?.received_by || 'Store Officer'}</Text>
                </View>
              </View>

              {/* Line Items */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionHeader}>Inward Material Items ({selectedGRN?.items?.length || 0})</Text>
                {selectedGRN?.items && selectedGRN.items.length > 0 ? (
                  selectedGRN.items.map((item, idx) => (
                    <View key={idx} style={styles.lineItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lineItemName}>{item.item_name || item.itemName || 'Material'}</Text>
                        <Text style={styles.lineItemSpec}>{item.specification || item.item_code || item.itemCode}</Text>
                        <Text style={styles.lineItemRate}>
                          Received: {item.received_quantity || item.receivedQuantity || 0} {item.uom || 'NOS'} • Accepted: {item.accepted_quantity || item.acceptedQuantity || item.receivedQuantity || 0}
                        </Text>
                      </View>
                      <Text style={styles.lineItemAmount}>
                        ₹{(item.total_amount || item.totalAmount || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No item rows specified.</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setSelectedGRN(null)}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL: NEW ITEM MASTER */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewItemModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Item Master</Text>
              <TouchableOpacity onPress={() => setShowNewItemModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Item Code *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. RAW-PL-MS-12MM"
                placeholderTextColor={colors.textMuted}
                value={newItemCode}
                onChangeText={setNewItemCode}
              />

              <Text style={styles.formInputLabel}>Item Description *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. MS Plates IS 2062 Gr.B 12mm"
                placeholderTextColor={colors.textMuted}
                value={newItemName}
                onChangeText={setNewItemName}
              />

              <Text style={styles.formInputLabel}>Material Specification</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. 12mm x 1500mm x 6000mm"
                placeholderTextColor={colors.textMuted}
                value={newItemSpec}
                onChangeText={setNewItemSpec}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formInputLabel}>Category</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Raw Material"
                    placeholderTextColor={colors.textMuted}
                    value={newItemCategory}
                    onChangeText={setNewItemCategory}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formInputLabel}>UOM</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Kg / Nos"
                    placeholderTextColor={colors.textMuted}
                    value={newItemUOM}
                    onChangeText={setNewItemUOM}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formInputLabel}>Reorder Min Level</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newItemReorder}
                    onChangeText={setNewItemReorder}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formInputLabel}>Unit Cost (₹)</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g. 68.50"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={newItemCost}
                    onChangeText={setNewItemCost}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowNewItemModal(false)}
                disabled={isSubmittingItem}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreateItem}
                disabled={isSubmittingItem}
              >
                {isSubmittingItem ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Create Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 10. MODAL: ISSUE MATERIAL SLIP */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewIssueModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Material to Shop</Text>
              <TouchableOpacity onPress={() => setShowNewIssueModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Project Reference</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. PRJ-2026-0001"
                placeholderTextColor={colors.textMuted}
                value={issueProject}
                onChangeText={setIssueProject}
              />

              <Text style={styles.formInputLabel}>Work Order / Job Code</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. WO-2026-001"
                placeholderTextColor={colors.textMuted}
                value={issueWorkOrder}
                onChangeText={setIssueWorkOrder}
              />

              <Text style={styles.formInputLabel}>Issued To (Supervisor / Lead)</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Ketan Parmar (Fabrication Lead)"
                placeholderTextColor={colors.textMuted}
                value={issueTo}
                onChangeText={setIssueTo}
              />

              <View style={styles.formDivider} />
              <Text style={styles.sectionHeader}>Material Selection</Text>

              <Text style={styles.formInputLabel}>Item Code / Material *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. RAW-PL-MS-12MM"
                placeholderTextColor={colors.textMuted}
                value={issueItemCode}
                onChangeText={setIssueItemCode}
              />

              <Text style={styles.formInputLabel}>Quantity to Issue *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. 10"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
                value={issueQty}
                onChangeText={setIssueQty}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowNewIssueModal(false)}
                disabled={isSubmittingIssue}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreateIssue}
                disabled={isSubmittingIssue}
              >
                {isSubmittingIssue ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Authorize Issue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 11. MODAL: RECORD QC DECISION */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showQCModal} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Incoming QC Inspection</Text>
              <TouchableOpacity onPress={() => setShowQCModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.reviewPromptText}>
                Record Quality Control results for GRN: {qcTargetGRN?.grn_number || qcTargetGRN?.grnNumber} from {qcTargetGRN?.supplier_name || qcTargetGRN?.supplierName}.
              </Text>

              <Text style={styles.formInputLabel}>Inspection Decision</Text>
              <View style={styles.priorityRow}>
                {(['Pass', 'Fail', 'Conditional Approval'] as const).map((dec) => (
                  <TouchableOpacity
                    key={dec}
                    style={[styles.priorityPill, qcDecision === dec && styles.priorityPillActive]}
                    onPress={() => setQcDecision(dec)}
                  >
                    <Text style={[styles.priorityPillText, qcDecision === dec && styles.priorityPillTextActive]}>
                      {dec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formInputLabel}>Remarks / Non-conformance Details</Text>
              <TextInput
                style={[styles.formTextInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Visual, dimensional, and MTC verification notes..."
                placeholderTextColor={colors.textMuted}
                value={qcRemarks}
                onChangeText={setQcRemarks}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowQCModal(false)}
                disabled={isSubmittingQC}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  qcDecision === 'Fail' && { backgroundColor: colors.danger },
                ]}
                onPress={handleRecordQC}
                disabled={isSubmittingQC}
              >
                {isSubmittingQC ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Save QC Result</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 12. MODAL: STOCK TRANSFER */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showTransferModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Warehouse Stock Transfer</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formInputLabel}>Source Warehouse</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="Main Store"
                placeholderTextColor={colors.textMuted}
                value={transferFromWH}
                onChangeText={setTransferFromWH}
              />

              <Text style={styles.formInputLabel}>Destination Warehouse</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="Scrap / Rejection Yard"
                placeholderTextColor={colors.textMuted}
                value={transferToWH}
                onChangeText={setTransferToWH}
              />

              <Text style={styles.formInputLabel}>Item Code *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. RAW-PL-MS-12MM"
                placeholderTextColor={colors.textMuted}
                value={transferItemCode}
                onChangeText={setTransferItemCode}
              />

              <Text style={styles.formInputLabel}>Transfer Quantity *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. 5"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
                value={transferQty}
                onChangeText={setTransferQty}
              />

              <Text style={styles.formInputLabel}>Transfer Reason</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. QC Rejection / Yard Segregation"
                placeholderTextColor={colors.textMuted}
                value={transferReason}
                onChangeText={setTransferReason}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowTransferModal(false)}
                disabled={isSubmittingTransfer}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleCreateTransfer}
                disabled={isSubmittingTransfer}
              >
                {isSubmittingTransfer ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryBtnText}>Execute Transfer</Text>
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

const styles = StyleSheet.create({
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
    width: 60,
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
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.dangerBorder,
  },
  lowStockCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  lowStockName: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  lowStockVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.danger,
  },
  lowStockReorder: {
    fontSize: 10,
    color: colors.textMuted,
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  warehouseIconCol: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warehouseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  warehouseSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  warehouseLoc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
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
    marginBottom: 6,
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
  entityTitle: {
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
  itemSpecText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  entityMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: 6,
    gap: 8,
    marginBottom: 6,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  hsnText: {
    fontSize: 10,
    color: colors.textMuted,
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
  qcRemarkText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  stockQtyMatrix: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  stockMatrixCol: {
    alignItems: 'center',
  },
  stockMatrixLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  stockMatrixVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  stockFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stockFooterLoc: {
    fontSize: 10,
    color: colors.textMuted,
  },
  stockValuationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  subToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 3,
    marginBottom: spacing.sm,
  },
  subToggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 4,
  },
  subToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  subToggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subToggleBtnTextActive: {
    color: '#FFFFFF',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
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
});
