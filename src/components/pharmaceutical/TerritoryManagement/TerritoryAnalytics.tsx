/**
 * Territory Analytics Component - PharmaFlow Frontend
 * 
 * Advanced analytics dashboard with competitive analysis, market insights,
 * and pharmaceutical territory intelligence using modern visualization.
 * 
 * Constitutional Compliance:
 * ✅ Pharmaceutical industry first - Territory-specific pharmaceutical analytics
 * ✅ Mobile-first design - Responsive analytics layout with touch interactions
 * ✅ DGDA compliance - Regulatory analytics and compliance tracking
 * ✅ Bangladesh performance - Local market analysis and optimization
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Territory,
  TerritoryAnalyticsData
} from './types';

interface TerritoryAnalyticsProps {
  territory: Territory;
  period?: 'monthly' | 'quarterly' | 'yearly';
  className?: string;
}

interface AnalyticsTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function AnalyticsTabPanel({ children, value, index }: AnalyticsTabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerSegmentChart: React.FC<{ data: any[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Distribution
      </Typography>
      {data.map((segment, index) => {
        const percentage = (segment.count / total) * 100;
        return (
          <motion.div
            key={segment.segment}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{segment.segment}</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {segment.count} ({percentage.toFixed(1)}%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    flex: 1,
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, 
                        ${index % 3 === 0 ? '#1976d2' : index % 3 === 1 ? '#4caf50' : '#ff9800'} 0%, 
                        ${index % 3 === 0 ? '#42a5f5' : index % 3 === 1 ? '#66bb6a' : '#ffb74d'} 100%)`
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                  ৳{(segment.revenue / 1000000).toFixed(1)}M
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
};

const SalesTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sales Trend Analysis
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', height: 200, mb: 2 }}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 150;
          return (
            <motion.div
              key={item.period}
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              style={{
                flex: 1,
                background: `linear-gradient(0deg, #1976d2 0%, #42a5f5 100%)`,
                borderRadius: '4px 4px 0 0',
                minHeight: 20,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              <Box sx={{ position: 'absolute', bottom: -25, color: 'text.secondary', fontSize: 10 }}>
                {item.period}
              </Box>
              {item.trend === 'UP' && <TrendingUpIcon sx={{ fontSize: 12, color: '#4caf50' }} />}
            </motion.div>
          );
        })}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Monthly sales performance with trend indicators
      </Typography>
    </Box>
  );
};

const CompetitiveAnalysisTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Competitive Landscape
      </Typography>
      {data.map((competitor, index) => (
        <motion.div
          key={competitor.competitor}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {competitor.competitor}
                </Typography>
                <Chip
                  label={`${competitor.marketShare.toFixed(1)}% share`}
                  size="small"
                  color={competitor.marketShare > 20 ? 'error' : competitor.marketShare > 10 ? 'warning' : 'success'}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {competitor.keyProducts.slice(0, 3).map((product: string) => (
                  <Chip key={product} label={product} size="small" variant="outlined" />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="success.main">
                    Strengths:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {competitor.strengths.slice(0, 2).join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="error.main">
                    Threats:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {competitor.threats.slice(0, 2).join(', ')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

const OpportunitiesPanel: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Market Opportunities
      </Typography>
      {data.map((opportunity, index) => (
        <motion.div
          key={opportunity.opportunityType}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            sx={{ 
              mb: 2, 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                  {opportunity.opportunityType}
                </Typography>
                <Chip
                  label={`৳${(opportunity.estimatedValue / 1000000).toFixed(1)}M`}
                  size="small"
                  color="success"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {opportunity.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${opportunity.probability}% probability`}
                    size="small"
                    variant="outlined"
                    color={opportunity.probability > 70 ? 'success' : opportunity.probability > 40 ? 'warning' : 'default'}
                  />
                  <Chip
                    label={opportunity.timeframe}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="primary">
                  {opportunity.requiredActions.length} actions required
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

const RiskAnalysis: React.FC<{ data: any[] }> = ({ data }) => {
  const criticalRisks = data.filter(risk => risk.impact === 'HIGH' && risk.probability === 'HIGH');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Risk Assessment
      </Typography>
      
      {criticalRisks.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{criticalRisks.length} Critical Risk(s) Identified</strong>
          <br />
          Immediate attention required for high-impact, high-probability risks.
        </Alert>
      )}
      
      {data.map((risk, index) => (
        <motion.div
          key={risk.riskType}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            sx={{ 
              mb: 2,
              border: '1px solid',
              borderColor: risk.impact === 'HIGH' ? 'error.light' : risk.impact === 'MEDIUM' ? 'warning.light' : 'success.light'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {risk.riskType}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${risk.impact} Impact`}
                    size="small"
                    color={risk.impact === 'HIGH' ? 'error' : risk.impact === 'MEDIUM' ? 'warning' : 'success'}
                  />
                  <Chip
                    label={`${risk.probability} Probability`}
                    size="small"
                    variant="outlined"
                    color={risk.probability === 'HIGH' ? 'error' : risk.probability === 'MEDIUM' ? 'warning' : 'success'}
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {risk.description}
              </Typography>
              
              <Typography variant="caption" color="primary">
                Mitigation strategies: {risk.mitigation.join(', ')}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

export const TerritoryAnalytics: React.FC<TerritoryAnalyticsProps> = ({
  territory,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading] = useState(false);

  // Mock analytics data (in real implementation, this would come from API)
  const analyticsData: TerritoryAnalyticsData = useMemo(() => ({
    customerDistribution: [
      { segment: 'Hospitals', count: 45, revenue: 8500000, growth: 12.5, potential: 15 },
      { segment: 'Pharmacies', count: 120, revenue: 6200000, growth: 8.3, potential: 25 },
      { segment: 'Clinics', count: 80, revenue: 3100000, growth: 15.2, potential: 20 },
      { segment: 'Distributors', count: 12, revenue: 4200000, growth: 6.8, potential: 18 }
    ],
    salesTrends: [
      { period: 'Jan', value: 1850000, trend: 'UP', changePercent: 5.2 },
      { period: 'Feb', value: 2100000, trend: 'UP', changePercent: 13.5 },
      { period: 'Mar', value: 1950000, trend: 'DOWN', changePercent: -7.1 },
      { period: 'Apr', value: 2250000, trend: 'UP', changePercent: 15.4 },
      { period: 'May', value: 2400000, trend: 'UP', changePercent: 6.7 },
      { period: 'Jun', value: 2180000, trend: 'DOWN', changePercent: -9.2 }
    ],
    competitiveAnalysis: [
      {
        competitor: 'Square Pharmaceuticals',
        marketShare: 28.5,
        keyProducts: ['Napa', 'Seclo', 'Fexo'],
        strengths: ['Strong brand recognition', 'Wide distribution network', 'R&D capabilities'],
        threats: ['Aggressive pricing', 'New product launches', 'Market expansion']
      },
      {
        competitor: 'Beximco Pharmaceuticals',
        marketShare: 18.2,
        keyProducts: ['Bextrum', 'Monas', 'Sergel'],
        strengths: ['Export capabilities', 'Manufacturing efficiency', 'Cost leadership'],
        threats: ['Price competition', 'Generic alternatives', 'Regulatory changes']
      },
      {
        competitor: 'Incepta Pharmaceuticals',
        marketShare: 12.8,
        keyProducts: ['Ace', 'Amdocal', 'Losectil'],
        strengths: ['Quality focus', 'Innovation', 'Customer relationships'],
        threats: ['Market penetration', 'Product differentiation', 'Digital marketing']
      }
    ],
    marketOpportunities: [
      {
        opportunityType: 'Digital Health Integration',
        description: 'Opportunity to integrate with digital health platforms and telemedicine services',
        estimatedValue: 2500000,
        probability: 75,
        timeframe: '6-12 months',
        requiredActions: ['Technology partnership', 'Platform integration', 'Staff training']
      },
      {
        opportunityType: 'Rural Market Expansion',
        description: 'Untapped rural areas with growing healthcare awareness and purchasing power',
        estimatedValue: 1800000,
        probability: 65,
        timeframe: '9-18 months',
        requiredActions: ['Market research', 'Distribution setup', 'Local partnerships']
      },
      {
        opportunityType: 'Preventive Care Products',
        description: 'Growing demand for preventive healthcare and wellness products',
        estimatedValue: 3200000,
        probability: 80,
        timeframe: '3-9 months',
        requiredActions: ['Product portfolio expansion', 'Marketing strategy', 'Healthcare provider education']
      }
    ],
    riskFactors: [
      {
        riskType: 'Regulatory Changes',
        description: 'Potential changes in DGDA regulations could impact product approvals and market access',
        impact: 'HIGH',
        probability: 'MEDIUM',
        mitigation: ['Regulatory monitoring', 'Compliance team strengthening', 'Government relations']
      },
      {
        riskType: 'Supply Chain Disruption',
        description: 'Raw material shortages or logistics disruptions could affect product availability',
        impact: 'MEDIUM',
        probability: 'HIGH',
        mitigation: ['Diversified suppliers', 'Strategic inventory', 'Alternative logistics']
      },
      {
        riskType: 'Economic Downturn',
        description: 'Economic challenges could reduce healthcare spending and affect purchasing power',
        impact: 'HIGH',
        probability: 'LOW',
        mitigation: ['Flexible pricing', 'Insurance partnerships', 'Government programs']
      }
    ]
  }), []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box className={className} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Territory Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Advanced insights and competitive intelligence for {territory.name}
        </Typography>
      </Box>

      {/* Analytics Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="territory analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<BusinessIcon />} label="Customers" />
          <Tab icon={<TrendingUpIcon />} label="Sales Trends" />
          <Tab icon={<AssessmentIcon />} label="Competition" />
          <Tab icon={<InsightsIcon />} label="Opportunities" />
          <Tab icon={<WarningIcon />} label="Risk Analysis" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <AnalyticsTabPanel value={activeTab} index={0}>
        <CustomerSegmentChart data={analyticsData.customerDistribution} />
      </AnalyticsTabPanel>

      <AnalyticsTabPanel value={activeTab} index={1}>
        <SalesTrendChart data={analyticsData.salesTrends} />
      </AnalyticsTabPanel>

      <AnalyticsTabPanel value={activeTab} index={2}>
        <CompetitiveAnalysisTable data={analyticsData.competitiveAnalysis} />
      </AnalyticsTabPanel>

      <AnalyticsTabPanel value={activeTab} index={3}>
        <OpportunitiesPanel data={analyticsData.marketOpportunities} />
      </AnalyticsTabPanel>

      <AnalyticsTabPanel value={activeTab} index={4}>
        <RiskAnalysis data={analyticsData.riskFactors} />
      </AnalyticsTabPanel>
    </Box>
  );
};

export default TerritoryAnalytics;