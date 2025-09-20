/**
 * Comprehensive API Hooks for Pharmaceutical Operations
 * Type-safe RTK Query hooks for all pharmaceutical endpoints
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './';
import { useMemo, useCallback } from 'react';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export existing pharmaceutical API hooks
export {
  // Customer Management Hooks
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerHierarchyQuery,
  useGetCustomerAnalyticsQuery,
  
  // DGDA Compliance Hooks
  useGetDGDASubmissionsQuery,
  useCreateDGDASubmissionMutation,
  useUpdateDGDASubmissionStatusMutation,
  
  // Territory Management Hooks
  useGetTerritoriesQuery,
  useGetTerritoryAnalyticsQuery,
  useAssignCustomerToTerritoryMutation,
  
  // Marketing Campaign Hooks
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  
  // User Management Hooks
  useGetUsersQuery,
  useUpdateUserProfileMutation,
  
  // System Configuration Hooks
  useGetAuditTrailQuery
} from './api/pharmaApi';

// Re-export WebSocket hooks
export {
  useSubscribeToDGDAUpdatesMutation,
  useSubscribeToTerritoryUpdatesMutation,
  useSubscribeToCampaignUpdatesMutation,
  useSendNotificationMutation
} from './api/webSocketApi';

// Re-export offline sync hooks
export {
  useTestConnectivityQuery,
  useBulkSyncMutation,
  useSyncOperationTypeMutation,
  useGetServerStateQuery,
  useUploadFilesMutation as useOfflineUploadFilesMutation,
  useGetSyncStatsQuery
} from './api/offlineQueue';

// Import required types and hooks
import { 
  useGetCustomersQuery, 
  useGetTerritoriesQuery,
  useGetCampaignsQuery,
  useGetDGDASubmissionsQuery,
  useGetTerritoryAnalyticsQuery
} from './api/pharmaApi';
import { CustomerTier, BangladeshDivision } from '../types/customer';
import { OfflineOperationType } from './api/offlineQueue';
import { CacheStrategy } from './api/cacheService';

// Hook for current user context
export const useCurrentUser = () => {
  return useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    tokens: state.auth.tokens,
    isLoading: state.auth.isLoading,
    error: state.auth.error
  }));
};

// Hook for WebSocket connection status
export const useWebSocketStatus = () => {
  return useAppSelector((state) => ({
    status: state.webSocket.status,
    lastConnected: state.webSocket.lastConnected,
    reconnectAttempts: state.webSocket.reconnectAttempts,
    error: state.webSocket.error,
    events: state.webSocket.events
  }));
};

// Hook for offline queue status
export const useOfflineStatus = () => {
  return useAppSelector((state) => ({
    syncStatus: state.offlineQueue.syncStatus,
    queueLength: state.offlineQueue.items.length,
    lastSuccessfulSync: state.offlineQueue.lastSuccessfulSync,
    isAutoSyncEnabled: state.offlineQueue.isAutoSyncEnabled,
    syncInProgress: state.offlineQueue.syncInProgress
  }));
};

// Hook for cache statistics
export const useCacheStats = () => {
  return useAppSelector((state) => ({
    hitCount: state.cache.metrics.hitCount,
    missCount: state.cache.metrics.missCount,
    memoryUsage: state.cache.metrics.memoryUsage,
    entryCount: Object.keys(state.cache.entries).length
  }));
};

// Hook for pharmaceutical dashboard data
export const useDashboardData = () => {
  const { user } = useCurrentUser();
  
  // Conditionally fetch data based on user role and territory
  const customersQuery = useGetCustomersQuery({
    page: 1,
    limit: 10,
    territoryId: user?.territoryId,
    tier: user?.role === 'territory_manager' ? undefined : CustomerTier.DISTRIBUTOR
  }, {
    skip: !user,
    pollingInterval: 30000 // Poll every 30 seconds
  });
  
  const territoriesQuery = useGetTerritoriesQuery({
    managerId: user?.role === 'territory_manager' ? user.id : undefined
  }, {
    skip: !user
  });
  
  const campaignsQuery = useGetCampaignsQuery({
    status: 'active',
    territoryId: user?.territoryId
  }, {
    skip: !user
  });
  
  const dgdaSubmissionsQuery = useGetDGDASubmissionsQuery({
    status: 'pending',
    companyId: user?.companyId
  }, {
    skip: !user
  });
  
  return useMemo(() => ({
    customers: {
      data: customersQuery.data,
      isLoading: customersQuery.isLoading,
      error: customersQuery.error
    },
    territories: {
      data: territoriesQuery.data,
      isLoading: territoriesQuery.isLoading,
      error: territoriesQuery.error
    },
    campaigns: {
      data: campaignsQuery.data,
      isLoading: campaignsQuery.isLoading,
      error: campaignsQuery.error
    },
    dgdaSubmissions: {
      data: dgdaSubmissionsQuery.data,
      isLoading: dgdaSubmissionsQuery.isLoading,
      error: dgdaSubmissionsQuery.error
    },
    isLoading: customersQuery.isLoading || territoriesQuery.isLoading || 
               campaignsQuery.isLoading || dgdaSubmissionsQuery.isLoading
  }), [customersQuery, territoriesQuery, campaignsQuery, dgdaSubmissionsQuery]);
};

// Hook for customer hierarchy management
export const useCustomerHierarchy = (parentId?: string) => {
  const { data, isLoading, error, refetch } = useGetCustomersQuery({
    parentId,
    includeHierarchy: true
  });
  
  const dispatch = useAppDispatch();
  
  const moveCustomer = useCallback(async (
    customerId: string,
    newParentId: string,
    newTier: CustomerTier
  ) => {
    // Add to offline queue for field operations
    dispatch({
      type: 'offlineQueue/addToQueue',
      payload: {
        type: OfflineOperationType.UPDATE_CUSTOMER_TIER,
        data: { customerId, newParentId, newTier },
        endpoint: `/api/v1/customers/${customerId}/move`,
        method: 'PATCH' as const,
        auditTrail: {
          action: 'move_customer_hierarchy',
          businessJustification: 'Customer hierarchy reorganization'
        }
      }
    });
  }, [dispatch]);
  
  return {
    hierarchy: data,
    isLoading,
    error,
    refetch,
    moveCustomer
  };
};

// Hook for territory analytics
export const useTerritoryAnalytics = (territoryId: string, dateRange?: { start: string; end: string }) => {
  const { data, isLoading, error } = useGetTerritoryAnalyticsQuery({
    territoryId,
    startDate: dateRange?.start,
    endDate: dateRange?.end
  }, {
    skip: !territoryId
  });
  
  return useMemo(() => {
    if (!data) return { metrics: null, trends: null, isLoading, error };
    
    return {
      metrics: {
        totalCustomers: data.customerCount,
        activeCustomers: data.activeCustomerCount,
        revenue: data.totalRevenue,
        growth: data.growthRate
      },
      trends: {
        customerGrowth: data.customerGrowthTrend,
        revenueGrowth: data.revenueGrowthTrend,
        marketPenetration: data.marketPenetrationTrend
      },
      isLoading,
      error
    };
  }, [data, isLoading, error]);
};

// Hook for DGDA compliance monitoring
export const useDGDACompliance = (companyId?: string) => {
  const { data, isLoading, error, refetch } = useGetDGDASubmissionsQuery({
    companyId,
    includeUpcoming: true
  }, {
    skip: !companyId,
    pollingInterval: 60000 // Poll every minute for compliance updates
  });
  
  return useMemo(() => {
    if (!data) return { status: null, alerts: [], isLoading, error, refetch };
    
    const pendingSubmissions = data.filter((sub: any) => sub.status === 'pending');
    const overdueSubmissions = data.filter((sub: any) => 
      new Date(sub.deadline) < new Date() && sub.status !== 'approved'
    );
    const upcomingDeadlines = data.filter((sub: any) => {
      const deadline = new Date(sub.deadline);
      const daysUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7 && daysUntil > 0 && sub.status !== 'approved';
    });
    
    return {
      status: {
        total: data.length,
        pending: pendingSubmissions.length,
        overdue: overdueSubmissions.length,
        upcoming: upcomingDeadlines.length
      },
      alerts: [
        ...overdueSubmissions.map((sub: any) => ({
          type: 'error' as const,
          message: `DGDA submission ${sub.id} is overdue`,
          submission: sub
        })),
        ...upcomingDeadlines.map((sub: any) => ({
          type: 'warning' as const,
          message: `DGDA submission ${sub.id} deadline approaching`,
          submission: sub
        }))
      ],
      isLoading,
      error,
      refetch
    };
  }, [data, isLoading, error, refetch]);
};

// Hook for Bangladesh-specific operations
export const useBangladeshOperations = () => {
  const dispatch = useAppDispatch();
  
  const { data: customers } = useGetCustomersQuery({
    country: 'BD',
    includeLocation: true
  });
  
  const getCustomersByDivision = useCallback((division: BangladeshDivision) => {
    return customers?.filter((customer: any) => customer.address?.division === division) || [];
  }, [customers]);
  
  const optimizeRoutes = useCallback((customerId: string, targetDivision: BangladeshDivision) => {
    // Add route optimization to offline queue for field teams
    dispatch({
      type: 'offlineQueue/addToQueue',
      payload: {
        type: OfflineOperationType.UPDATE_CUSTOMER,
        data: { customerId, optimization: 'route_planning', targetDivision },
        endpoint: `/api/v1/bangladesh/routes/optimize`,
        method: 'POST' as const
      }
    });
  }, [dispatch]);
  
  return {
    customers: customers || [],
    getCustomersByDivision,
    optimizeRoutes,
    divisions: Object.values(BangladeshDivision)
  };
};

// Hook for real-time notifications
export const usePharmaceuticalNotifications = () => {
  const { events } = useWebSocketStatus();
  const dispatch = useAppDispatch();
  
  const markAsRead = useCallback((eventId: string) => {
    dispatch({
      type: 'webSocket/markEventAsRead',
      payload: eventId
    });
  }, [dispatch]);
  
  const clearAll = useCallback(() => {
    dispatch({
      type: 'webSocket/eventsCleared'
    });
  }, [dispatch]);
  
  return {
    notifications: events.slice(0, 10), // Show last 10 notifications
    unreadCount: events.filter((event: any) => !event.read).length,
    markAsRead,
    clearAll
  };
};

// Hook for caching pharmaceutical data
export const usePharmaceuticalCache = () => {
  const dispatch = useAppDispatch();
  
  const cacheCustomerData = useCallback((customerId: string, data: any) => {
    dispatch({
      type: 'cache/setCacheEntry',
      payload: {
        key: `customer_${customerId}`,
        data,
        strategy: CacheStrategy.PERSISTENT,
        tags: ['customers', `customer_${customerId}`],
        dgdaContext: {
          complianceLevel: 'medium'
        }
      }
    });
  }, [dispatch]);
  
  const cacheDGDASubmission = useCallback((submissionId: string, data: any) => {
    dispatch({
      type: 'cache/setCacheEntry',
      payload: {
        key: `dgda_submission_${submissionId}`,
        data,
        strategy: CacheStrategy.CRITICAL,
        tags: ['dgda', `dgda_submission_${submissionId}`],
        dgdaContext: {
          complianceLevel: 'critical'
        }
      }
    });
  }, [dispatch]);
  
  const invalidateCustomerCache = useCallback((customerId?: string) => {
    if (customerId) {
      dispatch({
        type: 'cache/invalidateCacheEntry',
        payload: `customer_${customerId}`
      });
    } else {
      dispatch({
        type: 'cache/invalidateByTags',
        payload: ['customers']
      });
    }
  }, [dispatch]);
  
  return {
    cacheCustomerData,
    cacheDGDASubmission,
    invalidateCustomerCache
  };
};