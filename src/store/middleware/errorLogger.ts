/**
 * RTK Query Error Logger Middleware
 * Comprehensive error handling for pharmaceutical operations
 */

import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';

// Error severity levels
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for pharmaceutical operations
enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  DGDA_COMPLIANCE = 'dgda_compliance',
  CUSTOMER_MANAGEMENT = 'customer_management',
  TERRITORY_MANAGEMENT = 'territory_management',
  MARKETING_AUTOMATION = 'marketing_automation',
  ANALYTICS = 'analytics',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  SYSTEM = 'system'
}

// Error context interface
interface ErrorContext {
  userId?: string;
  tenantId?: string;
  action: string;
  endpoint?: string;
  dgdaContext?: {
    submissionId?: string;
    documentId?: string;
    complianceLevel?: string;
  };
  customerContext?: {
    customerId?: string;
    customerTier?: string;
    territoryId?: string;
  };
  auditTrail?: {
    timestamp: string;
    userAgent: string;
    sessionId: string;
  };
}

// Structured error interface
interface StructuredError {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  details: any;
  context: ErrorContext;
  stackTrace?: string;
  resolved: boolean;
}

// Error notification interface
interface ErrorNotification {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  autoHide: boolean;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Determine error severity based on status code and category
const getErrorSeverity = (statusCode: number, category: ErrorCategory): ErrorSeverity => {
  // DGDA compliance errors are always high priority
  if (category === ErrorCategory.DGDA_COMPLIANCE) {
    return statusCode >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;
  }
  
  // Authentication errors
  if (category === ErrorCategory.AUTHENTICATION) {
    return statusCode === 401 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
  }
  
  // General severity mapping
  if (statusCode >= 500) return ErrorSeverity.CRITICAL;
  if (statusCode >= 400) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
};

// Determine error category based on endpoint and error details
const getErrorCategory = (endpoint: string, errorData: any): ErrorCategory => {
  if (endpoint.includes('/auth/') || errorData?.code === 'UNAUTHORIZED') {
    return ErrorCategory.AUTHENTICATION;
  }
  
  if (endpoint.includes('/dgda/') || endpoint.includes('/compliance/')) {
    return ErrorCategory.DGDA_COMPLIANCE;
  }
  
  if (endpoint.includes('/customers/')) {
    return ErrorCategory.CUSTOMER_MANAGEMENT;
  }
  
  if (endpoint.includes('/territories/')) {
    return ErrorCategory.TERRITORY_MANAGEMENT;
  }
  
  if (endpoint.includes('/campaigns/') || endpoint.includes('/marketing/')) {
    return ErrorCategory.MARKETING_AUTOMATION;
  }
  
  if (endpoint.includes('/analytics/') || endpoint.includes('/reports/')) {
    return ErrorCategory.ANALYTICS;
  }
  
  if (errorData?.code === 'NETWORK_ERROR' || errorData?.code === 'TIMEOUT') {
    return ErrorCategory.NETWORK;
  }
  
  if (errorData?.code === 'VALIDATION_ERROR') {
    return ErrorCategory.VALIDATION;
  }
  
  if (errorData?.code === 'PERMISSION_DENIED') {
    return ErrorCategory.PERMISSION;
  }
  
  return ErrorCategory.SYSTEM;
};

// Generate user-friendly error messages
const getUserFriendlyMessage = (category: ErrorCategory, statusCode: number, originalMessage: string): string => {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return statusCode === 401 
        ? 'আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।'
        : 'অনুমতি সংক্রান্ত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    
    case ErrorCategory.DGDA_COMPLIANCE:
      return 'ড্রাগ প্রশাসন সংক্রান্ত সমস্যা হয়েছে। অনুগ্রহ করে নিয়মানুবর্তিতা দল এর সাথে যোগাযোগ করুন।';
    
    case ErrorCategory.CUSTOMER_MANAGEMENT:
      return 'গ্রাহক তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    
    case ErrorCategory.TERRITORY_MANAGEMENT:
      return 'অঞ্চল ব্যবস্থাপনায় সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।';
    
    case ErrorCategory.MARKETING_AUTOMATION:
      return 'বিপণন ক্যাম্পেইন প্রক্রিয়াকরণে সমস্যা হয়েছে।';
    
    case ErrorCategory.NETWORK:
      return 'ইন্টারনেট সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আপনার সংযোগ পরীক্ষা করুন।';
    
    case ErrorCategory.VALIDATION:
      return 'প্রদত্ত তথ্যে ত্রুটি রয়েছে। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।';
    
    case ErrorCategory.PERMISSION:
      return 'আপনার এই কাজের অনুমতি নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।';
    
    default:
      return originalMessage || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
  }
};

