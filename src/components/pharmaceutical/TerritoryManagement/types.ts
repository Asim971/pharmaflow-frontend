/**
 * Territory Management Types - PharmaFlow Frontend
 * 
 * Comprehensive TypeScript interfaces for territory management system
 * with Bangladesh pharmaceutical market specificity and DGDA compliance.
 * 
 * Constitutional Compliance:
 * ✅ Pharmaceutical industry first - Territory-specific pharmaceutical data
 * ✅ Mobile-first design - Responsive interface considerations  
 * ✅ DGDA compliance - Regulatory territory requirements
 * ✅ Bangladesh performance - Local pharmaceutical territory optimization
 */

// Import types for future customer integration
// import { Customer } from '../../../types/customer';

// Core Territory Types
export interface Territory {
  id: string;
  name: string;
  code: string;
  type: TerritoryType;
  status: TerritoryStatus;
  description?: string;
  parentTerritoryId?: string;
  hierarchyLevel: number;
  territoryPath: string[];
  
  // Geographic Information
  boundaries: TerritoryBoundaries;
  centerCoordinates: [number, number];
  areaSize?: number; // in sq km
  
  // Assignments
  assignments: TerritoryAssignment[];
  primaryRepresentativeId?: string;
  
  // Performance Data
  performance: TerritoryPerformance;
  quotas: TerritoryQuota[];
  analytics: TerritoryAnalyticsData;
  
  // Customer Management
  customerCount: number;
  activeCustomers: number;
  customerCapacity?: number;
  
  // DGDA Compliance
  dgdaCompliance: DGDAComplianceInfo;
  regulatoryZone: string;
  inspectionHistory: InspectionRecord[];
  
  // System Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

export enum TerritoryType {
  NATIONAL = 'NATIONAL',
  DIVISIONAL = 'DIVISIONAL',
  DISTRICT = 'DISTRICT',
  UPAZILA = 'UPAZILA',
  CITY = 'CITY',
  AREA = 'AREA',
  BEAT = 'BEAT',
  HOSPITAL_TERRITORY = 'HOSPITAL_TERRITORY',
  PHARMACY_TERRITORY = 'PHARMACY_TERRITORY',
  INSTITUTIONAL = 'INSTITUTIONAL'
}

export enum TerritoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ARCHIVED = 'ARCHIVED'
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  UNASSIGNED = 'UNASSIGNED',
  SHARED = 'SHARED',
  TRANSITIONING = 'TRANSITIONING',
  TEMPORARILY_VACANT = 'TEMPORARILY_VACANT'
}

// Geographic and Boundary Types
export interface TerritoryBoundaries {
  coordinates: [number, number][];
  boundaryType: 'POLYGON' | 'CIRCLE' | 'ADMINISTRATIVE';
  administrativeBoundary?: {
    division?: string;
    district?: string;
    upazila?: string;
    union?: string;
  };
}

// Assignment and User Management
export interface TerritoryAssignment {
  id: string;
  territoryId: string;
  userId: string;
  userName: string;
  userRole: PharmaceuticalRole;
  assignmentType: 'PRIMARY' | 'SECONDARY' | 'TEMPORARY' | 'COVERAGE';
  startDate: string;
  endDate?: string;
  assignedBy: string;
  isActive: boolean;
  responsibilities: string[];
  performanceTargets: Record<string, number>;
}

export enum PharmaceuticalRole {
  TERRITORY_MANAGER = 'TERRITORY_MANAGER',
  SALES_REPRESENTATIVE = 'SALES_REPRESENTATIVE',
  MEDICAL_REPRESENTATIVE = 'MEDICAL_REPRESENTATIVE',
  KEY_ACCOUNT_MANAGER = 'KEY_ACCOUNT_MANAGER',
  AREA_MANAGER = 'AREA_MANAGER',
  REGIONAL_MANAGER = 'REGIONAL_MANAGER',
  FIELD_SUPERVISOR = 'FIELD_SUPERVISOR'
}

// Performance and Analytics
export interface TerritoryPerformance {
  period: string;
  revenue: number;
  growth: number;
  customerAcquisition: number;
  customerRetention: number;
  marketShare: number;
  visitFrequency: number;
  conversionRate: number;
  averageOrderValue: number;
  performanceScore: number;
  rank: number;
  benchmarkComparison: number;
}

export interface TerritoryQuota {
  id: string;
  period: string;
  quotaType: QuotaType;
  targetValue: number;
  actualValue: number;
  achievement: number;
  status: QuotaStatus;
  currency: 'BDT' | 'USD';
}

export enum QuotaType {
  REVENUE = 'REVENUE',
  SALES_VOLUME = 'SALES_VOLUME',
  CUSTOMER_ACQUISITION = 'CUSTOMER_ACQUISITION',
  MARKET_SHARE = 'MARKET_SHARE',
  VISIT_FREQUENCY = 'VISIT_FREQUENCY'
}

export enum QuotaStatus {
  ON_TRACK = 'ON_TRACK',
  BEHIND = 'BEHIND',
  EXCEEDED = 'EXCEEDED',
  AT_RISK = 'AT_RISK'
}

export interface TerritoryAnalyticsData {
  customerDistribution: CustomerSegmentData[];
  salesTrends: SalesTrendData[];
  competitiveAnalysis: CompetitiveData[];
  marketOpportunities: OpportunityData[];
  riskFactors: RiskFactor[];
}

