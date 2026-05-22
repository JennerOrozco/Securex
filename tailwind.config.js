/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050b14',
          900: '#0a1628', // teal-darkest
          800: '#0d2137', // teal-dark
          700: '#0f3a52', // teal-mid
        },
        brand: {
          teal: '#1a7a6e',   // teal-accent
          bright: '#22c5a0', // teal-bright
          glow: '#00ff9d',   // green-glow
        },
        'padel-orange': '#c25b2f',
        'padel-olive': '#807033',
        'padel-teal': '#244c52',
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },

      // 👇 NUEVAS ANIMACIONES AÑADIDAS
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'text-shine': 'shine 8s linear infinite', // Título brillante
        'firework-pulse': 'firework-pulse 1.5s ease-out', // Partículas de fuego artificial
        'spin-slow': 'spin 3s linear infinite', // Carga más lenta
      },

      // 👇 NUEVOS KEYFRAMES AÑADIDOS
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'firework-pulse': {
          '0%': { transform: 'scale(0) opacity(1)' },
          '100%': { transform: 'scale(2) opacity(0)', filter: 'blur(4px)' },
        }
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
}