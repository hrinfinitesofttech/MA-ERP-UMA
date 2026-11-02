import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Search, Clock, Briefcase, Play, Square, AlertTriangle, WifiOff } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboard';
import { DashboardMetrics, DashboardJob, EmployeeDashboardData, WorkCenterBay } from '../../api/types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

type StageFilter = 'all' | 'planning' | 'fabrication' | 'quality' | 'dispatch';

const STAGE_FILTERS: { id: StageFilter; label: string; keys: string[] }[] = [
  { id: 'all', label: 'All', keys: [] },
  { id: 'planning', label: 'Planning', keys: ['plan', 'design', 'bom', 'material', 'purchase'] },
  { id: 'fabrication', label: 'Fabrication', keys: ['fab', 'prod', 'weld', 'machin'] },
  { id: 'quality', label: 'Quality', keys: ['qual', 'qc', 'test', 'inspect', 'ndt'] },
  { id: 'dispatch', label: 'Dispatch', keys: ['dispatch', 'ready', 'store'] },
];

const formatINR = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;
const prettyStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const stageVariant = (status: string): 'primary' | 'success' | 'warning' | 'purple' => {
  if (['qual', 'qc', 'test', 'inspect'].some((k) => status.includes(k))) return 'purple';
  if (['dispatch', 'ready', 'complete'].some((k) => status.includes(k))) return 'success';
  if (['plan', 'design', 'material'].some((k) => status.includes(k))) return 'warning';
  return 'primary';
};

const bayVariant = (status: string): 'success' | 'primary' | 'warning' | 'danger' | 'neutral' => {
  const s = status.toLowerCase();
  if (s.includes('running') || s.includes('progress')) return 'primary';
  if (s.includes('available') || s.includes('ready')) return 'success';
  if (s.includes('maint') || s.includes('idle') || s.includes('standby')) return 'warning';
  if (s.includes('break')) return 'danger';
  return 'neutral';
};

const Stat: React.FC<{ label: string; value: string; tone?: string; hint?: string }> = ({ label, value, tone, hint }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, tone ? { color: tone } : null]} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
  </View>
);

