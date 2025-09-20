// Pharmaceutical Authentication Types
export interface PharmaceuticalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: PharmaceuticalUserRole;
  companyId: string;
  territoryId?: string;
  permissions: PharmaceuticalPermission[];
  dgdaCompliance: boolean;
  lastLogin?: Date;
  auditTrailEnabled: boolean;
}

export type PharmaceuticalUserRole = 
  | 'regulatory_affairs_manager'
  | 'sales_director' 
  | 'marketing_manager'
  | 'territory_manager'
  | 'field_representative'
  | 'compliance_officer'
  | 'company_admin'
  | 'dgda_liaison';

export interface PharmaceuticalPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
  conditions?: {
    territoryId?: string;
    companyId?: string;
    dgdaCompliance?: boolean;
  };
}

export interface AuthenticationCredentials {
  email: string;
  password: string;
  companyId?: string;
  territoryId?: string;
  rememberMe?: boolean;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthenticationResponse {
  user: PharmaceuticalUser;
  tokens: JWTTokens;
  auditTrail: {
    loginId: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
  };
}

export interface AuthenticationState {
  user: PharmaceuticalUser | null;
  tokens: JWTTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

// Password reset request interface
export interface PasswordResetRequest {
  email: string;
  companyId: string;
  securityQuestionAnswer?: string;
}

// Password reset response interface
export interface PasswordResetResponse {
  message: string;
  resetToken?: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Pharmaceutical role-based access control
export interface RolePermissions {
  regulatory_affairs_manager: {
    dgda: ['create', 'read', 'update', 'delete', 'approve'];
    customers: ['read', 'update'];
    territories: ['read'];
    audit: ['read'];
    compliance: ['create', 'read', 'update', 'delete', 'approve'];
  };
  sales_director: {
    customers: ['create', 'read', 'update', 'delete'];
    territories: ['read', 'update'];
    marketing: ['read', 'approve'];
    analytics: ['read'];
    audit: ['read'];
  };
  marketing_manager: {
    marketing: ['create', 'read', 'update', 'delete'];
    customers: ['read'];
    territories: ['read'];
    compliance: ['read'];
    audit: ['read'];
  };
  territory_manager: {
    territories: ['read', 'update'];
    customers: ['read', 'update'];
    field_reps: ['read', 'update'];
    analytics: ['read'];
    audit: ['read'];
  };
  field_representative: {
    customers: ['read', 'update'];
    visits: ['create', 'read', 'update'];
    mobile: ['create', 'read', 'update'];
    audit: ['read'];
  };
  compliance_officer: {
    compliance: ['create', 'read', 'update', 'delete', 'approve'];
    audit: ['read'];
    dgda: ['read'];
    reporting: ['create', 'read'];
  };
  company_admin: {
    users: ['create', 'read', 'update', 'delete'];
    company: ['read', 'update'];
    territories: ['create', 'read', 'update', 'delete'];
    audit: ['read'];
    system: ['read', 'update'];
  };
  dgda_liaison: {
    dgda: ['create', 'read', 'update', 'delete', 'approve'];
    submissions: ['create', 'read', 'update', 'delete'];
    compliance: ['read', 'approve'];
    audit: ['read'];
    regulatory: ['create', 'read', 'update'];
  };
}

// Audit trail for authentication events
export interface AuthenticationAuditEntry {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'password_reset' | 'token_refresh' | 'session_timeout' | 'failed_login';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: {
    reason?: string;
    companyId?: string;
    territoryId?: string;
    attempts?: number;
  };
}

// Pharmaceutical security context
export interface PharmaceuticalSecurityContext {
  user: PharmaceuticalUser;
  companyId: string;
  territoryId?: string;
  permissions: PharmaceuticalPermission[];
  sessionId: string;
  auditTrailEnabled: boolean;
  dgdaComplianceRequired: boolean;
}

// Password reset confirmation response interface
export interface PasswordResetConfirmResponse {
  message: string;
  success: boolean;
}

// Token verification response interface
export interface TokenVerificationResponse {
  user: PharmaceuticalUser;
  tokenValid: boolean;
}