import { api } from '../api/base.service';

/**
 * Audit action types for pharmaceutical system
 */
export interface AuditAction {
  action: string;
  userId?: string;
  details?: Record<string, any>;
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit service for pharmaceutical compliance tracking
 * Handles all audit trail logging with DGDA compliance
 */
export class AuditService {
  private readonly baseUrl = '/audit';

  /**
   * Log an action to the audit trail
   */
  async logAction(auditAction: AuditAction): Promise<void> {
    try {
      // Enhance audit action with client-side information
      const enhancedAction: AuditAction = {
        ...auditAction,
        timestamp: auditAction.timestamp || new Date(),
        ipAddress: auditAction.ipAddress || await this.getClientIP(),
        userAgent: auditAction.userAgent || navigator.userAgent,
      };

      await api.post(`${this.baseUrl}/log`, enhancedAction);
    } catch (error) {
      // Don't throw audit errors - log them instead to prevent breaking user flow
      console.error('Audit logging failed:', error);
      
      // Store failed audit logs locally for retry
      this.storeFailedAuditLog(auditAction);
    }
  }

  /**
   * Get authentication-related audit logs
   */
  async getAuthenticationLogs(userId?: string, limit = 50): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        category: 'authentication',
        limit,
      };

      if (userId) {
        params.userId = userId;
      }

      const response = await api.get(`${this.baseUrl}/logs`, { params });
      return response.data.logs || [];
    } catch (error) {
      console.error('Failed to fetch authentication logs:', error);
      return [];
    }
  }

  /**
   * Get DGDA compliance audit logs
   */
  async getDGDAComplianceLogs(companyId: string, limit = 100): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/dgda-compliance`, {
        params: {
          companyId,
          limit,
        },
      });
      return response.data.logs || [];
    } catch (error) {
      console.error('Failed to fetch DGDA compliance logs:', error);
      return [];
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string, days = 30): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/user-activity/${userId}`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity summary:', error);
      return null;
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchLogs(filters: {
    action?: string;
    userId?: string;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        limit: filters.limit || 50,
      };

      if (filters.action) params.action = filters.action;
      if (filters.userId) params.userId = filters.userId;
      if (filters.companyId) params.companyId = filters.companyId;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();

      const response = await api.get(`${this.baseUrl}/search`, { params });
      return response.data.logs || [];
    } catch (error) {
      console.error('Failed to search audit logs:', error);
      return [];
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private async getClientIP(): Promise<string> {
    try {
      // This would typically be handled by the backend
      // For now, return a placeholder
      return 'client';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Store failed audit logs locally for retry
   */
  private storeFailedAuditLog(auditAction: AuditAction): void {
    try {
      const failedLogs = JSON.parse(localStorage.getItem('pharma_failed_audits') || '[]');
      failedLogs.push({
        ...auditAction,
        failedAt: new Date().toISOString(),
      });

      // Keep only last 100 failed logs
      if (failedLogs.length > 100) {
        failedLogs.splice(0, failedLogs.length - 100);
      }

      localStorage.setItem('pharma_failed_audits', JSON.stringify(failedLogs));
    } catch (error) {
      console.error('Failed to store failed audit log:', error);
    }
  }

  /**
   * Retry failed audit logs
   */
  async retryFailedAudits(): Promise<void> {
    try {
      const failedLogs = JSON.parse(localStorage.getItem('pharma_failed_audits') || '[]');
      
      if (failedLogs.length === 0) {
        return;
      }

      const retriedLogs: any[] = [];
      
      for (const log of failedLogs) {
        try {
          await this.logAction(log);
          // Successfully retried, don't add back to failed logs
        } catch (error) {
          // Still failing, keep in failed logs
          retriedLogs.push(log);
        }
      }

      // Update failed logs with remaining failed items
      localStorage.setItem('pharma_failed_audits', JSON.stringify(retriedLogs));
      
      if (retriedLogs.length < failedLogs.length) {
        console.log(`Successfully retried ${failedLogs.length - retriedLogs.length} failed audit logs`);
      }
    } catch (error) {
      console.error('Failed to retry audit logs:', error);
    }
  }

  /**
   * Clear all stored failed audit logs
   */
  clearFailedAudits(): void {
    localStorage.removeItem('pharma_failed_audits');
  }
}

// Export singleton instance
export const auditService = new AuditService();