export const DashboardScreen: React.FC<{ onOpenMenu?: () => void }> = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'overview' | 'workspace'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeDashboardData | null>(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (viewMode !== 'workspace') return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [viewMode]);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [exec, emp] = await Promise.allSettled([
        dashboardApi.getExecutiveDashboard(),
        dashboardApi.getEmployeeDashboard(user?.id),
      ]);

      if (exec.status === 'fulfilled') setMetrics(exec.value);
      else setError('Could not load live data. Pull down to retry.');
      if (emp.status === 'fulfilled') setEmployeeData(emp.value);

      setLoading(false);
      setRefreshing(false);
    },
    [user?.id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runPunch = async (kind: 'in' | 'out') => {
    setPunchLoading(true);
    try {
      const res = kind === 'in' ? await dashboardApi.punchIn() : await dashboardApi.punchOut();
      Alert.alert('Done', res.message || (kind === 'in' ? 'Punched in.' : 'Punched out.'));
      loadData(true);
    } catch (err: any) {
      Alert.alert('Attendance', err?.response?.data?.error || err?.message || 'Could not record attendance.');
    } finally {
      setPunchLoading(false);
    }
  };

  const updateTask = async (taskId: string, pct: number) => {
    setUpdatingTaskId(taskId);
    try {
      await dashboardApi.updateTaskProgress(taskId, pct);
      loadData(true);
    } catch {
      Alert.alert('Task', 'Could not update task progress.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredJobs = useMemo(() => {
    const keys = STAGE_FILTERS.find((f) => f.id === stageFilter)?.keys ?? [];
    const q = searchQuery.trim().toLowerCase();
    return (metrics?.jobs ?? []).filter((job) => {
      const stageOk = keys.length === 0 || keys.some((k) => job.status.includes(k));
      const searchOk =
        !q || [job.jobNumber, job.customerName, job.productName].some((v) => v.toLowerCase().includes(q));
      return stageOk && searchOk;
    });
  }, [metrics?.jobs, stageFilter, searchQuery]);

  if (loading && !metrics) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.centerText}>Loading your dashboard…</Text>
      </View>
    );
  }

  const firstName = (user?.name || user?.username || '').split(' ')[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const renderOverview = () => {
    if (!metrics) {
      return (
        <Card style={styles.empty}>
          <WifiOff size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No data available</Text>
          <Text style={styles.emptySub}>Pull down to refresh.</Text>
        </Card>
      );
    }
    const stages = [
      { label: 'Planning', value: metrics.stageCounts.planning, color: colors.warning },
      { label: 'Fabrication', value: metrics.stageCounts.fabrication, color: colors.accent },
      { label: 'Quality', value: metrics.stageCounts.quality, color: colors.purple },
      { label: 'Dispatch', value: metrics.stageCounts.dispatch, color: colors.success },
    ];
    const maxStage = Math.max(1, ...stages.map((s) => s.value));

    return (
      <>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>ORDER BACKLOG</Text>
          <Text style={styles.heroValue}>{formatINR(metrics.activeBacklog)}</Text>
          <View style={styles.heroRow}>
            <Stat label="Active projects" value={String(metrics.activeProjects)} />
            <Stat label="Need attention" value={String(metrics.expediteCount)} tone={metrics.expediteCount > 0 ? '#FFB199' : undefined} />
            <Stat label="QC pass rate" value={metrics.qualityPassRate === null ? '—' : `${metrics.qualityPassRate}%`} />
          </View>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Pipeline</Text>
          {stages.map((s) => (
            <View key={s.label} style={styles.pipeRow}>
              <Text style={styles.pipeLabel}>{s.label}</Text>
              <View style={styles.pipeTrack}>
                <View style={[styles.pipeFill, { width: `${(s.value / maxStage) * 100}%`, backgroundColor: s.color }]} />
              </View>
              <Text style={styles.pipeValue}>{s.value}</Text>
            </View>
          ))}
        </Card>

        {metrics.bays.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Work centers</Text>
            {metrics.bays.map((bay: WorkCenterBay, idx) => (
              <View key={bay.id} style={[styles.bayRow, idx > 0 && styles.rowDivider]}>
                <View style={styles.flex}>
                  <Text style={styles.bayName}>{bay.name}</Text>
                  {bay.location ? <Text style={styles.bayMeta}>{bay.location}</Text> : null}
                </View>
                <Badge label={prettyStatus(bay.status)} variant={bayVariant(bay.status)} size="sm" />
              </View>
            ))}
          </Card>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Active jobs</Text>
          <Text style={styles.listCount}>{filteredJobs.length}</Text>
        </View>

        <View style={styles.search}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search job, customer or product"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
          {STAGE_FILTERS.map((chip) => {
            const selected = stageFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => setStageFilter(chip.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredJobs.length === 0 ? (
          <Card style={styles.empty}>
            <Briefcase size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySub}>Try a different search or filter.</Text>
          </Card>
        ) : (
          filteredJobs.map((job: DashboardJob) => (
            <Card key={job.id} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <View style={styles.flex}>
                  <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                  <Text style={styles.jobCustomer} numberOfLines={1}>{job.customerName}</Text>
                </View>
                <Badge label={prettyStatus(job.status)} variant={stageVariant(job.status)} size="sm" />
              </View>
              <Text style={styles.jobProduct} numberOfLines={2}>{job.productName}</Text>
              <View style={styles.jobMeta}>
                <Text style={styles.jobValue}>{job.orderValue > 0 ? formatINR(job.orderValue) : '—'}</Text>
                <Text style={styles.jobDue}>Due {job.dueDate}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.trackFill, { width: `${job.progressPercent}%` }]} />
              </View>
              <Text style={styles.trackLabel}>{job.progressPercent}% complete</Text>
            </Card>
          ))
        )}
      </>
    );
  };

  const attendance = employeeData?.todayAttendance;
  const tasks = employeeData?.tasksSummary?.recentTasks ?? [];

  const renderWorkspace = () => (
    <>
      <Card style={styles.clockCard}>
        <Text style={styles.clockDate}>
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={styles.clockTime}>
          {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>

        <TouchableOpacity
          style={[styles.punchBtn, attendance?.checkIn ? styles.punchOut : styles.punchIn]}
          onPress={() => runPunch(attendance?.checkIn ? 'out' : 'in')}
          disabled={punchLoading}
          activeOpacity={0.85}
        >
          {punchLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              {attendance?.checkIn ? <Square size={16} color={colors.textInverse} /> : <Play size={16} color={colors.textInverse} />}
              <Text style={styles.punchText}>{attendance?.checkIn ? 'Punch out' : 'Punch in'}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.attRow}>
          <View style={styles.attCol}>
            <Text style={styles.attLabel}>In</Text>
            <Text style={styles.attValue}>{attendance?.checkIn || '—'}</Text>
          </View>
          <View style={styles.attCol}>
            <Text style={styles.attLabel}>Out</Text>
            <Text style={styles.attValue}>{attendance?.checkOut || '—'}</Text>
          </View>
          <View style={styles.attCol}>
            <Text style={styles.attLabel}>Status</Text>
            <Text style={styles.attValue}>{attendance?.status || '—'}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My tasks</Text>
        <Text style={styles.listCount}>{tasks.length}</Text>
      </View>

      {tasks.length === 0 ? (
        <Card style={styles.empty}>
          <Briefcase size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No tasks assigned</Text>
          <Text style={styles.emptySub}>Tasks assigned to you will appear here.</Text>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.jobCard}>
            <View style={styles.jobTop}>
              <Text style={[styles.jobProduct, styles.flex]}>{task.title}</Text>
              <Badge
                label={(task.priority || 'normal').toUpperCase()}
                variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'neutral'}
                size="sm"
              />
            </View>
            <View style={styles.dueRow}>
              <Clock size={13} color={colors.textMuted} />
              <Text style={styles.jobDue}>Due {task.dueDate || '—'}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${task.progressPercent}%` }]} />
            </View>
            <Text style={styles.trackLabel}>{task.progressPercent}% complete</Text>
            <View style={styles.pctRow}>
              {[25, 50, 75, 100].map((pct) => {
                const done = task.progressPercent >= pct;
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.pctBtn, done && styles.pctBtnDone]}
                    disabled={updatingTaskId === task.id}
                    onPress={() => updateTask(task.id, pct)}
                  >
                    <Text style={[styles.pctText, done && styles.pctTextDone]}>{pct === 100 ? 'Done' : `${pct}%`}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        ))
      )}
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData(true);
          }}
          colors={[colors.accent]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>
        {greeting}
        {firstName ? `, ${firstName}` : ''}
      </Text>

      <View style={styles.segment}>
        {(['overview', 'workspace'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.segmentBtn, viewMode === mode && styles.segmentBtnActive]}
            onPress={() => setViewMode(mode)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, viewMode === mode && styles.segmentTextActive]}>
              {mode === 'overview' ? 'Overview' : 'My workspace'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.notice}>
          <AlertTriangle size={15} color={colors.warning} />
          <Text style={styles.noticeText}>{error}</Text>
        </View>
      )}

      {viewMode === 'overview' ? renderOverview() : renderWorkspace()}
    </ScrollView>
  );
};

const styles = themedStyles(() => StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  centerText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },

  greeting: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: borderRadius.sm, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: colors.surface, ...shadows.sm },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  segmentTextActive: { color: colors.textPrimary },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.warning, fontWeight: '600' },

  hero: {
    backgroundColor: colors.header,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)' },
  heroValue: { fontSize: 32, fontWeight: '900', color: colors.textInverse, marginTop: 4, marginBottom: spacing.lg },
  heroRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textInverse, marginTop: 2 },
  statHint: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  pipeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  pipeLabel: { width: 78, fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  pipeTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceSubtle, overflow: 'hidden' },
  pipeFill: { height: '100%', borderRadius: 4 },
  pipeValue: { width: 26, textAlign: 'right', fontSize: 13, fontWeight: '800', color: colors.textPrimary },

  bayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.borderLight },
  bayName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  bayMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  listTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  listCount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentDark,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  chips: { marginBottom: spacing.md, flexGrow: 0 },
  chipsContent: { gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: colors.textInverse },

  jobCard: { marginBottom: spacing.md },
  jobTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  jobNumber: { fontSize: 15, fontWeight: '800', color: colors.primary },
  jobCustomer: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  jobProduct: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginVertical: spacing.sm },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  jobValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  jobDue: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceSubtle, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  trackLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 4 },

  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  emptySub: { fontSize: 12, color: colors.textMuted },

  clockCard: { alignItems: 'center', marginBottom: spacing.lg, paddingVertical: spacing.xl },
  clockDate: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  clockTime: { fontSize: 44, fontWeight: '900', color: colors.primary, marginVertical: spacing.sm },
  punchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  punchIn: { backgroundColor: colors.success },
  punchOut: { backgroundColor: colors.danger },
  punchText: { color: colors.textInverse, fontSize: 15, fontWeight: '800' },
  attRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  attCol: { flex: 1, alignItems: 'center' },
  attLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  attValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },

  pctRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  pctBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  pctBtnDone: { backgroundColor: colors.accentLight },
  pctText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  pctTextDone: { color: colors.accentDark },
}));
