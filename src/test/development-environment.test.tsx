import { renderPharmaceuticalComponent, testDGDACompliance } from '@/test/pharmaceutical-utils';

describe('Pharmaceutical Development Environment', () => {
  it('should validate DGDA compliance testing framework', () => {
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-dgda-compliant', 'true');
    
    expect(testDGDACompliance.hasComplianceIndicator(mockElement)).toBe(true);
  });

  it('should support pharmaceutical testing context', () => {
    const TestComponent = () => <div data-pharma-testid="test-component">Test</div>;
    
    const { getByTestId } = renderPharmaceuticalComponent(<TestComponent />, {
      companyId: 'test-pharma',
      userRole: 'regulatory_affairs_manager',
      dgdaCompliance: true,
    });

    expect(getByTestId('test-component')).toBeInTheDocument();
  });

  it('should validate audit trail functionality', () => {
    const mockElement = document.createElement('form');
    mockElement.setAttribute('data-audit-enabled', 'true');
    
    expect(testDGDACompliance.hasAuditTrail(mockElement)).toBe(true);
  });

  it('should support pharmaceutical environment variables', () => {
    // Test that pharmaceutical environment variables are available
    expect(import.meta.env.VITE_PHARMACEUTICAL_MODE).toBeDefined();
    expect(import.meta.env.VITE_DGDA_COMPLIANCE_MODE).toBeDefined();
  });
});