/**
 * Offline Queue Management System for Pharmaceutical Field Operations
 * Handles data synchronization for Bangladesh field teams with poor connectivity
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Queue operation types for pharmaceutical operations
export enum OfflineOperationType {
  // Customer Management
  CREATE_CUSTOMER = 'create_customer',
  UPDATE_CUSTOMER = 'update_customer',
  UPDATE_CUSTOMER_TIER = 'update_customer_tier',
  ASSIGN_TERRITORY = 'assign_territory',
  
  // DGDA Submissions
  CREATE_DGDA_SUBMISSION = 'create_dgda_submission',
  UPDATE_SUBMISSION_STATUS = 'update_submission_status',
  UPLOAD_DOCUMENT = 'upload_document',
  
  // Marketing Activities
  RECORD_CAMPAIGN_INTERACTION = 'record_campaign_interaction',
  UPDATE_CAMPAIGN_STATUS = 'update_campaign_status',
  LOG_MARKETING_ACTIVITY = 'log_marketing_activity',
  
  // Analytics & Reporting
  SYNC_ANALYTICS_DATA = 'sync_analytics_data',
  UPDATE_PERFORMANCE_METRICS = 'update_performance_metrics',
  
  // Audit Trail
  LOG_AUDIT_ENTRY = 'log_audit_entry'
}

// Queue operation priority levels
export enum OperationPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

// Offline queue item structure
interface OfflineQueueItem {
  id: string;
  type: OfflineOperationType;
  priority: OperationPriority;
  data: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  createdAt: string;
  lastAttempt?: string;
  attemptCount: number;
  maxAttempts: number;
  error?: string;
  dependencies?: string[]; // Other queue item IDs this depends on
  dgdaContext?: {
    submissionId?: string;
    documentId?: string;
    complianceRequired?: boolean;
  };
  auditTrail?: {
    userId: string;
    action: string;
    businessJustification?: string;
    customerContext?: string;
  };
}

// Sync status enumeration
export enum SyncStatus {
  OFFLINE = 'offline',
  SYNCING = 'syncing',
  ONLINE = 'online',
  ERROR = 'error'
}

// Offline queue state
interface OfflineQueueState {
  items: OfflineQueueItem[];
  syncStatus: SyncStatus;
  lastSyncAttempt: string | null;
  lastSuccessfulSync: string | null;
  isAutoSyncEnabled: boolean;
  syncInProgress: boolean;
  connectionRetryCount: number;
  maxConnectionRetries: number;
  pendingUploads: string[]; // File paths waiting for upload
  conflictResolution: {
    strategy: 'server_wins' | 'client_wins' | 'manual';
    conflicts: any[];
  };
  dataIntegrity: {
    checksumEnabled: boolean;
    lastIntegrityCheck: string | null;
    corruptedItems: string[];
  };
}

// Initial offline queue state
const initialState: OfflineQueueState = {
  items: [],
  syncStatus: SyncStatus.OFFLINE,
  lastSyncAttempt: null,
  lastSuccessfulSync: null,
  isAutoSyncEnabled: true,
  syncInProgress: false,
  connectionRetryCount: 0,
  maxConnectionRetries: 3,
  pendingUploads: [],
  conflictResolution: {
    strategy: 'server_wins',
    conflicts: []
  },
  dataIntegrity: {
    checksumEnabled: true,
    lastIntegrityCheck: null,
    corruptedItems: []
  }
};

// Generate unique ID for queue items
const generateQueueId = (): string => {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate operation priority based on type and context
const calculatePriority = (type: OfflineOperationType, context?: any): OperationPriority => {
  // DGDA compliance operations get highest priority
  if (type.includes('DGDA') || context?.dgdaContext?.complianceRequired) {
    return OperationPriority.CRITICAL;
  }
  
  // Customer management operations
  if (type.includes('CUSTOMER')) {
    return OperationPriority.HIGH;
  }
  
  // Analytics and reporting
  if (type.includes('ANALYTICS') || type.includes('METRICS')) {
    return OperationPriority.LOW;
  }
  
  // Default priority
  return OperationPriority.MEDIUM;
};

// Offline queue slice
export const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    // Add operation to queue
    addToQueue: (state, action: PayloadAction<{
      type: OfflineOperationType;
      data: any;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      headers?: Record<string, string>;
      dependencies?: string[];
      dgdaContext?: any;
      auditTrail?: any;
    }>) => {
      const { type, data, endpoint, method, headers, dependencies, dgdaContext, auditTrail } = action.payload;
      
      const queueItem: OfflineQueueItem = {
        id: generateQueueId(),
        type,
        priority: calculatePriority(type, { dgdaContext }),
        data,
        endpoint,
        method,
        headers,
        createdAt: new Date().toISOString(),
        attemptCount: 0,
        maxAttempts: 3,
        dependencies,
        dgdaContext,
        auditTrail
      };
      
      // Insert based on priority (higher priority first)
      const insertIndex = state.items.findIndex(item => item.priority < queueItem.priority);
      if (insertIndex === -1) {
        state.items.push(queueItem);
      } else {
        state.items.splice(insertIndex, 0, queueItem);
      }
    },
    
    // Remove item from queue
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // Update item attempt count and error
    updateQueueItem: (state, action: PayloadAction<{
      id: string;
      attemptCount?: number;
      error?: string;
      lastAttempt?: string;
    }>) => {
      const { id, attemptCount, error, lastAttempt } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        if (attemptCount !== undefined) item.attemptCount = attemptCount;
        if (error !== undefined) item.error = error;
        if (lastAttempt !== undefined) item.lastAttempt = lastAttempt;
      }
    },
    
    // Update sync status
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;
      
      if (action.payload === SyncStatus.SYNCING) {
        state.syncInProgress = true;
        state.lastSyncAttempt = new Date().toISOString();
      } else {
        state.syncInProgress = false;
        
        if (action.payload === SyncStatus.ONLINE) {
          state.lastSuccessfulSync = new Date().toISOString();
          state.connectionRetryCount = 0;
        }
      }
    },
    
    // Toggle auto-sync
    toggleAutoSync: (state) => {
      state.isAutoSyncEnabled = !state.isAutoSyncEnabled;
    },
    
    // Increment connection retry count
    incrementRetryCount: (state) => {
      state.connectionRetryCount += 1;
    },
    
    // Reset connection retry count
    resetRetryCount: (state) => {
      state.connectionRetryCount = 0;
    },
    
    // Add pending upload
    addPendingUpload: (state, action: PayloadAction<string>) => {
      if (!state.pendingUploads.includes(action.payload)) {
        state.pendingUploads.push(action.payload);
      }
    },
    
    // Remove pending upload
    removePendingUpload: (state, action: PayloadAction<string>) => {
      state.pendingUploads = state.pendingUploads.filter(path => path !== action.payload);
    },
    
    // Add conflict for resolution
    addConflict: (state, action: PayloadAction<any>) => {
      state.conflictResolution.conflicts.push(action.payload);
    },
    
    // Resolve conflict
    resolveConflict: (state, action: PayloadAction<{ conflictId: string; resolution: any }>) => {
      state.conflictResolution.conflicts = state.conflictResolution.conflicts.filter(
        conflict => conflict.id !== action.payload.conflictId
      );
    },
    
    // Set conflict resolution strategy
    setConflictStrategy: (state, action: PayloadAction<'server_wins' | 'client_wins' | 'manual'>) => {
      state.conflictResolution.strategy = action.payload;
    },
    
    // Mark item as corrupted
    markAsCorrupted: (state, action: PayloadAction<string>) => {
      if (!state.dataIntegrity.corruptedItems.includes(action.payload)) {
        state.dataIntegrity.corruptedItems.push(action.payload);
      }
    },
    
    // Remove corrupted item
    removeCorrupted: (state, action: PayloadAction<string>) => {
      state.dataIntegrity.corruptedItems = state.dataIntegrity.corruptedItems.filter(
        id => id !== action.payload
      );
    },
    
    // Update integrity check timestamp
    updateIntegrityCheck: (state) => {
      state.dataIntegrity.lastIntegrityCheck = new Date().toISOString();
    },
    
    // Clear entire queue (emergency reset)
    clearQueue: (state) => {
      state.items = [];
      state.pendingUploads = [];
      state.conflictResolution.conflicts = [];
      state.dataIntegrity.corruptedItems = [];
    }
  }
});

export const {
  addToQueue,
  removeFromQueue,
  updateQueueItem,
  setSyncStatus,
  toggleAutoSync,
  incrementRetryCount,
  resetRetryCount,
  addPendingUpload,
  removePendingUpload,
  addConflict,
  resolveConflict,
  setConflictStrategy,
  markAsCorrupted,
  removeCorrupted,
  updateIntegrityCheck,
  clearQueue
} = offlineQueueSlice.actions;

// Offline sync API
export const offlineSyncApi = createApi({
  reducerPath: 'offlineSyncApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState: _getState }) => {
      // Add pharmaceutical context headers
      headers.set('X-Pharma-Client', 'field-app');
      headers.set('X-Sync-Version', '1.0.0');
      
      // Add authentication if available
      const token = localStorage.getItem('pharma_auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    }
  }),
  endpoints: (builder) => ({
    // Test connectivity
    testConnectivity: builder.query<{ status: string; timestamp: string }, void>({
      query: () => '/health/connectivity'
    }),
    
    // Bulk sync operations
    bulkSync: builder.mutation<{
      successful: string[];
      failed: { id: string; error: string }[];
      conflicts: any[];
    }, { operations: OfflineQueueItem[] }>({
      query: ({ operations }) => ({
        url: '/sync/bulk',
        method: 'POST',
        body: { operations }
      })
    }),
    
    // Sync specific operation type
    syncOperationType: builder.mutation<any, {
      type: OfflineOperationType;
      operations: OfflineQueueItem[];
    }>({
      query: ({ type, operations }) => ({
        url: `/sync/${type.toLowerCase()}`,
        method: 'POST',
        body: { operations }
      })
    }),
    
    // Get server state for conflict resolution
    getServerState: builder.query<any, { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => `/sync/state/${entityType}/${entityId}`
    }),
    
    // Upload pending files
    uploadFiles: builder.mutation<{
      successful: string[];
      failed: { path: string; error: string }[];
    }, { files: FormData }>({
      query: ({ files }) => ({
        url: '/sync/files',
        method: 'POST',
        body: files
      })
    }),
    
    // Get sync statistics
    getSyncStats: builder.query<{
      totalOperations: number;
      pendingOperations: number;
      failedOperations: number;
      lastSyncTime: string;
      averageSyncTime: number;
    }, void>({
      query: () => '/sync/stats'
    })
  })
});

// Offline sync service class
class OfflineSyncService {
  private syncIntervalId: NodeJS.Timeout | null = null;
  private readonly syncInterval = 30000; // 30 seconds
  private dispatch: any = null;
  private getState: any = null;

  // Initialize service with Redux store
  initialize(dispatch: any, getState: any): void {
    this.dispatch = dispatch;
    this.getState = getState;
    
    // Start connectivity monitoring
    this.startConnectivityMonitoring();
    
    // Setup auto-sync if enabled
    this.setupAutoSync();
  }

  // Start automatic synchronization
  private setupAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    this.syncIntervalId = setInterval(() => {
      const state = this.getState();
      const { isAutoSyncEnabled, syncInProgress } = state.offlineQueue;
      
      if (isAutoSyncEnabled && !syncInProgress) {
        this.performSync();
      }
    }, this.syncInterval);
  }

  // Monitor network connectivity
  private startConnectivityMonitoring(): void {
    // Browser connectivity events
    window.addEventListener('online', () => {
      this.dispatch(setSyncStatus(SyncStatus.ONLINE));
      this.performSync();
    });
    
    window.addEventListener('offline', () => {
      this.dispatch(setSyncStatus(SyncStatus.OFFLINE));
    });
    
    // Initial connectivity check
    if (navigator.onLine) {
      this.testConnectivity();
    } else {
      this.dispatch(setSyncStatus(SyncStatus.OFFLINE));
    }
  }

  // Test actual connectivity to pharmaceutical API
  private async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/health/connectivity', {
        method: 'GET',
        timeout: 5000
      } as any);
      
      if (response.ok) {
        this.dispatch(setSyncStatus(SyncStatus.ONLINE));
        this.dispatch(resetRetryCount());
        return true;
      } else {
        this.dispatch(setSyncStatus(SyncStatus.ERROR));
        return false;
      }
    } catch (error) {
      this.dispatch(setSyncStatus(SyncStatus.OFFLINE));
      this.dispatch(incrementRetryCount());
      return false;
    }
  }

  // Perform synchronization of queued operations
  public async performSync(): Promise<void> {
    const state = this.getState();
    const { items, syncInProgress, maxConnectionRetries, connectionRetryCount } = state.offlineQueue;
    
    // Skip if already syncing or too many retries
    if (syncInProgress || connectionRetryCount >= maxConnectionRetries) {
      return;
    }
    
    // Skip if no items to sync
    if (items.length === 0) {
      return;
    }
    
    this.dispatch(setSyncStatus(SyncStatus.SYNCING));
    
    try {
      // Test connectivity first
      const isConnected = await this.testConnectivity();
      if (!isConnected) {
        this.dispatch(setSyncStatus(SyncStatus.OFFLINE));
        return;
      }
      
      // Group operations by priority and dependencies
      const sortedItems = this.sortItemsByPriorityAndDependencies(items);
      
      // Process operations in batches
      const batchSize = 10;
      for (let i = 0; i < sortedItems.length; i += batchSize) {
        const batch = sortedItems.slice(i, i + batchSize);
        await this.processBatch(batch);
      }
      
      this.dispatch(setSyncStatus(SyncStatus.ONLINE));
    } catch (error) {
      console.error('Sync failed:', error);
      this.dispatch(setSyncStatus(SyncStatus.ERROR));
      this.dispatch(incrementRetryCount());
    }
  }

  // Sort queue items by priority and dependencies
  private sortItemsByPriorityAndDependencies(items: OfflineQueueItem[]): OfflineQueueItem[] {
    // Simple priority sorting for now - can be enhanced with dependency graph
    return [...items].sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Earlier created items first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  // Process a batch of operations
  private async processBatch(batch: OfflineQueueItem[]): Promise<void> {
    for (const item of batch) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        
        // Update attempt count
        this.dispatch(updateQueueItem({
          id: item.id,
          attemptCount: item.attemptCount + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastAttempt: new Date().toISOString()
        }));
        
        // Remove if max attempts reached
        if (item.attemptCount + 1 >= item.maxAttempts) {
          this.dispatch(removeFromQueue(item.id));
          this.dispatch(markAsCorrupted(item.id));
        }
      }
    }
  }

  // Process individual queue item
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    const { endpoint, method, data, headers } = item;
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });
    
    if (response.ok) {
      // Success - remove from queue
      this.dispatch(removeFromQueue(item.id));
    } else {
      // Handle specific error cases
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 409) {
        // Conflict - add to conflict resolution
        this.dispatch(addConflict({
          id: item.id,
          clientData: data,
          serverData: errorData.serverData,
          conflictType: 'data_conflict'
        }));
      }
      
      throw new Error(`HTTP ${response.status}: ${errorData.message || 'Request failed'}`);
    }
  }

  // Add operation to queue
  public queueOperation(
    type: OfflineOperationType,
    data: any,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    options?: {
      headers?: Record<string, string>;
      dependencies?: string[];
      dgdaContext?: any;
      auditTrail?: any;
    }
  ): void {
    this.dispatch(addToQueue({
      type,
      data,
      endpoint,
      method,
      ...options
    }));
  }

  // Force immediate sync
  public async forcSync(): Promise<void> {
    await this.performSync();
  }

  // Clear all queued operations
  public clearAllOperations(): void {
    this.dispatch(clearQueue());
  }

  // Get queue statistics
  public getQueueStats(): {
    totalItems: number;
    pendingItems: number;
    criticalItems: number;
    oldestItem?: string;
  } {
    const state = this.getState();
    const { items } = state.offlineQueue;
    
    const criticalItems = items.filter((item: OfflineQueueItem) => item.priority === OperationPriority.CRITICAL);
    const oldestItem = items.length > 0 ? 
      items.reduce((oldest: OfflineQueueItem, current: OfflineQueueItem) => 
        new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
      ).createdAt : undefined;
    
    return {
      totalItems: items.length,
      pendingItems: items.filter((item: OfflineQueueItem) => item.attemptCount === 0).length,
      criticalItems: criticalItems.length,
      oldestItem
    };
  }
}

// Export sync service instance
export const offlineSyncService = new OfflineSyncService();

// Export RTK Query hooks
export const {
  useTestConnectivityQuery,
  useBulkSyncMutation,
  useSyncOperationTypeMutation,
  useGetServerStateQuery,
  useUploadFilesMutation,
  useGetSyncStatsQuery
} = offlineSyncApi;

export default offlineQueueSlice.reducer;