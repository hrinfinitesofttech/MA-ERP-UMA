import { apiClient } from './client';

// ==========================================
// TYPE DEFINITIONS FOR DESIGNER & ENGINEERING
// ==========================================

export interface DesignJobItem {
  id: string;
  design_job_number: string;
  project_id: string;
  project_number?: string;
  job_number?: string;
  customer_id?: string;
  customer_name: string;
  customer_po_number?: string;
  sales_order_number?: string;
  product_name: string;
  machine_type?: string;
  quantity?: number;
  delivery_date: string;
  design_manager?: string;
  assigned_designer?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  required_date?: string;
  status: 'pending' | 'in_progress' | 'approved' | 'disapproved' | 'released' | 'completed' | 'on_hold';
  remarks?: string;
  active_revision: string;
  drawing_file_name?: string;
  drawing_title?: string;
  drawing_number?: string;
  drawing_category?: 'GA' | 'Fabrication' | 'P&ID' | 'Electrical' | 'Layout' | '3D Model';
  drawing_format?: string;
  file_size?: string;
  file_url?: string;
  attachments?: Array<{
    name: string;
    sizeText?: string;
    type?: string;
    url?: string;
  }>;
  completed_date?: string;
  completed_by?: string;
  start_date?: string;
  target_completion_date?: string;
  approved_by?: string;
  approved_date?: string;
  disapproved_by?: string;
  disapproved_date?: string;
  rejection_reason?: string;
  approval_notes?: string;
  created_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BOMItemLine {
  id: string;
  itemNo?: number;
  partNumber: string; // BOM Code
  part_number?: string;
  itemName: string;
  item_name?: string;
  partName?: string;
  description: string;
  pCode?: 'C' | 'B' | 'OC' | 'P' | 'M' | string; // Cutting, Bending, Other Cutting, Purchase, Machining
  thk?: string; // Thickness
  size?: string;
  mat?: string; // Material Grade
  material?: string;
  materialGrade?: string;
  specification?: string;
  quantity: number;
  qty?: number;
  unit: string;
  estimatedRate?: number;
  rate?: number;
  totalEstimatedAmount?: number;
  total_amount?: number;
  procurement?: 'PURCHASE' | 'FABRICATE' | string;
  procurementType?: string;
  item_type?: 'RAW_MATERIAL' | 'FABRICATED' | 'BOUGHT_OUT' | 'CONSUMABLE' | 'HARDWARE' | 'ELECTRICAL' | string;
  itemType?: string;
}

export interface BOMHeaderItem {
  id: string;
  bom_number: string;
  design_job_id: string;
  project_id?: string;
  job_number?: string;
  active_revision: string;
  status: 'draft' | 'pending' | 'approved' | 'released' | 'rejected';
  total_items: number;
  total_weight_kg?: number;
  total_estimated_cost: number;
  prepared_by: string;
  approved_by?: string;
  release_date?: string;
  items: BOMItemLine[];
  revisions?: Array<{
    revision: string;
    date: string;
    reason: string;
    author: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface Drawing2DItem {
  id: string;
  design_job_id?: string;
  project_id?: string;
  job_number?: string;
  machine_name?: string;
  drawing_number: string;
  title: string;
  category: string; // GA, Fabrication, P&ID, Assembly
  revision: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'released';
  scale?: string;
  sheet_size?: string;
  prepared_by?: string;
  checked_by?: string;
  approved_by?: string;
  release_date?: string;
  file_format: string;
  file_size?: string;
  file_url?: string;
  created_at?: string;
}

export interface Design3DModelItem {
  id: string;
  design_job_id?: string;
  model_number: string;
  model_name: string;
  software: string; // SolidWorks, AutoCAD, Inventor
  version?: string;
  status: 'draft' | 'approved' | 'obsolete';
  mass_kg?: number;
  volume_m3?: number;
  modeled_by?: string;
  file_url?: string;
  created_at?: string;
}

export interface AssemblyDrawingItem {
  id: string;
  design_job_id?: string;
  project_id?: string;
  job_number?: string;
  assembly_number: string;
  assembly_title: string;
  sub_assembly_code?: string;
  parent_assembly_number?: string;
  revision_number: string;
  file_format: string;
  file_size?: string;
  file_url?: string;
  drawn_by?: string;
  approved_by?: string;
  created_at?: string;
}

export interface CustomerRequirementItem {
  id: string;
  design_job_id?: string;
  project_id?: string;
  job_number?: string;
  customer_name: string;
  contact_person?: string;
  contact_mobile?: string;
  machine_name: string;
  machine_type?: string;
  model?: string;
  quantity?: number;
  capacity?: string;
  application?: string;
  production_requirement?: string;
  dimensions?: string;
  material?: string;
  power_requirement?: string;
  speed?: string;
  output?: string;
  automation_level?: string;
  control_system?: string;
  safety_requirements?: string;
  special_requirements?: string;
  customer_drawing_url?: string;
  customer_notes?: string;
  designer_notes?: string;
  created_at?: string;
}

export interface TechnicalDocumentItem {
  id: string;
  design_job_id?: string;
  project_id?: string;
  job_number?: string;
  doc_number?: string;
  title?: string;
  document_name: string;
  category: string; // Calculation, Specification, Manual, Certificate
  version?: string;
  revision?: string;
  uploaded_by?: string;
  upload_date?: string;
  file_size?: string;
  file_url?: string;
  created_at?: string;
}

export interface DesignTaskItem {
  id: string;
  design_job_id?: string;
  project_id?: string;
  job_number?: string;
  task_name: string;
  customer_name?: string;
  machine_name?: string;
  designer: string;
  start_date?: string;
  target_date?: string;
  due_date?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimated_hours?: number;
  actual_hours?: number;
  progress_percent: number;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  remarks?: string;
  created_at?: string;
}

export interface DesignRevisionLogItem {
  id: string;
  design_job_id: string;
  revision_number: string;
  reason: string;
  changes_summary: string;
  requested_by: string;
  approved_by?: string;
  date: string;
}

// ==========================================
// API SERVICE METHODS FOR DESIGN & ENGINEERING
// ==========================================

export const engineeringApi = {
  /**
   * Fetch all Design Jobs with optional search and status filter
   */
  getDesignJobs: async (params?: { search?: string; status?: string }): Promise<DesignJobItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/jobs/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/design-jobs/', { params });
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch single Design Job details
   */
  getDesignJob: async (id: string): Promise<DesignJobItem> => {
    try {
      const response = await apiClient.get<DesignJobItem>(`/designer/jobs/${encodeURIComponent(id)}/`);
      return response.data;
    } catch {
      const fallback = await apiClient.get<DesignJobItem>(`/design-jobs/${encodeURIComponent(id)}/`);
      return fallback.data;
    }
  },

  /**
   * Create a new Design Job
   */
  createDesignJob: async (data: Partial<DesignJobItem>): Promise<DesignJobItem> => {
    try {
      const response = await apiClient.post<DesignJobItem>('/designer/jobs/', data);
      return response.data;
    } catch {
      const fallback = await apiClient.post<DesignJobItem>('/design-jobs/', data);
      return fallback.data;
    }
  },

  /**
   * Update an existing Design Job
   */
  updateDesignJob: async (id: string, data: Partial<DesignJobItem>): Promise<DesignJobItem> => {
    try {
      const response = await apiClient.patch<DesignJobItem>(`/designer/jobs/${encodeURIComponent(id)}/`, data);
      return response.data;
    } catch {
      const fallback = await apiClient.patch<DesignJobItem>(`/design-jobs/${encodeURIComponent(id)}/`, data);
      return fallback.data;
    }
  },

  /**
   * Approve a Design Job (Engineering Manager role)
   */
  approveDesignJob: async (id: string, notes?: string): Promise<{ success: boolean; message: string; job: DesignJobItem }> => {
    const payload = { approval_notes: notes || 'Approved after engineering verification.' };
    try {
      const response = await apiClient.post(`/designer/jobs/${encodeURIComponent(id)}/approve/`, payload);
      return response.data;
    } catch {
      const fallback = await apiClient.post(`/design-jobs/${encodeURIComponent(id)}/approve/`, payload);
      return fallback.data;
    }
  },

  /**
   * Disapprove / Reject a Design Job
   */
  disapproveDesignJob: async (id: string, reason: string): Promise<{ success: boolean; message: string; job: DesignJobItem }> => {
    const payload = { rejection_reason: reason };
    try {
      const response = await apiClient.post(`/designer/jobs/${encodeURIComponent(id)}/disapprove/`, payload);
      return response.data;
    } catch {
      const fallback = await apiClient.post(`/design-jobs/${encodeURIComponent(id)}/disapprove/`, payload);
      return fallback.data;
    }
  },

  /**
   * Release Design Job & BOM to Production
   */
  releaseToProduction: async (id: string): Promise<{ success: boolean; message: string; job: DesignJobItem }> => {
    try {
      const response = await apiClient.post(`/designer/jobs/${encodeURIComponent(id)}/release-to-production/`);
      return response.data;
    } catch {
      const fallback = await apiClient.post(`/design-jobs/${encodeURIComponent(id)}/release-to-production/`);
      return fallback.data;
    }
  },

  /**
   * Fetch all Bills of Materials (BOMs)
   */
  getBOMs: async (): Promise<BOMHeaderItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/boms/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/boms/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch single BOM by ID or BOM Number
   */
  getBOM: async (id: string): Promise<BOMHeaderItem> => {
    try {
      const response = await apiClient.get<BOMHeaderItem>(`/designer/boms/${encodeURIComponent(id)}/`);
      return response.data;
    } catch {
      const fallback = await apiClient.get<BOMHeaderItem>(`/boms/${encodeURIComponent(id)}/`);
      return fallback.data;
    }
  },

  /**
   * Create a new BOM Header
   */
  createBOM: async (data: Partial<BOMHeaderItem>): Promise<BOMHeaderItem> => {
    try {
      const response = await apiClient.post<BOMHeaderItem>('/designer/boms/', data);
      return response.data;
    } catch {
      const fallback = await apiClient.post<BOMHeaderItem>('/boms/', data);
      return fallback.data;
    }
  },

  /**
   * Update a BOM Header or Line Items
   */
  updateBOM: async (id: string, data: Partial<BOMHeaderItem>): Promise<BOMHeaderItem> => {
    try {
      const response = await apiClient.patch<BOMHeaderItem>(`/designer/boms/${encodeURIComponent(id)}/`, data);
      return response.data;
    } catch {
      const fallback = await apiClient.patch<BOMHeaderItem>(`/boms/${encodeURIComponent(id)}/`, data);
      return fallback.data;
    }
  },

  /**
   * Add a component item to an existing BOM
   */
  addBOMItem: async (bomId: string, item: Partial<BOMItemLine>): Promise<BOMHeaderItem> => {
    try {
      const response = await apiClient.post<BOMHeaderItem>(`/designer/boms/${encodeURIComponent(bomId)}/add-item/`, item);
      return response.data;
    } catch {
      const fallback = await apiClient.post<BOMHeaderItem>(`/boms/${encodeURIComponent(bomId)}/add-item/`, item);
      return fallback.data;
    }
  },

  /**
   * Fetch 2D CAD Drawings
   */
  get2DDrawings: async (): Promise<Drawing2DItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/drawings-2d/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/drawings-2d/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Create a 2D Drawing entry
   */
  create2DDrawing: async (data: Partial<Drawing2DItem>): Promise<Drawing2DItem> => {
    try {
      const response = await apiClient.post<Drawing2DItem>('/designer/drawings-2d/', data);
      return response.data;
    } catch {
      const fallback = await apiClient.post<Drawing2DItem>('/drawings-2d/', data);
      return fallback.data;
    }
  },

  /**
   * Fetch 3D Design Models
   */
  get3DModels: async (): Promise<Design3DModelItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/models-3d/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/models-3d/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch Customer Engineering Requirements
   */
  getCustomerRequirements: async (): Promise<CustomerRequirementItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/requirements/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/customer-requirements/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch Technical Documents
   */
  getTechnicalDocuments: async (): Promise<TechnicalDocumentItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/technical-documents/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/technical-documents/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch Design Tasks
   */
  getDesignTasks: async (): Promise<DesignTaskItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/tasks/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/design-tasks/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },

  /**
   * Fetch Design Revision Logs
   */
  getRevisionLogs: async (): Promise<DesignRevisionLogItem[]> => {
    try {
      const response = await apiClient.get<any>('/designer/revisions/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return [];
    } catch {
      const fallback = await apiClient.get<any>('/design-revisions/');
      if (Array.isArray(fallback.data)) return fallback.data;
      if (fallback.data && Array.isArray(fallback.data.results)) return fallback.data.results;
      return [];
    }
  },
};
