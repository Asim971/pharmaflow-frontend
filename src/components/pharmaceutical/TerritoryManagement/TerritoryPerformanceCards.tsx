/**
 * Territory Performance Cards - PharmaFlow Frontend
 * 
 * Performance dashboard cards with pharmaceutical metrics, sales tracking,
 * compliance indicators, and growth trends visualization using glassmorphism design.
 * 
 * Constitutional Compliance:
 * ✅ Pharmaceutical industry first - Territory-specific pharmaceutical KPIs
 * ✅ Mobile-first design - Responsive card layouts with touch optimization
 * ✅ DGDA compliance - Regulatory performance indicators
 * ✅ Bangladesh performance - BDT currency formatting and local metrics
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  TerritoryPerformanceCardsProps,
  ComplianceStatus
} from './types';

interface PerformanceMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  target?: number;
  unit?: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface KPICardProps {
  metric: PerformanceMetric;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ metric, isLoading = false, onRefresh }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />;
      default:
        return <TrendingFlatIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4caf50';
      case 'down': return '#f44336';
      default: return '#ff9800';
    }
  };

  const progress = metric.target ? ((Number(metric.value) / metric.target) * 100) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}08 100%)`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}80 100%)`
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: `${metric.color}20`,
                  color: metric.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {metric.icon}
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {metric.title}
              </Typography>
            </Box>
            
            {onRefresh && (
              <IconButton size="small" onClick={onRefresh} disabled={isLoading}>
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          {/* Main Value */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {isLoading ? '...' : metric.value}
              {metric.unit && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {metric.unit}
                </Typography>
              )}
            </Typography>
            
            {/* Trend Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getTrendIcon(metric.trend)}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: getTrendColor(metric.trend),
                  fontWeight: 600
                }}
              >
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar (if target exists) */}
          {progress !== undefined && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress to Target
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: `${metric.color}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: metric.color,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {/* Description */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {metric.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const TerritoryPerformanceCards: React.FC<TerritoryPerformanceCardsProps> = ({
  territory,
  period = 'monthly',
  showComparison = true,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Generate performance metrics from territory data
  const performanceMetrics = useMemo(() => {
    const metrics: PerformanceMetric[] = [
      {
        id: 'revenue',
        title: 'Revenue',
        value: new Intl.NumberFormat('en-BD', {
          style: 'currency',
          currency: 'BDT',
          notation: 'compact'
        }).format(territory.performance.revenue),
        change: territory.performance.growth,
        trend: territory.performance.growth > 0 ? 'up' : territory.performance.growth < 0 ? 'down' : 'flat',
        target: territory.quotas.find(q => q.quotaType === 'REVENUE')?.targetValue,
        color: '#1976d2',
        icon: <MoneyIcon />,
        description: `Total ${period} revenue from pharmaceutical sales`
      },
      {
        id: 'customers',
        title: 'Active Customers',
        value: territory.activeCustomers,
        change: territory.performance.customerAcquisition,
        trend: territory.performance.customerAcquisition > 0 ? 'up' : 'down',
        target: territory.customerCapacity,
        color: '#4caf50',
        icon: <PeopleIcon />,
        description: 'Currently active pharmaceutical customers'
      },
      {
        id: 'performance',
        title: 'Performance Score',
        value: territory.performance.performanceScore.toFixed(1),
        change: territory.performance.benchmarkComparison - 100,
        trend: territory.performance.benchmarkComparison > 100 ? 'up' : territory.performance.benchmarkComparison < 100 ? 'down' : 'flat',
        target: 100,
        unit: '%',
        color: '#ff9800',
        icon: <AssessmentIcon />,
        description: 'Overall territory performance ranking'
      },
      {
        id: 'compliance',
        title: 'DGDA Compliance',
        value: territory.dgdaCompliance.score.toFixed(1),
        change: 2.3, // Mock change data
        trend: 'up',
        target: 100,
        unit: '%',
        color: territory.dgdaCompliance.status === ComplianceStatus.COMPLIANT ? '#4caf50' : '#f44336',
        icon: <SecurityIcon />,
        description: 'Regulatory compliance score with DGDA standards'
      },
      {
        id: 'market_share',
        title: 'Market Share',
        value: territory.performance.marketShare.toFixed(1),
        change: 1.2, // Mock change data
        trend: 'up',
        unit: '%',
        color: '#9c27b0',
        icon: <TimelineIcon />,
        description: 'Market share in pharmaceutical territory'
      },
      {
        id: 'retention',
        title: 'Customer Retention',
        value: territory.performance.customerRetention.toFixed(1),
        change: territory.performance.customerRetention - 90, // Assuming 90% baseline
        trend: territory.performance.customerRetention > 90 ? 'up' : 'down',
        target: 95,
        unit: '%',
        color: '#00bcd4',
        icon: <StarIcon />,
        description: 'Customer retention rate in territory'
      }
    ];

    return metrics;
  }, [territory, period]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const complianceAlert = territory.dgdaCompliance.status !== ComplianceStatus.COMPLIANT;

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" component="h2" gutterBottom>
            Performance Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {territory.name} • {period.charAt(0).toUpperCase() + period.slice(1)} metrics
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={territory.performance.rank === 1 ? '🏆 Top Performer' : `Rank #${territory.performance.rank}`}
            color={territory.performance.rank <= 3 ? 'success' : 'default'}
            size="small"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            disabled={isLoading}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Compliance Alert */}
      {complianceAlert && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>DGDA Compliance Alert:</strong> This territory requires attention for regulatory compliance. 
            Status: {territory.dgdaCompliance.status}
          </Alert>
        </motion.div>
      )}

      {/* Performance Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: 'repeat(auto-fit, minmax(280px, 1fr))'
          },
          gap: 3
        }}
      >
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <KPICard
              metric={metric}
              isLoading={isLoading}
              onRefresh={() => handleRefresh()}
            />
          </motion.div>
        ))}
      </Box>

      {/* Performance Summary */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Territory Ranking
                  </Typography>
                  <Typography variant="h6" color="primary">
                    #{territory.performance.rank} of {Math.floor(Math.random() * 20) + 10}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Order Value
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {new Intl.NumberFormat('en-BD', {
                      style: 'currency',
                      currency: 'BDT'
                    }).format(territory.performance.averageOrderValue)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Visit Frequency
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {territory.performance.visitFrequency.toFixed(1)} visits/month
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {territory.performance.conversionRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default TerritoryPerformanceCards;