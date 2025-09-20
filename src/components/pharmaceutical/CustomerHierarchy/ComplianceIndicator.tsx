/**
 * Compliance Indicator Component
 * Shows DGDA compliance status with trust indicators
 */

import {
  Chip,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { ComplianceIndicatorProps } from './types';

const statusConfig = {
  compliant: {
    icon: <VerifiedIcon />,
    color: '#4caf50',
    label: 'DGDA Compliant',
    description: 'Fully compliant with DGDA regulations',
  },
  pending: {
    icon: <PendingIcon />,
    color: '#ff9800',
    label: 'Pending Review',
    description: 'DGDA submission under review',
  },
  non_compliant: {
    icon: <ErrorIcon />,
    color: '#f44336',
    label: 'Non-Compliant',
    description: 'Does not meet DGDA requirements',
  },
  expired: {
    icon: <WarningIcon />,
    color: '#ff5722',
    label: 'Expired',
    description: 'DGDA compliance has expired',
  },
};

export const ComplianceIndicator = ({
  status,
  lastAuditDate,
  expirationDate,
  documentCount,
  size = 'medium',
  showDetails = false,
  onClick,
}: ComplianceIndicatorProps) => {
  const config = statusConfig[status];

  const getChipSize = () => {
    switch (size) {
      case 'small': return { height: 24, fontSize: '0.75rem' };
      case 'large': return { height: 40, fontSize: '0.875rem' };
      default: return { height: 32, fontSize: '0.8rem' };
    }
  };

  const chipStyle = getChipSize();

  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 250 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {config.label}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {config.description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Last Audit: {lastAuditDate.toLocaleDateString()}
      </Typography>
      {expirationDate && (
        <Typography variant="caption" color="text.secondary" display="block">
          Expires: {expirationDate.toLocaleDateString()}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" display="block">
        Documents: {documentCount}
      </Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Chip
          icon={config.icon}
          label={showDetails ? config.label : ''}
          size={size === 'large' ? 'medium' : 'small'}
          onClick={onClick}
          sx={{
            backgroundColor: `${config.color}22`,
            color: config.color,
            border: `1px solid ${config.color}44`,
            fontWeight: 600,
            cursor: onClick ? 'pointer' : 'default',
            height: chipStyle.height,
            fontSize: chipStyle.fontSize,
            '& .MuiChip-icon': {
              color: config.color,
            },
            '&:hover': onClick ? {
              backgroundColor: `${config.color}33`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 8px ${config.color}33`,
            } : {},
            transition: 'all 0.18s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </motion.div>
    </Tooltip>
  );
};