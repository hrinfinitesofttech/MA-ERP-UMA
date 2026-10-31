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
  Platform,
} from 'react-native';
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  Calendar,
  Building,
  User,
  DollarSign,
  TrendingUp,
  Tag,
  Briefcase,
  Wrench,
  FileText,
  Play,
  Send,
  X,
  RefreshCw,
  Cpu,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import {
  projectsApi,
  ProjectItem,
  ProjectPlanningStage,
  ProjectTaskItem,
  ProjectMilestone,
  ProjectDashboardSummary,
  ProjectDelayItem,
} from '../../api/projects';

interface ProjectManagementScreenProps {
  onBackToDashboard?: () => void;
}

type TabType = 'dashboard' | 'projects' | 'stages' | 'tasks' | 'milestones';

export const ProjectManagementScreen: React.FC<ProjectManagementScreenProps> = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data States
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [stages, setStages] = useState<ProjectPlanningStage[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [summary, setSummary] = useState<ProjectDashboardSummary | null>(null);
  const [delays, setDelays] = useState<ProjectDelayItem[]>([]);

  // UI / Async States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Modals
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'project' | 'task'>('project');
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [activeTaskForProgress, setActiveTaskForProgress] = useState<ProjectTaskItem | null>(null);
  const [taskProgressValue, setTaskProgressValue] = useState('0');
  const [taskActualHours, setTaskActualHours] = useState('0');
  const [taskRemarks, setTaskRemarks] = useState('');
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    customer_name: '',
    product_name: '',
    specification: '',
    order_value: '',
    target_delivery_date: '',
    priority: 'high' as 'urgent' | 'high' | 'medium' | 'low',
    project_manager_name: 'Bhavin Shah',
  });

  // New Task Form State
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    project_id: '',
    department: 'Production',
    assigned_to_name: '',
    priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
    due_date: '',
    estimated_hours: '8',
    description: '',
  });

  // Load all Project Management data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [
        summaryRes,
        projectsRes,
        tasksRes,
        stagesRes,
        milestonesRes,
        delaysRes,
      ] = await Promise.allSettled([
        projectsApi.getDashboardSummary(),
        projectsApi.getProjects(),
        projectsApi.getTasks(),
        projectsApi.getPlanningStages(),
        projectsApi.getMilestones(),
        projectsApi.getProjectDelays(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (projectsRes.status === 'fulfilled') {
        setProjects(projectsRes.value);
        if (projectsRes.value.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsRes.value[0].id);
        }
      }
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);
      if (stagesRes.status === 'fulfilled') setStages(stagesRes.value);
      if (milestonesRes.status === 'fulfilled') setMilestones(milestonesRes.value);
      if (delaysRes.status === 'fulfilled') setDelays(delaysRes.value);

      // If both projects and tasks failed, trigger an error state
      if (projectsRes.status === 'rejected' && tasksRes.status === 'rejected') {
        throw new Error('Unable to connect to Project Management endpoints.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load project records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived KPI Metrics
  const totalCount = projects.length;
  const activeCount = projects.filter(
    (p) => !['completed', 'cancelled'].includes((p.current_status || '').toLowerCase())
  ).length;
  const completedCount = projects.filter(
    (p) => ['completed', 'delivered'].includes((p.current_status || '').toLowerCase())
  ).length;
  const delayedCount = delays.length || projects.filter((p) => p.health_status === 'delayed' || p.health_status === 'critical').length;

  // Filtered Projects for List Tab
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        (item.project_number && item.project_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.job_number && item.job_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.product_name && item.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const statusClean = (item.current_status || 'planning').toUpperCase();
      const matchStatus =
        statusFilter === 'ALL' ||
        statusClean.includes(statusFilter) ||
        (statusFilter === 'ACTIVE' && !['COMPLETED', 'CANCELLED'].includes(statusClean));

      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Stages filtered by currently selected project
  const currentProjectStages = useMemo(() => {
    if (!selectedProjectId) return stages.slice(0, 16);
    const filtered = stages.filter(
      (s) => s.project_id && s.project_id.toLowerCase() === selectedProjectId.toLowerCase()
    );
    return filtered.length > 0 ? filtered : stages.slice(0, 16);
  }, [stages, selectedProjectId]);

  // Complete Stage Action
  const handleCompleteStage = async (stageId: string, stageName: string) => {
    Alert.alert(
      'Complete Stage',
      `Mark "${stageName}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Complete',
          onPress: async () => {
            try {
              await projectsApi.completePlanningStage(stageId, 'Completed via mobile app');
              Alert.alert('Stage Completed', `Stage "${stageName}" marked as 100% completed.`);
              loadData(true);
            } catch (err: any) {
              Alert.alert('Update Failed', err?.response?.data?.error || 'Unable to update stage status.');
            }
          },
        },
      ]
    );
  };

  // Open Task Progress Modal
  const openProgressModal = (task: ProjectTaskItem) => {
    setActiveTaskForProgress(task);
    setTaskProgressValue(String(task.progress_percent || 0));
    setTaskActualHours(String(task.actual_hours || 0));
    setTaskRemarks(task.remarks || '');
    setIsProgressModalOpen(true);
  };

  // Submit Task Progress
  const handleSubmitTaskProgress = async () => {
    if (!activeTaskForProgress) return;
    const progressNum = Math.min(100, Math.max(0, parseInt(taskProgressValue, 10) || 0));
    const hoursNum = parseFloat(taskActualHours) || 0;

    setIsSubmittingProgress(true);
    try {
      const statusToSet = progressNum === 100 ? 'Completed' : 'In Progress';
      await projectsApi.updateTaskProgress(activeTaskForProgress.id, {
        progress_percent: progressNum,
        status: statusToSet,
        actual_hours: hoursNum,
        remarks: taskRemarks,
      });

      Alert.alert('Progress Updated', `Task updated to ${progressNum}% completion.`);
      setIsProgressModalOpen(false);
      loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update task progress.');
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  // Create New Project Submission
  const handleCreateProject = async () => {
    if (!newProjectForm.customer_name.trim() || !newProjectForm.product_name.trim()) {
      Alert.alert('Required Fields', 'Please enter customer name and product/equipment name.');
      return;
    }

    try {
      await projectsApi.createProject({
        customer_name: newProjectForm.customer_name.trim(),
        product_name: newProjectForm.product_name.trim(),
        specification: newProjectForm.specification.trim(),
        order_value: parseFloat(newProjectForm.order_value) || 0,
        target_delivery_date: newProjectForm.target_delivery_date || new Date().toISOString().split('T')[0],
        priority: newProjectForm.priority,
        project_manager_name: newProjectForm.project_manager_name,
        current_status: 'planning',
        progress_percent: 0,
      });

      Alert.alert('Success', 'New Project created successfully with standard 16 planning stages.');
      setIsCreateModalOpen(false);
      setNewProjectForm({
        customer_name: '',
        product_name: '',
        specification: '',
        order_value: '',
        target_delivery_date: '',
        priority: 'high',
        project_manager_name: 'Bhavin Shah',
      });
      loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create project.');
    }
  };

  // Create New Task Submission
  const handleCreateTask = async () => {
    if (!newTaskForm.title.trim()) {
      Alert.alert('Required Fields', 'Please enter a task title.');
      return;
    }

    try {
      await projectsApi.createTask({
        title: newTaskForm.title.trim(),
        project_id: newTaskForm.project_id || (projects[0]?.id || ''),
        department: newTaskForm.department,
        assigned_to_name: newTaskForm.assigned_to_name.trim() || 'Assigned Engineer',
        priority: newTaskForm.priority,
        due_date: newTaskForm.due_date || new Date().toISOString().split('T')[0],
        estimated_hours: parseFloat(newTaskForm.estimated_hours) || 8,
        description: newTaskForm.description,
        status: 'Assigned',
        progress_percent: 0,
      });

      Alert.alert('Success', 'Project task successfully created and assigned.');
      setIsCreateModalOpen(false);
      setNewTaskForm({
        title: '',
        project_id: '',
        department: 'Production',
        assigned_to_name: '',
        priority: 'medium',
        due_date: '',
        estimated_hours: '8',
        description: '',
      });
      loadData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create task.');
    }
  };

  // Helpers for Status Styling
  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('complete') || s.includes('delivered') || s.includes('achieved')) return colors.success;
    if (s.includes('progress') || s.includes('running')) return colors.primary;
    if (s.includes('review') || s.includes('qc')) return colors.accent;
    if (s.includes('delay') || s.includes('hold') || s.includes('lost')) return colors.danger;
    return colors.warning; // planning, pending, assigned
  };

  const getPriorityBadgeStyle = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return { bg: '#FEE2E2', text: '#DC2626' };
    if (p === 'high') return { bg: '#FEF3C7', text: '#D97706' };
    if (p === 'medium') return { bg: '#DBEAFE', text: '#2563EB' };
    return { bg: '#F1F5F9', text: '#475569' };
  };

  return (
    <View style={styles.container}>
      {/* 1. Header KPI Statistics Ribbon */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiValue}>{totalCount}</Text>
          <Text style={styles.kpiLabel}>Total Projects</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>In Progress</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.success }]}>{completedCount}</Text>
          <Text style={styles.kpiLabel}>Completed</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.danger }]}>{delayedCount}</Text>
          <Text style={styles.kpiLabel}>Watchlist</Text>
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
            style={[styles.tabButton, activeTab === 'projects' && styles.tabButtonActive]}
            onPress={() => setActiveTab('projects')}
          >
            <FolderKanban size={14} color={activeTab === 'projects' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
              Projects ({projects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'stages' && styles.tabButtonActive]}
            onPress={() => setActiveTab('stages')}
          >
            <TrendingUp size={14} color={activeTab === 'stages' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'stages' && styles.tabTextActive]}>
              16 Stages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <CheckCircle2 size={14} color={activeTab === 'tasks' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              Tasks ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'milestones' && styles.tabButtonActive]}
            onPress={() => setActiveTab('milestones')}
          >
            <Clock size={14} color={activeTab === 'milestones' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'milestones' && styles.tabTextActive]}>
              Timeline
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Search and Action Bar */}
      {activeTab === 'projects' && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by code, customer, product..."
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
              setCreateMode('project');
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Project</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'tasks' && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Filter tasks..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => {
              setCreateMode('task');
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newButtonText}>Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Chips for Projects */}
      {activeTab === 'projects' && (
        <View style={styles.chipsContainer}>
          {['ALL', 'ACTIVE', 'PLANNING', 'PRODUCTION', 'QC', 'COMPLETED'].map((chip) => (
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
            <Text style={styles.loadingText}>Syncing Project Management data...</Text>
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
                {/* Stage Distribution Telemetry */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Stage Distribution Pipeline</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Active jobs passing through engineering & fabrication stages
                  </Text>
                  <View style={styles.stageGrid}>
                    {[
                      { name: 'Planning', count: projects.filter((p) => (p.current_status || '').includes('planning')).length, color: '#8B5CF6' },
                      { name: 'Design / CAD', count: projects.filter((p) => (p.current_status || '').includes('design')).length, color: '#EC4899' },
                      { name: 'Store / Material', count: projects.filter((p) => (p.current_status || '').includes('material')).length, color: '#F59E0B' },
                      { name: 'Fabrication', count: projects.filter((p) => (p.current_status || '').includes('production')).length, color: '#10B981' },
                      { name: 'Quality & NDT', count: projects.filter((p) => (p.current_status || '').includes('qc')).length, color: '#06B6D4' },
                      { name: 'Dispatch Ready', count: projects.filter((p) => (p.current_status || '').includes('dispatch')).length, color: '#F97316' },
                    ].map((stage, idx) => (
                      <View key={idx} style={styles.stageGridItem}>
                        <View style={[styles.stageColorDot, { backgroundColor: stage.color }]} />
                        <Text style={styles.stageItemCount}>{stage.count}</Text>
                        <Text style={styles.stageItemName}>{stage.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Priority Breakdown */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Project Priority Allocation</Text>
                  <View style={styles.priorityRow}>
                    {(summary?.priority_chart_data && summary.priority_chart_data.length > 0
                      ? summary.priority_chart_data
                      : [
                          { name: 'Urgent', count: projects.filter((p) => (p.priority || '').toLowerCase() === 'urgent').length, fill: '#EF4444' },
                          { name: 'High', count: projects.filter((p) => (p.priority || '').toLowerCase() === 'high').length, fill: '#F59E0B' },
                          { name: 'Medium', count: projects.filter((p) => (p.priority || '').toLowerCase() === 'medium').length, fill: '#3B82F6' },
                          { name: 'Low', count: projects.filter((p) => (p.priority || '').toLowerCase() === 'low').length, fill: '#94A3B8' },
                        ]
                    ).map((item, idx) => (
                      <View key={idx} style={[styles.priorityPill, { borderColor: item.fill }]}>
                        <View style={[styles.priorityDot, { backgroundColor: item.fill }]} />
                        <Text style={styles.priorityLabel}>{item.name}</Text>
                        <Text style={[styles.priorityCount, { color: item.fill }]}>{item.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Department Workload Summary */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Department Task Loads</Text>
                  <Text style={styles.cardHeaderSubtitle}>Open tasks and estimated engineering hours</Text>
                  <View style={styles.deptLoadList}>
                    {(summary?.department_chart_data && summary.department_chart_data.length > 0
                      ? summary.department_chart_data
                      : [
                          { name: 'Production', count: tasks.filter((t) => t.department === 'Production').length, hours: 80 },
                          { name: 'Design', count: tasks.filter((t) => t.department === 'Design').length, hours: 45 },
                          { name: 'QC', count: tasks.filter((t) => t.department === 'Quality' || t.department === 'QC').length, hours: 24 },
                          { name: 'Purchase', count: tasks.filter((t) => t.department === 'Purchase').length, hours: 32 },
                        ]
                    ).map((dept, idx) => (
                      <View key={idx} style={styles.deptLoadRow}>
                        <View style={styles.deptNameCol}>
                          <Text style={styles.deptNameText}>{dept.name}</Text>
                          <Text style={styles.deptSubText}>{dept.count} tasks assigned</Text>
                        </View>
                        <View style={styles.deptHoursBadge}>
                          <Clock size={12} color={colors.primary} />
                          <Text style={styles.deptHoursText}>{dept.hours} hrs</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: PROJECTS LIST */}
            {activeTab === 'projects' && (
              <View style={styles.sectionContainer}>
                {filteredProjects.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <FolderKanban size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No Projects Found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? 'Try adjusting your search criteria.'
                        : 'Tap "+ Project" to create your first project master.'}
                    </Text>
                  </View>
                ) : (
                  filteredProjects.map((prj) => {
                    const statusColor = getStatusColor(prj.current_status);
                    const priorityStyle = getPriorityBadgeStyle(prj.priority);
                    return (
                      <TouchableOpacity
                        key={prj.id}
                        style={styles.projectCard}
                        onPress={() => setSelectedProjectDetail(prj)}
                        activeOpacity={0.8}
                      >
                        {/* Top Card Row */}
                        <View style={styles.projectCardTop}>
                          <View style={styles.projectCodeBadge}>
                            <Text style={styles.projectCodeText}>{prj.project_number || prj.id}</Text>
                          </View>
                          <View style={[styles.priorityTag, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.priorityTagText, { color: priorityStyle.text }]}>
                              {(prj.priority || 'NORMAL').toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Customer & Product Information */}
                        <Text style={styles.projectCustomerName}>{prj.customer_name || 'Direct Client'}</Text>
                        <Text style={styles.projectProductName}>{prj.product_name || 'Fabrication Equipment'}</Text>
                        {prj.specification ? (
                          <Text style={styles.projectSpecText} numberOfLines={1}>
                            {prj.specification}
                          </Text>
                        ) : null}

                        {/* Financial and Schedule Row */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <DollarSign size={13} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                              ₹ {(prj.order_value || 0).toLocaleString('en-IN')}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Calendar size={13} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                              Target: {prj.target_delivery_date || 'TBD'}
                            </Text>
                          </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressLabelRow}>
                            <Text style={styles.progressLabel}>Stage: {prj.stage || 'Kickoff & Planning'}</Text>
                            <Text style={styles.progressPercentText}>{prj.progress_percent || 0}%</Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(100, Math.max(5, prj.progress_percent || 0))}%`,
                                  backgroundColor: statusColor,
                                },
                              ]}
                            />
                          </View>
                        </View>

                        {/* Card Bottom: PM and Status */}
                        <View style={styles.cardBottomRow}>
                          <View style={styles.pmInfo}>
                            <User size={13} color={colors.textSecondary} />
                            <Text style={styles.pmName}>{prj.project_manager_name || 'Bhavin Shah'}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                              {(prj.current_status || 'PLANNING').toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 3: 16 STANDARD PLANNING STAGES */}
            {activeTab === 'stages' && (
              <View style={styles.sectionContainer}>
                {/* Project Selector Header */}
                <View style={styles.selectorCard}>
                  <Text style={styles.selectorLabel}>Active Project Scope:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                    {projects.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.selectorPill,
                          selectedProjectId === p.id && styles.selectorPillActive,
                        ]}
                        onPress={() => setSelectedProjectId(p.id)}
                      >
                        <Text
                          style={[
                            styles.selectorPillText,
                            selectedProjectId === p.id && styles.selectorPillTextActive,
                          ]}
                        >
                          {p.project_number || p.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 16 Standard Stages List */}
                {currentProjectStages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed' || stage.progress === 100;
                  return (
                    <View key={stage.id || idx} style={styles.stageCard}>
                      <View style={styles.stageHeaderRow}>
                        <View style={[styles.stageNumBadge, isCompleted && styles.stageNumBadgeCompleted]}>
                          {isCompleted ? (
                            <Check size={14} color="#FFFFFF" />
                          ) : (
                            <Text style={styles.stageNumText}>{stage.stage_number || idx + 1}</Text>
                          )}
                        </View>
                        <View style={styles.stageTitleCol}>
                          <Text style={styles.stageTitleText}>{stage.name}</Text>
                          <Text style={styles.stageDeptText}>
                            {(stage.department || 'Production').toUpperCase()} • Assigned: {stage.assigned_employee_name || 'Engineering Lead'}
                          </Text>
                        </View>
                        {!isCompleted && (
                          <TouchableOpacity
                            style={styles.stageActionBtn}
                            onPress={() => handleCompleteStage(stage.id, stage.name)}
                          >
                            <Text style={styles.stageActionBtnText}>Done</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {stage.description ? (
                        <Text style={styles.stageDescText} numberOfLines={2}>
                          {stage.description}
                        </Text>
                      ) : null}

                      {/* Stage Progress Bar */}
                      <View style={styles.stageProgressTrack}>
                        <View
                          style={[
                            styles.stageProgressFill,
                            {
                              width: `${isCompleted ? 100 : stage.progress || 0}%`,
                              backgroundColor: isCompleted ? colors.success : colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* TAB 4: TASKS AND ASSIGNMENTS */}
            {activeTab === 'tasks' && (
              <View style={styles.sectionContainer}>
                {tasks.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <CheckCircle2 size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No Tasks Found</Text>
                    <Text style={styles.emptySubtitle}>Tap "+ Task" to create and assign tasks.</Text>
                  </View>
                ) : (
                  tasks.map((task) => {
                    const priorityStyle = getPriorityBadgeStyle(task.priority);
                    const isDone = task.status === 'Completed' || task.progress_percent === 100;
                    return (
                      <View key={task.id} style={styles.taskCard}>
                        <View style={styles.taskCardHeader}>
                          <View style={styles.taskNumBadge}>
                            <Text style={styles.taskNumText}>{task.task_number || task.id}</Text>
                          </View>
                          <View style={[styles.priorityTag, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.priorityTagText, { color: priorityStyle.text }]}>
                              {(task.priority || 'MEDIUM').toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.taskTitle}>{task.title}</Text>
                        {task.description ? (
                          <Text style={styles.taskDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        ) : null}

                        <View style={styles.taskMetaRow}>
                          <Text style={styles.taskDeptBadge}>
                            {(task.department || 'General').toUpperCase()}
                          </Text>
                          <Text style={styles.taskAssigneeText}>
                            Assignee: {task.assigned_to_name || 'Staff Member'}
                          </Text>
                        </View>

                        {/* Progress slider bar */}
                        <View style={styles.taskProgressRow}>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${task.progress_percent || 0}%`,
                                  backgroundColor: isDone ? colors.success : colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.taskPercentLabel}>{task.progress_percent || 0}%</Text>
                        </View>

                        {/* Interactive Task Actions */}
                        <View style={styles.taskActionRow}>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: getStatusColor(task.status) }]}>
                              {task.status}
                            </Text>
                          </View>

                          {!isDone && (
                            <TouchableOpacity
                              style={styles.updateProgressButton}
                              onPress={() => openProgressModal(task)}
                            >
                              <TrendingUp size={13} color="#FFFFFF" />
                              <Text style={styles.updateProgressButtonText}>Update Progress</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 5: MILESTONES & TIMELINE */}
            {activeTab === 'milestones' && (
              <View style={styles.sectionContainer}>
                {milestones.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Clock size={40} color={colors.border} />
                    <Text style={styles.emptyTitle}>No Milestones Recorded</Text>
                    <Text style={styles.emptySubtitle}>
                      Milestone checkpoints track key payment and engineering delivery schedules.
                    </Text>
                  </View>
                ) : (
                  milestones.map((ms, idx) => {
                    const isCompleted = ms.status === 'completed' || ms.status === 'achieved';
                    return (
                      <View key={ms.id || idx} style={styles.timelineItem}>
                        {/* Vertical line indicator */}
                        <View style={styles.timelineTrack}>
                          <View
                            style={[
                              styles.timelineDot,
                              isCompleted && styles.timelineDotCompleted,
                            ]}
                          >
                            {isCompleted && <Check size={10} color="#FFFFFF" />}
                          </View>
                          {idx < milestones.length - 1 && <View style={styles.timelineLine} />}
                        </View>

                        {/* Timeline Content */}
                        <View style={styles.timelineContentCard}>
                          <View style={styles.timelineHeaderRow}>
                            <Text style={styles.milestoneTitle}>
                              {ms.milestone_name || ms.title || `Milestone #${idx + 1}`}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: isCompleted ? colors.success + '20' : colors.warning + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  { color: isCompleted ? colors.success : colors.warning },
                                ]}
                              >
                                {(ms.status || 'PENDING').toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.milestoneMetaRow}>
                            <View style={styles.metaItem}>
                              <Calendar size={12} color={colors.textSecondary} />
                              <Text style={styles.metaText}>
                                Planned: {ms.planned_date || ms.target_date || 'TBD'}
                              </Text>
                            </View>
                            {ms.payment_percentage ? (
                              <View style={styles.metaItem}>
                                <DollarSign size={12} color={colors.success} />
                                <Text style={[styles.metaText, { color: colors.success, fontWeight: '700' }]}>
                                  {ms.payment_percentage}% Payment
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {ms.remarks ? (
                            <Text style={styles.milestoneRemarks}>{ms.remarks}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 5. Modal: Update Task Progress */}
      <Modal
        visible={isProgressModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProgressModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Task Progress</Text>
              <TouchableOpacity onPress={() => setIsProgressModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {activeTaskForProgress && (
              <>
                <Text style={styles.modalSubheading}>{activeTaskForProgress.title}</Text>
                <Text style={styles.modalDeptTag}>
                  Department: {activeTaskForProgress.department}
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Progress Percentage (%):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={taskProgressValue}
                    onChangeText={setTaskProgressValue}
                    placeholder="e.g. 50"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Actual Hours Spent:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={taskActualHours}
                    onChangeText={setTaskActualHours}
                    placeholder="e.g. 4.5"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Work Notes / Remarks:</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 65, textAlignVertical: 'top' }]}
                    multiline
                    value={taskRemarks}
                    onChangeText={setTaskRemarks}
                    placeholder="Detail work performed..."
                  />
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsProgressModalOpen(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleSubmitTaskProgress}
                    disabled={isSubmittingProgress}
                  >
                    {isSubmittingProgress ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>Submit Progress</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. Modal: Create New Project / Task */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {createMode === 'project' ? 'New Project Master' : 'New Project Task'}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {createMode === 'project' ? (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Customer / Company Name *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. Reliance Industries Ltd"
                      value={newProjectForm.customer_name}
                      onChangeText={(t) => setNewProjectForm({ ...newProjectForm, customer_name: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Product / Equipment Name *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 50KL Reaction Vessel SS316L"
                      value={newProjectForm.product_name}
                      onChangeText={(t) => setNewProjectForm({ ...newProjectForm, product_name: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Equipment Specifications</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. ASME Sec VIII Div 1, Limpet coil, 12 Bar Hydro"
                      value={newProjectForm.specification}
                      onChangeText={(t) => setNewProjectForm({ ...newProjectForm, specification: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Order Value (₹)</Text>
                    <TextInput
                      style={styles.modalInput}
                      keyboardType="numeric"
                      placeholder="e.g. 1500000"
                      value={newProjectForm.order_value}
                      onChangeText={(t) => setNewProjectForm({ ...newProjectForm, order_value: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Target Delivery Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="2026-12-31"
                      value={newProjectForm.target_delivery_date}
                      onChangeText={(t) => setNewProjectForm({ ...newProjectForm, target_delivery_date: t })}
                    />
                  </View>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setIsCreateModalOpen(false)}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateProject}>
                      <Text style={styles.modalSubmitBtnText}>Create Project</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Task Title *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. CNC Plasma Shell Cutting"
                      value={newTaskForm.title}
                      onChangeText={(t) => setNewTaskForm({ ...newTaskForm, title: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Department</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. Production, Design, QC"
                      value={newTaskForm.department}
                      onChangeText={(t) => setNewTaskForm({ ...newTaskForm, department: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Assigned Engineer / Supervisor</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. Dharmesh Joshi"
                      value={newTaskForm.assigned_to_name}
                      onChangeText={(t) => setNewTaskForm({ ...newTaskForm, assigned_to_name: t })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Due Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="2026-11-15"
                      value={newTaskForm.due_date}
                      onChangeText={(t) => setNewTaskForm({ ...newTaskForm, due_date: t })}
                    />
                  </View>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setIsCreateModalOpen(false)}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateTask}>
                      <Text style={styles.modalSubmitBtnText}>Assign Task</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Modal: Project 360 Detail Sheet */}
      <Modal
        visible={!!selectedProjectDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProjectDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedProjectDetail?.project_number || selectedProjectDetail?.id}
                </Text>
                <Text style={styles.modalSubheading}>{selectedProjectDetail?.customer_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProjectDetail(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProjectDetail && (
                <View style={styles.detailSheetContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Product / Equipment:</Text>
                    <Text style={styles.detailValue}>{selectedProjectDetail.product_name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Specifications:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProjectDetail.specification || 'Standard Factory Spec'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Linked Job #:</Text>
                    <Text style={styles.detailValue}>{selectedProjectDetail.job_number || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sales Order #:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProjectDetail.sales_order_number || selectedProjectDetail.sales_order_id || 'SO-2026-Linked'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer PO #:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProjectDetail.customer_po_number || 'Direct Contract'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Commercial Value:</Text>
                    <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
                      ₹ {(selectedProjectDetail.order_value || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Target Delivery:</Text>
                    <Text style={styles.detailValue}>{selectedProjectDetail.target_delivery_date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Project Manager:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProjectDetail.project_manager_name || 'Bhavin Shah'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Health:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            selectedProjectDetail.health_status === 'delayed'
                              ? colors.danger
                              : colors.success,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {(selectedProjectDetail.health_status || 'ON TRACK').toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, { marginTop: 20 }]}
                    onPress={() => setSelectedProjectDetail(null)}
                  >
                    <Text style={styles.modalSubmitBtnText}>Close Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
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
    backgroundColor: '#FEE2E2',
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
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priorityCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  deptLoadList: {
    gap: spacing.xs,
  },
  deptLoadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deptNameCol: {
    gap: 2,
  },
  deptNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deptSubText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deptHoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  deptHoursText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  projectCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: spacing.xs,
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectCodeBadge: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
  },
  projectCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  priorityTag: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  priorityTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  projectCustomerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  projectProductName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  projectSpecText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressContainer: {
    marginVertical: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pmName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
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
  selectorCard: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: 6,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorPill: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    marginRight: 6,
  },
  selectorPillActive: {
    backgroundColor: colors.primary,
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectorPillTextActive: {
    color: '#FFFFFF',
  },
  stageCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: 8,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stageNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageNumBadgeCompleted: {
    backgroundColor: colors.success,
  },
  stageNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  stageTitleCol: {
    flex: 1,
  },
  stageTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stageDeptText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stageActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
  },
  stageActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stageDescText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  stageProgressTrack: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stageProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  taskCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    gap: 8,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskNumBadge: {
    backgroundColor: colors.background,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  taskNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  taskDescription: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDeptBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
  },
  taskAssigneeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskPercentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    width: 35,
    textAlign: 'right',
  },
  taskActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  updateProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  updateProgressButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineTrack: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    gap: 6,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  milestoneMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneRemarks: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
  modalDeptTag: {
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
});
