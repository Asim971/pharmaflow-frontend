import {
  AuthenticationCredentials,
  AuthenticationResponse,
  PharmaceuticalUser,
  JWTTokens,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirm,
  PasswordResetConfirmResponse,
  TokenVerificationResponse,
} from '../../types/authentication';
import { api } from './base.service';

/**
 * Authentication service for pharmaceutical users
 * Handles all authentication-related API calls with DGDA compliance
 */
export class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Authenticate pharmaceutical user with credentials
   */
  async login(credentials: AuthenticationCredentials): Promise<AuthenticationResponse> {
    try {
      const response = await api.post<AuthenticationResponse>(`${this.baseUrl}/login`, {
        email: credentials.email,
        password: credentials.password,
        companyId: credentials.companyId,
        territoryId: credentials.territoryId,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout current pharmaceutical user
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`);
    } catch (error) {
      // Log logout errors but don't throw - allow client-side cleanup
      console.error('Logout API error:', error);
    }
  }

  /**
   * Refresh JWT tokens
   */
  async refreshToken(refreshToken: string): Promise<JWTTokens> {
    try {
      const response = await api.post<JWTTokens>(`${this.baseUrl}/refresh`, {
        refreshToken,
      });

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify JWT token and get user information
   */
  async verifyToken(token: string): Promise<PharmaceuticalUser> {
    try {
      const response = await api.get<TokenVerificationResponse>(`${this.baseUrl}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset for pharmaceutical user
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await api.post<PasswordResetResponse>(`${this.baseUrl}/password-reset`, {
        email: request.email,
        companyId: request.companyId,
        securityQuestionAnswer: request.securityQuestionAnswer,
      });

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<PasswordResetConfirmResponse> {
    try {
      const response = await api.post<PasswordResetConfirmResponse>(`${this.baseUrl}/password-reset/confirm`, {
        token: request.token,
        newPassword: request.newPassword,
        confirmPassword: request.confirmPassword,
      });

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password (authenticated)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/change-password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user profile with pharmaceutical context
   */
  async getProfile(): Promise<PharmaceuticalUser> {
    try {
      const response = await api.get<PharmaceuticalUser>(`${this.baseUrl}/profile`);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<PharmaceuticalUser>): Promise<PharmaceuticalUser> {
    try {
      const response = await api.put<PharmaceuticalUser>(`${this.baseUrl}/profile`, updates);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if email is available for registration
   */
  async checkEmailAvailability(email: string, companyId: string): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(`${this.baseUrl}/check-email`, {
        params: { email, companyId },
      });
      return response.data.available;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get pharmaceutical user permissions based on role and context
   */
  async getUserPermissions(): Promise<string[]> {
    try {
      const response = await api.get<{ permissions: string[] }>(`${this.baseUrl}/permissions`);
      return response.data.permissions;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle authentication-specific errors
   */
  private handleAuthError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return new Error(data.message || 'Invalid credentials');
        case 403:
          return new Error(data.message || 'Access denied');
        case 404:
          return new Error(data.message || 'User not found');
        case 422:
          return new Error(data.message || 'Invalid input data');
        case 429:
          return new Error(data.message || 'Too many attempts. Please try again later.');
        default:
          return new Error(data.message || 'Authentication failed');
      }
    }

    if (error.request) {
      return new Error('Network error. Please check your connection.');
    }

    return new Error(error.message || 'Authentication service error');
  }
}

// Export singleton instance
export const authService = new AuthService();