import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Base query with authentication and DGDA compliance headers
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.tokens?.accessToken;
    
    // Add authentication token
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Add pharmaceutical compliance headers
    headers.set('Content-Type', 'application/json');
    headers.set('X-Client-Version', import.meta.env.VITE_APP_VERSION || '1.0.0');
    headers.set('X-Client-Platform', 'web');
    headers.set('X-DGDA-Compliance', 'enabled');
    headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    headers.set('X-Timestamp', new Date().toISOString());
    
    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = (api.getState() as RootState).auth.tokens?.refreshToken;
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Update tokens and retry original request
        const newTokens = refreshResult.data as any;
        localStorage.setItem('pharma_access_token', newTokens.accessToken);
        localStorage.setItem('pharma_refresh_token', newTokens.refreshToken);
        
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        localStorage.removeItem('pharma_access_token');
        localStorage.removeItem('pharma_refresh_token');
        api.dispatch({ type: 'auth/clearAuthentication' });
      }
    }
  }
  
  return result;
};

// Main pharmaceutical API slice
export const pharmaApi = createApi({
  reducerPath: 'pharmaApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Customer',
    'CustomerHierarchy', 
    'DGDASubmission',
    'ComplianceDocument',
    'Territory',
    'Campaign',
    'Analytics',
    'AuditTrail',
    'User',
  ],
  endpoints: (builder) => ({
    // Customer Management Endpoints
    getCustomers: builder.query<any, any>({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      providesTags: ['Customer'],
    }),
    
    getCustomerById: builder.query<any, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    
    createCustomer: builder.mutation<any, any>({
      query: (customerData) => ({
        url: '/customers',
        method: 'POST',
        body: customerData,
      }),
      invalidatesTags: ['Customer', 'CustomerHierarchy'],
    }),
    
    updateCustomer: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        'CustomerHierarchy',
      ],
    }),
    
    deleteCustomer: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Customer', 'CustomerHierarchy'],
    }),
    
    getCustomerHierarchy: builder.query<any, { parentId?: string; depth?: number }>({
      query: ({ parentId, depth = 3 }) => ({
        url: '/customers/hierarchy',
        params: { parentId, depth },
      }),
      providesTags: ['CustomerHierarchy'],
    }),
    
    updateCustomerDGDACompliance: builder.mutation<any, { id: string; compliance: any }>({
      query: ({ id, compliance }) => ({
        url: `/customers/${id}/dgda-compliance`,
        method: 'PUT',
        body: compliance,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        'ComplianceDocument',
      ],
    }),
    
    // DGDA Submission Endpoints
    getDGDASubmissions: builder.query<any, any>({
      query: (params) => ({
        url: '/dgda-submissions',
        params,
      }),
      providesTags: ['DGDASubmission'],
    }),
    
    createDGDASubmission: builder.mutation<any, any>({
      query: (submissionData) => ({
        url: '/dgda-submissions',
        method: 'POST',
        body: submissionData,
      }),
      invalidatesTags: ['DGDASubmission', 'ComplianceDocument'],
    }),
    
    updateDGDASubmissionStatus: builder.mutation<any, { id: string; status: string; notes?: string }>({
      query: ({ id, status, notes }) => ({
        url: `/dgda-submissions/${id}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'DGDASubmission', id },
        'ComplianceDocument',
      ],
    }),
    
    // Territory Management Endpoints
    getTerritories: builder.query<any, any>({
      query: (params) => ({
        url: '/territories',
        params,
      }),
      providesTags: ['Territory'],
    }),
    
    assignCustomerToTerritory: builder.mutation<any, { customerId: string; territoryId: string }>({
      query: ({ customerId, territoryId }) => ({
        url: `/territories/${territoryId}/assign-customer`,
        method: 'POST',
        body: { customerId },
      }),
      invalidatesTags: ['Territory', 'Customer'],
    }),
    
    // Marketing Campaign Endpoints
    getCampaigns: builder.query<any, any>({
      query: (params) => ({
        url: '/campaigns',
        params,
      }),
      providesTags: ['Campaign'],
    }),
    
    createCampaign: builder.mutation<any, any>({
      query: (campaignData) => ({
        url: '/campaigns',
        method: 'POST',
        body: campaignData,
      }),
      invalidatesTags: ['Campaign'],
    }),
    
    // Analytics Endpoints
    getCustomerAnalytics: builder.query<any, any>({
      query: (params) => ({
        url: '/analytics/customers',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getTerritoryAnalytics: builder.query<any, any>({
      query: (params) => ({
        url: '/analytics/territories',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getDGDAComplianceMetrics: builder.query<any, any>({
      query: (params) => ({
        url: '/analytics/dgda-compliance',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    // Audit Trail Endpoints
    getAuditTrail: builder.query<any, any>({
      query: (params) => ({
        url: '/audit-trail',
        params,
      }),
      providesTags: ['AuditTrail'],
    }),
    
    // User Management Endpoints
    getUsers: builder.query<any, any>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Customer hooks
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerHierarchyQuery,
  useUpdateCustomerDGDAComplianceMutation,
  
  // DGDA hooks
  useGetDGDASubmissionsQuery,
  useCreateDGDASubmissionMutation,
  useUpdateDGDASubmissionStatusMutation,
  
  // Territory hooks
  useGetTerritoriesQuery,
  useAssignCustomerToTerritoryMutation,
  
  // Campaign hooks
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  
  // Analytics hooks
  useGetCustomerAnalyticsQuery,
  useGetTerritoryAnalyticsQuery,
  useGetDGDAComplianceMetricsQuery,
  
  // Audit hooks
  useGetAuditTrailQuery,
  
  // User hooks
  useGetUsersQuery,
  useUpdateUserProfileMutation,
} = pharmaApi;