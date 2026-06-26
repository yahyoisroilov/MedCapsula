import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Hanken Grotesk — body / UI
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Spectral — display / headings
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        // Space Mono — labels / numbers
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Warm neutral surfaces
        sand: {
          DEFAULT: '#F5F0E6', // page background (cream)
          deep: '#EDE6D6',    // alternating section background (tan)
          card: '#FBF8F1',    // card surface (light cream)
        },
        // Text / ink
        ink: {
          DEFAULT: '#2B2722', // primary text (dark brown)
          soft: '#5b5343',    // body text
          mute: '#6c6353',    // secondary text
          faint: '#9a8f78',   // muted labels
          dim: '#a99e87',     // dimmest labels
        },
        // Brand green
        brand: {
          DEFAULT: '#2F6B4F',
          dark: '#27593f',
          soft: '#5a7a66',
          tint: '#E4EDE5',    // light green badge background
          line: '#cfe0d3',    // green badge border
        },
        // Accent blue
        sky: {
          DEFAULT: '#5A95BE',
          light: '#7FB8DC',
          text: '#3f7da3',
          tint: '#E3EFF6',    // light blue badge background
          line: '#c4ddec',    // blue badge border
        },
        // Dark footer
        night: '#26221C',
      },
      maxWidth: {
        shell: '1240px',
        prose: '760px',
      },
      boxShadow: {
        card: '0 6px 16px rgba(43,39,34,0.08)',
        lift: '0 10px 24px rgba(47,107,79,0.10)',
        feature: '0 12px 30px rgba(47,107,79,0.10)',
        btn: '0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 18px rgba(47,107,79,0.26)',
        'btn-sm': '0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 8px rgba(47,107,79,0.22)',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateX(-50%) rotate(17deg) translateY(0)' },
          '50%': { transform: 'translateX(-50%) rotate(17deg) translateY(-14px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        floatY: 'floatY 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.35s ease both',
        'slide-in': 'slideIn 0.3s ease both',
      },
    },
  },
  plugins: [],
}
export default config
