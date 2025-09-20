import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchResponse,
  CustomerTreeNode,
  CustomerFilters,
} from '../../types/customer';
import { api } from './base.service';

/**
 * Customer service aligned with backend Customer Service Layer
 * Integrates with T009 REST API Endpoints for pharmaceutical CRM
 */
export class CustomerService {
  private readonly baseUrl = '/customers';

  /**
   * Search customers with comprehensive filtering
   * Matches backend CustomerQueryOptions interface
   */
  async searchCustomers(params: {
    filters?: CustomerFilters;
    page?: number;
    limit?: number;
  }): Promise<CustomerSearchResponse> {
    try {
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        limit: params.limit || 50,
      };

      // Map frontend filters to backend query options
      if (params.filters) {
        const { filters } = params;
        
        if (filters.type?.length) {
          queryParams.customerType = filters.type.join(',');
        }
        if (filters.status?.length) {
          queryParams.status = filters.status.join(',');
        }
        if (filters.territoryId) {
          queryParams.territoryId = filters.territoryId;
        }
        if (filters.dgdaLicenseStatus?.length) {
          queryParams.dgdaLicenseStatus = filters.dgdaLicenseStatus.join(',');
        }
        if (filters.segment?.length) {
          queryParams.marketSegment = filters.segment.join(',');
        }
        if (filters.search) {
          queryParams.searchTerm = filters.search;
        }
        if (filters.parentId) {
          queryParams.parentCustomerId = filters.parentId;
        }
        if (filters.createdDateRange) {
          queryParams.createdFrom = filters.createdDateRange.from.toISOString();
          queryParams.createdTo = filters.createdDateRange.to.toISOString();
        }
      }

      const response = await api.get<CustomerSearchResponse>(this.baseUrl, {
        params: queryParams,
      });

      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Get customer by ID with complete pharmaceutical context
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    try {
      const response = await api.get<Customer>(`${this.baseUrl}/${customerId}`);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Create new pharmaceutical customer
   * Aligns with backend CreateCustomerRequest interface
   */
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    try {
      // Transform frontend request to backend format
      const backendRequest = {
        legalName: customerData.name,
        customerType: this.mapCustomerType(customerData.type),
        parentCustomerId: customerData.parentId,
        contacts: customerData.contacts.map(contact => ({
          contactName: contact.name,
          designation: contact.designation,
          phoneNumber: contact.phone,
          emailAddress: contact.email,
          isPrimaryContact: contact.isPrimary,
          department: contact.department,
        })),
        addresses: customerData.addresses.map(address => ({
          addressType: address.type,
          division: address.division,
          district: address.district,
          upazila: address.upazila,
          union: address.union,
          wardNo: address.wardNo,
          holdingNo: address.holdingNo,
          roadName: address.roadName,
          areaName: address.areaName,
          postalCode: address.postalCode,
          landmark: address.landmark,
          coordinates: address.coordinates,
          isPrimaryAddress: address.isPrimary,
        })),
        tradeLicenseNumber: customerData.tradeLicense,
        vatRegistrationNumber: customerData.vatRegistration,
        tinNumber: customerData.tinNumber,
        territoryId: customerData.territoryId,
        tags: customerData.tags,
      };

      const response = await api.post<Customer>(this.baseUrl, backendRequest);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Update existing pharmaceutical customer
   */
  async updateCustomer(updateData: UpdateCustomerRequest): Promise<Customer> {
    try {
      const { id, ...data } = updateData;
      
      // Transform frontend update to backend format
      const backendUpdate = this.transformUpdateRequest(data);
      
      const response = await api.put<Customer>(`${this.baseUrl}/${id}`, backendUpdate);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Delete customer with business reason
   */
  async deleteCustomer(customerId: string, reason: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${customerId}`, {
        data: { reason },
      });
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Get customer hierarchy tree structure
   * Matches backend CustomerHierarchyNode interface
   */
  async getCustomerHierarchy(parentId?: string, depth = 3): Promise<CustomerTreeNode[]> {
    try {
      const response = await api.get<CustomerTreeNode[]>(`${this.baseUrl}/hierarchy`, {
        params: { parentId, depth },
      });

      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Update customer DGDA compliance information
   */
  async updateDGDACompliance(customerId: string, complianceData: any): Promise<Customer> {
    try {
      const response = await api.put<Customer>(
        `${this.baseUrl}/${customerId}/dgda-compliance`,
        complianceData
      );
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Get customer financial metrics
   */
  async getCustomerMetrics(customerId: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/${customerId}/metrics`);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Assign customer to territory
   */
  async assignToTerritory(customerId: string, territoryId: string): Promise<Customer> {
    try {
      const response = await api.post<Customer>(
        `${this.baseUrl}/${customerId}/assign-territory`,
        { territoryId }
      );
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Get customer audit trail
   */
  async getCustomerAuditTrail(customerId: string, limit = 50): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${customerId}/audit-trail`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  }

  /**
   * Map frontend customer type to backend CustomerTier
   */
  private mapCustomerType(frontendType: string): string {
    const typeMapping: Record<string, string> = {
      'distributor': 'NATIONAL_DISTRIBUTOR',
      'retailer': 'INDEPENDENT_PHARMACY',
      'healthcare_provider': 'HEALTHCARE_CENTER',
      'hospital': 'HOSPITAL',
      'clinic': 'CLINIC',
      'pharmacy': 'INDEPENDENT_PHARMACY',
    };

    return typeMapping[frontendType] || frontendType.toUpperCase();
  }

  /**
   * Transform frontend update request to backend format
   */
  private transformUpdateRequest(data: Partial<CreateCustomerRequest>): any {
    const backendUpdate: any = {};

    if (data.name) backendUpdate.legalName = data.name;
    if (data.type) backendUpdate.customerType = this.mapCustomerType(data.type);
    if (data.parentId) backendUpdate.parentCustomerId = data.parentId;
    if (data.tradeLicense) backendUpdate.tradeLicenseNumber = data.tradeLicense;
    if (data.vatRegistration) backendUpdate.vatRegistrationNumber = data.vatRegistration;
    if (data.tinNumber) backendUpdate.tinNumber = data.tinNumber;
    if (data.territoryId) backendUpdate.territoryId = data.territoryId;
    if (data.tags) backendUpdate.tags = data.tags;

    if (data.contacts) {
      backendUpdate.contacts = data.contacts.map(contact => ({
        contactName: contact.name,
        designation: contact.designation,
        phoneNumber: contact.phone,
        emailAddress: contact.email,
        isPrimaryContact: contact.isPrimary,
        department: contact.department,
      }));
    }

    if (data.addresses) {
      backendUpdate.addresses = data.addresses.map(address => ({
        addressType: address.type,
        division: address.division,
        district: address.district,
        upazila: address.upazila,
        union: address.union,
        wardNo: address.wardNo,
        holdingNo: address.holdingNo,
        roadName: address.roadName,
        areaName: address.areaName,
        postalCode: address.postalCode,
        landmark: address.landmark,
        coordinates: address.coordinates,
        isPrimaryAddress: address.isPrimary,
      }));
    }

    return backendUpdate;
  }

  /**
   * Handle customer service errors
   */
  private handleCustomerError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid customer data');
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Insufficient permissions for customer operation');
        case 404:
          return new Error('Customer not found');
        case 409:
          return new Error(data.message || 'Customer already exists');
        case 422:
          return new Error(data.message || 'Invalid customer information');
        default:
          return new Error(data.message || 'Customer service error');
      }
    }

    if (error.request) {
      return new Error('Network error. Please check your connection.');
    }

    return new Error(error.message || 'Customer service error');
  }
}

// Export singleton instance
export const customerService = new CustomerService();