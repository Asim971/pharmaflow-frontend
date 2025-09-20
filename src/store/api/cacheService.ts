/**
 * Advanced Caching Strategies for Pharmaceutical Operations
 * Optimized for Bangladesh field operations with intelligent cache management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Cache strategy types for different pharmaceutical data
export enum CacheStrategy {
  // Long-term stable data (regulatory requirements, territories)
  PERSISTENT = 'persistent',
  
  // Frequently changing data (customer status, campaign metrics)
  DYNAMIC = 'dynamic',
  
  // Critical compliance data (DGDA submissions, audit trails)
  CRITICAL = 'critical',
  
  // Real-time data (live analytics, notifications)
  REALTIME = 'realtime',
  
  // Temporary data (search results, filtered views)
  TEMPORARY = 'temporary'
}

// Cache priority levels for memory management
export enum CachePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

// Cache invalidation triggers
export enum InvalidationTrigger {
  TIME_BASED = 'time_based',
  EVENT_BASED = 'event_based',
  MANUAL = 'manual',
  DEPENDENCY_CHANGE = 'dependency_change',
  DATA_MUTATION = 'data_mutation'
}

// Cache entry metadata
interface CacheMetadata {
  strategy: CacheStrategy;
  priority: CachePriority;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  expiryTime?: string;
  invalidationTriggers: InvalidationTrigger[];
  dependencies: string[]; // Other cache keys this depends on
  size: number; // Estimated size in bytes
  checksum?: string; // For data integrity
  dgdaContext?: {
    complianceLevel: 'low' | 'medium' | 'high' | 'critical';
    regulatoryDataType?: string;
    retentionPeriod?: number; // Days
  };
}

// Cache entry structure
interface CacheEntry {
  key: string;
  data: any;
  metadata: CacheMetadata;
  tags: string[]; // For grouped invalidation
}

// Cache performance metrics
interface CacheMetrics {
  hitCount: number;
  missCount: number;
  evictionCount: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number;
  maxMemoryUsage: number;
  lastOptimization: string | null;
}

// Cache configuration
interface CacheConfig {
  maxMemoryUsage: number; // Bytes
  maxEntries: number;
  defaultTTL: number; // Seconds
  cleanupInterval: number; // Seconds
  persistToDisk: boolean;
  compressionEnabled: boolean;
  integrityCheckEnabled: boolean;
  strategies: {
    [key in CacheStrategy]: {
      defaultTTL: number;
      maxSize: number;
      priority: CachePriority;
      persistToDisk: boolean;
    };
  };
}

// Cache state
interface CacheState {
  entries: { [key: string]: CacheEntry };
  metrics: CacheMetrics;
  config: CacheConfig;
  isOptimizing: boolean;
  lastCleanup: string | null;
  pendingInvalidations: string[];
  backgroundSyncQueue: string[];
}

// Default cache configuration optimized for pharmaceutical operations
const defaultConfig: CacheConfig = {
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxEntries: 10000,
  defaultTTL: 3600, // 1 hour
  cleanupInterval: 300, // 5 minutes
  persistToDisk: true,
  compressionEnabled: true,
  integrityCheckEnabled: true,
  strategies: {
    [CacheStrategy.PERSISTENT]: {
      defaultTTL: 86400, // 24 hours
      maxSize: 1024 * 1024, // 1MB per entry
      priority: CachePriority.HIGH,
      persistToDisk: true
    },
    [CacheStrategy.DYNAMIC]: {
      defaultTTL: 1800, // 30 minutes
      maxSize: 512 * 1024, // 512KB per entry
      priority: CachePriority.MEDIUM,
      persistToDisk: false
    },
    [CacheStrategy.CRITICAL]: {
      defaultTTL: 43200, // 12 hours
      maxSize: 2 * 1024 * 1024, // 2MB per entry
      priority: CachePriority.CRITICAL,
      persistToDisk: true
    },
    [CacheStrategy.REALTIME]: {
      defaultTTL: 60, // 1 minute
      maxSize: 256 * 1024, // 256KB per entry
      priority: CachePriority.LOW,
      persistToDisk: false
    },
    [CacheStrategy.TEMPORARY]: {
      defaultTTL: 300, // 5 minutes
      maxSize: 128 * 1024, // 128KB per entry
      priority: CachePriority.LOW,
      persistToDisk: false
    }
  }
};

// Initial cache state
const initialState: CacheState = {
  entries: {},
  metrics: {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    maxMemoryUsage: defaultConfig.maxMemoryUsage,
    lastOptimization: null
  },
  config: defaultConfig,
  isOptimizing: false,
  lastCleanup: null,
  pendingInvalidations: [],
  backgroundSyncQueue: []
};

// Calculate estimated size of data
const calculateDataSize = (data: any): number => {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    // Fallback estimation
    return JSON.stringify(data).length * 2; // Rough UTF-16 estimate
  }
};

// Generate checksum for data integrity
const generateChecksum = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

// Pharmaceutical cache slice
export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    // Set cache entry
    setCacheEntry: (state, action: PayloadAction<{
      key: string;
      data: any;
      strategy: CacheStrategy;
      ttl?: number;
      tags?: string[];
      dependencies?: string[];
      dgdaContext?: any;
    }>) => {
      const { key, data, strategy, ttl, tags = [], dependencies = [], dgdaContext } = action.payload;
      const now = new Date().toISOString();
      const strategyConfig = state.config.strategies[strategy];
      const finalTTL = ttl || strategyConfig.defaultTTL;
      
      const metadata: CacheMetadata = {
        strategy,
        priority: strategyConfig.priority,
        createdAt: now,
        lastAccessed: now,
        accessCount: 1,
        expiryTime: new Date(Date.now() + finalTTL * 1000).toISOString(),
        invalidationTriggers: [InvalidationTrigger.TIME_BASED],
        dependencies,
        size: calculateDataSize(data),
        checksum: state.config.integrityCheckEnabled ? generateChecksum(data) : undefined,
        dgdaContext
      };
      
      // Check if entry exceeds max size for strategy
      if (metadata.size > strategyConfig.maxSize) {
        console.warn(`Cache entry ${key} exceeds max size for strategy ${strategy}`);
        return;
      }
      
      const entry: CacheEntry = {
        key,
        data,
        metadata,
        tags
      };
      
      state.entries[key] = entry;
      state.metrics.memoryUsage += metadata.size;
      
      // Trigger cleanup if memory usage is high
      if (state.metrics.memoryUsage > state.config.maxMemoryUsage * 0.8) {
        state.pendingInvalidations.push('memory_pressure_cleanup');
      }
    },
    
    // Get cache entry and update access metadata
    accessCacheEntry: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const entry = state.entries[key];
      
      state.metrics.totalRequests += 1;
      
      if (entry) {
        // Check if entry is expired
        if (entry.metadata.expiryTime && new Date() > new Date(entry.metadata.expiryTime)) {
          delete state.entries[key];
          state.metrics.memoryUsage -= entry.metadata.size;
          state.metrics.missCount += 1;
          return;
        }
        
        // Update access metadata
        entry.metadata.lastAccessed = new Date().toISOString();
        entry.metadata.accessCount += 1;
        state.metrics.hitCount += 1;
      } else {
        state.metrics.missCount += 1;
      }
    },
    
    // Invalidate cache entry
    invalidateCacheEntry: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const entry = state.entries[key];
      
      if (entry) {
        state.metrics.memoryUsage -= entry.metadata.size;
        state.metrics.evictionCount += 1;
        delete state.entries[key];
        
        // Invalidate dependent entries
        Object.values(state.entries).forEach(dependentEntry => {
          if (dependentEntry.metadata.dependencies.includes(key)) {
            state.pendingInvalidations.push(dependentEntry.key);
          }
        });
      }
    },
    
    // Invalidate by tags
    invalidateByTags: (state, action: PayloadAction<string[]>) => {
      const tagsToInvalidate = action.payload;
      
      Object.values(state.entries).forEach(entry => {
        const hasMatchingTag = entry.tags.some(tag => tagsToInvalidate.includes(tag));
        if (hasMatchingTag) {
          state.pendingInvalidations.push(entry.key);
        }
      });
    },
    
    // Process pending invalidations
    processPendingInvalidations: (state) => {
      state.pendingInvalidations.forEach(key => {
        if (key === 'memory_pressure_cleanup') {
          // Perform memory pressure cleanup
          state.pendingInvalidations = state.pendingInvalidations.filter(k => k !== key);
          return;
        }
        
        const entry = state.entries[key];
        if (entry) {
          state.metrics.memoryUsage -= entry.metadata.size;
          state.metrics.evictionCount += 1;
          delete state.entries[key];
        }
      });
      
      state.pendingInvalidations = [];
    },
    
    // Cleanup expired entries
    cleanupExpiredEntries: (state) => {
      const now = new Date();
      const expiredKeys: string[] = [];
      
      Object.values(state.entries).forEach(entry => {
        if (entry.metadata.expiryTime && now > new Date(entry.metadata.expiryTime)) {
          expiredKeys.push(entry.key);
        }
      });
      
      expiredKeys.forEach(key => {
        const entry = state.entries[key];
        state.metrics.memoryUsage -= entry.metadata.size;
        state.metrics.evictionCount += 1;
        delete state.entries[key];
      });
      
      state.lastCleanup = now.toISOString();
    },
    
    // Optimize cache (LRU eviction for memory pressure)
    optimizeCache: (state) => {
      if (state.metrics.memoryUsage <= state.config.maxMemoryUsage) {
        return; // No optimization needed
      }
      
      state.isOptimizing = true;
      
      // Sort entries by priority and access patterns
      const entries = Object.values(state.entries).sort((a, b) => {
        // Critical priority entries are kept
        if (a.metadata.priority === CachePriority.CRITICAL) return 1;
        if (b.metadata.priority === CachePriority.CRITICAL) return -1;
        
        // Then by access frequency and recency
        const aScore = a.metadata.accessCount / (Date.now() - new Date(a.metadata.lastAccessed).getTime());
        const bScore = b.metadata.accessCount / (Date.now() - new Date(b.metadata.lastAccessed).getTime());
        
        return aScore - bScore; // Lower score gets evicted first
      });
      
      // Evict entries until memory usage is acceptable
      const targetMemory = state.config.maxMemoryUsage * 0.7; // Leave 30% headroom
      let currentMemory = state.metrics.memoryUsage;
      
      for (const entry of entries) {
        if (currentMemory <= targetMemory) break;
        if (entry.metadata.priority === CachePriority.CRITICAL) continue;
        
        currentMemory -= entry.metadata.size;
        state.metrics.evictionCount += 1;
        delete state.entries[entry.key];
      }
      
      state.metrics.memoryUsage = currentMemory;
      state.metrics.lastOptimization = new Date().toISOString();
      state.isOptimizing = false;
    },
    
    // Update cache configuration
    updateCacheConfig: (state, action: PayloadAction<Partial<CacheConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    
    // Reset cache metrics
    resetMetrics: (state) => {
      state.metrics = {
        ...initialState.metrics,
        maxMemoryUsage: state.config.maxMemoryUsage
      };
    },
    
    // Add to background sync queue
    addToBackgroundSync: (state, action: PayloadAction<string>) => {
      if (!state.backgroundSyncQueue.includes(action.payload)) {
        state.backgroundSyncQueue.push(action.payload);
      }
    },
    
    // Remove from background sync queue
    removeFromBackgroundSync: (state, action: PayloadAction<string>) => {
      state.backgroundSyncQueue = state.backgroundSyncQueue.filter(key => key !== action.payload);
    },
    
    // Clear entire cache (emergency reset)
    clearCache: (state) => {
      state.entries = {};
      state.metrics.memoryUsage = 0;
      state.metrics.evictionCount += Object.keys(state.entries).length;
      state.pendingInvalidations = [];
      state.backgroundSyncQueue = [];
    }
  }
});

export const {
  setCacheEntry,
  accessCacheEntry,
  invalidateCacheEntry,
  invalidateByTags,
  processPendingInvalidations,
  cleanupExpiredEntries,
  optimizeCache,
  updateCacheConfig,
  resetMetrics,
  addToBackgroundSync,
  removeFromBackgroundSync,
  clearCache
} = cacheSlice.actions;

// Cache service class for pharmaceutical operations
class PharmaceuticalCacheService {
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private dispatch: any = null;
  private getState: any = null;

  // Initialize cache service
  initialize(dispatch: any, getState: any): void {
    this.dispatch = dispatch;
    this.getState = getState;
    
    // Start automatic cleanup
    this.startAutomaticCleanup();
    
    // Load persisted cache if available
    this.loadPersistedCache();
  }

  // Start automatic cleanup interval
  private startAutomaticCleanup(): void {
    const state = this.getState();
    const { cleanupInterval } = state.cache.config;
    
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
    
    this.cleanupIntervalId = setInterval(() => {
      this.performMaintenance();
    }, cleanupInterval * 1000);
  }

  // Perform cache maintenance
  private performMaintenance(): void {
    this.dispatch(cleanupExpiredEntries());
    this.dispatch(processPendingInvalidations());
    
    const state = this.getState();
    if (state.cache.metrics.memoryUsage > state.cache.config.maxMemoryUsage * 0.8) {
      this.dispatch(optimizeCache());
    }
    
    // Persist critical cache entries
    this.persistCriticalEntries();
  }

  // Load persisted cache from localStorage
  private loadPersistedCache(): void {
    try {
      const persistedData = localStorage.getItem('pharma_cache_persistent');
      if (persistedData) {
        const parsedData = JSON.parse(persistedData);
        
        // Restore only non-expired entries
        const now = new Date();
        Object.entries(parsedData).forEach(([key, entry]: [string, any]) => {
          if (!entry.metadata.expiryTime || now < new Date(entry.metadata.expiryTime)) {
            this.dispatch(setCacheEntry({
              key,
              data: entry.data,
              strategy: entry.metadata.strategy,
              tags: entry.tags,
              dependencies: entry.metadata.dependencies,
              dgdaContext: entry.metadata.dgdaContext
            }));
          }
        });
      }
    } catch (error) {
      console.error('Failed to load persisted cache:', error);
    }
  }

  // Persist critical cache entries to localStorage
  private persistCriticalEntries(): void {
    try {
      const state = this.getState();
      const { entries, config } = state.cache;
      
      if (!config.persistToDisk) return;
      
      const criticalEntries: { [key: string]: CacheEntry } = {};
      
      Object.entries(entries).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry;
        const strategyConfig = config.strategies[cacheEntry.metadata.strategy];
        if (strategyConfig.persistToDisk && cacheEntry.metadata.priority >= CachePriority.HIGH) {
          criticalEntries[key] = cacheEntry;
        }
      });
      
      localStorage.setItem('pharma_cache_persistent', JSON.stringify(criticalEntries));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  // Get cached data with automatic access tracking
  public get(key: string): any {
    this.dispatch(accessCacheEntry(key));
    
    const state = this.getState();
    const entry = state.cache.entries[key];
    
    if (entry) {
      // Verify data integrity if enabled
      if (state.cache.config.integrityCheckEnabled && entry.metadata.checksum) {
        const currentChecksum = generateChecksum(entry.data);
        if (currentChecksum !== entry.metadata.checksum) {
          console.warn(`Cache integrity check failed for ${key}`);
          this.dispatch(invalidateCacheEntry(key));
          return null;
        }
      }
      
      return entry.data;
    }
    
    return null;
  }

  // Set cached data with pharmaceutical context
  public set(
    key: string,
    data: any,
    strategy: CacheStrategy = CacheStrategy.DYNAMIC,
    options?: {
      ttl?: number;
      tags?: string[];
      dependencies?: string[];
      dgdaContext?: any;
    }
  ): void {
    this.dispatch(setCacheEntry({
      key,
      data,
      strategy,
      ...options
    }));
  }

  // Invalidate cache entries by pattern
  public invalidatePattern(pattern: RegExp): void {
    const state = this.getState();
    const keysToInvalidate = Object.keys(state.cache.entries).filter(key => pattern.test(key));
    
    keysToInvalidate.forEach(key => {
      this.dispatch(invalidateCacheEntry(key));
    });
  }

  // Invalidate DGDA-related cache entries
  public invalidateDGDACache(submissionId?: string): void {
    const tags = ['dgda'];
    if (submissionId) {
      tags.push(`dgda_submission_${submissionId}`);
    }
    
    this.dispatch(invalidateByTags(tags));
  }

  // Get cache statistics
  public getStats(): {
    hitRate: number;
    memoryUsage: string;
    entryCount: number;
    averageEntrySize: string;
  } {
    const state = this.getState();
    const { metrics, entries } = state.cache;
    
    const hitRate = metrics.totalRequests > 0 ? 
      (metrics.hitCount / metrics.totalRequests) * 100 : 0;
    
    const entryCount = Object.keys(entries).length;
    const averageEntrySize = entryCount > 0 ? 
      metrics.memoryUsage / entryCount : 0;
    
    return {
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.formatBytes(metrics.memoryUsage),
      entryCount,
      averageEntrySize: this.formatBytes(averageEntrySize)
    };
  }

  // Format bytes for human readability
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Force cache optimization
  public optimize(): void {
    this.dispatch(optimizeCache());
  }

  // Clear all cache data
  public clear(): void {
    this.dispatch(clearCache());
    localStorage.removeItem('pharma_cache_persistent');
  }
}

// Export cache service instance
export const pharmaceuticalCacheService = new PharmaceuticalCacheService();

export default cacheSlice.reducer;