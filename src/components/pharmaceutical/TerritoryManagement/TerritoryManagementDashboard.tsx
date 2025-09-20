/**
 * Territory Management Dashboard - PharmaFlow Frontend
 * 
 * Main dashboard component for comprehensive territory management system
 * with Bangladesh pharmaceutical market optimization and DGDA compliance.
 * 
 * Constitutional Compliance:
 * ✅ Pharmaceutical industry first - Territory-specific pharmaceutical workflows
 * ✅ Mobile-first design - Responsive grid layout with touch optimization
 * ✅ DGDA compliance - Regulatory territory compliance tracking
 * ✅ Bangladesh performance - Bangladesh-specific territory management
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Territory,
  TerritoryDashboardProps,
  TerritoryFilters,
  TerritoryStatus,
  ComplianceStatus
} from './types';

// Component imports
import { TerritoryMap } from './TerritoryMap';
// import { TerritoryPerformanceCards } from './TerritoryPerformanceCards';
// import { TerritoryAssignments } from './TerritoryAssignments';
// import { TerritorySearch } from './TerritorySearch';
// import { TerritoryFilters as TerritoryFiltersComponent } from './TerritoryFilters';
// import { TerritoryActions } from './TerritoryActions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`territory-tabpanel-${index}`}
      aria-labelledby={`territory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const TerritoryManagementDashboard: React.FC<TerritoryDashboardProps> = ({
  className = '',
  selectedTerritoryId,
  onTerritorySelect,
  showPerformanceMetrics = true,
  showMap = true,
  showAssignments = true
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [filters, setFilters] = useState<TerritoryFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration (will be replaced with API calls)
  const mockTerritories: Territory[] = useMemo(() => [
    {
      id: 'dhaka-metro',
      name: 'Dhaka Metropolitan',
      code: 'DHK-METRO',
      type: 'CITY' as any,
      status: TerritoryStatus.ACTIVE,
      description: 'Primary metropolitan territory covering Dhaka city',
      hierarchyLevel: 2,
      territoryPath: ['Bangladesh', 'Dhaka Division', 'Dhaka Metropolitan'],
      boundaries: {
        coordinates: [[90.3563, 23.8041], [90.4326, 23.8041], [90.4326, 23.8759], [90.3563, 23.8759]],
        boundaryType: 'ADMINISTRATIVE' as any,
        administrativeBoundary: {
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Dhaka Metro'
        }
      },
      centerCoordinates: [90.3945, 23.8400],
      areaSize: 306.38,
      assignments: [],
      performance: {
        period: '2024-Q4',
        revenue: 12500000,
        growth: 15.3,
        customerAcquisition: 45,
        customerRetention: 92.5,
        marketShare: 23.8,
        visitFrequency: 2.3,
        conversionRate: 18.5,
        averageOrderValue: 125000,
        performanceScore: 88.5,
        rank: 1,
        benchmarkComparison: 105.2
      },
      quotas: [],
      analytics: {
        customerDistribution: [],
        salesTrends: [],
        competitiveAnalysis: [],
        marketOpportunities: [],
        riskFactors: []
      },
      customerCount: 245,
      activeCustomers: 228,
      customerCapacity: 300,
      dgdaCompliance: {
        status: ComplianceStatus.COMPLIANT,
        score: 98.2,
        lastAuditDate: '2024-01-15',
        nextAuditDate: '2024-07-15',
        certificationLevel: 'A-Grade',
        violations: [],
        complianceOfficer: 'Dr. Rahman Ahmed'
      },
      regulatoryZone: 'Zone-A',
      inspectionHistory: [],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      createdBy: 'admin',
      isActive: true
    },
    {
      id: 'chittagong',
      name: 'Chittagong Commercial',
      code: 'CTG-COMM',
      type: 'CITY' as any,
      status: TerritoryStatus.ACTIVE,
      description: 'Commercial territory covering Chittagong port city',
      hierarchyLevel: 2,
      territoryPath: ['Bangladesh', 'Chittagong Division', 'Chittagong Commercial'],
      boundaries: {
        coordinates: [[91.7832, 22.3151], [91.8901, 22.3151], [91.8901, 22.3860], [91.7832, 22.3860]],
        boundaryType: 'ADMINISTRATIVE' as any,
        administrativeBoundary: {
          division: 'Chittagong',
          district: 'Chittagong',
          upazila: 'Chittagong Metro'
        }
      },
      centerCoordinates: [91.8367, 22.3505],
      areaSize: 168.07,
      assignments: [],
      performance: {
        period: '2024-Q4',
        revenue: 8900000,
        growth: 12.8,
        customerAcquisition: 32,
        customerRetention: 89.3,
        marketShare: 19.4,
        visitFrequency: 2.1,
        conversionRate: 16.8,
        averageOrderValue: 108000,
        performanceScore: 82.3,
        rank: 2,
        benchmarkComparison: 98.7
      },
      quotas: [],
      analytics: {
        customerDistribution: [],
        salesTrends: [],
        competitiveAnalysis: [],
        marketOpportunities: [],
        riskFactors: []
      },
      customerCount: 186,
      activeCustomers: 168,
      customerCapacity: 250,
      dgdaCompliance: {
        status: ComplianceStatus.COMPLIANT,
        score: 96.8,
        lastAuditDate: '2024-02-10',
        nextAuditDate: '2024-08-10',
        certificationLevel: 'A-Grade',
        violations: [],
        complianceOfficer: 'Dr. Fatima Khan'
      },
      regulatoryZone: 'Zone-B',
      inspectionHistory: [],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
      createdBy: 'admin',
      isActive: true
    }
  ], []);

  // Effects
  useEffect(() => {
    // Simulate API call
    const loadTerritories = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTerritories(mockTerritories);
        
        // Set initially selected territory
        if (selectedTerritoryId) {
          const territory = mockTerritories.find(t => t.id === selectedTerritoryId);
          if (territory) {
            setSelectedTerritory(territory);
          }
        }
      } catch (err) {
        setError('Failed to load territories');
      } finally {
        setLoading(false);
      }
    };

    loadTerritories();
  }, [selectedTerritoryId, mockTerritories]);

  // Remove unused variables to fix TypeScript warnings
  const handleTerritorySelect = (territory: Territory) => {
    setSelectedTerritory(territory);
    onTerritorySelect?.(territory);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (newFilters: TerritoryFilters) => {
    setFilters(newFilters);
    // Apply filters to territories
    // This would be handled by API in real implementation
  };
  
  // Suppress unused warnings for now (will be used in future todos)
  void filters;
  void handleTerritorySelect;
  void handleFilterChange;

  // Computed values
  const territoryStats = useMemo(() => {
    if (!territories.length) return null;

    const totalTerritories = territories.length;
    const activeTerritories = territories.filter(t => t.status === TerritoryStatus.ACTIVE).length;
    const assignedTerritories = territories.filter(t => t.assignments.length > 0).length;
    const compliantTerritories = territories.filter(t => 
      t.dgdaCompliance.status === ComplianceStatus.COMPLIANT
    ).length;
    const totalRevenue = territories.reduce((sum, t) => sum + t.performance.revenue, 0);
    const totalCustomers = territories.reduce((sum, t) => sum + t.customerCount, 0);

    return {
      totalTerritories,
      activeTerritories,
      assignedTerritories,
      compliantTerritories,
      totalRevenue,
      totalCustomers,
      averagePerformance: territories.reduce((sum, t) => sum + t.performance.performanceScore, 0) / totalTerritories
    };
  }, [territories]);

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="xl" className={className}>
        <Box sx={{ py: 3 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Skeleton variant="rectangular" height={120} />
              </Box>
            ))}
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="xl" className={className}>
        <Box sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Territory Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Comprehensive Bangladesh pharmaceutical territory management with DGDA compliance
          </Typography>
          
          {/* Key Statistics */}
          {territoryStats && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {territoryStats.totalTerritories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Territories
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {territoryStats.activeTerritories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="info.main" fontWeight="bold">
                    {territoryStats.assignedTerritories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {territoryStats.compliantTerritories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DGDA Compliant
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {new Intl.NumberFormat('en-BD', {
                      style: 'currency',
                      currency: 'BDT',
                      notation: 'compact'
                    }).format(territoryStats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" color="secondary.main" fontWeight="bold">
                    {territoryStats.totalCustomers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Selected Territory Info */}
        {selectedTerritory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Chip
                  label={selectedTerritory.dgdaCompliance.status}
                  color={selectedTerritory.dgdaCompliance.status === ComplianceStatus.COMPLIANT ? 'success' : 'warning'}
                  size="small"
                />
              }
            >
              <strong>{selectedTerritory.name}</strong> ({selectedTerritory.code}) - 
              {selectedTerritory.customerCount} customers, {selectedTerritory.performance.performanceScore.toFixed(1)}% performance score
            </Alert>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="territory management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            {showMap && <Tab label="Territory Map" />}
            {showPerformanceMetrics && <Tab label="Performance" />}
            {showAssignments && <Tab label="Assignments" />}
            <Tab label="Analytics" />
            <Tab label="Compliance" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '2 1 600px' }}>
                  {/* Territory List/Grid - Placeholder */}
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      textAlign: 'center',
                      minHeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Territory List Component
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interactive territory list with search and filtering capabilities
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      To be implemented in subsequent todos
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ flex: '1 1 300px' }}>
                  {/* Territory Actions - Placeholder */}
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      textAlign: 'center',
                      minHeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Territory Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create, edit, and manage territory operations
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      To be implemented in subsequent todos
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* Territory Map Tab */}
            {showMap && (
              <TabPanel value={activeTab} index={1}>
                <TerritoryMap
                  territories={territories}
                  selectedTerritoryId={selectedTerritory?.id}
                  onTerritorySelect={handleTerritorySelect}
                  showCustomers={true}
                  showPerformance={true}
                  showCompliance={true}
                />
              </TabPanel>
            )}

            {/* Performance Tab */}
            {showPerformanceMetrics && (
              <TabPanel value={activeTab} index={showMap ? 2 : 1}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    minHeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Territory Performance Widgets
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Performance cards, analytics, and KPI panels for territory insights
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    To be implemented in Todo 3
                  </Typography>
                </Box>
              </TabPanel>
            )}

            {/* Assignments Tab */}
            {showAssignments && (
              <TabPanel value={activeTab} index={(showMap ? 1 : 0) + (showPerformanceMetrics ? 1 : 0) + 1}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    minHeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Territory Assignments Component
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sales representative assignment interface with role management
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    To be implemented in Todo 4
                  </Typography>
                </Box>
              </TabPanel>
            )}

            {/* Analytics Tab */}
            <TabPanel value={activeTab} index={(showMap ? 1 : 0) + (showPerformanceMetrics ? 1 : 0) + (showAssignments ? 1 : 0) + 1}>
              <Box
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  minHeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Territory Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Advanced analytics dashboard with competitive analysis and market insights
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  To be implemented in future iterations
                </Typography>
              </Box>
            </TabPanel>

            {/* Compliance Tab */}
            <TabPanel value={activeTab} index={(showMap ? 1 : 0) + (showPerformanceMetrics ? 1 : 0) + (showAssignments ? 1 : 0) + 2}>
              <Box
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  minHeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  DGDA Compliance Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Comprehensive DGDA compliance tracking and regulatory management
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  To be implemented in future iterations
                </Typography>
              </Box>
            </TabPanel>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default TerritoryManagementDashboard;