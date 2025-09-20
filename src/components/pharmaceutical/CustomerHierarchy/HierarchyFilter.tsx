/**
 * Hierarchy Filter Component
 * Provides filtering options for customer hierarchy
 */

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { HierarchyFilterProps } from './types';
import { CustomerTier } from '../../../types/customer';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const HierarchyFilter = ({
  filters,
  filterOptions,
  onFiltersChange,
  onReset,
}: HierarchyFilterProps) => {
  const handleTierChange = (event: any) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      tier: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleComplianceChange = (event: any) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      complianceStatus: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleTerritoryChange = (event: any) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      territory: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const getTierLabel = (tier: CustomerTier) => {
    return tier.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getComplianceLabel = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter
  );

  return (
    <Paper sx={{ p: 2, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterIcon color="primary" />
        <Typography variant="h6">Filters</Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onReset}
            sx={{ ml: 'auto' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Customer Tier Filter */}
        <FormControl fullWidth>
          <InputLabel>Customer Tier</InputLabel>
          <Select
            multiple
            value={filters.tier || []}
            onChange={handleTierChange}
            input={<OutlinedInput label="Customer Tier" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={getTierLabel(value)}
                    size="small"
                    sx={{ height: 24 }}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {filterOptions.tiers.map((tier) => (
              <MenuItem key={tier} value={tier}>
                {getTierLabel(tier)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Compliance Status Filter */}
        <FormControl fullWidth>
          <InputLabel>Compliance Status</InputLabel>
          <Select
            multiple
            value={filters.complianceStatus || []}
            onChange={handleComplianceChange}
            input={<OutlinedInput label="Compliance Status" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={getComplianceLabel(value)}
                    size="small"
                    sx={{ height: 24 }}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {filterOptions.complianceStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {getComplianceLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Territory Filter */}
        {filterOptions.territories.length > 0 && (
          <FormControl fullWidth>
            <InputLabel>Territory</InputLabel>
            <Select
              multiple
              value={filters.territory || []}
              onChange={handleTerritoryChange}
              input={<OutlinedInput label="Territory" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const territory = filterOptions.territories.find(t => t.id === value);
                    return (
                      <Chip
                        key={value}
                        label={territory?.name || value}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {filterOptions.territories.map((territory) => (
                <MenuItem key={territory.id} value={territory.id}>
                  {territory.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Paper>
  );
};