/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05080A',
        panel: '#0B1114',
        panel2: '#0D1518',
        snow: '#E9F2F0',
        mist: '#8FA5A0',
        teal: '#1FE8CF',
        blaze: '#FF6A00',
        line: 'rgba(233,242,240,0.12)'
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-orange': '0 0 34px rgba(255,106,0,0.28)',
        'glow-teal': '0 0 34px rgba(31,232,207,0.18)',
        'card': '0 18px 70px rgba(0,0,0,0.35)'
      },
      letterSpacing: {
        mega: '0.22em'
      }
    }
  },
  plugins: []
}
