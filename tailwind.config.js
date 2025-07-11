/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bot-green': '#008f39',
        'bot-dark-green': '#006b2b',
        'bot-light-green': '#92d051',
        'bot-blue': '#2271b3',
        'bot-dark': '#1a1a1a',
        'bot-light': '#f8f9fa',
      },
      fontFamily: {
        'mark': ['Mark Pro', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'bot-green': '0 4px 14px 0 rgba(0, 143, 57, 0.2)',
        'bot-blue': '0 4px 14px 0 rgba(34, 113, 179, 0.2)',
      },
    },
  },
  plugins: [],
}