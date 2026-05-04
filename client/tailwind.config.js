/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { 
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6b00b3',  // darker purple
          dark: '#4a007d',     // hover - even darker purple
          light: '#f3e6ff',    // soft purple tint
        },
        // Course badge colors (EduAdmin style)
        badge: {
          blue: '#2980b9',     // IT & Software
          orange: '#e67e22',   // Programming
          coral: '#e74c3c',    // Networking
          teal: '#16a085',     // Network Security
          purple: '#8e44ad',   // Design
          green: '#27ae60',    // Business
        },
        // Surface colors
        surface: {
          page: '#f0f4f8',
          card: '#ffffff',
        },
        // Text colors
        text: {
          dark: '#1a1a2e',
          muted: '#6b7280',
          light: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    } 
  },
  plugins: [],
}
