/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'stripe-purple': '#533afd',
        'stripe-purple-hover': '#4434d4',
        'stripe-purple-deep': '#2e2b8c',
        'stripe-purple-light': '#b9b9f9',
        'stripe-navy': '#061b31',
        'stripe-label': '#273951',
        'stripe-body': '#64748d',
        'stripe-border': '#e5edf5',
        'stripe-dark': '#1c1e54',
        'stripe-success': '#15be53',
        'stripe-success-text': '#108c3d',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'stripe': 'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px',
        'stripe-sm': 'rgba(23,23,23,0.08) 0px 15px 35px 0px',
        'stripe-ambient': 'rgba(23,23,23,0.06) 0px 3px 6px',
      },
      borderRadius: {
        'stripe': '6px',
      }
    }
  },
  plugins: [],
}
