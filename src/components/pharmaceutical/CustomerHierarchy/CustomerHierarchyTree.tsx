/**
 * Customer Hierarchy Tree Component
 * PharmaFlow Pharmaceutical Customer Hierarchy Visualization
 * 
 * Constitutional Compliance:
 * ✓ Pharmaceutical workflow efficiency with audit trail visibility
 * ✓ DGDA compliance indicators and territory display
 * ✓ Mobile-first design with offline capabilities
 * ✓ Performance optimized for Bangladesh conditions
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  LocalHospital as HospitalIcon,
  AccountTree as HierarchyIcon,
  Visibility as ViewIcon,
  Timeline as AuditIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { CustomerHierarchyTreeProps, HierarchyNodeComponentProps } from './types';
import { CustomerTier } from '../../../types/customer';
import { ComplianceIndicator } from './ComplianceIndicator';
import { TerritoryDisplay } from './TerritoryDisplay';
import { PerformanceMetrics } from './PerformanceMetrics';
import { HierarchyFilter } from './HierarchyFilter';
import { HierarchySearch } from './HierarchySearch';

// Pharmaceutical hierarchy level configuration
const hierarchyLevels = {
  [CustomerTier.PHARMACEUTICAL_COMPANY]: {
    icon: <BusinessIcon />,
    color: '#1976d2',
    name: 'Pharmaceutical Company',
    level: 0,
  },
  [CustomerTier.NATIONAL_DISTRIBUTOR]: {
    icon: <BusinessIcon />,
    color: '#388e3c',
    name: 'National Distributor',
    level: 1,
  },
  [CustomerTier.REGIONAL_DISTRIBUTOR]: {
    icon: <StoreIcon />,
    color: '#f57c00',
    name: 'Regional Distributor',
    level: 2,
  },
  [CustomerTier.LOCAL_DISTRIBUTOR]: {
    icon: <StoreIcon />,
    color: '#7b1fa2',
    name: 'Local Distributor',
    level: 3,
  },
  [CustomerTier.PHARMACY_CHAIN]: {
    icon: <StoreIcon />,
    color: '#c2185b',
    name: 'Pharmacy Chain',
    level: 4,
  },
  [CustomerTier.INDEPENDENT_PHARMACY]: {
    icon: <StoreIcon />,
    color: '#5d4037',
    name: 'Independent Pharmacy',
    level: 5,
  },
  [CustomerTier.HOSPITAL]: {
    icon: <HospitalIcon />,
    color: '#d32f2f',
    name: 'Hospital',
    level: 6,
  },
  [CustomerTier.CLINIC]: {
    icon: <HospitalIcon />,
    color: '#303f9f',
    name: 'Clinic',
    level: 7,
  },
  [CustomerTier.HEALTHCARE_PROVIDER]: {
    icon: <HospitalIcon />,
    color: '#689f38',
    name: 'Healthcare Provider',
    level: 8,
  },
};

// Modern motion variants following component preferences
const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.28,
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.28,
        ease: [0.2, 0.8, 0.2, 1],
      },
    },
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transition: {
      duration: 0.18,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
  active: {
    scale: 0.98,
    transition: { duration: 0.06 },
  },
};

/**
 * Individual Hierarchy Node Component
 * Implements modern pharmaceutical design patterns with glassmorphism effects
 */
