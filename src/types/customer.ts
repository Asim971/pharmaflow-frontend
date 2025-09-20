// Customer hierarchy types for pharmaceutical business - aligned with backend CustomerTier enum
export type CustomerType = 
  | 'pharmaceutical_company'
  | 'national_distributor' 
  | 'regional_distributor'
  | 'pharmacy_chain'
  | 'independent_pharmacy'
  | 'medical_store'
  | 'hospital'
  | 'clinic'
  | 'diagnostic_center'
  | 'healthcare_center';

// Backend CustomerTier enum mapping
export enum CustomerTier {
  PHARMACEUTICAL_COMPANY = 'PHARMACEUTICAL_COMPANY',
  NATIONAL_DISTRIBUTOR = 'NATIONAL_DISTRIBUTOR',
  REGIONAL_DISTRIBUTOR = 'REGIONAL_DISTRIBUTOR',
  LOCAL_DISTRIBUTOR = 'LOCAL_DISTRIBUTOR',
  PHARMACY_CHAIN = 'PHARMACY_CHAIN',
  INDEPENDENT_PHARMACY = 'INDEPENDENT_PHARMACY',
  MEDICAL_STORE = 'MEDICAL_STORE',
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  DIAGNOSTIC_CENTER = 'DIAGNOSTIC_CENTER',
  HEALTHCARE_CENTER = 'HEALTHCARE_CENTER',
  WHOLESALER = 'WHOLESALER',
  RETAILER = 'RETAILER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  HEALTHCARE_PROVIDER = 'HEALTHCARE_PROVIDER'
}

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'rejected' | 'under_review' | 'blacklisted';

export type DGDALicenseStatus = 'valid' | 'expired' | 'pending_renewal' | 'suspended' | 'not_required';

// Bangladesh divisions enum - aligned with backend
export enum BangladeshDivision {
  DHAKA = 'DHAKA',
  CHITTAGONG = 'CHITTAGONG', 
  SYLHET = 'SYLHET',
  RAJSHAHI = 'RAJSHAHI',
  KHULNA = 'KHULNA',
  BARISAL = 'BARISAL',
  RANGPUR = 'RANGPUR',
  MYMENSINGH = 'MYMENSINGH'
}

// Business categories aligned with backend
export enum BusinessCategory {
  PHARMACEUTICAL_DISTRIBUTOR = 'PHARMACEUTICAL_DISTRIBUTOR',
  RETAIL_PHARMACY = 'RETAIL_PHARMACY',
  HOSPITAL_PHARMACY = 'HOSPITAL_PHARMACY',
  CLINIC_PHARMACY = 'CLINIC_PHARMACY',
  CHAIN_PHARMACY = 'CHAIN_PHARMACY',
  WHOLESALE_DISTRIBUTOR = 'WHOLESALE_DISTRIBUTOR',
  GENERIC_MEDICINE_STORE = 'GENERIC_MEDICINE_STORE',
  SPECIALIZED_PHARMACY = 'SPECIALIZED_PHARMACY',
  ONLINE_PHARMACY = 'ONLINE_PHARMACY',
  MEDICAL_EQUIPMENT = 'MEDICAL_EQUIPMENT',
  DIAGNOSTIC_CENTER = 'DIAGNOSTIC_CENTER',
  HEALTHCARE_PROVIDER = 'HEALTHCARE_PROVIDER'
}

// Market segments aligned with backend
export enum MarketSegment {
  RURAL = 'RURAL',
  URBAN = 'URBAN',
  SEMI_URBAN = 'SEMI_URBAN',
  METROPOLITAN = 'METROPOLITAN',
  GOVERNMENT = 'GOVERNMENT',
  PRIVATE = 'PRIVATE',
  CORPORATE = 'CORPORATE',
  INSTITUTIONAL = 'INSTITUTIONAL'
}

// Customer relationship types
export interface CustomerHierarchy {
  id: string;
  parentId?: string;
  children: string[];
  depth: number;
  path: string[]; // Array of IDs from root to current
}

