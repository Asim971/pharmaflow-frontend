/**
 * Customer Hierarchy Tree Component Types
 * PharmaFlow Pharmaceutical Customer Hierarchy Visualization
 * 
 * Implements constitutional requirements for pharmaceutical customer hierarchy
 * with DGDA compliance indicators and territory management integration.
 */

import { ReactNode } from 'react';
import { Customer, CustomerTier } from '../../../types/customer';

export interface HierarchyNode {
  /** Unique customer identifier */
  id: string;
  /** Customer information */
  customer: Customer;
  /** Child nodes in hierarchy */
  children: HierarchyNode[];
  /** Hierarchy level (0=root, 1=distributor, 2=retailer, 3=provider) */
  level: number;
  /** Parent node reference */
  parent?: HierarchyNode;
  /** Territory assignment information */
  territory: {
    primaryTerritoryId: string;
    territoryName: string;
    coverageArea: string;
  };
  /** DGDA compliance status */
  compliance: {
    status: 'compliant' | 'pending' | 'non_compliant' | 'expired';
    lastAuditDate: Date;
    expirationDate?: Date;
    documents: string[];
  };
  /** Performance metrics */
  performance: {
    salesVolume: number;
    growthRate: number;
    orderFrequency: number;
    lastOrderDate?: Date;
  };
}

export interface CustomerHierarchyTreeProps {
  /** Root hierarchy nodes */
  hierarchyData: HierarchyNode[];
  /** Currently selected customer ID */
  selectedCustomerId?: string;
  /** Expanded node IDs */
  expandedNodes: Set<string>;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Tree view mode */
  viewMode?: 'compact' | 'detailed' | 'analytics';
  /** Filter options */
  filters?: {
    tier?: CustomerTier[];
    complianceStatus?: string[];
    territory?: string[];
    performanceLevel?: string[];
  };
  /** Search query */
  searchQuery?: string;
  /** Show territory information */
  showTerritory?: boolean;
  /** Show compliance indicators */
  showCompliance?: boolean;
  /** Show performance metrics */
  showPerformance?: boolean;
  /** Enable drag and drop for reassignment */
  enableDragDrop?: boolean;
  /** Maximum display depth */
  maxDepth?: number;
  
  // Event handlers
  /** Handle node selection */
  onNodeSelect?: (node: HierarchyNode) => void;
  /** Handle node expansion/collapse */
  onNodeToggle?: (nodeId: string, expanded: boolean) => void;
  /** Handle customer reassignment */
  onCustomerReassign?: (customerId: string, newParentId: string) => void;
  /** Handle territory reassignment */
  onTerritoryReassign?: (customerId: string, territoryId: string) => void;
  /** Handle compliance action */
  onComplianceAction?: (customerId: string, action: 'audit' | 'renew' | 'view') => void;
  /** Handle performance drill-down */
  onPerformanceDrillDown?: (customerId: string) => void;
  /** Handle audit trail view */
  onViewAuditTrail?: (customerId: string) => void;
}

export interface HierarchyNodeComponentProps {
  /** Node data */
  node: HierarchyNode;
  /** Whether node is selected */
  isSelected: boolean;
  /** Whether node is expanded */
  isExpanded: boolean;
  /** Depth level for styling */
  depth: number;
  /** View mode */
  viewMode: 'compact' | 'detailed' | 'analytics';
  /** Show options */
  showOptions: {
    territory: boolean;
    compliance: boolean;
    performance: boolean;
  };
  /** Enable interactions */
  enableDragDrop: boolean;
  /** Search highlight */
  searchQuery?: string;
  
  // Event handlers
  onSelect?: (node: HierarchyNode) => void;
  onToggle?: (nodeId: string, expanded: boolean) => void;
  onReassign?: (customerId: string, newParentId: string) => void;
  onTerritoryReassign?: (customerId: string, territoryId: string) => void;
  onComplianceAction?: (customerId: string, action: 'audit' | 'renew' | 'view') => void;
  onPerformanceDrillDown?: (customerId: string) => void;
  onViewAuditTrail?: (customerId: string) => void;
}

export interface ComplianceIndicatorProps {
  /** Compliance status */
  status: 'compliant' | 'pending' | 'non_compliant' | 'expired';
  /** Last audit date */
  lastAuditDate: Date;
  /** Expiration date */
  expirationDate?: Date;
  /** Number of documents */
  documentCount: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show detailed info */
  showDetails?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface TerritoryDisplayProps {
  /** Territory information */
  territory: {
    primaryTerritoryId: string;
    territoryName: string;
    coverageArea: string;
  };
  /** Display variant */
  variant?: 'chip' | 'badge' | 'full';
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** Click handler */
  onClick?: () => void;
}

export interface PerformanceMetricsProps {
  /** Performance data */
  performance: {
    salesVolume: number;
    growthRate: number;
    orderFrequency: number;
    lastOrderDate?: Date;
  };
  /** Display format */
  format?: 'compact' | 'detailed' | 'chart';
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** Click handler for drill-down */
  onClick?: () => void;
}

export interface HierarchyFilterProps {
  /** Current filter values */
  filters: {
    tier?: CustomerTier[];
    complianceStatus?: string[];
    territory?: string[];
    performanceLevel?: string[];
  };
  /** Available filter options */
  filterOptions: {
    tiers: CustomerTier[];
    complianceStatuses: string[];
    territories: { id: string; name: string }[];
    performanceLevels: string[];
  };
  /** Filter change handler */
  onFiltersChange: (filters: any) => void;
  /** Reset filters handler */
  onReset: () => void;
}

export interface HierarchySearchProps {
  /** Search query */
  query: string;
  /** Search placeholder */
  placeholder?: string;
  /** Search change handler */
  onChange: (query: string) => void;
  /** Search suggestions */
  suggestions?: string[];
}

// Pharmaceutical hierarchy specific types
export interface PharmaceuticalHierarchyLevel {
  level: number;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  maxChildren?: number;
  requiredCompliance: string[];
}

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userName: string;
  details: string;
  complianceImpact?: string;
  dgdaReference?: string;
}

export interface DGDAComplianceInfo {
  submissionId?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submissionDate?: Date;
  reviewDate?: Date;
  approvalDate?: Date;
  documents: {
    id: string;
    name: string;
    type: string;
    status: string;
    uploadDate: Date;
  }[];
  notes?: string;
  reviewer?: string;
}