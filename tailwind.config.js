/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bondi: {
          DEFAULT: '#00A0B2',
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00A0B2',
          600: '#00838F',
          700: '#006064',
          800: '#004D54',
          900: '#003A3F',
        },
        cod: {
          DEFAULT: '#111111',
          50: '#3A3A3A',
          100: '#333333',
          200: '#2A2A2A',
          300: '#222222',
          400: '#1A1A1A',
          500: '#111111',
          600: '#0D0D0D',
          700: '#080808',
          800: '#050505',
          900: '#000000',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.1)',
          surface: 'rgba(255, 255, 255, 0.05)',
          highlight: 'rgba(0, 160, 178, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'glass': '20px',
        'glass-sm': '12px',
        'glass-lg': '28px',
      },
      backdropBlur: {
        'glass': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-hover': '0 12px 48px rgba(0, 160, 178, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glow': '0 0 20px rgba(0, 160, 178, 0.4)',
      },
    },
  },
  plugins: [],
};
