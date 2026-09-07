/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a13',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#0b101d',
          foreground: '#f8fafc',
        },
        popover: {
          DEFAULT: '#0b101d',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#00d9ff',
          foreground: '#050811',
          glow: 'rgba(0, 217, 255, 0.25)',
        },
        secondary: {
          DEFAULT: '#7928ca',
          foreground: '#ffffff',
          glow: 'rgba(121, 40, 202, 0.25)',
        },
        muted: {
          DEFAULT: '#141b2d',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#1a233a',
          foreground: '#00d9ff',
        },
        border: '#1f293d',
        input: '#0d1322',
        ring: '#00d9ff',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle-cyan': '0 0 20px rgba(0, 217, 255, 0.15)',
        'subtle-purple': '0 0 20px rgba(121, 40, 202, 0.15)',
        'card-premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 217, 255, 0.1)',
        'glass-inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-hero': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 217, 255, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 85% 20%, rgba(121, 40, 202, 0.08), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.02)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'float-reverse 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
