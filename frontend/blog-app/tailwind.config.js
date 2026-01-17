/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-foreground': '#FFFFFF',
        text: '#1F2937',
        background: '#F9FAFB',
        border: '#D1D5DB',
        'secondary-text': '#6B7280',
        error: '#DC2626',
        success: '#16A34A',
      }
    },
  },
  plugins: [],
}
