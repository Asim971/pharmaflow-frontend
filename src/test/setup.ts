import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Global type declarations for pharmaceutical testing
declare global {
  var dgdaComplianceAPI: any;
  var territoryAPI: any;
  var pharmaAuth: any;
  var pharmaceuticalTestContext: any;
}

// Configure testing library for pharmaceutical components
configure({
  testIdAttribute: 'data-pharma-testid',
  // Pharmaceutical accessibility testing
  getElementError: (message) => {
    const enhancedMessage = `
    ${message}

    Pharmaceutical Testing Guide:
    - Use data-pharma-testid for pharmaceutical components
    - Test DGDA compliance features thoroughly
    - Verify audit trail functionality
    - Check territory-based permissions
    - Validate customer hierarchy relationships
    `;
    return new Error(enhancedMessage);
  },
});

// Mock pharmaceutical APIs for testing
global.fetch = jest.fn();

// Mock DGDA compliance checks
global.dgdaComplianceAPI = {
  validateSubmission: jest.fn(),
  checkRegulatory: jest.fn(),
  auditTrail: jest.fn(),
};

// Mock territory management
global.territoryAPI = {
  getTerritory: jest.fn(),
  validateAccess: jest.fn(),
  getCustomerHierarchy: jest.fn(),
};

// Mock pharmaceutical authentication
global.pharmaAuth = {
  login: jest.fn(),
  logout: jest.fn(),
  validateRole: jest.fn(),
  auditAction: jest.fn(),
};

// Pharmaceutical test environment setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset pharmaceutical state
  localStorage.clear();
  sessionStorage.clear();
  
  // Setup default pharmaceutical context
  global.pharmaceuticalTestContext = {
    companyId: 'test-pharma-company',
    territoryId: 'test-territory',
    userId: 'test-user',
    userRole: 'regulatory_affairs_manager',
    dgdaCompliance: true,
    auditTrailEnabled: true,
  };
});

afterEach(() => {
  // Cleanup pharmaceutical resources
  jest.restoreAllMocks();
});

// Custom pharmaceutical matchers
expect.extend({
  toHaveDGDACompliance(received) {
    const pass = received.hasAttribute('data-dgda-compliant');
    return {
      message: () => 
        pass 
          ? `Expected element not to have DGDA compliance`
          : `Expected element to have DGDA compliance attribute`,
      pass,
    };
  },
  
  toHaveAuditTrail(received) {
    const pass = received.hasAttribute('data-audit-enabled');
    return {
      message: () => 
        pass 
          ? `Expected element not to have audit trail`
          : `Expected element to have audit trail tracking`,
      pass,
    };
  },
  
  toHavePharmaceuticalAccess(received, role) {
    const dataRole = received.getAttribute('data-pharma-role');
    const pass = dataRole && dataRole.includes(role);
    return {
      message: () => 
        pass 
          ? `Expected element not to have ${role} access`
          : `Expected element to have ${role} pharmaceutical access`,
      pass,
    };
  },
});