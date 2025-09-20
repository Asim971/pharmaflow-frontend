import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Pharmaceutical Testing Utilities
 * Provides specialized testing functions for pharmaceutical components
 */

interface PharmaceuticalTestOptions {
  companyId?: string;
  territoryId?: string;
  userRole?: string;
  dgdaCompliance?: boolean;
  auditTrail?: boolean;
}

/**
 * Render pharmaceutical component with required context
 */
export const renderPharmaceuticalComponent = (
  component: React.ReactElement,
  options: PharmaceuticalTestOptions = {}
) => {
  const {
    companyId = 'test-company',
    territoryId = 'test-territory',
    userRole = 'regulatory_affairs_manager',
    dgdaCompliance = true,
    auditTrail = true,
  } = options;

  // Mock pharmaceutical context
  const pharmaceuticalContext = {
    companyId,
    territoryId,
    userRole,
    dgdaCompliance,
    auditTrail,
  };

  const PharmaceuticalWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div data-testid="pharmaceutical-wrapper" {...pharmaceuticalContext}>
        {children}
      </div>
    );
  };

  return render(component, { wrapper: PharmaceuticalWrapper });
};

/**
 * Test DGDA compliance features
 */
export const testDGDACompliance = {
  hasComplianceIndicator: (element: HTMLElement) => {
    return element.hasAttribute('data-dgda-compliant');
  },
  
  hasAuditTrail: (element: HTMLElement) => {
    return element.hasAttribute('data-audit-enabled');
  },
  
  hasValidationRules: (form: HTMLFormElement) => {
    return form.hasAttribute('data-dgda-validation');
  },
  
  simulateComplianceCheck: async () => {
    const result = await global.dgdaComplianceAPI.validateSubmission({
      test: true
    });
    return result;
  },
};

/**
 * Test customer hierarchy functionality
 */
export const testCustomerHierarchy = {
  findDistributors: () => {
    return screen.queryAllByTestId(/distributor-/);
  },
  
  findRetailers: () => {
    return screen.queryAllByTestId(/retailer-/);
  },
  
  findHealthcareProviders: () => {
    return screen.queryAllByTestId(/healthcare-provider-/);
  },
  
  testHierarchyNavigation: (hierarchyComponent: HTMLElement) => {
    const distributors = hierarchyComponent.querySelectorAll('[data-type="distributor"]');
    const retailers = hierarchyComponent.querySelectorAll('[data-type="retailer"]');
    const providers = hierarchyComponent.querySelectorAll('[data-type="healthcare-provider"]');
    
    return {
      distributorCount: distributors.length,
      retailerCount: retailers.length,
      providerCount: providers.length,
    };
  },
};

/**
 * Test territory management features
 */
export const testTerritoryManagement = {
  validateTerritoryAccess: (element: HTMLElement, expectedTerritory: string) => {
    const territory = element.getAttribute('data-territory');
    return territory === expectedTerritory;
  },
  
  testTerritoryFiltering: async (territoryId: string) => {
    const result = await global.territoryAPI.getTerritory(territoryId);
    return result;
  },
  
  checkTerritoryPermissions: (element: HTMLElement, userRole: string) => {
    const roleAccess = element.getAttribute('data-role-access');
    return roleAccess?.includes(userRole) || false;
  },
};

/**
 * Test pharmaceutical forms and validation
 */
export const testPharmaceuticalForms = {
  fillDGDAForm: (form: HTMLFormElement, data: Record<string, any>) => {
    Object.entries(data).forEach(([field, value]) => {
      const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement;
      if (input) {
        fireEvent.change(input, { target: { value } });
      }
    });
  },
  
  submitWithAuditTrail: async (form: HTMLFormElement) => {
    fireEvent.submit(form);
    
    // Verify audit trail was logged
    const auditCall = jest.mocked(global.pharmaAuth.auditAction);
    expect(auditCall).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'form_submission',
        timestamp: expect.any(String),
      })
    );
  },
  
  validateRequired: (form: HTMLFormElement) => {
    const requiredFields = form.querySelectorAll('[required]');
    return Array.from(requiredFields).every(field => 
      (field as HTMLInputElement).value.trim() !== ''
    );
  },
};

/**
 * Performance testing utilities for Bangladesh conditions
 */
export const testPerformance = {
  measureLoadTime: async (componentName: string) => {
    const startTime = performance.now();
    await screen.findByTestId(componentName);
    const endTime = performance.now();
    return endTime - startTime;
  },
  
  testOfflineCapability: () => {
    // Simulate offline condition
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    
    // Test component behavior
    window.dispatchEvent(new Event('offline'));
  },
  
  testBandwidthOptimization: (component: HTMLElement) => {
    const images = component.querySelectorAll('img');
    const lazyImages = Array.from(images).filter(img => 
      img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy'
    );
    
    return {
      totalImages: images.length,
      lazyImages: lazyImages.length,
      optimizationRatio: lazyImages.length / images.length,
    };
  },
};

/**
 * Accessibility testing for pharmaceutical components
 */
export const testAccessibility = {
  checkAriaLabels: (component: HTMLElement) => {
    const interactive = component.querySelectorAll('button, input, select, textarea, [role="button"]');
    const withAriaLabel = Array.from(interactive).filter(el => 
      el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
    );
    
    return {
      total: interactive.length,
      labeled: withAriaLabel.length,
      coverage: withAriaLabel.length / interactive.length,
    };
  },
  
  checkColorContrast: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      // Note: Actual contrast calculation would require additional logic
      hasGoodContrast: true, // Placeholder
    };
  },
  
  checkKeyboardNavigation: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      focusableCount: focusableElements.length,
      hasTabOrder: Array.from(focusableElements).every(el => 
        el.getAttribute('tabindex') !== '-1'
      ),
    };
  },
};

// Custom jest matchers for pharmaceutical testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveDGDACompliance(): R;
      toHaveAuditTrail(): R;
      toHavePharmaceuticalAccess(role: string): R;
    }
  }
}