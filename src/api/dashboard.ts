import { apiClient } from './client';
import { DashboardJob, DashboardMetrics, EmployeeDashboardData, WorkCenterBay } from './types';

const toList = (res: PromiseSettledResult<{ data: any }>): any[] => {
  if (res.status !== 'fulfilled') return [];
  const data = res.value.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
};

const num = (v: unknown): number => Number(v) || 0;
const pick = (o: any, ...keys: string[]) => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && o?.[k] !== '') return o[k];
  return undefined;
};

const statusOf = (p: any): string => String(pick(p, 'current_status', 'currentStage', 'stage', 'status') ?? '').toLowerCase();
const isClosed = (s: string) => ['completed', 'delivered', 'cancelled', 'closed'].some((k) => s.includes(k));
const isPlanning = (s: string) => ['plan', 'design', 'bom', 'material', 'purchase'].some((k) => s.includes(k));
const isFabrication = (s: string) => ['fab', 'prod', 'weld', 'machin'].some((k) => s.includes(k));
const isQuality = (s: string) => ['qual', 'qc', 'test', 'inspect', 'ndt'].some((k) => s.includes(k));
const isDispatch = (s: string) => ['dispatch', 'ready', 'store'].some((k) => s.includes(k));

const toJob = (p: any): DashboardJob => ({
  id: String(p.id),
  jobNumber: pick(p, 'job_number', 'jobNumber', 'project_number', 'projectNumber') ?? '—',
  customerName: pick(p, 'customer_name', 'customerName') ?? '—',
  productName: pick(p, 'product_name', 'productName', 'project_name', 'projectName') ?? '—',
  orderValue: num(pick(p, 'order_value', 'orderValue')),
  dueDate: pick(p, 'target_delivery_date', 'targetDeliveryDate', 'delivery_date', 'deliveryDate') ?? '—',
  progressPercent: Math.min(100, Math.max(0, num(pick(p, 'progress_percent', 'progressPercent')))),
  status: statusOf(p) || '—',
  priority: String(pick(p, 'priority') ?? '').toLowerCase(),
  health: String(pick(p, 'health_status', 'healthStatus') ?? '').toLowerCase(),
});

const toBay = (w: any): WorkCenterBay => {
  const eff = pick(w, 'efficiency_percent', 'efficiencyPercent');
  return {
    id: String(w.id),
    name: pick(w, 'work_center_name', 'workCenterName', 'name') ?? '—',
    location: pick(w, 'location', 'department') ?? '',
    status: pick(w, 'status') ?? '—',
    efficiency: eff === undefined ? null : num(eff),
  };
};

export const dashboardApi = {
  // Executive dashboard: every figure is derived from live backend data.
  getExecutiveDashboard: async (): Promise<DashboardMetrics> => {
    const [projectsRes, salesOrdersRes, workCentersRes, qcRes] = await Promise.allSettled([
      apiClient.get('/projects/'),
      apiClient.get('/sales-orders/'),
      apiClient.get('/work-centers/'),
      apiClient.get('/qc-inspections/'),
    ]);

    if (projectsRes.status === 'rejected' && salesOrdersRes.status === 'rejected') {
      throw projectsRes.reason;
    }

    const projects = toList(projectsRes);
    const salesOrders = toList(salesOrdersRes);
    const active = projects.filter((p) => !isClosed(statusOf(p)));

    const soTotal = salesOrders.reduce(
      (sum, so) => sum + num(pick(so, 'grand_total', 'grandTotal', 'totalAmount', 'total_amount', 'orderValue')),
      0
    );
    const projectTotal = active.reduce((sum, p) => sum + num(pick(p, 'order_value', 'orderValue')), 0);

    const qc = toList(qcRes);
    const decided = qc.filter((q) => ['pass', 'fail'].includes(String(pick(q, 'overall_result', 'qcResult') ?? '').toLowerCase()));
    const passed = decided.filter((q) => String(pick(q, 'overall_result', 'qcResult')).toLowerCase() === 'pass').length;

    return {
      activeBacklog: soTotal > 0 ? soTotal : projectTotal,
      activeProjects: active.length,
      expediteCount: active.filter(
        (p) => ['urgent', 'high'].includes(String(p.priority ?? '').toLowerCase()) || ['delayed', 'critical'].includes(String(pick(p, 'health_status', 'healthStatus') ?? '').toLowerCase())
      ).length,
      qualityPassRate: decided.length > 0 ? Math.round((passed / decided.length) * 100) : null,
      stageCounts: {
        planning: active.filter((p) => isPlanning(statusOf(p))).length,
        fabrication: active.filter((p) => isFabrication(statusOf(p))).length,
        quality: active.filter((p) => isQuality(statusOf(p))).length,
        dispatch: active.filter((p) => isDispatch(statusOf(p))).length,
      },
      bays: toList(workCentersRes).map(toBay),
      jobs: active.slice(0, 20).map(toJob),
    };
  },

  // Live Employee Dashboard
  getEmployeeDashboard: async (employeeId?: string): Promise<EmployeeDashboardData> => {
    const ep = employeeId ? `/hr/employee-dashboard/?employee_id=${employeeId}` : '/hr/employee-dashboard/';
    const res = await apiClient.get<EmployeeDashboardData>(ep);
    return res.data;
  },

  // Attendance Punch In
  punchIn: async (): Promise<{ message: string; record?: any }> => {
    const res = await apiClient.post('/attendance-records/check_in/');
    return res.data;
  },

  // Attendance Punch Out
  punchOut: async (): Promise<{ message: string; record?: any }> => {
    const res = await apiClient.post('/attendance-records/check_out/');
    return res.data;
  },

  // Update Task Progress
  updateTaskProgress: async (taskId: string, progressPercent: number, remarks?: string): Promise<any> => {
    if (progressPercent >= 100) {
      const res = await apiClient.post(`/project-tasks/${taskId}/submit_for_review/`, {
        remarks: remarks || 'Completed 100% via Mobile App',
      });
      return res.data;
    }
    const res = await apiClient.patch(`/project-tasks/${taskId}/update_progress/`, {
      progress_percent: progressPercent,
      status: 'In Progress',
      remarks,
    });
    return res.data;
  },
};
