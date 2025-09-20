/**
 * WebSocket Integration for Real-time Pharmaceutical Operations
 * Handles real-time updates for DGDA submissions, compliance status, and territory changes
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// WebSocket connection states
export enum WebSocketStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Real-time event types for pharmaceutical operations
export enum PharmaceuticalEventType {
  // DGDA Compliance Events
  DGDA_SUBMISSION_STATUS_CHANGE = 'dgda_submission_status_change',
  DGDA_DOCUMENT_APPROVED = 'dgda_document_approved',
  DGDA_COMPLIANCE_DEADLINE = 'dgda_compliance_deadline',
  
  // Customer Management Events
  CUSTOMER_TIER_UPDATED = 'customer_tier_updated',
  CUSTOMER_TERRITORY_CHANGED = 'customer_territory_changed',
  CUSTOMER_COMPLIANCE_STATUS = 'customer_compliance_status',
  
  // Marketing Campaign Events
  CAMPAIGN_STATUS_CHANGE = 'campaign_status_change',
  CAMPAIGN_APPROVAL_UPDATE = 'campaign_approval_update',
  CAMPAIGN_PERFORMANCE_ALERT = 'campaign_performance_alert',
  
  // Territory Management Events
  TERRITORY_ASSIGNMENT_CHANGE = 'territory_assignment_change',
  TERRITORY_PERFORMANCE_UPDATE = 'territory_performance_update',
  
  // System Events
  SYSTEM_MAINTENANCE = 'system_maintenance',
  AUDIT_TRAIL_UPDATE = 'audit_trail_update'
}

// WebSocket message structure for pharmaceutical events
interface PharmaceuticalWebSocketMessage {
  type: PharmaceuticalEventType;
  payload: any;
  timestamp: string;
  userId?: string;
  tenantId?: string;
  dgdaContext?: {
    submissionId?: string;
    documentId?: string;
    complianceStatus?: string;
  };
  auditTrail?: {
    action: string;
    actor: string;
    businessJustification?: string;
  };
}

// WebSocket state interface
interface WebSocketState {
  status: WebSocketStatus;
  lastConnected: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  events: PharmaceuticalWebSocketMessage[];
  subscriptions: string[];
  error: string | null;
}

// Initial WebSocket state
const initialState: WebSocketState = {
  status: WebSocketStatus.DISCONNECTED,
  lastConnected: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  events: [],
  subscriptions: [],
  error: null
};

// WebSocket slice for state management
export const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    connectionStarted: (state) => {
      state.status = WebSocketStatus.CONNECTING;
      state.error = null;
    },
    connectionEstablished: (state) => {
      state.status = WebSocketStatus.CONNECTED;
      state.lastConnected = new Date().toISOString();
      state.reconnectAttempts = 0;
      state.error = null;
    },
    connectionLost: (state, action: PayloadAction<string>) => {
      state.status = WebSocketStatus.DISCONNECTED;
      state.error = action.payload;
    },
    reconnecting: (state) => {
      state.status = WebSocketStatus.RECONNECTING;
      state.reconnectAttempts += 1;
    },
    connectionError: (state, action: PayloadAction<string>) => {
      state.status = WebSocketStatus.ERROR;
      state.error = action.payload;
    },
    eventReceived: (state, action: PayloadAction<PharmaceuticalWebSocketMessage>) => {
      state.events.unshift(action.payload);
      // Keep only last 100 events to prevent memory issues
      if (state.events.length > 100) {
        state.events = state.events.slice(0, 100);
      }
    },
    subscriptionAdded: (state, action: PayloadAction<string>) => {
      if (!state.subscriptions.includes(action.payload)) {
        state.subscriptions.push(action.payload);
      }
    },
    subscriptionRemoved: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(sub => sub !== action.payload);
    },
    eventsCleared: (state) => {
      state.events = [];
    }
  }
});

export const {
  connectionStarted,
  connectionEstablished,
  connectionLost,
  reconnecting,
  connectionError,
  eventReceived,
  subscriptionAdded,
  subscriptionRemoved,
  eventsCleared
} = webSocketSlice.actions;

// WebSocket API for pharmaceutical real-time operations
export const webSocketApi = createApi({
  reducerPath: 'webSocketApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    // Subscribe to DGDA compliance updates
    subscribeToDGDAUpdates: builder.mutation<void, { submissionIds: string[] }>({
      queryFn: ({ submissionIds: _submissionIds }) => {
        // Implementation handled by WebSocket service
        return { data: undefined };
      }
    }),
    
    // Subscribe to customer territory changes
    subscribeToTerritoryUpdates: builder.mutation<void, { territoryIds: string[] }>({
      queryFn: ({ territoryIds: _territoryIds }) => {
        return { data: undefined };
      }
    }),
    
    // Subscribe to marketing campaign updates
    subscribeToCampaignUpdates: builder.mutation<void, { campaignIds: string[] }>({
      queryFn: ({ campaignIds: _campaignIds }) => {
        return { data: undefined };
      }
    }),
    
    // Send real-time notification
    sendNotification: builder.mutation<void, {
      type: PharmaceuticalEventType;
      recipients: string[];
      payload: any;
    }>({
      queryFn: ({ type: _type, recipients: _recipients, payload: _payload }) => {
        return { data: undefined };
      }
    })
  })
});

// WebSocket service class for managing pharmaceutical real-time connections
class PharmaceuticalWebSocketService {
  private ws: WebSocket | null = null;
  private dispatch: any = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly baseUrl: string;
  private readonly heartbeatInterval = 30000; // 30 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Initialize WebSocket with Redux dispatch
  initialize(dispatch: any): void {
    this.dispatch = dispatch;
  }

  // Connect to pharmaceutical WebSocket server
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.dispatch(connectionStarted());

    try {
      const wsUrl = `${this.baseUrl}?token=${token}&client=pharma_frontend`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      this.dispatch(connectionError(error instanceof Error ? error.message : 'Connection failed'));
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Subscribe to pharmaceutical event channels
  subscribe(channels: string[]): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: 'subscribe',
        channels
      });

      channels.forEach(channel => {
        this.dispatch(subscriptionAdded(channel));
      });
    }
  }

  // Unsubscribe from pharmaceutical event channels
  unsubscribe(channels: string[]): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: 'unsubscribe',
        channels
      });

      channels.forEach(channel => {
        this.dispatch(subscriptionRemoved(channel));
      });
    }
  }

  // Send message to WebSocket server
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Handle WebSocket connection open
  private handleOpen(): void {
    this.dispatch(connectionEstablished());
    this.startHeartbeat();
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent): void {
    try {
      const message: PharmaceuticalWebSocketMessage = JSON.parse(event.data);
      
      // Handle different message types
      switch (message.type) {
        case PharmaceuticalEventType.DGDA_SUBMISSION_STATUS_CHANGE:
        case PharmaceuticalEventType.DGDA_DOCUMENT_APPROVED:
        case PharmaceuticalEventType.DGDA_COMPLIANCE_DEADLINE:
        case PharmaceuticalEventType.CUSTOMER_TIER_UPDATED:
        case PharmaceuticalEventType.CUSTOMER_TERRITORY_CHANGED:
        case PharmaceuticalEventType.CAMPAIGN_STATUS_CHANGE:
        case PharmaceuticalEventType.TERRITORY_ASSIGNMENT_CHANGE:
        case PharmaceuticalEventType.AUDIT_TRAIL_UPDATE:
          this.dispatch(eventReceived(message));
          break;
        
        default:
          console.warn('Unknown pharmaceutical WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle WebSocket connection close
  private handleClose(event: CloseEvent): void {
    this.dispatch(connectionLost(`Connection closed: ${event.reason || 'Unknown reason'}`));
    this.stopHeartbeat();
    
    // Attempt reconnection if not intentional close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  // Handle WebSocket errors
  private handleError(event: Event): void {
    this.dispatch(connectionError('WebSocket connection error'));
    console.error('WebSocket error:', event);
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  // Stop heartbeat timer
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.dispatch(reconnecting());
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      // Get token from auth state and reconnect
      const token = localStorage.getItem('pharma_auth_token');
      if (token) {
        this.connect(token);
      }
    }, 5000); // 5 second delay
  }
}

// Export WebSocket service instance
export const pharmaceuticalWebSocketService = new PharmaceuticalWebSocketService(
  process.env.NODE_ENV === 'production' 
    ? 'wss://api.pharmaflow.com.bd/ws'
    : 'ws://localhost:8080/ws'
);

// Export RTK Query hooks
export const {
  useSubscribeToDGDAUpdatesMutation,
  useSubscribeToTerritoryUpdatesMutation,
  useSubscribeToCampaignUpdatesMutation,
  useSendNotificationMutation
} = webSocketApi;

export default webSocketSlice.reducer;