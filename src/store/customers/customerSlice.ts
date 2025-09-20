import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Customer,
  CustomerState,
  CustomerFilters,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchResponse,
  CustomerTreeNode,
} from '../../types/customer';
import { customerService } from '../../services/api/customer.service';
import { auditService } from '../../services/audit/audit.service';

// Initial state for customer management
const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  hierarchyView: {
    expandedNodes: [],
    selectedNode: null,
  },
};

// Async thunks for customer operations

export const fetchCustomers = createAsyncThunk<
  CustomerSearchResponse,
  { filters?: CustomerFilters; page?: number; limit?: number },
  { rejectValue: string }
>(
  'customers/fetchCustomers',
  async ({ filters = {}, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await customerService.searchCustomers({
        ...filters,
        page,
        limit,
      });
      
      // Log customer data access for DGDA compliance
      await auditService.logAction({
        action: 'customer_data_access',
        details: {
          filters,
          resultCount: response.customers.length,
          page,
          limit,
        },
      });

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>(
  'customers/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const customer = await customerService.getCustomerById(customerId);
      
      // Log customer profile access
      await auditService.logAction({
        action: 'customer_profile_access',
        details: {
          customerId,
          customerName: customer.name,
          customerType: customer.type,
        },
      });

      return customer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk<
  Customer,
  CreateCustomerRequest,
  { rejectValue: string }
>(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const customer = await customerService.createCustomer(customerData);
      
      // Log customer creation
      await auditService.logAction({
        action: 'customer_created',
        details: {
          customerId: customer.id,
          customerName: customer.name,
          customerType: customer.type,
          parentId: customerData.parentId,
        },
      });

      return customer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk<
  Customer,
  UpdateCustomerRequest,
  { rejectValue: string }
>(
  'customers/updateCustomer',
  async (updateData, { rejectWithValue }) => {
    try {
      const customer = await customerService.updateCustomer(updateData);
      
      // Log customer update
      await auditService.logAction({
        action: 'customer_updated',
        details: {
          customerId: customer.id,
          customerName: customer.name,
          updatedFields: Object.keys(updateData),
        },
      });

      return customer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk<
  string,
  { customerId: string; reason: string },
  { rejectValue: string }
>(
  'customers/deleteCustomer',
  async ({ customerId, reason }, { rejectWithValue }) => {
    try {
      await customerService.deleteCustomer(customerId, reason);
      
      // Log customer deletion
      await auditService.logAction({
        action: 'customer_deleted',
        details: {
          customerId,
          reason,
        },
      });

      return customerId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete customer');
    }
  }
);

export const fetchCustomerHierarchy = createAsyncThunk<
  CustomerTreeNode[],
  { parentId?: string; depth?: number },
  { rejectValue: string }
>(
  'customers/fetchCustomerHierarchy',
  async ({ parentId, depth = 3 }, { rejectWithValue }) => {
    try {
      const hierarchy = await customerService.getCustomerHierarchy(parentId, depth);
      
      // Log hierarchy access
      await auditService.logAction({
        action: 'customer_hierarchy_access',
        details: {
          parentId,
          depth,
          nodeCount: hierarchy.length,
        },
      });

      return hierarchy;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customer hierarchy');
    }
  }
);

export const updateCustomerDGDACompliance = createAsyncThunk<
  Customer,
  { customerId: string; complianceData: any },
  { rejectValue: string }
>(
  'customers/updateCustomerDGDACompliance',
  async ({ customerId, complianceData }, { rejectWithValue }) => {
    try {
      const customer = await customerService.updateDGDACompliance(customerId, complianceData);
      
      // Log DGDA compliance update
      await auditService.logAction({
        action: 'dgda_compliance_updated',
        details: {
          customerId,
          customerName: customer.name,
          previousStatus: customer.dgdaCompliance.status,
          newStatus: complianceData.status,
          licenseNumber: complianceData.licenseNumber,
        },
      });

      return customer;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update DGDA compliance');
    }
  }
);

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    setPagination: (state, action: PayloadAction<Partial<CustomerState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    toggleHierarchyNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const expandedNodes = state.hierarchyView.expandedNodes;
      const index = expandedNodes.indexOf(nodeId);
      
      if (index > -1) {
        state.hierarchyView.expandedNodes.splice(index, 1);
      } else {
        state.hierarchyView.expandedNodes.push(nodeId);
      }
    },
    
    selectHierarchyNode: (state, action: PayloadAction<string | null>) => {
      state.hierarchyView.selectedNode = action.payload;
    },
    
    expandAllHierarchyNodes: (state) => {
      state.hierarchyView.expandedNodes = state.customers.map(customer => customer.id);
    },
    
    collapseAllHierarchyNodes: (state) => {
      state.hierarchyView.expandedNodes = [];
    },
    
    // Optimistic updates for better UX
    optimisticallyUpdateCustomer: (state, action: PayloadAction<Partial<Customer> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      const index = state.customers.findIndex(customer => customer.id === id);
      
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...updates };
      }
      
      if (state.selectedCustomer?.id === id) {
        state.selectedCustomer = { ...state.selectedCustomer, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomerSearchResponse>) => {
        state.isLoading = false;
        state.customers = action.payload.customers;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: Math.ceil(action.payload.total / action.payload.limit),
        };
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      });

    // Fetch customer by ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
        
        // Update customer in list if it exists
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customer';
      });

    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        state.customers.unshift(action.payload); // Add to beginning of list
        state.selectedCustomer = action.payload;
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create customer';
      });

    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        
        // Update customer in list
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        
        // Update selected customer if it's the same one
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update customer';
      });

    // Delete customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        
        // Remove customer from list
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
        
        // Clear selected customer if it was deleted
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
        
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete customer';
      });

    // Update DGDA compliance
    builder
      .addCase(updateCustomerDGDACompliance.fulfilled, (state, action: PayloadAction<Customer>) => {
        // Update customer in list
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        
        // Update selected customer if it's the same one
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomerDGDACompliance.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update DGDA compliance';
      });
  },
});

// Export actions
export const {
  clearError,
  setSelectedCustomer,
  updateFilters,
  clearFilters,
  setPagination,
  toggleHierarchyNode,
  selectHierarchyNode,
  expandAllHierarchyNodes,
  collapseAllHierarchyNodes,
  optimisticallyUpdateCustomer,
} = customerSlice.actions;

// Selectors
export const selectCustomers = (state: { customers: CustomerState }) => state.customers.customers;
export const selectSelectedCustomer = (state: { customers: CustomerState }) => state.customers.selectedCustomer;
export const selectCustomersLoading = (state: { customers: CustomerState }) => state.customers.isLoading;
export const selectCustomersError = (state: { customers: CustomerState }) => state.customers.error;
export const selectCustomerFilters = (state: { customers: CustomerState }) => state.customers.filters;
export const selectCustomerPagination = (state: { customers: CustomerState }) => state.customers.pagination;
export const selectHierarchyView = (state: { customers: CustomerState }) => state.customers.hierarchyView;

// Complex selectors
export const selectCustomersByType = (customerType: string) => (state: { customers: CustomerState }) =>
  state.customers.customers.filter(customer => customer.type === customerType);

export const selectDGDACompliantCustomers = (state: { customers: CustomerState }) =>
  state.customers.customers.filter(customer => customer.dgdaCompliance.status === 'valid');

export const selectCustomersByTerritory = (territoryId: string) => (state: { customers: CustomerState }) =>
  state.customers.customers.filter(customer => customer.territoryAssignment?.territoryId === territoryId);

// Export reducer
export default customerSlice.reducer;