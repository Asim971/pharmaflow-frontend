/**
 * Territory Management Module - Export Barrel
 * 
 * Centralizes all territory management component exports for clean imports
 * across the PharmaFlow application with constitutional compliance.
 */

// Component exports
export { TerritoryManagementDashboard } from './TerritoryManagementDashboard';
export { TerritoryMap } from './TerritoryMap';
export { TerritoryPerformanceCards } from './TerritoryPerformanceCards';
export { TerritoryAnalytics } from './TerritoryAnalytics';

// Type exports
export type {
  Territory,
  TerritoryType,
  TerritoryStatus,
  ComplianceStatus,
  AssignmentStatus,
  TerritoryAnalyticsData,
  TerritoryFilters,
  TerritoryAssignment,
  TerritoryAction,
  TerritoryDashboardProps,
  TerritoryMapProps
} from './types';