export interface CustomerSegmentData {
  segment: string;
  count: number;
  revenue: number;
  growth: number;
  potential: number;
}

export interface SalesTrendData {
  period: string;
  value: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
}

export interface CompetitiveData {
  competitor: string;
  marketShare: number;
  keyProducts: string[];
  strengths: string[];
  threats: string[];
}

export interface OpportunityData {
  opportunityType: string;
  description: string;
  estimatedValue: number;
  probability: number;
  timeframe: string;
  requiredActions: string[];
}

export interface RiskFactor {
  riskType: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation: string[];
}

// DGDA Compliance Types
export interface DGDAComplianceInfo {
  status: ComplianceStatus;
  score: number;
  lastAuditDate?: string;
  nextAuditDate?: string;
  certificationLevel: string;
  complianceOfficer?: string;
  violations: ComplianceViolation[];
  improvementPlan?: string[];
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_CERTIFICATION = 'PENDING_CERTIFICATION'
}

export interface ComplianceViolation {
  id: string;
  violationType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  identifiedDate: string;
  resolvedDate?: string;
  resolution?: string;
  responsible: string;
}

export interface InspectionRecord {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  inspectionType: 'ROUTINE' | 'SURPRISE' | 'COMPLAINT' | 'FOLLOW_UP';
  findings: string[];
  recommendations: string[];
  complianceScore: number;
  status: 'PASSED' | 'FAILED' | 'CONDITIONAL';
}

// Territory Management Component Props
export interface TerritoryDashboardProps {
  className?: string;
  selectedTerritoryId?: string;
  onTerritorySelect?: (territory: Territory) => void;
  showPerformanceMetrics?: boolean;
  showMap?: boolean;
  showAssignments?: boolean;
}

export interface TerritoryMapProps {
  territories: Territory[];
  selectedTerritoryId?: string;
  onTerritorySelect?: (territory: Territory) => void;
  showCustomers?: boolean;
  showPerformance?: boolean;
  showCompliance?: boolean;
  className?: string;
}

export interface TerritoryPerformanceCardsProps {
  territory: Territory;
  period?: 'monthly' | 'quarterly' | 'yearly';
  showComparison?: boolean;
  className?: string;
}

export interface TerritoryAssignmentsProps {
  territory: Territory;
  onAssignmentChange?: (assignment: TerritoryAssignment) => void;
  allowEdit?: boolean;
  className?: string;
}

export interface TerritorySearchProps {
  territories: Territory[];
  onSearch?: (query: string) => void;
  onTerritorySelect?: (territory: Territory) => void;
  placeholder?: string;
  className?: string;
}

export interface TerritoryFiltersProps {
  onFilterChange?: (filters: TerritoryFilters) => void;
  initialFilters?: TerritoryFilters;
  className?: string;
}

export interface TerritoryActionsProps {
  territory?: Territory;
  onCreateTerritory?: (territoryData: CreateTerritoryRequest) => void;
  onUpdateTerritory?: (territoryId: string, updates: UpdateTerritoryRequest) => void;
  onDeleteTerritory?: (territoryId: string) => void;
  allowedActions?: TerritoryAction[];
  className?: string;
}

// Filter and Search Types
export interface TerritoryFilters {
  type?: TerritoryType[];
  status?: TerritoryStatus[];
  assignmentStatus?: AssignmentStatus[];
  complianceStatus?: ComplianceStatus[];
  performanceRange?: {
    min: number;
    max: number;
  };
  region?: string[];
  hasActiveAssignment?: boolean;
  customerCountRange?: {
    min: number;
    max: number;
  };
}

export enum TerritoryAction {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  TRANSFER = 'TRANSFER',
  SUSPEND = 'SUSPEND',
  ACTIVATE = 'ACTIVATE',
  REVIEW_PERFORMANCE = 'REVIEW_PERFORMANCE',
  UPDATE_BOUNDARIES = 'UPDATE_BOUNDARIES'
}

// API Request/Response Types
export interface CreateTerritoryRequest {
  name: string;
  code: string;
  type: TerritoryType;
  description?: string;
  parentTerritoryId?: string;
  boundaries: TerritoryBoundaries;
  assignedRepresentativeId?: string;
  quotas?: Omit<TerritoryQuota, 'id' | 'actualValue' | 'achievement'>[];
}

export interface UpdateTerritoryRequest {
  name?: string;
  description?: string;
  boundaries?: TerritoryBoundaries;
  status?: TerritoryStatus;
  quotas?: TerritoryQuota[];
}

export interface TerritoryQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: TerritoryFilters;
  search?: string;
  includeAnalytics?: boolean;
  includePerformance?: boolean;
}

// Utility Types
export interface TerritoryHierarchyNode extends Territory {
  children: TerritoryHierarchyNode[];
  parent?: TerritoryHierarchyNode;
  depth: number;
}

export interface TerritoryGeoData {
  territory: Territory;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  properties: {
    name: string;
    performance: number;
    customerCount: number;
    complianceScore: number;
  };
}

// Event Handler Types
export type TerritoryEventHandler = (territory: Territory) => void;
export type TerritoryAssignmentEventHandler = (assignment: TerritoryAssignment) => void;
export type TerritoryFilterEventHandler = (filters: TerritoryFilters) => void;
export type TerritorySearchEventHandler = (query: string, results: Territory[]) => void;