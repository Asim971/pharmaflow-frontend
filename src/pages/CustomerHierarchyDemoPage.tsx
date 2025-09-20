/**
 * Customer Hierarchy Demo Page
 * Demonstrates the Customer Hierarchy Tree Component
 */

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
} from '@mui/material';
import {
  AccountTree as HierarchyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { CustomerHierarchyTree } from '../components/pharmaceutical/CustomerHierarchy';
import { HierarchyNode } from '../components/pharmaceutical/CustomerHierarchy/types';
import { Customer } from '../types/customer';

// Mock data for demonstration
const createMockCustomer = (
  id: string,
  name: string,
  type: string,
  complianceStatus: 'compliant' | 'pending' | 'non_compliant' | 'expired' = 'compliant'
): Customer => ({
  id,
  code: `C${id}`,
  name,
  type: type as any,
  status: 'active',
  tradeLicense: `TL${id}`,
  hierarchy: {
    id: `h${id}`,
    parentId: undefined,
    children: [],
    depth: 0,
    path: [id],
  },
  contacts: [],
  addresses: [],
  dgdaCompliance: {
    status: complianceStatus === 'compliant' ? 'valid' : 'expired',
    lastAuditDate: new Date('2024-01-15'),
    nextAuditDue: new Date('2025-01-15'),
    complianceScore: complianceStatus === 'compliant' ? 95 : 65,
    violations: [],
    documents: [],
  },
  metrics: {
    monthlyPurchaseVolume: 150000,
    totalOrders: 150,
    averageOrderValue: 16667,
    lastOrderDate: new Date('2024-09-15'),
    customerLifetimeValue: 5000000,
    paymentTerms: 30,
    creditLimit: 1000000,
    currentOutstanding: 250000,
    riskScore: 25,
  },
  tags: ['pharmaceutical', 'priority'],
  segment: 'A',
  createdAt: new Date('2020-03-01'),
  updatedAt: new Date('2024-09-15'),
  createdBy: 'system',
  updatedBy: 'system',
  companyId: 'pharmaflow-inc',
});

const mockHierarchyData: HierarchyNode[] = [
  {
    id: '1',
    customer: createMockCustomer('1', 'Beximco Pharmaceuticals', 'pharmaceutical_company'),
    children: [
      {
        id: '2',
        customer: createMockCustomer('2', 'Square Pharma Distribution', 'national_distributor'),
        children: [
          {
            id: '3',
            customer: createMockCustomer('3', 'Dhaka Medical Store', 'independent_pharmacy', 'pending'),
            children: [],
            level: 2,
            territory: {
              primaryTerritoryId: 'dhaka-1',
              territoryName: 'Dhaka Central',
              coverageArea: 'Dhanmondi, Gulshan, Banani',
            },
            compliance: {
              status: 'pending',
              lastAuditDate: new Date('2024-06-15'),
              documents: ['license.pdf', 'permit.pdf'],
            },
            performance: {
              salesVolume: 850000,
              growthRate: 12.5,
              orderFrequency: 8,
              lastOrderDate: new Date('2024-09-10'),
            },
          },
          {
            id: '4',
            customer: createMockCustomer('4', 'Chittagong Pharmacy Chain', 'pharmacy_chain'),
            children: [],
            level: 2,
            territory: {
              primaryTerritoryId: 'chittagong-1',
              territoryName: 'Chittagong City',
              coverageArea: 'Agrabad, Nasirabad, GEC',
            },
            compliance: {
              status: 'compliant',
              lastAuditDate: new Date('2024-03-20'),
              documents: ['license.pdf', 'permit.pdf', 'inspection.pdf'],
            },
            performance: {
              salesVolume: 1200000,
              growthRate: 18.3,
              orderFrequency: 12,
              lastOrderDate: new Date('2024-09-18'),
            },
          },
        ],
        level: 1,
        territory: {
          primaryTerritoryId: 'dhaka-region',
          territoryName: 'Dhaka Region',
          coverageArea: 'Greater Dhaka Area',
        },
        compliance: {
          status: 'compliant',
          lastAuditDate: new Date('2024-02-10'),
          documents: ['license.pdf', 'permit.pdf', 'audit.pdf'],
        },
        performance: {
          salesVolume: 2500000,
          growthRate: 15.2,
          orderFrequency: 20,
          lastOrderDate: new Date('2024-09-19'),
        },
      },
    ],
    level: 0,
    territory: {
      primaryTerritoryId: 'national',
      territoryName: 'National Coverage',
      coverageArea: 'All Bangladesh Divisions',
    },
    compliance: {
      status: 'compliant',
      lastAuditDate: new Date('2024-01-15'),
      documents: ['manufacturing.pdf', 'license.pdf', 'gmp.pdf'],
    },
    performance: {
      salesVolume: 15000000,
      growthRate: 22.1,
      orderFrequency: 50,
      lastOrderDate: new Date('2024-09-20'),
    },
  },
  {
    id: '5',
    customer: createMockCustomer('5', 'Popular Pharmaceuticals', 'pharmaceutical_company'),
    children: [],
    level: 0,
    territory: {
      primaryTerritoryId: 'national-2',
      territoryName: 'National Coverage',
      coverageArea: 'All Bangladesh Divisions',
    },
    compliance: {
      status: 'expired',
      lastAuditDate: new Date('2023-08-10'),
      expirationDate: new Date('2024-08-10'),
      documents: ['license.pdf'],
    },
    performance: {
      salesVolume: 8500000,
      growthRate: -5.2,
      orderFrequency: 25,
      lastOrderDate: new Date('2024-08-15'),
    },
  },
];

export const CustomerHierarchyDemoPage = () => {
  const [hierarchyData] = useState<HierarchyNode[]>(mockHierarchyData);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2']));
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'analytics'>('detailed');
  const [showTerritory, setShowTerritory] = useState(true);
  const [showCompliance, setShowCompliance] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);

  const handleNodeSelect = (node: HierarchyNode) => {
    setSelectedCustomerId(node.id);
    console.log('Selected customer:', node.customer.name);
  };

  const handleNodeToggle = (nodeId: string, expanded: boolean) => {
    const newExpanded = new Set(expandedNodes);
    if (expanded) {
      newExpanded.add(nodeId);
    } else {
      newExpanded.delete(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleComplianceAction = (customerId: string, action: string) => {
    console.log(`Compliance action '${action}' for customer ${customerId}`);
  };

  const handleViewAuditTrail = (customerId: string) => {
    console.log(`View audit trail for customer ${customerId}`);
  };

  const handlePerformanceDrillDown = (customerId: string) => {
    console.log(`Performance drill-down for customer ${customerId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <HierarchyIcon fontSize="large" />
          Customer Hierarchy Tree Demo
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Interactive pharmaceutical customer hierarchy with DGDA compliance and territory management
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Controls Panel */}
        <Box sx={{ minWidth: 300, flex: '0 0 auto' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Display Options
            </Typography>
            
            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showTerritory}
                    onChange={(e) => setShowTerritory(e.target.checked)}
                  />
                }
                label="Show Territory"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showCompliance}
                    onChange={(e) => setShowCompliance(e.target.checked)}
                  />
                }
                label="Show Compliance"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showPerformance}
                    onChange={(e) => setShowPerformance(e.target.checked)}
                  />
                }
                label="Show Performance"
              />
            </FormGroup>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                View Mode
              </Typography>
              <Button
                variant={viewMode === 'compact' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('compact')}
                sx={{ mr: 1, mb: 1 }}
              >
                Compact
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('detailed')}
                sx={{ mr: 1, mb: 1 }}
              >
                Detailed
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('analytics')}
                sx={{ mb: 1 }}
              >
                Analytics
              </Button>
            </Box>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setExpandedNodes(new Set(['1', '2']));
                setSelectedCustomerId(undefined);
              }}
              fullWidth
            >
              Reset View
            </Button>

            {selectedCustomerId && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="white">
                  Selected Customer: {selectedCustomerId}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Hierarchy Tree */}
        <Box sx={{ flex: '1 1 600px' }}>
          <Paper sx={{ height: '80vh', overflow: 'auto' }}>
            <CustomerHierarchyTree
              hierarchyData={hierarchyData}
              selectedCustomerId={selectedCustomerId}
              expandedNodes={expandedNodes}
              viewMode={viewMode}
              showTerritory={showTerritory}
              showCompliance={showCompliance}
              showPerformance={showPerformance}
              enableDragDrop={false}
              onNodeSelect={handleNodeSelect}
              onNodeToggle={handleNodeToggle}
              onComplianceAction={handleComplianceAction}
              onViewAuditTrail={handleViewAuditTrail}
              onPerformanceDrillDown={handlePerformanceDrillDown}
            />
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};