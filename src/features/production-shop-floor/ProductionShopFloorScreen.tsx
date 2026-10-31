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
  Platform,
} from 'react-native';
import {
  Factory,
  Briefcase,
  Layers,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Truck,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Activity,
  Play,
  X,
  Calendar,
  User,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  productionApi,
  ManufacturingJobItem,
  WorkOrderItem,
  WorkCenterItem,
  RoutingOperationItem,
  ProductionEntryItem,
  WIPRecordItem,
  ProductionHoldItem,
  FinishedGoodsItem,
  DispatchOrderItem,
  ProductionDashboardStats,
} from '../../api/production';

interface ProductionShopFloorScreenProps {
  onBackToDashboard: () => void;
}

type ProductionTab = 'dashboard' | 'orders' | 'job_cards' | 'bays' | 'logs' | 'wip_dispatch';

export const ProductionShopFloorScreen: React.FC<ProductionShopFloorScreenProps> = ({
  onBackToDashboard,
}) => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<ProductionTab>('dashboard');

  // Loading & Refresh State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live Data Stores
  const [dashboardStats, setDashboardStats] = useState<ProductionDashboardStats | null>(null);
  const [jobs, setJobs] = useState<ManufacturingJobItem[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenterItem[]>([]);
  const [routingOperations, setRoutingOperations] = useState<RoutingOperationItem[]>([]);
  const [productionEntries, setProductionEntries] = useState<ProductionEntryItem[]>([]);
  const [wipRecords, setWipRecords] = useState<WIPRecordItem[]>([]);
  const [productionHolds, setProductionHolds] = useState<ProductionHoldItem[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodsItem[]>([]);
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrderItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selection & Inspector
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderItem | null>(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenterItem | null>(null);

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderJobNumber, setNewOrderJobNumber] = useState('');
  const [newOrderProduct, setNewOrderProduct] = useState('');
  const [newOrderQty, setNewOrderQty] = useState('1');
  const [newOrderPriority, setNewOrderPriority] = useState('High');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Daily Production Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logWorkOrder, setLogWorkOrder] = useState('');
  const [logOperation, setLogOperation] = useState('Longitudinal & Circumferential SAW Seam Welding');
  const [logWorkCenter, setLogWorkCenter] = useState('WC-SAW-01');
  const [logOperator, setLogOperator] = useState('');
  const [logPlannedQty, setLogPlannedQty] = useState('1');
  const [logProducedQty, setLogProducedQty] = useState('1');
  const [logRejectedQty, setLogRejectedQty] = useState('0');
  const [logScrapQty, setLogScrapQty] = useState('0');
  const [logDowntimeMin, setLogDowntimeMin] = useState('0');
  const [logDowntimeReason, setLogDowntimeReason] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // New Routing Operation Modal
  const [showOpModal, setShowOpModal] = useState(false);
  const [opName, setOpName] = useState('');
  const [opSequence, setOpSequence] = useState('10');
  const [opBay, setOpBay] = useState('WC-PLASMA-01');
  const [opMachine, setOpMachine] = useState('Messer MultiTherm 4000');
  const [opOperator, setOpOperator] = useState('');
  const [opSetupMin, setOpSetupMin] = useState('30');
  const [opProcessMin, setOpProcessMin] = useState('180');
  const [isSubmittingOp, setIsSubmittingOp] = useState(false);

  // Production Hold Modal
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdOrderNumber, setHoldOrderNumber] = useState('');
  const [holdReason, setHoldReason] = useState('Material Shortage');
  const [holdDescription, setHoldDescription] = useState('');
  const [isSubmittingHold, setIsSubmittingHold] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch live production data
  const loadData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [stats, jList, woList, wcList, roList, peList, wipList, hldList, fgList, dispList] =
        await Promise.all([
          productionApi.getDashboardStats().catch(() => null),
          productionApi.getJobs().catch(() => []),
          productionApi.getWorkOrders().catch(() => []),
          productionApi.getWorkCenters().catch(() => []),
          productionApi.getRoutingOperations().catch(() => []),
          productionApi.getProductionEntries().catch(() => []),
          productionApi.getWIPRecords().catch(() => []),
          productionApi.getProductionHolds().catch(() => []),
          productionApi.getFinishedGoods().catch(() => []),
          productionApi.getDispatchOrders().catch(() => []),
        ]);

      setDashboardStats(stats);
      setJobs(jList);
      setWorkOrders(woList);
      setWorkCenters(wcList);
      setRoutingOperations(roList);
      setProductionEntries(peList);
      setWipRecords(wipList);
      setProductionHolds(hldList);
      setFinishedGoods(fgList);
      setDispatchOrders(dispList);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sync live production data');
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

  // Filtered Work Orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (wo.work_order_number || wo.workOrderNumber || '').toLowerCase();
      const prod = (wo.product_name || wo.productName || '').toLowerCase();
      const job = (wo.job_number || wo.jobNumber || '').toLowerCase();
      const cust = (wo.customer_name || wo.customerName || '').toLowerCase();
      const matchesSearch = !q || num.includes(q) || prod.includes(q) || job.includes(q) || cust.includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const st = (wo.status || '').toUpperCase();
      if (statusFilter === 'PLANNED') return st.includes('PLAN') || st.includes('DRAFT');
      if (statusFilter === 'RELEASED') return st.includes('RELEASE');
      if (statusFilter === 'IN_PROGRESS') return st.includes('PROGRESS');
      if (statusFilter === 'COMPLETED') return st.includes('COMPLET');
      if (statusFilter === 'ON_HOLD') return st.includes('HOLD');
      return true;
    });
  }, [workOrders, searchQuery, statusFilter]);

  // Filtered Routing Operations
  const filteredOperations = useMemo(() => {
    return routingOperations.filter((op) => {
      const q = searchQuery.toLowerCase().trim();
      const name = (op.operation_name || op.operationName || '').toLowerCase();
      const bay = (op.work_center_name || op.workCenterName || op.work_center_code || '').toLowerCase();
      const machine = (op.machine_name || op.machineName || '').toLowerCase();
      const opNum = String(op.operation_number || op.operationNumber || '');
      return !q || name.includes(q) || bay.includes(q) || machine.includes(q) || opNum.includes(q);
    });
  }, [routingOperations, searchQuery]);

  // Filtered Production Entries
  const filteredEntries = useMemo(() => {
    return productionEntries.filter((pe) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (pe.production_entry_number || pe.productionEntryNumber || '').toLowerCase();
      const wo = (pe.work_order_number || pe.workOrderNumber || '').toLowerCase();
      const op = (pe.operation_name || pe.operationName || '').toLowerCase();
      const opName = (pe.operator_name || pe.operatorName || '').toLowerCase();
      return !q || num.includes(q) || wo.includes(q) || op.includes(q) || opName.includes(q);
    });
  }, [productionEntries, searchQuery]);

  // -------------------------------------------------------------
  // WORKFLOW ACTION HANDLERS
  // -------------------------------------------------------------

  // Create Work Order
  const handleCreateWorkOrder = async () => {
    if (!newOrderJobNumber.trim() || !newOrderProduct.trim()) {
      Alert.alert('Validation Error', 'Job Number and Product Name are required.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload: Partial<WorkOrderItem> = {
        work_order_number: `WO-2026-${Date.now().toString().slice(-4)}`,
        job_number: newOrderJobNumber.trim(),
        product_name: newOrderProduct.trim(),
        production_quantity: parseFloat(newOrderQty) || 1,
        priority: newOrderPriority,
        status: 'In Progress',
        uom: 'Nos',
      };

      await productionApi.createWorkOrder(payload);
      showToast(`Work Order created for ${newOrderJobNumber.trim()}`);
      setShowNewOrderModal(false);
      setNewOrderJobNumber('');
      setNewOrderProduct('');
      setNewOrderQty('1');
      loadData();
    } catch (err: any) {
      Alert.alert('Failed to Create Work Order', err?.response?.data?.error || err?.message || 'Server rejected request.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Release Work Order
  const handleReleaseOrder = async (orderId: string) => {
    try {
      await productionApi.releaseWorkOrder(orderId);
      showToast(`Work Order ${orderId} released to Shop Floor!`);
      loadData();
    } catch (err: any) {
      Alert.alert('Action Failed', err?.message || 'Could not release order.');
    }
  };

  // Record Daily Production Log
  const handleCreateProductionLog = async () => {
    if (!logWorkOrder.trim() || !logOperator.trim()) {
      Alert.alert('Validation Error', 'Work Order Number and Operator Name are required.');
      return;
    }

    const prodQty = parseFloat(logProducedQty) || 0;
    const rejQty = parseFloat(logRejectedQty) || 0;
    const scrQty = parseFloat(logScrapQty) || 0;
    const goodQty = Math.max(0, prodQty - rejQty - scrQty);

    setIsSubmittingLog(true);
    try {
      const payload: Partial<ProductionEntryItem> = {
        production_entry_number: `PENTRY-${Date.now().toString().slice(-4)}`,
        entry_date: new Date().toISOString().split('T')[0],
        work_order_number: logWorkOrder.trim(),
        operation_name: logOperation,
        work_center_name: logWorkCenter,
        operator_name: logOperator.trim(),
        planned_quantity: parseFloat(logPlannedQty) || prodQty,
        produced_quantity: prodQty,
        rejected_quantity: rejQty,
        scrap_quantity: scrQty,
        good_quantity: goodQty,
        downtime_minutes: parseInt(logDowntimeMin, 10) || 0,
        downtime_reason: logDowntimeReason.trim(),
      };

      await productionApi.createProductionEntry(payload);
      showToast(`Logged ${goodQty} Good Units on Shop Floor!`);
      setShowLogModal(false);
      setLogWorkOrder('');
      setLogOperator('');
      setLogProducedQty('1');
      setLogRejectedQty('0');
      setLogScrapQty('0');
      setLogDowntimeMin('0');
      setLogDowntimeReason('');
      loadData();
    } catch (err: any) {
      Alert.alert('Log Failed', err?.response?.data?.error || err?.message || 'Server rejected log entry.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Add Routing Operation
  const handleCreateRoutingOp = async () => {
    if (!opName.trim()) {
      Alert.alert('Validation Error', 'Operation Name is required.');
      return;
    }

    setIsSubmittingOp(true);
    try {
      const payload: Partial<RoutingOperationItem> = {
        operation_name: opName.trim(),
        operation_number: parseInt(opSequence, 10) || 10,
        sequence: Math.floor((parseInt(opSequence, 10) || 10) / 10),
        work_center_code: opBay,
        work_center_name: opBay,
        machine_name: opMachine,
        assigned_operator: opOperator.trim(),
        planned_setup_minutes: parseInt(opSetupMin, 10) || 0,
        planned_processing_minutes: parseInt(opProcessMin, 10) || 0,
        total_planned_minutes: (parseInt(opSetupMin, 10) || 0) + (parseInt(opProcessMin, 10) || 0),
        qc_required: true,
        status: 'Ready',
      };

      await productionApi.createRoutingOperation(payload);
      showToast(`Process Stage ${opName.trim()} added!`);
      setShowOpModal(false);
      setOpName('');
      setOpOperator('');
      loadData();
    } catch (err: any) {
      Alert.alert('Operation Failed', err?.response?.data?.error || err?.message || 'Server rejected operation.');
    } finally {
      setIsSubmittingOp(false);
    }
  };

  // Create Production Hold
  const handleCreateHold = async () => {
    if (!holdOrderNumber.trim()) {
      Alert.alert('Validation Error', 'Work Order Number is required.');
      return;
    }

    setIsSubmittingHold(true);
    try {
      const payload: Partial<ProductionHoldItem> = {
        hold_number: `HLD-2026-${Date.now().toString().slice(-4)}`,
        work_order_number: holdOrderNumber.trim(),
        reason: holdReason,
        description: holdDescription.trim(),
        start_date: new Date().toISOString().split('T')[0],
        status: 'Active Hold',
      };

      await productionApi.createProductionHold(payload);
      showToast(`Production Hold flagged for ${holdOrderNumber.trim()}`);
      setShowHoldModal(false);
      setHoldOrderNumber('');
      setHoldDescription('');
      loadData();
    } catch (err: any) {
      Alert.alert('Hold Failed', err?.response?.data?.error || err?.message || 'Server rejected hold.');
    } finally {
      setIsSubmittingHold(false);
    }
  };

  // Resume Hold
  const handleResumeHold = async (holdId: string) => {
    try {
      await productionApi.resumeHold(holdId);
      showToast(`Production Hold resumed!`);
      loadData();
    } catch (err: any) {
      Alert.alert('Resume Failed', err?.message || 'Could not resume hold.');
    }
  };

  // Toggle Work Center Machine Status
  const handleToggleWorkCenter = async (wc: WorkCenterItem) => {
    const nextStatus = wc.status === 'Running' ? 'Available' : 'Running';
    try {
      await productionApi.updateWorkCenterStatus(wc.id, nextStatus);
      showToast(`${wc.work_center_name || wc.workCenterName} set to ${nextStatus}`);
      loadData();
    } catch (err: any) {
      Alert.alert('Status Update Failed', err?.message || 'Could not update work center.');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    const st = (status || '').toUpperCase();
    if (st.includes('RUNNING') || st.includes('IN PROGRESS') || st.includes('RELEASED') || st.includes('AVAILABLE') || st.includes('PASSED')) {
      return { bg: colors.successLight, text: colors.success, label: status };
    }
    if (st.includes('HOLD') || st.includes('PENDING') || st.includes('MAINTENANCE') || st.includes('DELAY')) {
      return { bg: colors.warningLight, text: colors.warning, label: status };
    }
    if (st.includes('BREAKDOWN') || st.includes('REJECTED') || st.includes('FAILED')) {
      return { bg: colors.dangerLight, text: colors.danger, label: status };
    }
    return { bg: colors.primarySubtle, text: colors.primary, label: status || 'Normal' };
  };

  // -------------------------------------------------------------
  // COMPUTED KPI METRICS
  // -------------------------------------------------------------
  const activeJobsCount = jobs.filter((j) => (j.status || '').toLowerCase().includes('in production') || (j.status || '').toLowerCase().includes('pending')).length || jobs.length;
  const runningBaysCount = workCenters.filter((wc) => (wc.status || '').toLowerCase() === 'running').length;
  const totalWipCount = wipRecords.length;
  const activeOpsCount = routingOperations.filter((ro) => (ro.status || '').toLowerCase() === 'in progress').length;
  const totalGoodQty = productionEntries.reduce((sum, pe) => sum + Number(pe.good_quantity || pe.goodQuantity || 0), 0);
  const finishedGoodsCount = finishedGoods.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Banner */}
      {successToast && (
        <View style={styles.toastContainer}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <Factory size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Production & Shop Floor</Text>
            <Text style={styles.headerSubtitle}>
              Heavy Fabrication Bays, Machine Allocation & OEE Control
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToDashboard}>
          <Text style={styles.backBtnText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* 6 Executive KPI Cards */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={[styles.kpiCard, { borderLeftColor: colors.primary }]}>
            <View style={styles.kpiIconBox}>
              <Briefcase size={16} color={colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{activeJobsCount}</Text>
            <Text style={styles.kpiLabel}>Active Jobs</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: colors.success }]}>
            <View style={styles.kpiIconBox}>
              <Activity size={16} color={colors.success} />
            </View>
            <Text style={styles.kpiValue}>{runningBaysCount} / {workCenters.length}</Text>
            <Text style={styles.kpiLabel}>Bays Running</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: colors.accent }]}>
            <View style={styles.kpiIconBox}>
              <Sliders size={16} color={colors.accent} />
            </View>
            <Text style={styles.kpiValue}>{workOrders.length}</Text>
            <Text style={styles.kpiLabel}>Work Orders</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: colors.warning }]}>
            <View style={styles.kpiIconBox}>
              <Wrench size={16} color={colors.warning} />
            </View>
            <Text style={styles.kpiValue}>{activeOpsCount} / {routingOperations.length}</Text>
            <Text style={styles.kpiLabel}>Operations WIP</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: '#0284C7' }]}>
            <View style={styles.kpiIconBox}>
              <CheckCircle2 size={16} color="#0284C7" />
            </View>
            <Text style={styles.kpiValue}>{totalGoodQty}</Text>
            <Text style={styles.kpiLabel}>Daily Good Qty</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: '#7C3AED' }]}>
            <View style={styles.kpiIconBox}>
              <Truck size={16} color="#7C3AED" />
            </View>
            <Text style={styles.kpiValue}>{finishedGoodsCount}</Text>
            <Text style={styles.kpiLabel}>Ready FG Units</Text>
          </View>
        </ScrollView>
      </View>

      {/* Segmented Tab Navigation */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'orders', label: 'Work Orders', icon: Sliders },
            { id: 'job_cards', label: 'Job Cards & Routing', icon: Wrench },
            { id: 'bays', label: 'Bays & Machines', icon: Factory },
            { id: 'logs', label: 'Daily Logs', icon: Clock },
            { id: 'wip_dispatch', label: 'WIP & Dispatch', icon: Truck },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => {
                  setActiveTab(tab.id as ProductionTab);
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              >
                <IconComp size={14} color={isActive ? colors.primary : colors.textMuted} />
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Syncing live shop floor telemetry...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorBox}>
          <AlertTriangle size={20} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.bodyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: PRODUCTION DASHBOARD OVERVIEW */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <View style={styles.tabContent}>
              {/* Shop Floor Stage Pipeline */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Fabrication Process Pipeline</Text>
                  <Text style={styles.cardSub}>5-Stage Heavy Equipment Lifecycle</Text>
                </View>
                <View style={styles.pipelineFlow}>
                  {[
                    { step: '01', title: 'Plasma Cutting', bay: 'Bay 1 North', status: 'Completed' },
                    { step: '02', title: 'Shell Rolling', bay: 'Bay 1 Center', status: 'Completed' },
                    { step: '03', title: 'SAW Welding', bay: 'Bay 2 South', status: 'In Progress' },
                    { step: '04', title: 'CNC Boring', bay: 'Bay 3 Machining', status: 'Pending' },
                    { step: '05', title: 'Hydro Test', bay: 'Testing Bunker', status: 'Pending' },
                  ].map((p, idx) => (
                    <View key={idx} style={styles.pipelineItem}>
                      <View style={[styles.pipelineCircle, p.status === 'Completed' ? styles.pipelineCompleted : p.status === 'In Progress' ? styles.pipelineActive : styles.pipelinePending]}>
                        <Text style={styles.pipelineStepText}>{p.step}</Text>
                      </View>
                      <Text style={styles.pipelineTitle}>{p.title}</Text>
                      <Text style={styles.pipelineBay}>{p.bay}</Text>
                      <View style={[styles.statusPill, { backgroundColor: p.status === 'Completed' ? colors.successLight : p.status === 'In Progress' ? colors.warningLight : colors.border }]}>
                        <Text style={[styles.statusPillText, { color: p.status === 'Completed' ? colors.success : p.status === 'In Progress' ? colors.warning : colors.textMuted }]}>
                          {p.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bay Telemetry & OEE Cards */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Shop Floor Bays Telemetry</Text>
                    <Text style={styles.cardSub}>Real-time Work Center Machine Availability & Efficiency</Text>
                  </View>
                  <TouchableOpacity style={styles.actionPillBtn} onPress={() => setActiveTab('bays')}>
                    <Text style={styles.actionPillBtnText}>View All Bays</Text>
                  </TouchableOpacity>
                </View>
                {workCenters.map((wc) => {
                  const isRunning = (wc.status || '').toLowerCase() === 'running';
                  return (
                    <View key={wc.id} style={styles.bayListItem}>
                      <View style={styles.bayLeft}>
                        <View style={[styles.bayStatusDot, { backgroundColor: isRunning ? colors.success : colors.textMuted }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bayCode}>{wc.work_center_code || wc.workCenterCode} — {wc.work_center_name || wc.workCenterName}</Text>
                          <Text style={styles.bayLocation}>{wc.location || 'Main Fabrication Shop'} • Machine: {wc.machine_name || wc.machineName || 'Heavy Machinery'}</Text>
                        </View>
                      </View>
                      <View style={styles.bayMetrics}>
                        <Text style={styles.bayOee}>{wc.efficiency_percent || wc.efficiencyPercent || 90}% OEE</Text>
                        <Text style={styles.bayHours}>{wc.available_hours || wc.availableHours || 8}h Avail</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Quick Actions Bar */}
              <View style={styles.quickActionsBox}>
                <Text style={styles.quickActionsTitle}>Shop Floor Operations Hub</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowLogModal(true)}>
                    <Clock size={16} color={colors.primary} />
                    <Text style={styles.quickActionLabel}>Log Production Shift</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowNewOrderModal(true)}>
                    <Sliders size={16} color={colors.primary} />
                    <Text style={styles.quickActionLabel}>New Work Order</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowOpModal(true)}>
                    <Wrench size={16} color={colors.primary} />
                    <Text style={styles.quickActionLabel}>Add Process Stage</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowHoldModal(true)}>
                    <PauseCircle size={16} color={colors.warning} />
                    <Text style={[styles.quickActionLabel, { color: colors.warning }]}>Flag Production Hold</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: WORK ORDERS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'orders' && (
            <View style={styles.tabContent}>
              {/* Search & Status Filters */}
              <View style={styles.searchBar}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by WO #, Product, Job..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
                {['ALL', 'PLANNED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
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

              {/* Action Banner */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>
                  Work Orders ({filteredWorkOrders.length})
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewOrderModal(true)}>
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>New Order</Text>
                </TouchableOpacity>
              </View>

              {filteredWorkOrders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Sliders size={32} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No Work Orders Found</Text>
                  <Text style={styles.emptySub}>Create a new work order to start shop floor production.</Text>
                </View>
              ) : (
                filteredWorkOrders.map((wo) => {
                  const badge = getStatusBadge(wo.status);
                  const isReleased = (wo.status || '').toLowerCase().includes('released') || (wo.status || '').toLowerCase().includes('progress');
                  return (
                    <View key={wo.id} style={styles.orderCard}>
                      <View style={styles.orderCardHeader}>
                        <View>
                          <Text style={styles.orderNumber}>{wo.work_order_number || wo.workOrderNumber}</Text>
                          <Text style={styles.orderJob}>Job: {wo.job_number || wo.jobNumber || 'General Fabrication'}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusPillText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                      </View>

                      <Text style={styles.orderProduct}>{wo.product_name || wo.productName}</Text>

                      <View style={styles.orderMetaGrid}>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>Planned Qty</Text>
                          <Text style={styles.metaVal}>{wo.production_quantity || wo.productionQuantity || 1} {wo.uom || 'Nos'}</Text>
                        </View>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>Priority</Text>
                          <Text style={[styles.metaVal, { color: wo.priority === 'Urgent' ? colors.danger : colors.primary }]}>{wo.priority || 'Medium'}</Text>
                        </View>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>Customer</Text>
                          <Text style={styles.metaVal} numberOfLines={1}>{wo.customer_name || wo.customerName || 'UMA Client'}</Text>
                        </View>
                      </View>

                      <View style={styles.orderActionRow}>
                        <TouchableOpacity
                          style={styles.detailBtn}
                          onPress={() => setSelectedWorkOrder(wo)}
                        >
                          <Text style={styles.detailBtnText}>View 360° Specs</Text>
                        </TouchableOpacity>

                        {!isReleased && (
                          <TouchableOpacity
                            style={styles.releaseBtn}
                            onPress={() => handleReleaseOrder(wo.id)}
                          >
                            <Play size={12} color="#FFFFFF" />
                            <Text style={styles.releaseBtnText}>Release to Shop</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: JOB CARDS & ROUTING OPERATIONS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'job_cards' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Process Routing Operations ({filteredOperations.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowOpModal(true)}>
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add Operation</Text>
                </TouchableOpacity>
              </View>

              {filteredOperations.map((op) => {
                const badge = getStatusBadge(op.status);
                return (
                  <View key={op.id} style={styles.opCard}>
                    <View style={styles.opHeader}>
                      <View style={styles.opSeqBadge}>
                        <Text style={styles.opSeqText}>OP {op.operation_number || op.operationNumber || 10}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.opName}>{op.operation_name || op.operationName}</Text>
                        <Text style={styles.opDept}>{op.department || 'Fabrication Department'}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusPillText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <View style={styles.opDetailRow}>
                      <View style={styles.opDetailItem}>
                        <Factory size={12} color={colors.textMuted} />
                        <Text style={styles.opDetailText}>{op.work_center_name || op.workCenterName || 'Fabrication Bay'}</Text>
                      </View>
                      <View style={styles.opDetailItem}>
                        <Wrench size={12} color={colors.textMuted} />
                        <Text style={styles.opDetailText}>{op.machine_name || op.machineName || 'Machine'}</Text>
                      </View>
                      <View style={styles.opDetailItem}>
                        <User size={12} color={colors.textMuted} />
                        <Text style={styles.opDetailText}>{op.assigned_operator || op.assignedOperator || 'Assigned Lead'}</Text>
                      </View>
                    </View>

                    <View style={styles.opTimeRow}>
                      <Text style={styles.opTimeText}>
                        Setup: {op.planned_setup_minutes || op.plannedSetupMinutes || 0}m • Processing: {op.planned_processing_minutes || op.plannedProcessingMinutes || 0}m • Total: {op.total_planned_minutes || op.totalPlannedMinutes || 0}m
                      </Text>
                      {op.qc_required && (
                        <View style={styles.qcTag}>
                          <ShieldCheck size={11} color="#059669" />
                          <Text style={styles.qcTagText}>QC Required</Text>
                        </View>
                      )}
                    </View>

                    {op.instructions ? (
                      <View style={styles.instructionsBox}>
                        <Info size={12} color={colors.primary} />
                        <Text style={styles.instructionsText}>{op.instructions}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: BAYS & MACHINE ALLOCATION */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'bays' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Fabrication Bays & Work Centers ({workCenters.length})</Text>
              </View>

              {workCenters.map((wc) => {
                const isRunning = (wc.status || '').toLowerCase() === 'running';
                return (
                  <View key={wc.id} style={styles.bayCard}>
                    <View style={styles.bayCardHeader}>
                      <View>
                        <Text style={styles.bayCardCode}>{wc.work_center_code || wc.workCenterCode}</Text>
                        <Text style={styles.bayCardTitle}>{wc.work_center_name || wc.workCenterName}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.statusToggleBtn, { backgroundColor: isRunning ? colors.successLight : colors.border }]}
                        onPress={() => handleToggleWorkCenter(wc)}
                      >
                        <View style={[styles.statusToggleDot, { backgroundColor: isRunning ? colors.success : colors.textMuted }]} />
                        <Text style={[styles.statusToggleText, { color: isRunning ? colors.success : colors.textMuted }]}>
                          {wc.status || 'Available'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.bayMetaRow}>
                      <Text style={styles.bayMetaItem}>Location: {wc.location || 'Bay Floor'}</Text>
                      <Text style={styles.bayMetaItem}>Supervisor: {wc.supervisor_name || wc.supervisorName || 'Bay Lead'}</Text>
                    </View>

                    <View style={styles.machineDetailBox}>
                      <Text style={styles.machineLabel}>Machine Equipment:</Text>
                      <Text style={styles.machineValue}>{wc.machine_name || wc.machineName} ({wc.machine_number || wc.machineNumber || 'N/A'})</Text>
                    </View>

                    <View style={styles.capacityBarWrapper}>
                      <View style={styles.capacityBarHeader}>
                        <Text style={styles.capacityLabel}>Shift Capacity: {wc.capacity_per_day_hours || wc.capacityPerDayHours || 16}h</Text>
                        <Text style={styles.capacityVal}>OEE Efficiency: {wc.efficiency_percent || wc.efficiencyPercent || 90}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${Math.min(100, wc.efficiency_percent || wc.efficiencyPercent || 90)}%`,
                              backgroundColor: isRunning ? colors.success : colors.warning,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: DAILY PRODUCTION LOGS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'logs' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Daily Production Shift Entries ({filteredEntries.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowLogModal(true)}>
                  <Plus size={14} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Record Log</Text>
                </TouchableOpacity>
              </View>

              {filteredEntries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Clock size={32} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No Shift Entries Yet</Text>
                  <Text style={styles.emptySub}>Record worker shift outputs, good quantities, and machine downtime.</Text>
                </View>
              ) : (
                filteredEntries.map((pe) => (
                  <View key={pe.id} style={styles.logCard}>
                    <View style={styles.logCardHeader}>
                      <View>
                        <Text style={styles.logNumber}>{pe.production_entry_number || pe.productionEntryNumber}</Text>
                        <Text style={styles.logDate}>{pe.entry_date || pe.entryDate} • WO: {pe.work_order_number || pe.workOrderNumber}</Text>
                      </View>
                      <View style={styles.goodQtyBadge}>
                        <CheckCircle2 size={12} color="#059669" />
                        <Text style={styles.goodQtyBadgeText}>{pe.good_quantity || pe.goodQuantity || 0} Good Units</Text>
                      </View>
                    </View>

                    <Text style={styles.logOperation}>{pe.operation_name || pe.operationName}</Text>
                    <Text style={styles.logMachine}>{pe.work_center_name || pe.workCenterName} • Operator: {pe.operator_name || pe.operatorName}</Text>

                    <View style={styles.qtyBreakdownRow}>
                      <View style={styles.qtyCell}>
                        <Text style={styles.qtyLabel}>Produced</Text>
                        <Text style={styles.qtyVal}>{pe.produced_quantity || pe.producedQuantity || 0}</Text>
                      </View>
                      <View style={styles.qtyCell}>
                        <Text style={styles.qtyLabel}>Rejected</Text>
                        <Text style={[styles.qtyVal, { color: colors.danger }]}>{pe.rejected_quantity || pe.rejectedQuantity || 0}</Text>
                      </View>
                      <View style={styles.qtyCell}>
                        <Text style={styles.qtyLabel}>Scrap</Text>
                        <Text style={[styles.qtyVal, { color: colors.warning }]}>{pe.scrap_quantity || pe.scrapQuantity || 0}</Text>
                      </View>
                      <View style={styles.qtyCell}>
                        <Text style={styles.qtyLabel}>Downtime</Text>
                        <Text style={styles.qtyVal}>{pe.downtime_minutes || pe.downtimeMinutes || 0}m</Text>
                      </View>
                    </View>

                    {pe.downtime_reason ? (
                      <View style={styles.downtimeAlert}>
                        <AlertTriangle size={12} color={colors.warning} />
                        <Text style={styles.downtimeText}>Downtime: {pe.downtime_reason || pe.downtimeReason}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: WIP & DISPATCH */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'wip_dispatch' && (
            <View style={styles.tabContent}>
              {/* Finished Goods Ready for Site Dispatch */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Finished Goods & Site Deliveries</Text>
              </View>

              {finishedGoods.map((fg) => (
                <View key={fg.id} style={styles.fgCard}>
                  <View style={styles.fgHeader}>
                    <Text style={styles.fgNumber}>{fg.finished_goods_number || fg.finishedGoodsNumber}</Text>
                    <View style={[styles.statusPill, { backgroundColor: colors.successLight }]}>
                      <Text style={[styles.statusPillText, { color: colors.success }]}>{fg.qc_status || fg.qcStatus || 'QC Passed'}</Text>
                    </View>
                  </View>
                  <Text style={styles.fgProduct}>{fg.product_name || fg.productName}</Text>
                  <Text style={styles.fgLocation}>Location: {fg.location_bin || fg.locationBin || 'Bay 4 Dispatch Area'}</Text>
                  <Text style={styles.fgQty}>Total Output: {fg.quantity} {fg.uom || 'Nos'}</Text>
                </View>
              ))}

              {/* Active Dispatch Orders */}
              <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                <Text style={styles.sectionHeading}>Active Dispatch Shipments ({dispatchOrders.length})</Text>
              </View>

              {dispatchOrders.map((disp) => (
                <View key={disp.id} style={styles.dispCard}>
                  <View style={styles.dispHeader}>
                    <Text style={styles.dispNumber}>{disp.dispatch_number || disp.dispatchNumber}</Text>
                    <View style={[styles.statusPill, { backgroundColor: colors.warningLight }]}>
                      <Text style={[styles.statusPillText, { color: colors.warning }]}>{disp.status || 'In Transit'}</Text>
                    </View>
                  </View>
                  <Text style={styles.dispCustomer}>Customer: {disp.customer_name || disp.customerName}</Text>
                  <Text style={styles.dispVehicle}>Vehicle: {disp.vehicle_number || disp.vehicleNumber || 'Trailer'} • {disp.transporter_name || disp.transporterName}</Text>
                  <Text style={styles.dispDest}>Destination: {disp.destination_city || disp.destinationCity || 'Client Site'}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: NEW WORK ORDER */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showNewOrderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Work Order</Text>
              <TouchableOpacity onPress={() => setShowNewOrderModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Job Master / Project ID *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. JOB-2026-0014"
                value={newOrderJobNumber}
                onChangeText={setNewOrderJobNumber}
              />

              <Text style={styles.inputLabel}>Product Equipment Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Pressure Vessel 70 Bar Tank"
                value={newOrderProduct}
                onChangeText={setNewOrderProduct}
              />

              <Text style={styles.inputLabel}>Production Quantity (Nos) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1"
                keyboardType="numeric"
                value={newOrderQty}
                onChangeText={setNewOrderQty}
              />

              <Text style={styles.inputLabel}>Shop Floor Priority</Text>
              <View style={styles.radioRow}>
                {['High', 'Urgent', 'Medium'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.radioBtn, newOrderPriority === p && styles.radioBtnActive]}
                    onPress={() => setNewOrderPriority(p)}
                  >
                    <Text style={[styles.radioBtnText, newOrderPriority === p && styles.radioBtnTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewOrderModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateWorkOrder} disabled={isSubmittingOrder}>
                {isSubmittingOrder ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Create Order</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: RECORD DAILY PRODUCTION LOG */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Production Entry</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Work Order Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. WO-2026-001"
                value={logWorkOrder}
                onChangeText={setLogWorkOrder}
              />

              <Text style={styles.inputLabel}>Process Stage / Operation *</Text>
              <TextInput
                style={styles.textInput}
                value={logOperation}
                onChangeText={setLogOperation}
              />

              <Text style={styles.inputLabel}>Fabrication Bay / Work Center</Text>
              <TextInput
                style={styles.textInput}
                value={logWorkCenter}
                onChangeText={setLogWorkCenter}
              />

              <Text style={styles.inputLabel}>Operator / Technician Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Kishore Jha (SAW Specialist)"
                value={logOperator}
                onChangeText={setLogOperator}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Produced Qty</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={logProducedQty} onChangeText={setLogProducedQty} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Rejected Qty</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={logRejectedQty} onChangeText={setLogRejectedQty} />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Scrap Qty</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={logScrapQty} onChangeText={setLogScrapQty} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Downtime (Minutes)</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={logDowntimeMin} onChangeText={setLogDowntimeMin} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Downtime Reason (If any)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Power fluctuation / Electrode change"
                value={logDowntimeReason}
                onChangeText={setLogDowntimeReason}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProductionLog} disabled={isSubmittingLog}>
                {isSubmittingLog ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Submit Shift Log</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ADD PROCESS STAGE (ROUTING OPERATION) */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showOpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Process Routing Operation</Text>
              <TouchableOpacity onPress={() => setShowOpModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Operation Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Plate Edge Beveling"
                value={opName}
                onChangeText={setOpName}
              />

              <Text style={styles.inputLabel}>Operation Sequence Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10, 20, 30..."
                keyboardType="numeric"
                value={opSequence}
                onChangeText={setOpSequence}
              />

              <Text style={styles.inputLabel}>Assigned Bay Code</Text>
              <TextInput
                style={styles.textInput}
                value={opBay}
                onChangeText={setOpBay}
              />

              <Text style={styles.inputLabel}>Assigned Operator Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Suresh Kumar"
                value={opOperator}
                onChangeText={setOpOperator}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Setup Minutes</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={opSetupMin} onChangeText={setOpSetupMin} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Processing Minutes</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={opProcessMin} onChangeText={setOpProcessMin} />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowOpModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateRoutingOp} disabled={isSubmittingOp}>
                {isSubmittingOp ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Add Operation</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: PRODUCTION HOLD */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={showHoldModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Flag Production Hold</Text>
              <TouchableOpacity onPress={() => setShowHoldModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Work Order / Job Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. WO-2026-001"
                value={holdOrderNumber}
                onChangeText={setHoldOrderNumber}
              />

              <Text style={styles.inputLabel}>Hold Reason Category</Text>
              <View style={styles.radioRow}>
                {['Material Shortage', 'Machine Breakdown', 'Quality Issue', 'Customer Hold'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.radioBtn, holdReason === r && styles.radioBtnActive]}
                    onPress={() => setHoldReason(r)}
                  >
                    <Text style={[styles.radioBtnText, holdReason === r && styles.radioBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Detailed Description / Bottleneck</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                placeholder="Describe reason for pausing production..."
                value={holdDescription}
                onChangeText={setHoldDescription}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowHoldModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.warning }]} onPress={handleCreateHold} disabled={isSubmittingHold}>
                {isSubmittingHold ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Apply Hold</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: 360° WORK ORDER INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      <Modal visible={!!selectedWorkOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Work Order 360° Inspector</Text>
              <TouchableOpacity onPress={() => setSelectedWorkOrder(null)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedWorkOrder && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.inspectorHero}>
                  <Text style={styles.inspectorNumber}>{selectedWorkOrder.work_order_number || selectedWorkOrder.workOrderNumber}</Text>
                  <Text style={styles.inspectorProduct}>{selectedWorkOrder.product_name || selectedWorkOrder.productName}</Text>
                  <View style={[styles.statusPill, { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.statusPillText, { color: colors.primary }]}>{selectedWorkOrder.status}</Text>
                  </View>
                </View>

                <View style={styles.inspectorGrid}>
                  <View style={styles.inspectorCell}>
                    <Text style={styles.inspectorCellLabel}>Job Reference</Text>
                    <Text style={styles.inspectorCellVal}>{selectedWorkOrder.job_number || selectedWorkOrder.jobNumber || 'N/A'}</Text>
                  </View>
                  <View style={styles.inspectorCell}>
                    <Text style={styles.inspectorCellLabel}>Client</Text>
                    <Text style={styles.inspectorCellVal}>{selectedWorkOrder.customer_name || selectedWorkOrder.customerName || 'UMA Customer'}</Text>
                  </View>
                  <View style={styles.inspectorCell}>
                    <Text style={styles.inspectorCellLabel}>Planned Qty</Text>
                    <Text style={styles.inspectorCellVal}>{selectedWorkOrder.production_quantity || selectedWorkOrder.productionQuantity || 1} {selectedWorkOrder.uom || 'Nos'}</Text>
                  </View>
                  <View style={styles.inspectorCell}>
                    <Text style={styles.inspectorCellLabel}>Priority</Text>
                    <Text style={styles.inspectorCellVal}>{selectedWorkOrder.priority || 'High'}</Text>
                  </View>
                </View>

                {selectedWorkOrder.remarks ? (
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksLabel}>Production Remarks:</Text>
                    <Text style={styles.remarksText}>{selectedWorkOrder.remarks}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.submitBtn} onPress={() => setSelectedWorkOrder(null)}>
                <Text style={styles.submitBtnText}>Close Inspector</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// -------------------------------------------------------------
// STYLESHEET
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 40,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  backBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  kpiContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kpiScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  kpiCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 4,
    minWidth: 100,
    ...shadows.sm,
  },
  kpiIconBox: {
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabsWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  bodyScroll: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardHeaderRow: {
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
  cardSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionPillBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  actionPillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  pipelineFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  pipelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  pipelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pipelineCompleted: {
    backgroundColor: colors.success,
  },
  pipelineActive: {
    backgroundColor: colors.warning,
  },
  pipelinePending: {
    backgroundColor: colors.border,
  },
  pipelineStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pipelineTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pipelineBay: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  bayListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bayStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bayCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bayLocation: {
    fontSize: 10,
    color: colors.textMuted,
  },
  bayMetrics: {
    alignItems: 'flex-end',
  },
  bayOee: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  bayHours: {
    fontSize: 10,
    color: colors.textMuted,
  },
  quickActionsBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  filterChipScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadows.sm,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderJob: {
    fontSize: 11,
    color: colors.textMuted,
  },
  orderProduct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
  },
  metaCell: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  releaseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  releaseBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  opCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadows.sm,
  },
  opHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opSeqBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  opSeqText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  opName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  opDept: {
    fontSize: 10,
    color: colors.textMuted,
  },
  opDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 4,
  },
  opDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  opDetailText: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  opTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opTimeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  qcTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  qcTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsText: {
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
  },
  bayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadows.sm,
  },
  bayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bayCardCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  bayCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusToggleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bayMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bayMetaItem: {
    fontSize: 11,
    color: colors.textMuted,
  },
  machineDetailBox: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
  },
  machineLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  machineValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  capacityBarWrapper: {
    marginTop: 4,
  },
  capacityBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  capacityVal: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  logCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    ...shadows.sm,
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  logDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
  goodQtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  goodQtyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  logOperation: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  logMachine: {
    fontSize: 11,
    color: colors.textMuted,
  },
  qtyBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  qtyCell: {
    alignItems: 'center',
    flex: 1,
  },
  qtyLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  downtimeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningLight,
    padding: 6,
    borderRadius: borderRadius.sm,
  },
  downtimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
  },
  fgCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    ...shadows.sm,
  },
  fgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fgNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fgProduct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  fgLocation: {
    fontSize: 11,
    color: colors.textMuted,
  },
  fgQty: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  dispCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    marginTop: 8,
    ...shadows.sm,
  },
  dispHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dispNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dispCustomer: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dispVehicle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dispDest: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
  },
  errorBox: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  radioBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  radioBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  radioBtnTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inspectorHero: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  inspectorNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  inspectorProduct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  inspectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.md,
  },
  inspectorCell: {
    width: '47%',
  },
  inspectorCellLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  inspectorCellVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  remarksBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  remarksText: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
