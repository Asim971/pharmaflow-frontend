import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Email,
  Lock,
  LocationOn,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/auth/authSlice';
import { AuthenticationCredentials } from '../../types/authentication';

interface LoginFormProps {
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export const LoginForm = ({
  onForgotPassword,
  onCreateAccount,
}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state: { auth: any }) => state.auth);

  const [credentials, setCredentials] = useState<AuthenticationCredentials>({
    email: '',
    password: '',
    companyId: '',
    territoryId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<AuthenticationCredentials>>({});

  // Sample data for demonstration - in real app, this would come from API
  const companies = [
    { id: 'company-1', name: 'Square Pharmaceuticals Ltd.' },
    { id: 'company-2', name: 'Beximco Pharmaceuticals Ltd.' },
    { id: 'company-3', name: 'Incepta Pharmaceuticals Ltd.' },
    { id: 'company-4', name: 'Renata Limited' },
  ];

  const territories = [
    { id: 'territory-1', name: 'Dhaka Metropolitan' },
    { id: 'territory-2', name: 'Chittagong Division' },
    { id: 'territory-3', name: 'Sylhet Division' },
    { id: 'territory-4', name: 'Rajshahi Division' },
    { id: 'territory-5', name: 'Khulna Division' },
    { id: 'territory-6', name: 'Barisal Division' },
    { id: 'territory-7', name: 'Rangpur Division' },
    { id: 'territory-8', name: 'Mymensingh Division' },
  ];

  const validateForm = (): boolean => {
    const errors: Partial<AuthenticationCredentials> = {};

    if (!credentials.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!credentials.companyId) {
      errors.companyId = 'Company selection is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof AuthenticationCredentials) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value as string;
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginUser(credentials)).unwrap();
      // Navigation will be handled by the auth state change
    } catch (error) {
      // Error is already set in the store by the rejected action
      console.error('Login failed:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 480,
          width: '100%',
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 1,
            }}
          >
            PharmaFlow
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Bangladesh Pharmaceutical Management System
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            DGDA Compliant • Secure • Efficient
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Company Selection */}
            <FormControl
              fullWidth
              error={!!formErrors.companyId}
              required
            >
              <InputLabel>Pharmaceutical Company</InputLabel>
              <Select
                value={credentials.companyId}
                onChange={handleInputChange('companyId')}
                label="Pharmaceutical Company"
                startAdornment={
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                }
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.companyId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.companyId}
                </Typography>
              )}
            </FormControl>

            {/* Territory Selection */}
            <FormControl fullWidth>
              <InputLabel>Territory (Optional)</InputLabel>
              <Select
                value={credentials.territoryId || ''}
                onChange={handleInputChange('territoryId')}
                label="Territory (Optional)"
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>All Territories</em>
                </MenuItem>
                {territories.map((territory) => (
                  <MenuItem key={territory.id} value={territory.id}>
                    {territory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Email */}
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={credentials.email}
              onChange={handleInputChange('email')}
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={credentials.password}
              onChange={handleInputChange('password')}
              error={!!formErrors.password}
              helperText={formErrors.password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </form>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Need Help?
          </Typography>
        </Divider>

        {/* Footer Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {onForgotPassword && (
            <Button
              fullWidth
              variant="text"
              onClick={onForgotPassword}
              sx={{ textTransform: 'none' }}
            >
              Forgot your password?
            </Button>
          )}
          
          {onCreateAccount && (
            <Button
              fullWidth
              variant="text"
              onClick={onCreateAccount}
              sx={{ textTransform: 'none' }}
            >
              Don't have an account? Contact your administrator
            </Button>
          )}
        </Box>

        {/* DGDA Compliance Notice */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This system complies with DGDA regulations for pharmaceutical operations in Bangladesh.
            All activities are logged for regulatory compliance.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};