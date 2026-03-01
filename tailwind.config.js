/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#4A90E2',
        'medical-teal': '#50C9CE',
        'medical-green': '#7ED321',
        'medical-yellow': '#F5A623',
        'medical-red': '#D0021B',
        'medical-gray': '#F5F7FA',
        'medical-dark': '#2C3E50',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'dyslexic': ['OpenDyslexic', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'card': '12px',
      },
      backgroundImage: {
        'gradient-medical': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      },
    },
  },
  plugins: [],
}

