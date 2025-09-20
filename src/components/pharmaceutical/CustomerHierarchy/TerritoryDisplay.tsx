/**
 * Territory Display Component
 * Shows territory assignment information
 */

import {
  Chip,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { TerritoryDisplayProps } from './types';

export const TerritoryDisplay = ({
  territory,
  variant = 'chip',
  size = 'medium',
  onClick,
}: TerritoryDisplayProps) => {
  const { territoryName, coverageArea } = territory;

  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 200 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {territoryName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Coverage: {coverageArea}
      </Typography>
    </Box>
  );

  if (variant === 'full') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      >
        <LocationIcon color="primary" />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {territoryName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {coverageArea}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip title={tooltipContent} arrow>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Chip
          icon={<LocationIcon />}
          label={territoryName}
          variant={variant === 'badge' ? 'filled' : 'outlined'}
          size={size === 'large' ? 'medium' : 'small'}
          onClick={onClick}
          sx={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            border: '1px solid #bbdefb',
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              backgroundColor: '#bbdefb',
              transform: 'translateY(-1px)',
            } : {},
            transition: 'all 0.18s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </motion.div>
    </Tooltip>
  );
};