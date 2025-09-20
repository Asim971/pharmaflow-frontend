/**
 * Hierarchy Search Component
 * Provides search functionality for customer hierarchy
 */

import {
  TextField,
  InputAdornment,
  Autocomplete,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { HierarchySearchProps } from './types';

export const HierarchySearch = ({
  query,
  placeholder = 'Search customers...',
  onChange,
  suggestions = [],
}: HierarchySearchProps) => {
  const handleInputChange = (_event: any, value: string) => {
    onChange(value);
  };

  if (suggestions.length > 0) {
    return (
      <Autocomplete
        freeSolo
        options={suggestions}
        value={query}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <ClearIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onChange('')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />
        )}
        PaperComponent={(props) => (
          <Paper {...props} sx={{ mt: 1, boxShadow: 2 }} />
        )}
      />
    );
  }

  return (
    <TextField
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      sx={{ minWidth: 300 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: query ? (
          <InputAdornment position="end">
            <ClearIcon
              sx={{ cursor: 'pointer' }}
              onClick={() => onChange('')}
            />
          </InputAdornment>
        ) : null,
      }}
    />
  );
};