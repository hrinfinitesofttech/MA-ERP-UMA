import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {
  Compass,
  Search,
  Plus,
  AlertTriangle,
  Layers,
  Calendar,
  User,
  FileText,
  X,
  RefreshCw,
  Cpu,
  Check,
  ChevronRight,
  FileSpreadsheet,
  Boxes,
  Package,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  engineeringApi,
  DesignJobItem,
  BOMHeaderItem,
  BOMItemLine,
  Drawing2DItem,
  Design3DModelItem,
  CustomerRequirementItem,
  TechnicalDocumentItem,
} from '../../api/engineering';

interface DesignerEngineeringScreenProps {
  onBackToDashboard?: () => void;
}

type TabType = 'dashboard' | 'jobs' | 'drawings' | 'bom' | 'requirements';

export const DesignerEngineeringScreen: React.FC<DesignerEngineeringScreenProps> = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data States
  const [jobs, setJobs] = useState<DesignJobItem[]>([]);
  const [boms, setBoms] = useState<BOMHeaderItem[]>([]);
  const [drawings2D, setDrawings2D] = useState<Drawing2DItem[]>([]);
  const [models3D, setModels3D] = useState<Design3DModelItem[]>([]);
  const [requirements, setRequirements] = useState<CustomerRequirementItem[]>([]);
  const [documents, setDocuments] = useState<TechnicalDocumentItem[]>([]);

  // UI / Async States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawingsSubTab, setDrawingsSubTab] = useState<'2d' | '3d'>('2d');

  // Modals
  const [selectedJobDetail, setSelectedJobDetail] = useState<DesignJobItem | null>(null);
  const [selectedBOMDetail, setSelectedBOMDetail] = useState<BOMHeaderItem | null>(null);
  const [selectedDrawingDetail, setSelectedDrawingDetail] = useState<Drawing2DItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'job' | 'bom_item'>('job');

  // Approval / Review Modal State
  const [reviewModalJob, setReviewModalJob] = useState<DesignJobItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New Job Form State
  const [newJobForm, setNewJobForm] = useState({
    customer_name: '',
    product_name: '',
    machine_type: 'Reaction Vessel',
    quantity: '1',
    delivery_date: '',
    assigned_designer: 'Dharmesh Joshi',
    priority: 'high' as 'urgent' | 'high' | 'medium' | 'low',
    remarks: '',
  });

  // New BOM Item Form State
  const [newBOMItemForm, setNewBOMItemForm] = useState({
    partNumber: '',
    itemName: '',
    description: '',
    pCode: 'C' as 'C' | 'B' | 'OC' | 'P' | 'M',
    mat: 'SS 316L',
    thk: '12 mm',
    size: '1500 x 3000',
    quantity: '1',
    unit: 'PCS',
    estimatedRate: '45000',
  });

  // Load all Designer & Engineering data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [
        jobsRes,
        bomsRes,
        drawingsRes,
        modelsRes,
        reqsRes,
        docsRes,
      ] = await Promise.allSettled([
        engineeringApi.getDesignJobs(),
        engineeringApi.getBOMs(),
        engineeringApi.get2DDrawings(),
        engineeringApi.get3DModels(),
        engineeringApi.getCustomerRequirements(),
        engineeringApi.getTechnicalDocuments(),
      ]);

      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value);
      if (bomsRes.status === 'fulfilled') setBoms(bomsRes.value);
      if (drawingsRes.status === 'fulfilled') setDrawings2D(drawingsRes.value);
      if (modelsRes.status === 'fulfilled') setModels3D(modelsRes.value);
      if (reqsRes.status === 'fulfilled') setRequirements(reqsRes.value);
      if (docsRes.status === 'fulfilled') setDocuments(docsRes.value);

      if (jobsRes.status === 'rejected' && bomsRes.status === 'rejected') {
        throw new Error('Unable to connect to Designer & Engineering backend endpoints.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load engineering records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived KPI Metrics
  const totalJobsCount = jobs.length;
  const inProgressJobsCount = jobs.filter((j) => (j.status || '').toLowerCase() === 'in_progress').length;
  const approvedJobsCount = jobs.filter((j) => (j.status || '').toLowerCase() === 'approved').length;
  const releasedBOMsCount = boms.filter((b) => (b.status || '').toLowerCase() === 'released').length;

  // Filtered Jobs for Tab 2
  const filteredJobs = useMemo(() => {
    return jobs.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        (item.design_job_number && item.design_job_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.product_name && item.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.assigned_designer && item.assigned_designer.toLowerCase().includes(searchQuery.toLowerCase()));

      const statusClean = (item.status || 'in_progress').toUpperCase();
      const matchStatus =
        statusFilter === 'ALL' ||
        statusClean.includes(statusFilter) ||
        (statusFilter === 'ACTIVE' && ['IN_PROGRESS', 'PENDING'].includes(statusClean));

      return matchSearch && matchStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Filtered BOMs for Tab 4
  const filteredBoms = useMemo(() => {
    return boms.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (b.bom_number && b.bom_number.toLowerCase().includes(q)) ||
        (b.job_number && b.job_number.toLowerCase().includes(q)) ||
        (b.design_job_id && b.design_job_id.toLowerCase().includes(q))
      );
    });
  }, [boms, searchQuery]);

  // Handle Approve Design Job Action
  const handleApproveJob = async () => {
    if (!reviewModalJob) return;
    setIsSubmittingReview(true);
    try {
      await engineeringApi.approveDesignJob(reviewModalJob.id, reviewNotes);
      Alert.alert('Approved', `Design Job ${reviewModalJob.design_job_number} approved successfully.`);
      setReviewModalJob(null);
      setReviewNotes('');
      loadData(true);
    } catch (err: any) {
      Alert.alert('Approval Error', err?.response?.data?.error || 'Failed to approve design job.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Disapprove Design Job Action
  const handleDisapproveJob = async () => {
    if (!reviewModalJob) return;
    if (!reviewNotes.trim()) {
      Alert.alert('Required', 'Please enter rejection comments / reason.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await engineeringApi.disapproveDesignJob(reviewModalJob.id, reviewNotes);
      Alert.alert('Rejected', `Design Job ${reviewModalJob.design_job_number} returned for engineering revision.`);
      setReviewModalJob(null);
      setReviewNotes('');
      loadData(true);
    } catch (err: any) {
      Alert.alert('Rejection Error', err?.response?.data?.error || 'Failed to reject design job.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Release to Production
  const handleReleaseToProduction = async (job: DesignJobItem) => {
    Alert.alert(
      'Release to Production',
      `Officially hand over Design Job ${job.design_job_number} & its BOM to the fabrication shopfloor?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Release',
          onPress: async () => {
            try {
              await engineeringApi.releaseToProduction(job.id);
              Alert.alert('Released', `Design Job ${job.design_job_number} released to Production.`);
              loadData(true);
            } catch (err: any) {
              Alert.alert('Release Error', err?.response?.data?.error || 'Failed to release job to production.');
            }
          },
        },
      ]
    );
  };

  // Handle Create Design Job
  const handleCreateJob = async () => {
    if (!newJobForm.customer_name.trim() || !newJobForm.product_name.trim()) {
      Alert.alert('Required Fields', 'Please enter customer name and product name.');
      return;
    }

    try {
      await engineeringApi.createDesignJob({
        customer_name: newJobForm.customer_name.trim(),
        product_name: newJobForm.product_name.trim(),
        machine_type: newJobForm.machine_type.trim(),
        quantity: parseInt(newJobForm.quantity, 10) || 1,
        delivery_date: newJobForm.delivery_date || new Date().toISOString().split('T')[0],
        assigned_designer: newJobForm.assigned_designer,
        priority: newJobForm.priority,
        remarks: newJobForm.remarks,
        status: 'in_progress',
        active_revision: 'REV-01',
      });

      Alert.alert('Success', 'New Design Job created successfully.');
      setIsCreateModalOpen(false);
      setNewJobForm({
        customer_name: '',
        product_name: '',
        machine_type: 'Reaction Vessel',
        quantity: '1',
        delivery_date: '',
        assigned_designer: 'Dharmesh Joshi',
        priority: 'high',
        remarks: '',
      });
      loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create design job.');
    }
  };

  // Handle Add Item to BOM
  const handleAddBOMItem = async () => {
    if (!selectedBOMDetail) return;
    if (!newBOMItemForm.partNumber.trim() || !newBOMItemForm.itemName.trim()) {
      Alert.alert('Required Fields', 'Please enter part number and component name.');
      return;
    }

    const qty = parseFloat(newBOMItemForm.quantity) || 1;
    const rate = parseFloat(newBOMItemForm.estimatedRate) || 0;

    try {
      await engineeringApi.addBOMItem(selectedBOMDetail.id, {
        partNumber: newBOMItemForm.partNumber.trim(),
        itemName: newBOMItemForm.itemName.trim(),
        description: newBOMItemForm.description.trim() || newBOMItemForm.itemName.trim(),
        pCode: newBOMItemForm.pCode,
        mat: newBOMItemForm.mat,
        thk: newBOMItemForm.thk,
        size: newBOMItemForm.size,
        quantity: qty,
        unit: newBOMItemForm.unit,
        estimatedRate: rate,
        totalEstimatedAmount: qty * rate,
      });

      Alert.alert('Success', 'Component added to Bill of Materials.');
      setIsCreateModalOpen(false);
      setNewBOMItemForm({
        partNumber: '',
        itemName: '',
        description: '',
        pCode: 'C',
        mat: 'SS 316L',
        thk: '12 mm',
        size: '1500 x 3000',
        quantity: '1',
        unit: 'PCS',
        estimatedRate: '45000',
      });
      // Refresh selected BOM details
      const updatedBOM = await engineeringApi.getBOM(selectedBOMDetail.id);
      setSelectedBOMDetail(updatedBOM);
      loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to add component to BOM.');
    }
  };

  // Helper for Status Coloring
  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('release') || s.includes('complete')) return colors.success;
    if (s.includes('approve')) return colors.primary;
    if (s.includes('progress')) return colors.accent;
    if (s.includes('disapprove') || s.includes('reject') || s.includes('hold')) return colors.danger;
    return colors.warning; // draft, pending
  };

  // Helper for Process Code Badge in BOM
  const getPBadgeColor = (pCode?: string) => {
    const c = (pCode || 'C').toUpperCase();
    if (c === 'C') return { bg: '#EAEEF7', text: '#16233F', label: 'C • Laser/Plasma Cut' };
    if (c === 'B') return { bg: '#F3E8FF', text: '#7E22CE', label: 'B • CNC Bending' };
    if (c === 'OC') return { bg: '#FDF4DF', text: '#B45309', label: 'OC • Other Cut' };
    if (c === 'P') return { bg: '#D1FAE5', text: '#065F46', label: 'P • Purchase/Store' };
    if (c === 'M') return { bg: '#FFE4E6', text: '#BE123C', label: 'M • VMC Machining' };
    return { bg: '#EFECE5', text: '#4B5365', label: c };
  };

  return (
    <View style={styles.container}>
      {/* 1. Executive Header KPI Ribbon */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiValue}>{totalJobsCount}</Text>
          <Text style={styles.kpiLabel}>Design Jobs</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.accent }]}>{inProgressJobsCount}</Text>
          <Text style={styles.kpiLabel}>In Progress</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{approvedJobsCount}</Text>
          <Text style={styles.kpiLabel}>Approved</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.success }]}>{releasedBOMsCount}</Text>
          <Text style={styles.kpiLabel}>Released BOMs</Text>
        </View>
      </View>

      {/* 2. Horizontal Navigational Segmented Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'dashboard' && styles.tabButtonActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Layers size={14} color={activeTab === 'dashboard' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'jobs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('jobs')}
          >
            <Compass size={14} color={activeTab === 'jobs' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>
              Design Jobs ({jobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'drawings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('drawings')}
          >
            <FileText size={14} color={activeTab === 'drawings' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'drawings' && styles.tabTextActive]}>
              CAD Drawings ({drawings2D.length + models3D.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bom' && styles.tabButtonActive]}
            onPress={() => setActiveTab('bom')}
          >
            <FileSpreadsheet size={14} color={activeTab === 'bom' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'bom' && styles.tabTextActive]}>
              Master BOM ({boms.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requirements' && styles.tabButtonActive]}
            onPress={() => setActiveTab('requirements')}
          >
            <Cpu size={14} color={activeTab === 'requirements' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'requirements' && styles.tabTextActive]}>
              Reqs & Docs
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Search and Action Bar */}
      {activeTab === 'jobs' && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by job, product, customer..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => {
              setCreateMode('job');
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Chips for Jobs */}
      {activeTab === 'jobs' && (
        <View style={styles.chipsContainer}>
          {['ALL', 'ACTIVE', 'IN_PROGRESS', 'APPROVED', 'RELEASED'].map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.filterChip, statusFilter === chip && styles.filterChipActive]}
              onPress={() => setStatusFilter(chip)}
            >
              <Text style={[styles.filterChipText, statusFilter === chip && styles.filterChipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 4. Main Scrollable Content */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} />}
      >
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading Engineering & CAD models...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorCard}>
            <AlertTriangle size={28} color={colors.danger} />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorSubtitle}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
              <RefreshCw size={14} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <View style={styles.sectionContainer}>
                {/* Engineering Pipeline Telemetry */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Engineering Stage Pipeline</Text>
                  <Text style={styles.cardHeaderSubtitle}>Design lifecycle from 3D CAD modeling to BOM release</Text>
                  <View style={styles.stageGrid}>
                    {[
                      { name: 'Concept & Specs', count: jobs.filter((j) => (j.status || '').includes('pending')).length, color: '#6D4BC9' },
                      { name: '3D CAD Modeling', count: jobs.filter((j) => (j.status || '').includes('in_progress')).length, color: '#3B5BA9' },
                      { name: 'GA Approvals', count: jobs.filter((j) => (j.status || '').includes('approved')).length, color: '#17875B' },
                      { name: 'Released to Fab', count: jobs.filter((j) => (j.status || '').includes('released')).length, color: '#17875B' },
                    ].map((stg, idx) => (
                      <View key={idx} style={styles.stageGridItem}>
                        <View style={[styles.stageColorDot, { backgroundColor: stg.color }]} />
                        <Text style={styles.stageItemCount}>{stg.count}</Text>
                        <Text style={styles.stageItemName}>{stg.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Drawing Formats & Distribution */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>CAD Drawings Inventory</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxNumber}>{drawings2D.length}</Text>
                      <Text style={styles.statBoxLabel}>2D GA Drawings</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxNumber, { color: colors.accent }]}>{models3D.length}</Text>
                      <Text style={styles.statBoxLabel}>3D Solid Models</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxNumber, { color: colors.success }]}>{boms.length}</Text>
                      <Text style={styles.statBoxLabel}>Total BOMs</Text>
                    </View>
                  </View>
                </View>

                {/* Pending Review Queue */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Pending Engineering Sign-offs</Text>
                  <Text style={styles.cardHeaderSubtitle}>Jobs awaiting management review & revision approval</Text>
                  {jobs.filter((j) => j.status === 'in_progress').length === 0 ? (
                    <Text style={styles.emptyNote}>No pending design sign-offs in queue.</Text>
                  ) : (
                    jobs
                      .filter((j) => j.status === 'in_progress')
                      .slice(0, 3)
                      .map((j) => (
                        <View key={j.id} style={styles.reviewQueueRow}>
                          <View style={styles.reviewQueueLeft}>
                            <Text style={styles.reviewJobNumber}>{j.design_job_number}</Text>
                            <Text style={styles.reviewJobProduct}>{j.product_name}</Text>
                            <Text style={styles.reviewJobDesigner}>
                              Lead: {j.assigned_designer || '—'} • {j.active_revision}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.reviewActionBtn}
                            onPress={() => {
                              setReviewModalJob(j);
                              setReviewNotes('');
                            }}
                          >
                            <Text style={styles.reviewActionBtnText}>Review</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                  )}
                </View>
              </View>
            )}

            {/* TAB 2: DESIGN JOBS */}
            {activeTab === 'jobs' && (
              <View style={styles.sectionContainer}>
                {filteredJobs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Compass size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No Design Jobs Found</Text>
                    <Text style={styles.emptySubtitle}>Tap "+ Job" to create a new design job.</Text>
                  </View>
                ) : (
                  filteredJobs.map((job) => {
                    const statusColor = getStatusColor(job.status);
                    return (
                      <View key={job.id} style={styles.jobCard}>
                        <View style={styles.jobCardHeader}>
                          <View style={styles.jobCodeBadge}>
                            <Text style={styles.jobCodeText}>{job.design_job_number}</Text>
                          </View>
                          <View style={styles.revisionBadge}>
                            <Text style={styles.revisionBadgeText}>{job.active_revision || 'REV-01'}</Text>
                          </View>
                        </View>

                        <Text style={styles.jobProductTitle}>{job.product_name}</Text>
                        <Text style={styles.jobCustomerName}>{job.customer_name}</Text>

                        {/* Meta information row */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <User size={13} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{job.assigned_designer || '—'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Calendar size={13} color={colors.textSecondary} />
                            <Text style={styles.metaText}>Delivery: {job.delivery_date}</Text>
                          </View>
                        </View>

                        {/* Drawing Attachment Pill if available */}
                        {job.drawing_file_name ? (
                          <View style={styles.attachmentPill}>
                            <FileText size={12} color={colors.primary} />
                            <Text style={styles.attachmentText} numberOfLines={1}>
                              {job.drawing_file_name} ({job.drawing_format || 'PDF'})
                            </Text>
                          </View>
                        ) : null}

                        {/* Action buttons row */}
                        <View style={styles.jobActionRow}>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {(job.status || 'IN_PROGRESS').toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.buttonGroup}>
                            <TouchableOpacity
                              style={styles.detailButton}
                              onPress={() => setSelectedJobDetail(job)}
                            >
                              <Text style={styles.detailButtonText}>Details</Text>
                            </TouchableOpacity>

                            {job.status === 'in_progress' && (
                              <TouchableOpacity
                                style={styles.approveButton}
                                onPress={() => {
                                  setReviewModalJob(job);
                                  setReviewNotes('');
                                }}
                              >
                                <Check size={12} color="#FFFFFF" />
                                <Text style={styles.approveButtonText}>Sign-off</Text>
                              </TouchableOpacity>
                            )}

                            {job.status === 'approved' && (
                              <TouchableOpacity
                                style={styles.releaseButton}
                                onPress={() => handleReleaseToProduction(job)}
                              >
                                <Share2 size={12} color="#FFFFFF" />
                                <Text style={styles.releaseButtonText}>Release</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 3: CAD DRAWINGS (2D & 3D) */}
            {activeTab === 'drawings' && (
              <View style={styles.sectionContainer}>
                {/* 2D / 3D Sub Tab Switch */}
                <View style={styles.subTabRow}>
                  <TouchableOpacity
                    style={[styles.subTabBtn, drawingsSubTab === '2d' && styles.subTabBtnActive]}
                    onPress={() => setDrawingsSubTab('2d')}
                  >
                    <Text style={[styles.subTabBtnText, drawingsSubTab === '2d' && styles.subTabBtnTextActive]}>
                      2D Drawings ({drawings2D.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subTabBtn, drawingsSubTab === '3d' && styles.subTabBtnActive]}
                    onPress={() => setDrawingsSubTab('3d')}
                  >
                    <Text style={[styles.subTabBtnText, drawingsSubTab === '3d' && styles.subTabBtnTextActive]}>
                      3D CAD Models ({models3D.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {drawingsSubTab === '2d' ? (
                  drawings2D.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <FileText size={40} color={colors.border} />
                      <Text style={styles.emptyTitle}>No 2D Drawings</Text>
                      <Text style={styles.emptySubtitle}>2D General Arrangement (GA) and fabrication drawings.</Text>
                    </View>
                  ) : (
                    drawings2D.map((dwg) => (
                      <TouchableOpacity
                        key={dwg.id}
                        style={styles.drawingCard}
                        onPress={() => setSelectedDrawingDetail(dwg)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.drawingCardTop}>
                          <View style={styles.dwgNumBadge}>
                            <Text style={styles.dwgNumText}>{dwg.drawing_number}</Text>
                          </View>
                          <View style={styles.dwgFormatBadge}>
                            <Text style={styles.dwgFormatText}>{dwg.file_format || 'DWG'}</Text>
                          </View>
                        </View>

                        <Text style={styles.dwgTitle}>{dwg.title || '2D Fabrication Drawing'}</Text>
                        <Text style={styles.dwgCategoryText}>
                          Category: {dwg.category || 'GA'} • Revision: {dwg.revision} • Sheet: {dwg.sheet_size || 'A1'}
                        </Text>

                        <View style={styles.metaRow}>
                          <Text style={styles.metaText}>Scale: {dwg.scale || '1:10'}</Text>
                          <Text style={styles.metaText}>Approved by: {dwg.approved_by || '—'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )
                ) : models3D.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Boxes size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No 3D Models</Text>
                    <Text style={styles.emptySubtitle}>Parametric 3D solid models (SolidWorks / Inventor).</Text>
                  </View>
                ) : (
                  models3D.map((m3d) => (
                    <View key={m3d.id} style={styles.drawingCard}>
                      <View style={styles.drawingCardTop}>
                        <View style={styles.dwgNumBadge}>
                          <Text style={styles.dwgNumText}>{m3d.model_number}</Text>
                        </View>
                        <View style={[styles.dwgFormatBadge, { backgroundColor: colors.accentLight }]}>
                          <Text style={[styles.dwgFormatText, { color: colors.accentDark }]}>
                            {m3d.software || 'SolidWorks'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.dwgTitle}>{m3d.model_name || '3D Solid Model'}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>Weight: {m3d.mass_kg || 0} kg</Text>
                        <Text style={styles.metaText}>Modeled by: {m3d.modeled_by || 'CAD Engineer'}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB 4: BILL OF MATERIALS (BOM) */}
            {activeTab === 'bom' && (
              <View style={styles.sectionContainer}>
                {filteredBoms.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <FileSpreadsheet size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No BOMs Found</Text>
                    <Text style={styles.emptySubtitle}>Engineering BOM exploded into materials and buyout parts.</Text>
                  </View>
                ) : (
                  filteredBoms.map((bom) => {
                    const isReleased = (bom.status || '').toLowerCase() === 'released';
                    return (
                      <View key={bom.id} style={styles.bomCard}>
                        <View style={styles.bomCardHeader}>
                          <View style={styles.bomNumBadge}>
                            <Text style={styles.bomNumText}>{bom.bom_number}</Text>
                          </View>
                          <View style={styles.revisionBadge}>
                            <Text style={styles.revisionBadgeText}>{bom.active_revision || 'REV-01'}</Text>
                          </View>
                        </View>

                        <Text style={styles.bomJobRefText}>
                          Linked Design Job: {bom.design_job_id} {bom.job_number ? `(${bom.job_number})` : ''}
                        </Text>

                        <View style={styles.bomMetricsRow}>
                          <View style={styles.bomMetricItem}>
                            <Text style={styles.bomMetricLabel}>Components</Text>
                            <Text style={styles.bomMetricValue}>{bom.items?.length || bom.total_items || 0} Items</Text>
                          </View>
                          <View style={styles.bomMetricItem}>
                            <Text style={styles.bomMetricLabel}>Est. Cost</Text>
                            <Text style={[styles.bomMetricValue, { color: colors.primary }]}>
                              ₹ {(bom.total_estimated_cost || 0).toLocaleString('en-IN')}
                            </Text>
                          </View>
                          <View style={styles.bomMetricItem}>
                            <Text style={styles.bomMetricLabel}>Status</Text>
                            <Text
                              style={[
                                styles.bomMetricValue,
                                { color: isReleased ? colors.success : colors.warning },
                              ]}
                            >
                              {(bom.status || 'DRAFT').toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* BOM Action button */}
                        <TouchableOpacity
                          style={styles.inspectBOMBtn}
                          onPress={() => setSelectedBOMDetail(bom)}
                        >
                          <Text style={styles.inspectBOMBtnText}>Inspect Line Items</Text>
                          <ChevronRight size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 5: REQUIREMENTS & DOCS */}
            {activeTab === 'requirements' && (
              <View style={styles.sectionContainer}>
                {/* Customer Engineering Requirements */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Customer Technical Specifications</Text>
                  <Text style={styles.cardHeaderSubtitle}>Design inputs, capacities, and automation specs</Text>
                  {requirements.length === 0 ? (
                    <Text style={styles.emptyNote}>No customer requirements registered.</Text>
                  ) : (
                    requirements.map((req) => (
                      <View key={req.id} style={styles.reqCard}>
                        <Text style={styles.reqMachineTitle}>{req.machine_name}</Text>
                        <Text style={styles.reqCustomerText}>
                          Client: {req.customer_name} {req.contact_person ? `(${req.contact_person})` : ''}
                        </Text>
                        {req.capacity ? (
                          <Text style={styles.reqSpecText}>Capacity: {req.capacity}</Text>
                        ) : null}
                        {req.dimensions ? (
                          <Text style={styles.reqSpecText}>Dimensions: {req.dimensions}</Text>
                        ) : null}
                        {req.material ? (
                          <Text style={styles.reqSpecText}>Material: {req.material}</Text>
                        ) : null}
                      </View>
                    ))
                  )}
                </View>

                {/* Technical Documents */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Technical Documents & Datasheets</Text>
                  <Text style={styles.cardHeaderSubtitle}>Calculations, design dossiers, and certificates</Text>
                  {documents.length === 0 ? (
                    <Text style={styles.emptyNote}>No technical documents uploaded.</Text>
                  ) : (
                    documents.map((doc) => (
                      <View key={doc.id} style={styles.docItemRow}>
                        <FileText size={18} color={colors.primary} />
                        <View style={styles.docInfoCol}>
                          <Text style={styles.docTitleText}>{doc.document_name || doc.title}</Text>
                          <Text style={styles.docMetaText}>
                            {doc.category} • {doc.file_size || '2.5 MB'} • {doc.upload_date}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 5. Modal: Design Sign-off / Review */}
      <Modal
        visible={!!reviewModalJob}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalJob(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Engineering Sign-off Review</Text>
              <TouchableOpacity onPress={() => setReviewModalJob(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {reviewModalJob && (
              <>
                <Text style={styles.modalSubheading}>{reviewModalJob.product_name}</Text>
                <Text style={styles.modalJobCodeText}>
                  Job: {reviewModalJob.design_job_number} • Revision: {reviewModalJob.active_revision}
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Engineering Review Notes / Comments:</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                    multiline
                    placeholder="Enter approval verification notes or reason for rejection..."
                    value={reviewNotes}
                    onChangeText={setReviewNotes}
                  />
                </View>

                <View style={styles.reviewModalBtnRow}>
                  <TouchableOpacity
                    style={styles.disapproveBtn}
                    onPress={handleDisapproveJob}
                    disabled={isSubmittingReview}
                  >
                    <Text style={styles.disapproveBtnText}>Reject / Revise</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={handleApproveJob}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.approveBtnText}>Approve Design</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. Modal: Create Design Job */}
      <Modal
        visible={isCreateModalOpen && createMode === 'job'}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Design Job</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Aarti Industries Ltd"
                  value={newJobForm.customer_name}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, customer_name: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Equipment / Product Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 25KL Limpet Reaction Vessel SS316L"
                  value={newJobForm.product_name}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, product_name: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Machine / Equipment Category</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Pressure Vessel, Heat Exchanger"
                  value={newJobForm.machine_type}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, machine_type: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="1"
                  value={newJobForm.quantity}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, quantity: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Target Delivery Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="2026-12-31"
                  value={newJobForm.delivery_date}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, delivery_date: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Lead CAD Designer</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Dharmesh Joshi"
                  value={newJobForm.assigned_designer}
                  onChangeText={(t) => setNewJobForm({ ...newJobForm, assigned_designer: t })}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsCreateModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateJob}>
                  <Text style={styles.modalSubmitBtnText}>Create Job</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Modal: Add Line Item to BOM */}
      <Modal
        visible={isCreateModalOpen && createMode === 'bom_item'}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Component to BOM</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Part / Item Code *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. BOM-SHL-01"
                  value={newBOMItemForm.partNumber}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, partNumber: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Component Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Cylindrical Shell Plate"
                  value={newBOMItemForm.itemName}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, itemName: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Process Code (C, B, OC, P, M)</Text>
                <View style={styles.pCodeRow}>
                  {(['C', 'B', 'OC', 'P', 'M'] as const).map((pc) => (
                    <TouchableOpacity
                      key={pc}
                      style={[
                        styles.pCodeBtn,
                        newBOMItemForm.pCode === pc && styles.pCodeBtnActive,
                      ]}
                      onPress={() => setNewBOMItemForm({ ...newBOMItemForm, pCode: pc })}
                    >
                      <Text
                        style={[
                          styles.pCodeBtnText,
                          newBOMItemForm.pCode === pc && styles.pCodeBtnTextActive,
                        ]}
                      >
                        {pc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Material Grade</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. SA 516 Gr 70 / SS 316L"
                  value={newBOMItemForm.mat}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, mat: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Thickness / Size</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 16 mm THK x 2000 x 6000"
                  value={newBOMItemForm.thk}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, thk: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="1"
                  value={newBOMItemForm.quantity}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, quantity: t })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estimated Rate (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="45000"
                  value={newBOMItemForm.estimatedRate}
                  onChangeText={(t) => setNewBOMItemForm({ ...newBOMItemForm, estimatedRate: t })}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsCreateModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAddBOMItem}>
                  <Text style={styles.modalSubmitBtnText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 8. Modal: Detailed BOM Line Item Inspector */}
      <Modal
        visible={!!selectedBOMDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBOMDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '92%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedBOMDetail?.bom_number}</Text>
                <Text style={styles.modalSubheading}>
                  Job: {selectedBOMDetail?.design_job_id} ({selectedBOMDetail?.active_revision})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBOMDetail(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Add Component action */}
            <View style={styles.bomInspectorTopRow}>
              <Text style={styles.bomLineItemsHeader}>
                Components ({selectedBOMDetail?.items?.length || 0})
              </Text>
              <TouchableOpacity
                style={styles.addItemToBOMBtn}
                onPress={() => {
                  setCreateMode('bom_item');
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus size={13} color="#FFFFFF" />
                <Text style={styles.addItemToBOMBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBOMDetail?.items && selectedBOMDetail.items.length > 0 ? (
                selectedBOMDetail.items.map((item: BOMItemLine, idx: number) => {
                  const pBadge = getPBadgeColor(item.pCode);
                  return (
                    <View key={item.id || idx} style={styles.bomItemCard}>
                      <View style={styles.bomItemCardTop}>
                        <View style={[styles.pBadgeTag, { backgroundColor: pBadge.bg }]}>
                          <Text style={[styles.pBadgeTagText, { color: pBadge.text }]}>
                            {pBadge.label}
                          </Text>
                        </View>
                        <Text style={styles.bomItemCode}>{item.partNumber}</Text>
                      </View>

                      <Text style={styles.bomItemName}>{item.itemName || item.description}</Text>
                      <Text style={styles.bomItemMaterial}>
                        Mat: {item.mat || item.material || 'SS 316L'} • Size: {item.thk || item.size || 'Std'}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                          Qty: {item.quantity} {item.unit || 'PCS'}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.primary, fontWeight: '700' }]}>
                          ₹ {(item.totalEstimatedAmount || (item.quantity * (item.estimatedRate || 0))).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Package size={32} color={colors.border} />
                  <Text style={styles.emptyTitle}>No Line Items Yet</Text>
                  <Text style={styles.emptySubtitle}>Tap "+ Add Item" above to add raw plates or bought-out parts.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 9. Modal: Design Job 360 Detail Sheet */}
      <Modal
        visible={!!selectedJobDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedJobDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedJobDetail?.design_job_number}</Text>
                <Text style={styles.modalSubheading}>{selectedJobDetail?.product_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedJobDetail(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedJobDetail && (
                <View style={styles.detailSheetContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client:</Text>
                    <Text style={styles.detailValue}>{selectedJobDetail.customer_name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Linked Project #:</Text>
                    <Text style={styles.detailValue}>{selectedJobDetail.project_id || 'PRJ-2026-0001'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Schedule:</Text>
                    <Text style={styles.detailValue}>{selectedJobDetail.delivery_date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lead Designer:</Text>
                    <Text style={styles.detailValue}>{selectedJobDetail.assigned_designer || '—'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Revision:</Text>
                    <Text style={[styles.detailValue, { fontWeight: '800' }]}>
                      {selectedJobDetail.active_revision}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Design Status:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: getStatusColor(selectedJobDetail.status), fontWeight: '800' },
                      ]}
                    >
                      {(selectedJobDetail.status || 'IN_PROGRESS').toUpperCase()}
                    </Text>
                  </View>

                  {selectedJobDetail.approved_by ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Approved By:</Text>
                      <Text style={styles.detailValue}>
                        {selectedJobDetail.approved_by} ({selectedJobDetail.approved_date})
                      </Text>
                    </View>
                  ) : null}

                  {selectedJobDetail.rejection_reason ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rejection Reason:</Text>
                      <Text style={[styles.detailValue, { color: colors.danger }]}>
                        {selectedJobDetail.rejection_reason}
                      </Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, { marginTop: 20 }]}
                    onPress={() => setSelectedJobDetail(null)}
                  >
                    <Text style={styles.modalSubmitBtnText}>Close Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 10. Modal: Drawing Details */}
      <Modal
        visible={!!selectedDrawingDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDrawingDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedDrawingDetail?.drawing_number}</Text>
                <Text style={styles.modalSubheading}>{selectedDrawingDetail?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDrawingDetail(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedDrawingDetail && (
              <View style={styles.detailSheetContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.category || 'GA'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Revision:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.revision}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sheet Size:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.sheet_size || 'A1'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Format:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.file_format || 'DWG'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prepared By:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.prepared_by || '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Approved By:</Text>
                  <Text style={styles.detailValue}>{selectedDrawingDetail.approved_by || '—'}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { marginTop: 16 }]}
                  onPress={() => setSelectedDrawingDetail(null)}
                >
                  <Text style={styles.modalSubmitBtnText}>Close Drawing</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = themedStyles(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kpiContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 38,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    height: 38,
    gap: 4,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: colors.surface,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: '#FCEBE9',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
  },
  errorSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 6,
    marginTop: spacing.xs,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionContainer: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageGridItem: {
    width: '47%',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  stageColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  stageItemCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stageItemName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: 4,
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statBoxLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  reviewQueueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewQueueLeft: {
    gap: 2,
    flex: 1,
  },
  reviewJobNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  reviewJobProduct: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewJobDesigner: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  reviewActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  reviewActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jobCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: spacing.xs,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobCodeBadge: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
  },
  jobCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  revisionBadge: {
    backgroundColor: '#EFECE5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  revisionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5365',
  },
  jobProductTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  jobCustomerName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginVertical: 2,
  },
  attachmentText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  jobActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  detailButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  detailButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    gap: 4,
  },
  approveButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  releaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
    gap: 4,
  },
  releaseButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xs,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  subTabBtnActive: {
    backgroundColor: colors.primary,
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  subTabBtnTextActive: {
    color: '#FFFFFF',
  },
  drawingCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: 6,
  },
  drawingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dwgNumBadge: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  dwgNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  dwgFormatBadge: {
    backgroundColor: '#FDF4DF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  dwgFormatText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B7791F',
  },
  dwgTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dwgCategoryText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bomCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: 8,
  },
  bomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bomNumBadge: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
  },
  bomNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  bomJobRefText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bomMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bomMetricItem: {
    alignItems: 'center',
  },
  bomMetricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bomMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  inspectBOMBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  inspectBOMBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bomInspectorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  bomLineItemsHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addItemToBOMBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  addItemToBOMBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bomItemCard: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: 4,
  },
  bomItemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pBadgeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  pBadgeTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  bomItemCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bomItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bomItemMaterial: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  reqCard: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: 2,
  },
  reqMachineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reqCustomerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  reqSpecText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  docInfoCol: {
    flex: 1,
    gap: 2,
  },
  docTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  docMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubheading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  modalJobCodeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  formGroup: {
    gap: 4,
    marginTop: spacing.xs,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewModalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disapproveBtn: {
    flex: 1,
    backgroundColor: '#FCEBE9',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  disapproveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  approveBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pCodeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  pCodeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pCodeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pCodeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  pCodeBtnTextActive: {
    color: '#FFFFFF',
  },
  detailSheetContent: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    width: '40%',
  },
  detailValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '700',
    width: '60%',
    textAlign: 'right',
  },
}));
