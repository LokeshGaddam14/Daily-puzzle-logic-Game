/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#030308',
          surface: '#0A0A16',
          elevated: '#121226',
        },
        border: {
          DEFAULT: '#1c1c36',
          bright: '#2e2e54',
        },
        primary: {
          DEFAULT: '#5D3DE8',
          light: '#8066FF',
          dark: '#3A20B0',
          glow: 'rgba(93, 61, 232, 0.4)',
        },
        accent: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.3)',
        },
        streak: {
          DEFAULT: '#FF3C38',
          glow: 'rgba(255, 60, 56, 0.35)',
        },
        success: '#10B981',
        error: '#F43F5E',
        warning: '#F59E0B',
        text: {
          primary: '#F3F4F6',
          secondary: '#A1A1AA',
          muted: '#52525B',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(93, 61, 232, 0.4)',
        'glow-strong': '0 0 40px rgba(93, 61, 232, 0.6)',
        'glow-accent': '0 0 24px rgba(0, 240, 255, 0.3)',
        'glow-streak': '0 0 24px rgba(255, 60, 56, 0.35)',
        card: '0 12px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        elevated: '0 24px 64px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(to right, #030308, transparent), radial-gradient(circle at bottom left, rgba(93, 61, 232, 0.15), transparent 40%), radial-gradient(circle at top right, rgba(0, 240, 255, 0.1), transparent 40%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame': 'flame 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'bounceIn 0.7s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'celebration': 'celebration 0.6s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'spin-slow': 'spin 8s linear infinite',
        'sweep': 'sweep 2s ease-in-out infinite',
        'mesh-shift': 'meshShift 10s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(93, 61, 232, 0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(93, 61, 232, 0.6)' },
        },
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)' },
          '50%': { transform: 'scale(1.15) rotate(3deg)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.3)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        celebration: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        meshShift: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        }
      },
    },
  },
  plugins: [],
};
