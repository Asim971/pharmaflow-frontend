/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1E3A8A', // Primary pharmaceutical blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981', // Pharmaceutical trust green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        pharmaceutical: {
          blue: '#1E3A8A',
          mint: '#10B981',
          gold: '#F59E0B',
          lavender: '#8B5CF6',
          coral: '#F97316',
        },
        dgda: {
          primary: '#1E40AF',
          secondary: '#059669',
          warning: '#F59E0B',
          success: '#10B981',
          text: '#1F2937',
        },
        trust: {
          verified: '#10B981',
          pending: '#F59E0B',
          alert: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        'pharmaceutical': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'trust-pulse': 'trustPulse 2s ease-in-out infinite',
        'pharmaceutical-glow': 'pharmaceuticalGlow 3s ease-in-out infinite',
        'dgda-verified': 'dgdaVerified 1.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        trustPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        pharmaceuticalGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(30, 58, 138, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(30, 58, 138, 0.6)' },
        },
        dgdaVerified: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        'pharmaceutical': '20px',
      },
      backgroundImage: {
        'pharmaceutical-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #10B981 100%)',
        'trust-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'dgda-gradient': 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        'premium-mesh': 'radial-gradient(circle at 25% 25%, rgba(30, 58, 138, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'pharmaceutical': '0 10px 40px rgba(30, 58, 138, 0.15)',
        'trust': '0 8px 32px rgba(16, 185, 129, 0.2)',
        'dgda': '0 6px 24px rgba(30, 64, 175, 0.18)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'premium': '0 20px 80px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
  ],
}