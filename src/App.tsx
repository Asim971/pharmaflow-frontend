import { PharmaceuticalThemeProvider } from './contexts/PharmaceuticalThemeContext';
import './index.css';

// Temporary App component until we build the full pharmaceutical UI
const App = () => {
  return (
    <PharmaceuticalThemeProvider>
      <div className="min-h-screen bg-premium-mesh">
        {/* Premium Pharmaceutical Header */}
        <header className="pharmaceutical-glass border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pharmaceutical-gradient rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold text-pharmaceutical">
                    PharmaFlow
                  </h1>
                  <p className="text-sm text-gray-600">DGDA Compliance Platform</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="dgda-compliance-indicator">
                  <span className="text-xs">🛡️ DGDA Verified</span>
                </div>
                <button className="pharma-nav-item active">
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Welcome Card */}
            <div className="lg:col-span-2">
              <div className="pharma-card">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-trust-gradient rounded-full mb-6 animate-pharmaceutical-glow">
                    <span className="text-3xl">🏥</span>
                  </div>
                  
                  <h2 className="text-3xl font-heading font-bold text-pharmaceutical mb-4">
                    Welcome to PharmaFlow
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Your premium pharmaceutical compliance platform with advanced DGDA integration, 
                    modern UI components, and WOW-factor design elements.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="pharma-card bg-white/50">
                      <h3 className="font-semibold text-pharmaceutical mb-2">
                        🎯 Modern Components
                      </h3>
                      <p className="text-sm text-gray-600">
                        PolishedStepper, KPICards, Territory Maps, and more
                      </p>
                    </div>
                    
                    <div className="pharma-card bg-white/50">
                      <h3 className="font-semibold text-trust mb-2">
                        🛡️ DGDA Compliance
                      </h3>
                      <p className="text-sm text-gray-600">
                        Built-in regulatory compliance and audit trails
                      </p>
                    </div>
                    
                    <div className="pharma-card bg-white/50">
                      <h3 className="font-semibold text-pharmaceutical mb-2">
                        ✨ Premium Design
                      </h3>
                      <p className="text-sm text-gray-600">
                        Glassmorphism effects and pharmaceutical aesthetics
                      </p>
                    </div>
                    
                    <div className="pharma-card bg-white/50">
                      <h3 className="font-semibold text-dgda mb-2">
                        📱 Mobile Optimized
                      </h3>
                      <p className="text-sm text-gray-600">
                        Field team support with offline capabilities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Trust Indicators */}
              <div className="pharma-card">
                <h3 className="font-semibold text-pharmaceutical mb-4">
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">DGDA Connection</span>
                    <div className="status-badge approved">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Connected
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compliance Level</span>
                    <div className="status-badge approved">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      100%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Security Status</span>
                    <div className="status-badge approved">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Secure
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Preview */}
              <div className="pharma-card">
                <h3 className="font-semibold text-pharmaceutical mb-4">
                  Premium Components
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-trust-verified rounded-full"></span>
                    <span>PolishedStepper Ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-trust-verified rounded-full"></span>
                    <span>KPICard with Microcharts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-trust-verified rounded-full"></span>
                    <span>Territory Map Configured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-trust-verified rounded-full"></span>
                    <span>Advanced Data Tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-trust-verified rounded-full"></span>
                    <span>DGDA Guided Forms</span>
                  </div>
                </div>
              </div>

              {/* Theme Controls */}
              <div className="pharma-card">
                <h3 className="font-semibold text-pharmaceutical mb-4">
                  Theme Options
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="dgda-input w-4 h-4" />
                    <span className="text-sm">Glassmorphism Effects</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="dgda-input w-4 h-4" />
                    <span className="text-sm">Premium Animations</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="dgda-input w-4 h-4" />
                    <span className="text-sm">DGDA Compliance Mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Action Button */}
        <button className="pharma-fab">
          <span className="text-2xl">+</span>
        </button>
      </div>
    </PharmaceuticalThemeProvider>
  );
};

export default App;