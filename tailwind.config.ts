import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [],
  theme: {
    screens: {
      'sm': '640px',
      'md': '769px',
      'lg': '993px',
      'xl': '1200px',
    },
    extend: {
      colors: {
        monet: {
          primary: '#BFE9FF',
          bg: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB'
          },
          text: {
            primary: '#2A2E33',
            secondary: '#6B7280',
            tertiary: '#9CA3AF'
          },
          border: '#E5E7EB',
          aux: {
            purple: '#E9E0FF',
            pink: '#FFE9F3'
          }
        }
      },
      fontFamily: {
        'ink': ['"汉仪墨韵行书"', 'cursive', 'serif'],
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace']
      },
      boxShadow: {
        'nav': '0 2px 12px rgba(0,0,0,0.08)',
        'card': '0 2px 8px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.05)'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      }
    }
  },
  plugins: []
}
