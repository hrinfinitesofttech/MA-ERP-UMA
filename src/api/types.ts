export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  roleType: string;
  roleName: string;
  departmentName?: string;
  department?: string;
  assignedModules?: string[];
  effectivePermissions?: Record<string, string[]>;
  isActive?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  access: string;
  refresh: string;
}

export interface ProjectJob {
  id: string;
  jobNumber?: string;
  projectNumber?: string;
  customerName?: string;
  productName?: string;
  projectName?: string;
  customerPoNumber?: string;
  salesOrderNumber?: string;
  orderValue?: number | string;
  deliveryDate?: string;
  targetDeliveryDate?: string;
  progressPercent?: number;
  currentStage?: string;
  stage?: string;
  status?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'normal' | 'low';
}

export interface ManufacturingJob {
  id: string;
  jobNumber?: string;
  productName?: string;
  workCenter?: string;
  status?: string;
  progressPercent?: number;
  startDate?: string;
  targetDate?: string;
}

export interface WorkCenterBay {
  id: string;
  bayNumber: number;
  name: string;
  operation: string;
  status: 'READY' | 'IN PROGRESS' | 'CLEARED' | 'STANDBY';
  currentJob?: string;
  operator?: string;
}

export interface TodayAttendance {
  checkIn?: string;
  checkOut?: string;
  status?: string;
  totalHours?: number;
  lateMinutes?: number;
  shiftName?: string;
  canCheckIn?: boolean;
  canCheckOut?: boolean;
}

export interface AssignedTask {
  id: string;
  taskNumber?: string;
  title: string;
  priority: string;
  status: string;
  progressPercent: number;
  dueDate?: string;
  isOverdue?: boolean;
}

export interface EmployeeDashboardData {
  profile?: UserProfile;
  todayAttendance?: TodayAttendance;
  tasksSummary?: {
    totalAssigned?: number;
    pendingCount?: number;
    completedCount?: number;
    recentTasks?: AssignedTask[];
  };
}

export interface DashboardMetrics {
  activeBacklog: number;
  activeFloorCount: number;
  expediteCount: number;
  qualityPassRate: number;
  inPlanningCount: number;
  inFabCount: number;
  inQcCount: number;
  readyDispatchCount: number;
  bays: WorkCenterBay[];
  recentJobs: ProjectJob[];
}
