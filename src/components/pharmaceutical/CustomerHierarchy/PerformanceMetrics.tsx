/**
 * Performance Metrics Component
 * Shows customer performance indicators
 */

import {
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { PerformanceMetricsProps } from './types';

export const PerformanceMetrics = ({
  performance,
  format = 'compact',
  size = 'medium',
  onClick,
}: PerformanceMetricsProps) => {
  const { salesVolume, growthRate, orderFrequency, lastOrderDate } = performance;

  const getTrendIcon = (rate: number) => {
    if (rate > 5) return <TrendingUpIcon />;
    if (rate < -5) return <TrendingDownIcon />;
    return <TrendingFlatIcon />;
  };

  const getTrendColor = (rate: number) => {
    if (rate > 5) return '#4caf50';
    if (rate < -5) return '#f44336';
    return '#ff9800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (format === 'detailed') {
    return (
      <Box 
        sx={{ 
          p: 2, 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      >
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            Sales Volume: {formatCurrency(salesVolume)}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Growth Rate: {growthRate.toFixed(1)}%
            {getTrendIcon(growthRate)}
          </Typography>
          <Typography variant="body2">
            Order Frequency: {orderFrequency} orders/month
          </Typography>
          {lastOrderDate && (
            <Typography variant="caption" color="text.secondary">
              Last Order: {lastOrderDate.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 250 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Performance Summary
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Sales: {formatCurrency(salesVolume)}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Growth: {growthRate.toFixed(1)}%
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Orders: {orderFrequency}/month
      </Typography>
      {lastOrderDate && (
        <Typography variant="caption" color="text.secondary">
          Last: {lastOrderDate.toLocaleDateString()}
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Chip
          icon={getTrendIcon(growthRate)}
          label={`${growthRate.toFixed(1)}%`}
          size={size === 'large' ? 'medium' : 'small'}
          onClick={onClick}
          sx={{
            backgroundColor: `${getTrendColor(growthRate)}22`,
            color: getTrendColor(growthRate),
            border: `1px solid ${getTrendColor(growthRate)}44`,
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              backgroundColor: `${getTrendColor(growthRate)}33`,
              transform: 'translateY(-1px)',
            } : {},
            transition: 'all 0.18s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </motion.div>
    </Tooltip>
  );
};