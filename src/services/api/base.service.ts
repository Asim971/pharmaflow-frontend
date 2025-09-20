import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Base API service configuration for pharmaceutical application
 * Includes DGDA compliance headers and audit trail support
 */
class BaseApiService {
  private instance: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout for Bangladesh internet conditions
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
        'X-Client-Platform': 'web',
        'X-DGDA-Compliance': 'enabled',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('pharma_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add audit trail headers
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = new Date().toISOString();
        config.headers['X-User-Agent'] = navigator.userAgent;

        // Add DGDA compliance tracking
        if (this.isDGDAEndpoint(config.url)) {
          config.headers['X-DGDA-Request'] = 'true';
          config.headers['X-Audit-Required'] = 'true';
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful DGDA requests
        if (response.config.headers['X-DGDA-Request']) {
          console.log('DGDA API response:', {
            url: response.config.url,
            status: response.status,
            requestId: response.config.headers['X-Request-ID'],
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('pharma_refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              
              // Update tokens
              localStorage.setItem('pharma_access_token', response.data.accessToken);
              localStorage.setItem('pharma_refresh_token', response.data.refreshToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('pharma_access_token');
            localStorage.removeItem('pharma_refresh_token');
            
            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('auth:logout'));
            
            return Promise.reject(refreshError);
          }
        }

        // Log DGDA request errors
        if (originalRequest.headers['X-DGDA-Request']) {
          console.error('DGDA API error:', {
            url: originalRequest.url,
            status: error.response?.status,
            message: error.response?.data?.message,
            requestId: originalRequest.headers['X-Request-ID'],
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(refreshToken: string): Promise<AxiosResponse> {
    return axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken,
    });
  }

  /**
   * Check if URL is a DGDA-related endpoint
   */
  private isDGDAEndpoint(url?: string): boolean {
    if (!url) return false;
    
    const dgdaPatterns = [
      '/dgda',
      '/submissions',
      '/compliance',
      '/regulatory',
      '/documents',
      '/approvals',
    ];

    return dgdaPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Generate unique request ID for audit trail
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * Download file with progress tracking
   */
  async downloadFile(
    url: string,
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Get current instance for direct access
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const api = new BaseApiService();