// DGDA compliance information
export interface DGDACompliance {
  licenseNumber?: string;
  licenseType?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: DGDALicenseStatus;
  lastAuditDate?: Date;
  nextAuditDue?: Date;
  complianceScore?: number; // 0-100
  violations?: string[];
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: Date;
    verificationStatus: 'verified' | 'pending' | 'rejected';
  }[];
}

// Customer contact information
export interface CustomerContact {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  department?: string;
}

// Address information with Bangladesh-specific fields
export interface CustomerAddress {
  id: string;
  type: 'business' | 'delivery' | 'billing';
  division: BangladeshDivision;
  district: string;
  upazila?: string;
  union?: string;
  wardNo?: string;
  holdingNo?: string;
  roadName?: string;
  areaName?: string;
  postalCode?: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPrimary: boolean;
}

// Customer business metrics
export interface CustomerMetrics {
  monthlyPurchaseVolume: number;
  averageOrderValue: number;
  paymentTerms: number; // days
  creditLimit: number;
  currentOutstanding: number;
  lastOrderDate?: Date;
  totalOrders: number;
  customerLifetimeValue: number;
  riskScore: number; // 0-100, higher = riskier
}

// Territory assignment
export interface TerritoryAssignment {
  territoryId: string;
  territoryName: string;
  assignedDate: Date;
  assignedBy: string;
  fieldRepresentativeId?: string;
  fieldRepresentativeName?: string;
  isActive: boolean;
}

// Main customer interface
export interface Customer {
  id: string;
  code: string; // Internal customer code
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  
  // Business information
  tradeLicense?: string;
  vatRegistration?: string;
  tinNumber?: string;
  businessType?: string;
  establishedDate?: Date;
  
  // Hierarchy and relationships
  hierarchy: CustomerHierarchy;
  
  // Contact information
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  
  // DGDA compliance
  dgdaCompliance: DGDACompliance;
  
  // Territory assignment
  territoryAssignment?: TerritoryAssignment;
  
  // Business metrics
  metrics: CustomerMetrics;
  
  // Tags and categorization
  tags: string[];
  category?: string;
  segment?: 'A' | 'B' | 'C' | 'D'; // Customer segmentation
  
  // System metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  companyId: string;
  
  // Additional pharmaceutical-specific fields
  preferredPaymentMethod?: string;
  deliveryPreferences?: {
    preferredDay?: string;
    timeSlot?: string;
    specialInstructions?: string;
  };
  certifications?: string[];
  specializations?: string[]; // e.g., 'pediatric', 'cardiology', 'oncology'
}

// Customer list filters and search
export interface CustomerFilters {
  type?: CustomerType[];
  status?: CustomerStatus[];
  territoryId?: string;
  dgdaLicenseStatus?: DGDALicenseStatus[];
  segment?: ('A' | 'B' | 'C' | 'D')[];
  tags?: string[];
  createdDateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
  parentId?: string; // For filtering children of a specific customer
}

// Customer state management
export interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  filters: CustomerFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  hierarchyView: {
    expandedNodes: string[];
    selectedNode: string | null;
  };
}

// Customer API request/response types
export interface CreateCustomerRequest {
  name: string;
  type: CustomerType;
  parentId?: string;
  contacts: Omit<CustomerContact, 'id'>[];
  addresses: Omit<CustomerAddress, 'id'>[];
  tradeLicense?: string;
  vatRegistration?: string;
  tinNumber?: string;
  territoryId?: string;
  tags?: string[];
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: string;
}

export interface CustomerSearchResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Customer hierarchy tree node for UI components
export interface CustomerTreeNode {
  id: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  children: CustomerTreeNode[];
  hasChildren: boolean;
  expanded: boolean;
  level: number;
  dgdaCompliant: boolean;
  orderCount: number;
  totalValue: number;
}

// Customer audit trail
export interface CustomerAuditEntry {
  id: string;
  customerId: string;
  action: 'created' | 'updated' | 'status_changed' | 'territory_assigned' | 'compliance_updated';
  changes: Record<string, { from: any; to: any }>;
  timestamp: Date;
  userId: string;
  userName: string;
  reason?: string;
  ipAddress: string;
  userAgent: string;
}