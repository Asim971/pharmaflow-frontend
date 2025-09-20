import axios, { AxiosInstance } from 'axios';

// Types for API requests and responses
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  company?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  requestId: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface CustomerHierarchyParams {
  page?: number;
  limit?: number;
  territory?: string;
  type?: 'distributor' | 'retailer' | 'healthcare';
}

export interface DGDASubmissionParams {
  status?: string;
  submissionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DGDASubmissionData {
  type: string;
  productName: string;
  manufacturerName: string;
  documents: File[];
  submissionNotes?: string;
}

class PharmaFlowApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Platform': 'web',
        'X-Client-Type': 'pharmaceutical-frontend'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('pharmaflow_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp
        config.headers['X-Request-Timestamp'] = new Date().toISOString();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('pharmaflow_refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/refresh`, {
                refreshToken
              });

              const { accessToken } = response.data.data;
              localStorage.setItem('pharmaflow_access_token', accessToken);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('pharmaflow_access_token');
            localStorage.removeItem('pharmaflow_refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  auth = {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<any>> => {
      const response = await this.client.post('/auth/login', credentials);
      return response.data;
    },

    register: async (userData: RegisterData): Promise<ApiResponse<any>> => {
      const response = await this.client.post('/auth/register', userData);
      return response.data;
    },

    refreshToken: async (): Promise<ApiResponse<any>> => {
      const refreshToken = localStorage.getItem('pharmaflow_refresh_token');
      const response = await this.client.post('/auth/refresh', { refreshToken });
      return response.data;
    },

    logout: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.post('/auth/logout');
      // Clear local storage
      localStorage.removeItem('pharmaflow_access_token');
      localStorage.removeItem('pharmaflow_refresh_token');
      return response.data;
    },

    getProfile: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/auth/profile');
      return response.data;
    }
  };

  // Customer Management APIs
  customers = {
    getHierarchy: async (params?: CustomerHierarchyParams): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/customers/hierarchy', { params });
      return response.data;
    },

    getCustomer: async (customerId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    },

    updateCustomer: async (customerId: string, data: any): Promise<ApiResponse<any>> => {
      const response = await this.client.put(`/customers/${customerId}`, data);
      return response.data;
    },

    createCustomer: async (customerData: any): Promise<ApiResponse<any>> => {
      const response = await this.client.post('/customers', customerData);
      return response.data;
    },

    deleteCustomer: async (customerId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.delete(`/customers/${customerId}`);
      return response.data;
    },

    getTerritory: async (territoryId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/customers/territories/${territoryId}`);
      return response.data;
    },

    getTerritories: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/customers/territories');
      return response.data;
    }
  };

  // DGDA Compliance APIs
  dgda = {
    getSubmissions: async (params?: DGDASubmissionParams): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/dgda/submissions', { params });
      return response.data;
    },

    createSubmission: async (submissionData: DGDASubmissionData): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('type', submissionData.type);
      formData.append('productName', submissionData.productName);
      formData.append('manufacturerName', submissionData.manufacturerName);
      
      if (submissionData.submissionNotes) {
        formData.append('submissionNotes', submissionData.submissionNotes);
      }

      // Add documents
      submissionData.documents.forEach((file) => {
        formData.append(`documents`, file);
      });

      const response = await this.client.post('/dgda/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },

    getSubmission: async (submissionId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/dgda/submissions/${submissionId}`);
      return response.data;
    },

    getSubmissionStatus: async (submissionId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/dgda/submissions/${submissionId}/status`);
      return response.data;
    },

    uploadDocument: async (submissionId: string, file: File): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await this.client.post(
        `/dgda/submissions/${submissionId}/documents`, 
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    },

    getRequirements: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/dgda/requirements');
      return response.data;
    }
  };

  // Audit Trail APIs
  audit = {
    getTrail: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/audit/trail', { params });
      return response.data;
    },

    getEventDetails: async (eventId: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/audit/events/${eventId}`);
      return response.data;
    },

    exportAuditReport: async (params: any): Promise<Blob> => {
      const response = await this.client.get('/audit/export', { 
        params, 
        responseType: 'blob' 
      });
      return response.data;
    },

    getAuditStats: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/audit/stats');
      return response.data;
    }
  };

  // Analytics APIs
  analytics = {
    getKPIs: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/analytics/kpis', { params });
      return response.data;
    },

    getTerritoryPerformance: async (territoryId: string, period: string): Promise<ApiResponse<any>> => {
      const response = await this.client.get(`/analytics/territory/${territoryId}`, { 
        params: { period } 
      });
      return response.data;
    },

    getComplianceMetrics: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/analytics/compliance', { params });
      return response.data;
    },

    getDashboardData: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/analytics/dashboard');
      return response.data;
    },

    getSalesPerformance: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/analytics/sales', { params });
      return response.data;
    }
  };

  // Regulatory APIs
  regulatory = {
    getRequirements: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/regulatory/requirements');
      return response.data;
    },

    getCompliance: async (params?: any): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/regulatory/compliance', { params });
      return response.data;
    },

    getUpdates: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/regulatory/updates');
      return response.data;
    }
  };

  // Marketing APIs
  marketing = {
    getCampaigns: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/marketing/campaigns');
      return response.data;
    },

    createCampaign: async (campaignData: any): Promise<ApiResponse<any>> => {
      const response = await this.client.post('/marketing/campaigns', campaignData);
      return response.data;
    },

    getTemplates: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/marketing/templates');
      return response.data;
    }
  };

  // System APIs
  system = {
    getHealth: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/system/health');
      return response.data;
    },

    getVersion: async (): Promise<ApiResponse<any>> => {
      const response = await this.client.get('/system/version');
      return response.data;
    }
  };
}

// Create and export the API client instance
export const apiClient = new PharmaFlowApiClient();

export default apiClient;