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

export interface DashboardJob {
  id: string;
  jobNumber: string;
  customerName: string;
  productName: string;
  orderValue: number;
  dueDate: string;
  progressPercent: number;
  status: string;
  priority: string;
  health: string;
}

export interface WorkCenterBay {
  id: string;
  name: string;
  location: string;
  status: string;
  efficiency: number | null;
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
  activeProjects: number;
  expediteCount: number;
  qualityPassRate: number | null;
  stageCounts: { planning: number; fabrication: number; quality: number; dispatch: number };
  bays: WorkCenterBay[];
  jobs: DashboardJob[];
}