// Create error notification
const createErrorNotification = (error: StructuredError): ErrorNotification => {
  const { severity, category, message } = error;
  
  const notification: ErrorNotification = {
    title: severity === ErrorSeverity.CRITICAL ? 'জরুরি সমস্যা' : 'ত্রুটি',
    message,
    type: severity === ErrorSeverity.CRITICAL ? 'error' : 'warning',
    autoHide: severity !== ErrorSeverity.CRITICAL,
    duration: severity === ErrorSeverity.CRITICAL ? undefined : 5000
  };
  
  // Add specific actions based on error category
  if (category === ErrorCategory.AUTHENTICATION) {
    notification.actions = [
      {
        label: 'আবার লগইন করুন',
        action: () => {
          window.location.href = '/login';
        }
      }
    ];
  }
  
  if (category === ErrorCategory.NETWORK) {
    notification.actions = [
      {
        label: 'আবার চেষ্টা করুন',
        action: () => {
          window.location.reload();
        }
      }
    ];
  }
  
  return notification;
};

// Log error to external monitoring service
const logToMonitoringService = async (error: StructuredError): Promise<void> => {
  try {
    // Only log high and critical errors to external service
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      await fetch('/api/v1/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });
    }
  } catch (logError) {
    console.error('Failed to log error to monitoring service:', logError);
  }
};

// RTK Query error logger middleware
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    // Handle RTK Query rejected actions
    if (isRejectedWithValue(action)) {
      const { payload, meta } = action;
      const endpoint = meta?.arg?.originalArgs || 'unknown';
      const statusCode = payload?.status || 0;
      
      // Extract error details
      const errorData = payload?.data || payload;
      const category = getErrorCategory(endpoint.toString(), errorData);
      const severity = getErrorSeverity(statusCode, category);
      
      // Get user context from Redux state
      const state = api.getState() as any;
      const userId = state.auth?.user?.id;
      const tenantId = state.auth?.user?.tenantId;
      
      // Create structured error
      const structuredError: StructuredError = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        severity,
        category,
        message: getUserFriendlyMessage(category, statusCode, errorData?.message),
        details: {
          originalMessage: errorData?.message,
          statusCode,
          endpoint,
          payload: errorData
        },
        context: {
          userId,
          tenantId,
          action: action.type,
          endpoint: endpoint.toString(),
          auditTrail: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: localStorage.getItem('pharma_session_id') || 'unknown'
          }
        },
        stackTrace: errorData?.stack,
        resolved: false
      };
      
      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Pharmaceutical API Error - ${severity.toUpperCase()}`);
        console.error('Category:', category);
        console.error('Endpoint:', endpoint);
        console.error('Status:', statusCode);
        console.error('Message:', structuredError.message);
        console.error('Details:', structuredError.details);
        console.error('Context:', structuredError.context);
        console.groupEnd();
      }
      
      // Show user notification
      const notification = createErrorNotification(structuredError);
      
      // Dispatch notification to UI (would be handled by notification system)
      api.dispatch({
        type: 'notifications/add',
        payload: notification
      });
      
      // Log to monitoring service for high/critical errors
      logToMonitoringService(structuredError);
      
      // Store error in local state for error reporting
      const existingErrors = JSON.parse(localStorage.getItem('pharma_errors') || '[]');
      existingErrors.push(structuredError);
      
      // Keep only last 50 errors to prevent storage overflow
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('pharma_errors', JSON.stringify(existingErrors));
      
      // Special handling for authentication errors
      if (category === ErrorCategory.AUTHENTICATION && statusCode === 401) {
        // Clear auth state and redirect to login
        api.dispatch({ type: 'auth/logout' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      // Special handling for DGDA compliance critical errors
      if (category === ErrorCategory.DGDA_COMPLIANCE && severity === ErrorSeverity.CRITICAL) {
        // Notify compliance team
        api.dispatch({
          type: 'notifications/notifyComplianceTeam',
          payload: {
            error: structuredError,
            urgency: 'immediate'
          }
        });
      }
    }
    
    return next(action);
  };

// Error recovery utilities
export const errorRecoveryUtils = {
  // Retry failed request with exponential backoff
  retryWithBackoff: async (
    requestFn: () => Promise<any>, 
    maxRetries: number = 3, 
    baseDelay: number = 1000
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
  
  // Get stored errors for reporting
  getStoredErrors: (): StructuredError[] => {
    try {
      return JSON.parse(localStorage.getItem('pharma_errors') || '[]');
    } catch {
      return [];
    }
  },
  
  // Clear stored errors
  clearStoredErrors: (): void => {
    localStorage.removeItem('pharma_errors');
  },
  
  // Mark error as resolved
  markErrorResolved: (errorId: string): void => {
    const errors = errorRecoveryUtils.getStoredErrors();
    const updatedErrors = errors.map(error => 
      error.id === errorId ? { ...error, resolved: true } : error
    );
    localStorage.setItem('pharma_errors', JSON.stringify(updatedErrors));
  }
};

export default rtkQueryErrorLogger;