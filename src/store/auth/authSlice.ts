import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PharmaceuticalUser,
  AuthenticationCredentials,
  AuthenticationResponse,
  AuthenticationState,
  JWTTokens,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '../../types/authentication';
import { authService } from '../../services/api/auth.service';
import { auditService } from '../../services/audit/audit.service';

// Initial state for pharmaceutical authentication
const initialState: AuthenticationState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: null,
};

// Async thunks for pharmaceutical authentication

export const loginUser = createAsyncThunk<
  AuthenticationResponse,
  AuthenticationCredentials,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Log authentication attempt
      await auditService.logAction({
        action: 'login_attempt',
        details: {
          email: credentials.email,
          companyId: credentials.companyId,
          territoryId: credentials.territoryId,
        },
      });

      const response = await authService.login(credentials);
      
      // Store tokens securely
      localStorage.setItem('pharma_access_token', response.tokens.accessToken);
      localStorage.setItem('pharma_refresh_token', response.tokens.refreshToken);
      
      // Log successful authentication
      await auditService.logAction({
        action: 'login_success',
        userId: response.user.id,
        details: {
          companyId: response.user.companyId,
          territoryId: response.user.territoryId,
          role: response.user.role,
        },
      });

      return response;
    } catch (error: any) {
      // Log failed authentication
      await auditService.logAction({
        action: 'login_failed',
        details: {
          email: credentials.email,
          reason: error.message,
        },
      });

      return rejectWithValue(error.message || 'Authentication failed');
    }
  }
);

export const logoutUser = createAsyncThunk<
  void,
  void,
  { state: { auth: AuthenticationState } }
>(
  'auth/logoutUser',
  async (_, { getState }) => {
    const { auth } = getState();
    
    try {
      if (auth.user) {
        // Log logout action
        await auditService.logAction({
          action: 'logout',
          userId: auth.user.id,
          details: {
            companyId: auth.user.companyId,
            territoryId: auth.user.territoryId,
          },
        });
      }

      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens regardless of API success
      localStorage.removeItem('pharma_access_token');
      localStorage.removeItem('pharma_refresh_token');
    }
  }
);

export const refreshTokens = createAsyncThunk<
  JWTTokens,
  void,
  { rejectValue: string }
>(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('pharma_refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokens = await authService.refreshToken(refreshToken);
      
      // Update stored tokens
      localStorage.setItem('pharma_access_token', tokens.accessToken);
      localStorage.setItem('pharma_refresh_token', tokens.refreshToken);

      return tokens;
    } catch (error: any) {
      // Clear invalid tokens
      localStorage.removeItem('pharma_access_token');
      localStorage.removeItem('pharma_refresh_token');
      
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk<
  string,
  PasswordResetRequest,
  { rejectValue: string }
>(
  'auth/requestPasswordReset',
  async (request, { rejectWithValue }) => {
    try {
      // Log password reset request
      await auditService.logAction({
        action: 'password_reset_request',
        details: {
          email: request.email,
          companyId: request.companyId,
        },
      });

      const response = await authService.requestPasswordReset(request);
      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const confirmPasswordReset = createAsyncThunk<
  string,
  PasswordResetConfirm,
  { rejectValue: string }
>(
  'auth/confirmPasswordReset',
  async (request, { rejectWithValue }) => {
    try {
      const response = await authService.confirmPasswordReset(request);
      
      // Log password reset success
      await auditService.logAction({
        action: 'password_reset_success',
        details: {
          token: request.token.substring(0, 8) + '...',
        },
      });

      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const verifyToken = createAsyncThunk<
  PharmaceuticalUser,
  void,
  { rejectValue: string }
>(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('pharma_access_token');
      
      if (!token) {
        throw new Error('No access token available');
      }

      const user = await authService.verifyToken(token);
      return user;
    } catch (error: any) {
      // Clear invalid tokens
      localStorage.removeItem('pharma_access_token');
      localStorage.removeItem('pharma_refresh_token');
      
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

// Authentication slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = new Date();
    },
    
    clearAuthentication: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastActivity = null;
      localStorage.removeItem('pharma_access_token');
      localStorage.removeItem('pharma_refresh_token');
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthenticationResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = new Date();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // Logout user
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastActivity = null;
      });

    // Refresh tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action: PayloadAction<JWTTokens>) => {
        state.tokens = action.payload;
        state.lastActivity = new Date();
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action: PayloadAction<PharmaceuticalUser>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.lastActivity = new Date();
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // Password reset requests
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset request failed';
      });

    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed';
      });
  },
});

// Export actions
export const { clearError, updateLastActivity, clearAuthentication } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthenticationState }) => state.auth;
export const selectUser = (state: { auth: AuthenticationState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthenticationState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthenticationState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthenticationState }) => state.auth.error;

// Export reducer
export default authSlice.reducer;