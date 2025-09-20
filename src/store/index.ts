/**
 * Redux Store Configuration for Pharmaceutical Operations
 * Integrated with RTK Query, WebSocket, and Advanced Caching
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rtkQueryErrorLogger } from './middleware/errorLogger';

// Import API slices
import { pharmaApi } from './api/pharmaApi';
import { webSocketApi } from './api/webSocketApi';
import { offlineSyncApi } from './api/offlineQueue';

// Import feature slices
import authReducer from './auth/authSlice';
import customerReducer from './customers/customerSlice';
import webSocketReducer from './api/webSocketApi';
import offlineQueueReducer from './api/offlineQueue';
import cacheReducer from './api/cacheService';

// Configure the pharmaceutical Redux store
export const store = configureStore({
  reducer: {
    // API slices
    [pharmaApi.reducerPath]: pharmaApi.reducer,
    [webSocketApi.reducerPath]: webSocketApi.reducer,
    [offlineSyncApi.reducerPath]: offlineSyncApi.reducer,
    
    // Feature slices
    auth: authReducer,
    customer: customerReducer,
    webSocket: webSocketReducer,
    offlineQueue: offlineQueueReducer,
    cache: cacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types that may contain non-serializable data
        ignoredActions: [
          'webSocket/eventReceived',
          'offlineQueue/addToQueue',
          'cache/setCacheEntry'
        ],
        // Ignore specific paths in state that may contain non-serializable data
        ignoredPaths: [
          'webSocket.events',
          'offlineQueue.items',
          'cache.entries'
        ],
      },
    })
      .concat(pharmaApi.middleware)
      .concat(webSocketApi.middleware)
      .concat(offlineSyncApi.middleware)
      .concat(rtkQueryErrorLogger),
  
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup RTK Query listeners for caching and invalidation
setupListeners(store.dispatch);

// Initialize pharmaceutical services
import { pharmaceuticalWebSocketService } from './api/webSocketApi';
import { offlineSyncService } from './api/offlineQueue';
import { pharmaceuticalCacheService } from './api/cacheService';

// Initialize services with store access
pharmaceuticalWebSocketService.initialize(store.dispatch);
offlineSyncService.initialize(store.dispatch, store.getState);
pharmaceuticalCacheService.initialize(store.dispatch, store.getState);

// Auto-connect WebSocket when authenticated
store.subscribe(() => {
  const state = store.getState();
  const { isAuthenticated, tokens } = state.auth;
  const { status } = state.webSocket;
  
  if (isAuthenticated && tokens?.accessToken && status === 'disconnected') {
    pharmaceuticalWebSocketService.connect(tokens.accessToken);
  }
});

// Export store types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default
export default store;