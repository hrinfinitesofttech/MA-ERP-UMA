import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR PROJECT MANAGEMENT
// ==========================================

export interface ProjectItem {
  id: string;
  project_number: string;
  job_number: string;
  customer_id?: string;
  customer_name: string;
  sales_order_id?: string;
  sales_order_number?: string;
  customer_po_number?: string;
  product_name: string;
  product_code?: string;
  specification?: string;
  quantity?: number;
  unit?: string;
  order_value?: number;
  start_date: string;
  target_delivery_date: string;
  actual_delivery_date?: string | null;
  current_status: string; // planning, design, material_planning, purchase, production, qc, ready_for_dispatch, completed, on_hold, cancelled
  progress_percent: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  project_manager_id?: string;
  project_manager_name?: string;
  stage?: string;
  health_status?: 'on_track' | 'at_risk' | 'delayed' | 'critical';
  linked_records?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDashboardSummary {
  total_projects_count: number;
  tasks_count: number;
  delays_count: number;
  priority_chart_data?: Array<{ name: string; count: number; fill: string }>;
  department_chart_data?: Array<{ name: string; count: number; hours: number }>;
  monthly_creation_data?: Array<{ month: string; count: number; value: number }>;
  completion_trend_data?: Array<{ month: string; planned: number; actual: number }>;
  delay_breakdown_data?: Array<{ reason: string; days: number }>;
}

export interface ProjectPlanningStage {
  id: string;
  project_id: string;
  stage_number: number;
  name: string;
  department: string;
  assigned_employee_name?: string;
  assignees?: Array<{ name: string; department: string }>;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  progress: number;
  start_date?: string;
  end_date?: string;
  planned_duration_days?: number;
  actual_duration_days?: number;
  description?: string;
  completed_by?: string | null;
  completed_at?: string | null;
  completion_notes?: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  project_number?: string;
  job_number?: string;
  title?: string;
  milestone_name?: string;
  milestone_code?: string;
  owner?: string;
  planned_date?: string;
  actual_date?: string | null;
  target_date?: string;
  completion_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'achieved';
  payment_percentage?: number;
  payment_amount?: number;
  department?: string;
  remarks?: string;
}

export interface ProjectTaskItem {
  id: string;
  project_id?: string;
  task_number?: string;
  title: string;
  description?: string;
  department: string;
  assigned_by_name?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  category?: string;
  status: 'Assigned' | 'Accepted' | 'In Progress' | 'On Hold' | 'Submitted for Review' | 'Completed' | 'Cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress_percent: number;
  estimated_hours?: number;
  actual_hours?: number;
  checklist?: Array<{ id?: string; text: string; done: boolean }>;
  start_date?: string;
  due_date?: string;
  completion_date?: string | null;
  review_notes?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDelayItem {
  id: string;
  project_id: string;
  project_number?: string;
  job_number?: string;
  delay_no?: string;
  reason?: string;
  delay_reason?: string;
  department?: string;
  task_name?: string;
  delayed_days?: number;
  delay_days?: number;
  impact?: string;
  mitigation_plan?: string;
  corrective_action?: string;
  recorded_by?: string;
  responsible_person?: string;
  date?: string;
  status?: string;
}

export interface ProjectDocumentItem {
  id: string;
  project_id: string;
  job_number?: string;
  document_name: string;
  type?: string;
  version?: string;
  uploaded_by?: string;
  department?: string;
  related_record?: string;
  description?: string;
  file_size?: string;
  file_url?: string;
  upload_date?: string;
}

export interface MasterTaskItem {
  id: string;
  task_code: string;
  task_name: string;
  department: string;
  department_id?: string;
  description?: string;
  estimated_days?: number;
  estimated_hours?: number;
  status: string;
}

// ==========================================
// API SERVICE METHODS FOR PROJECT MANAGEMENT
// ==========================================

export const projectsApi = {
  /**
   * Fetch Dashboard summary metrics (KPIs, stage distribution, department loads)
   */
  getDashboardSummary: async (): Promise<ProjectDashboardSummary> => {
    try {
      const response = await apiClient.get<ProjectDashboardSummary>('/projects/dashboard-summary/');
      return response.data;
    } catch {
      // Fallback endpoint if router configuration differs
      const response = await apiClient.get<ProjectDashboardSummary>('/projects/dashboard_summary/');
      return response.data;
    }
  },

  /**
   * Fetch all projects with optional search query & status filter
   */
  getProjects: async (params?: { search?: string; status?: string }): Promise<ProjectItem[]> => {
    try {
      const response = await apiClient.get<any>('/projects/', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/project-jobs/', { params });
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch single project details by ID or Project Number
   */
  getProject: async (id: string): Promise<ProjectItem> => {
    try {
      const response = await apiClient.get<ProjectItem>(`/projects/${id}/`);
      return response.data;
    } catch {
      const fallback = await apiClient.get<ProjectItem>(`/project-jobs/${id}/`);
      return fallback.data;
    }
  },

  /**
   * Create a new project
   */
  createProject: async (data: Partial<ProjectItem>): Promise<ProjectItem> => {
    try {
      const response = await apiClient.post<ProjectItem>('/projects/', data);
      return response.data;
    } catch {
      const fallback = await apiClient.post<ProjectItem>('/project-jobs/', data);
      return fallback.data;
    }
  },

  /**
   * Update an existing project
   */
  updateProject: async (id: string, data: Partial<ProjectItem>): Promise<ProjectItem> => {
    try {
      const response = await apiClient.patch<ProjectItem>(`/projects/${id}/`, data);
      return response.data;
    } catch {
      const fallback = await apiClient.patch<ProjectItem>(`/project-jobs/${id}/`, data);
      return fallback.data;
    }
  },

  /**
   * Trigger automatic generation of 16 Standard Fabrication Planning Stages
   */
  generatePlanningStages: async (projectId: string): Promise<{ success: boolean; stages: ProjectPlanningStage[] }> => {
    const response = await apiClient.post(`/projects/${projectId}/generate-stages/`);
    return response.data;
  },

  /**
   * Fetch planning stages (filtered by projectId if supplied)
   */
  getPlanningStages: async (projectId?: string): Promise<ProjectPlanningStage[]> => {
    const params = projectId ? { projectId } : undefined;
    try {
      const response = await apiClient.get<any>('/planning-stages/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const response = await apiClient.get<any>('/projects/planning-stages/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    }
  },

  /**
   * Update a planning stage (progress, notes, status)
   */
  updatePlanningStage: async (id: string, data: Partial<ProjectPlanningStage>): Promise<ProjectPlanningStage> => {
    try {
      const response = await apiClient.patch<ProjectPlanningStage>(`/planning-stages/${id}/`, data);
      return response.data;
    } catch {
      const response = await apiClient.patch<ProjectPlanningStage>(`/projects/planning-stages/${id}/`, data);
      return response.data;
    }
  },

  /**
   * Mark a planning stage as completed
   */
  completePlanningStage: async (id: string, notes?: string): Promise<ProjectPlanningStage> => {
    const payload = { notes, completed_by: 'Authorized User' };
    try {
      const response = await apiClient.post<ProjectPlanningStage>(`/planning-stages/${id}/complete/`, payload);
      return response.data;
    } catch {
      const response = await apiClient.post<ProjectPlanningStage>(`/projects/planning-stages/${id}/complete/`, payload);
      return response.data;
    }
  },

  /**
   * Fetch milestones for a project or all projects
   */
  getMilestones: async (projectId?: string): Promise<ProjectMilestone[]> => {
    const params = projectId ? { projectId } : undefined;
    try {
      const response = await apiClient.get<any>('/project-milestones/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Create a project milestone
   */
  createMilestone: async (data: Partial<ProjectMilestone>): Promise<ProjectMilestone> => {
    const response = await apiClient.post<ProjectMilestone>('/project-milestones/', data);
    return response.data;
  },

  /**
   * Fetch project tasks with optional filters
   */
  getTasks: async (params?: {
    projectId?: string;
    department?: string;
    status?: string;
    assignedToId?: string;
  }): Promise<ProjectTaskItem[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.project_id = params.projectId;
    if (params?.department) queryParams.department = params.department;
    if (params?.status) queryParams.status = params.status;
    if (params?.assignedToId) queryParams.assigned_to_id = params.assignedToId;

    try {
      const response = await apiClient.get<any>('/project-tasks/', { params: queryParams });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const response = await apiClient.get<any>('/projects/tasks/', { params: queryParams });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    }
  },

  /**
   * Create a new project task
   */
  createTask: async (data: Partial<ProjectTaskItem>): Promise<ProjectTaskItem> => {
    try {
      const response = await apiClient.post<ProjectTaskItem>('/project-tasks/', data);
      return response.data;
    } catch {
      const response = await apiClient.post<ProjectTaskItem>('/projects/tasks/', data);
      return response.data;
    }
  },

  /**
   * Update task progress (% completed, hours, remarks, status)
   */
  updateTaskProgress: async (
    id: string,
    data: {
      progress_percent?: number;
      status?: string;
      actual_hours?: number;
      remarks?: string;
    }
  ): Promise<ProjectTaskItem> => {
    try {
      const response = await apiClient.post<ProjectTaskItem>(`/project-tasks/${id}/progress/`, data);
      return response.data;
    } catch {
      const response = await apiClient.patch<ProjectTaskItem>(`/project-tasks/${id}/`, data);
      return response.data;
    }
  },

  /**
   * Accept an assigned task
   */
  acceptTask: async (id: string): Promise<ProjectTaskItem> => {
    const response = await apiClient.post<ProjectTaskItem>(`/project-tasks/${id}/accept/`);
    return response.data;
  },

  /**
   * Start working on an accepted task
   */
  startTask: async (id: string): Promise<ProjectTaskItem> => {
    const response = await apiClient.post<ProjectTaskItem>(`/project-tasks/${id}/start/`);
    return response.data;
  },

  /**
   * Submit completed task for manager review
   */
  submitTaskForReview: async (id: string, remarks?: string): Promise<ProjectTaskItem> => {
    const response = await apiClient.post<ProjectTaskItem>(`/project-tasks/${id}/submit-for-review/`, { remarks });
    return response.data;
  },

  /**
   * Fetch project documents
   */
  getProjectDocuments: async (projectId?: string): Promise<ProjectDocumentItem[]> => {
    const params = projectId ? { projectId } : undefined;
    try {
      const response = await apiClient.get<any>('/project-documents/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch project delay logs
   */
  getProjectDelays: async (projectId?: string): Promise<ProjectDelayItem[]> => {
    const params = projectId ? { projectId } : undefined;
    try {
      const response = await apiClient.get<any>('/project-delays/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch master task library
   */
  getMasterTasks: async (department?: string): Promise<MasterTaskItem[]> => {
    const params = department ? { department } : undefined;
    try {
      const response = await apiClient.get<any>('/master-tasks/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      return [];
    }
  },
};
