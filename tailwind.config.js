/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030014',
        foreground: '#f4f0ff',
        'void-canvas': '#030014',
        'night-violet': '#0a0118',
        'midnight-surface': '#060317',
        'deep-indigo': '#10093a',
        'lilac-white': '#f4f0ff',
        pearl: '#ffffff',
        ash: '#a8a6b7',
        'ash-lilac': '#9b96b0',
        fog: '#918ea0',
        'dim-fog': '#85808c',
        steel: '#54525f',
        mercury: '#cdccd0',
        dusk: '#72707b',
        'lavender-accent': '#9382ff',
        iris: '#5046e4',
        'ultraviolet-core': '#713dff',
        'lilac-beam': '#b7a4fb',
        'horizon-glow': '#8562ff',
        card: {
          DEFAULT: '#060317',
          foreground: '#f4f0ff',
        },
        popover: {
          DEFAULT: '#060317',
          foreground: '#f4f0ff',
        },
        primary: {
          DEFAULT: '#5046e4',
          foreground: '#ffffff',
          accent: '#9382ff',
        },
        muted: {
          DEFAULT: '#0a0118',
          foreground: '#9b96b0',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'rgba(255, 255, 255, 0.04)',
        ring: '#9382ff',
      },
      borderRadius: {
        cards: '16px',
        badges: '32px',
        inputs: '5px',
        buttons: '5px',
        navpill: '999px',
        featureblocks: '24px',
        overlaycards: '10px',
      },
      fontFamily: {
        rebond: ['Sora', 'Plus Jakarta Sans', 'sans-serif'],
        aeonik: ['AeonikPro', 'Sora', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'reflect-lg': 'rgba(255, 255, 255, 0.04) 0px 0px 24px 0px inset',
        'reflect-lg-2': 'rgba(255, 255, 255, 0.06) 0px 0px 24px 0px inset',
        'reflect-badge': 'rgba(164, 143, 255, 0.12) 0px -7px 11px 0px inset',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(90.01deg, #e59cff 0.01%, #ba9cff 50.01%, #9cb2ff 100%)',
        'aurora-vertical': 'linear-gradient(180deg, rgba(183,164,251,0) 0%, #b7a4fb 50%, #8562ff 100%, rgba(133,98,255,0) 100%)',
        'ultraviolet-horizon': 'linear-gradient(180deg, rgba(183, 164, 251, 0) 0%, rgba(183, 164, 251, 0.5) 50%, rgba(133, 98, 255, 0.5) 75%, rgba(133, 98, 255, 0) 100%)',
        'violet-beam': 'linear-gradient(180deg, rgba(183, 164, 251, 0) 0%, rgb(183, 164, 251) 50%, rgb(133, 98, 255) 75%, rgba(133, 98, 255, 0) 100%)',
      },
      keyframes: {
        smoothFadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'fade-up': 'smoothFadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
