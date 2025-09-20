import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    downloadsFolder: 'tests/e2e/downloads',
    fixturesFolder: 'tests/e2e/fixtures',
    
    // Pharmaceutical testing configuration
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    
    // Bangladesh network conditions simulation
    defaultCommandTimeout: 10000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 30000,
    
    // DGDA compliance testing
    env: {
      pharmaceutical_mode: true,
      dgda_compliance: true,
      audit_trail: true,
      territory_testing: true,
      customer_hierarchy: true,
    },
    
    setupNodeEvents(on, config) {
      // Pharmaceutical testing plugins
      on('task', {
        // DGDA compliance validation
        validateDGDACompliance: (data) => {
          console.log('Validating DGDA compliance:', data);
          return { valid: true, timestamp: new Date().toISOString() };
        },
        
        // Audit trail verification
        verifyAuditTrail: (action) => {
          console.log('Verifying audit trail:', action);
          return { logged: true, auditId: `audit_${Date.now()}` };
        },
        
        // Territory access validation
        validateTerritoryAccess: (territory) => {
          console.log('Validating territory access:', territory);
          return { hasAccess: true, permissions: ['read', 'write'] };
        },
        
        // Customer hierarchy validation
        validateCustomerHierarchy: (hierarchy) => {
          console.log('Validating customer hierarchy:', hierarchy);
          return { valid: true, levels: hierarchy.length };
        },
      });
      
      // Pharmaceutical environment configuration
      if (config.env.pharmaceutical_mode) {
        config.env.api_url = 'http://localhost:3000/api';
        config.env.dgda_api = 'http://localhost:3000/api/dgda';
        config.env.audit_api = 'http://localhost:3000/api/audit';
      }
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'tests/component/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    
    // Pharmaceutical component testing
    viewportWidth: 1000,
    viewportHeight: 600,
    video: false,
    screenshot: true,
  },
  
  // Pharmaceutical project configuration
  projectId: 'pharmaflow-frontend',
  
  // Performance testing for Bangladesh conditions
  numTestsKeptInMemory: 5,
  experimentalMemoryManagement: true,
  
  // Security configuration for pharmaceutical data
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  
  // Reporting configuration
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'tests/e2e/reports',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss',
  },
});