const HierarchyNodeComponent: React.FC<HierarchyNodeComponentProps> = ({
  node,
  isSelected,
  isExpanded,
  depth,
  viewMode,
  showOptions,
  enableDragDrop,
  searchQuery,
  onSelect,
  onToggle,
  onReassign,
  onTerritoryReassign,
  onComplianceAction,
  onPerformanceDrillDown,
  onViewAuditTrail,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const hierarchyConfig = hierarchyLevels[node.customer.type as keyof typeof hierarchyLevels] || hierarchyLevels[CustomerTier.INDEPENDENT_PHARMACY];
  const hasChildren = node.children && node.children.length > 0;

  const handleNodeClick = useCallback(() => {
    onSelect?.(node);
  }, [node, onSelect]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.(node.id, !isExpanded);
  }, [node.id, isExpanded, onToggle]);

  const handleComplianceClick = useCallback(() => {
    onComplianceAction?.(node.id, 'view');
  }, [node.id, onComplianceAction]);

  const handleAuditTrailClick = useCallback(() => {
    onViewAuditTrail?.(node.id);
  }, [node.id, onViewAuditTrail]);

  const handlePerformanceClick = useCallback(() => {
    onPerformanceDrillDown?.(node.id);
  }, [node.id, onPerformanceDrillDown]);

  // Highlight search terms
  const highlightSearchTerm = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <motion.div
      variants={motionVariants.item}
      whileHover={motionVariants.hover}
      whileTap={motionVariants.active}
      style={{ marginLeft: `${depth * (isMobile ? 16 : 24)}px` }}
    >
      <Paper
        elevation={isSelected ? 8 : 2}
        sx={{
          p: isMobile ? 2 : 3,
          mb: 1,
          cursor: 'pointer',
          background: isSelected 
            ? 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)'
            : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: isSelected 
            ? `2px solid ${theme.palette.primary.main}` 
            : '1px solid rgba(255,255,255,0.2)',
          borderRadius: 2,
          transition: 'all 0.18s cubic-bezier(0.2,0.8,0.2,1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={handleNodeClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <IconButton
              size="small"
              onClick={handleToggleExpand}
              sx={{
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          {/* Hierarchy Level Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${hierarchyConfig.color} 0%, ${hierarchyConfig.color}88 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 12px ${hierarchyConfig.color}33`,
            }}
          >
            {hierarchyConfig.icon}
          </Box>

          {/* Customer Information */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(node.customer.name),
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={hierarchyConfig.name}
                size="small"
                sx={{
                  backgroundColor: `${hierarchyConfig.color}22`,
                  color: hierarchyConfig.color,
                  fontWeight: 500,
                }}
              />
              
              {showOptions.territory && (
                <TerritoryDisplay
                  territory={node.territory}
                  variant="chip"
                  size="small"
                  onClick={() => onTerritoryReassign?.(node.id, node.territory.primaryTerritoryId)}
                />
              )}
            </Box>

            {viewMode === 'detailed' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ID: {node.customer.id} • 
                Children: {node.children.length} • 
                Level: {node.level}
              </Typography>
            )}
          </Box>

          {/* Compliance Indicator */}
          {showOptions.compliance && (
            <ComplianceIndicator
              status={node.compliance.status}
              lastAuditDate={node.compliance.lastAuditDate}
              expirationDate={node.compliance.expirationDate}
              documentCount={node.compliance.documents.length}
              size="medium"
              onClick={handleComplianceClick}
            />
          )}

          {/* Performance Metrics */}
          {showOptions.performance && viewMode === 'analytics' && (
            <PerformanceMetrics
              performance={node.performance}
              format="compact"
              size="small"
              onClick={handlePerformanceClick}
            />
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleAuditTrailClick}
              sx={{ color: theme.palette.info.main }}
            >
              <AuditIcon />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={() => onSelect?.(node)}
              sx={{ color: theme.palette.primary.main }}
            >
              <ViewIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Child Nodes */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <Collapse in={isExpanded} timeout={300}>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {node.children.map((childNode) => (
                <HierarchyNodeComponent
                  key={childNode.id}
                  node={childNode}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  depth={depth + 1}
                  viewMode={viewMode}
                  showOptions={showOptions}
                  enableDragDrop={enableDragDrop}
                  searchQuery={searchQuery}
                  onSelect={onSelect}
                  onToggle={onToggle}
                  onReassign={onReassign}
                  onTerritoryReassign={onTerritoryReassign}
                  onComplianceAction={onComplianceAction}
                  onPerformanceDrillDown={onPerformanceDrillDown}
                  onViewAuditTrail={onViewAuditTrail}
                />
              ))}
            </motion.div>
          </Collapse>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Main Customer Hierarchy Tree Component
 * Implements pharmaceutical industry standards with DGDA compliance
 */
export const CustomerHierarchyTree = ({
  hierarchyData,
  selectedCustomerId,
  expandedNodes,
  loading = false,
  error,
  viewMode = 'detailed',
  filters = {},
  searchQuery = '',
  showTerritory = true,
  showCompliance = true,
  showPerformance = false,
  enableDragDrop = false,
  onNodeSelect,
  onNodeToggle,
  onCustomerReassign,
  onTerritoryReassign,
  onComplianceAction,
  onPerformanceDrillDown,
  onViewAuditTrail,
}: CustomerHierarchyTreeProps) => {
  const theme = useTheme();
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState(filters);

  // Filter and search hierarchy data
  const filteredHierarchy = useMemo(() => {
    let filtered = hierarchyData;

    // Apply search filter
    if (localSearchQuery) {
      const searchLower = localSearchQuery.toLowerCase();
      filtered = filtered.filter((node) =>
        node.customer.name.toLowerCase().includes(searchLower) ||
        node.customer.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply tier filters
    if (localFilters.tier && localFilters.tier.length > 0) {
      filtered = filtered.filter((node) =>
        localFilters.tier!.includes(node.customer.type as CustomerTier)
      );
    }

    // Apply compliance filters
    if (localFilters.complianceStatus && localFilters.complianceStatus.length > 0) {
      filtered = filtered.filter((node) =>
        localFilters.complianceStatus!.includes(node.compliance.status)
      );
    }

    return filtered;
  }, [hierarchyData, localSearchQuery, localFilters]);

  // Show options configuration
  const showOptions = {
    territory: showTerritory,
    compliance: showCompliance,
    performance: showPerformance,
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={80}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <HierarchyIcon />
          Customer Hierarchy
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Pharmaceutical supply chain relationships with DGDA compliance tracking
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <HierarchySearch
          query={localSearchQuery}
          onChange={setLocalSearchQuery}
          placeholder="Search customers by name or ID..."
        />
        
        <HierarchyFilter
          filters={localFilters}
          filterOptions={{
            tiers: Object.values(CustomerTier),
            complianceStatuses: ['compliant', 'pending', 'non_compliant', 'expired'],
            territories: [],
            performanceLevels: ['high', 'medium', 'low'],
          }}
          onFiltersChange={setLocalFilters}
          onReset={() => setLocalFilters({})}
        />
      </Box>

      {/* Hierarchy Tree */}
      <motion.div
        variants={motionVariants.container}
        initial="hidden"
        animate="visible"
      >
        {filteredHierarchy.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No customers found matching the current filters.
          </Alert>
        ) : (
          filteredHierarchy.map((rootNode) => (
            <HierarchyNodeComponent
              key={rootNode.id}
              node={rootNode}
              isSelected={selectedCustomerId === rootNode.id}
              isExpanded={expandedNodes.has(rootNode.id)}
              depth={0}
              viewMode={viewMode}
              showOptions={showOptions}
              enableDragDrop={enableDragDrop}
              searchQuery={localSearchQuery}
              onSelect={onNodeSelect}
              onToggle={onNodeToggle}
              onReassign={onCustomerReassign}
              onTerritoryReassign={onTerritoryReassign}
              onComplianceAction={onComplianceAction}
              onPerformanceDrillDown={onPerformanceDrillDown}
              onViewAuditTrail={onViewAuditTrail}
            />
          ))
        )}
      </motion.div>
    </Box>
  );
};

export default CustomerHierarchyTree;