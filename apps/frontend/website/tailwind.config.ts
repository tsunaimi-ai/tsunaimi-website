import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-light': 'var(--color-brand-primary-light)',
          'primary-medium': 'var(--color-brand-primary-medium)',
          'primary-dark': 'var(--color-brand-primary-dark)',
        },
        tsunaimi: {
          gray: {
            light: 'var(--color-gray-light)',
            dark: 'var(--color-gray-dark)',
          },
          background: {
            light: 'var(--color-background-light)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addBase }: { addBase: (styles: Record<string, any>) => void }) {
      addBase({
        ':root': {
          /* Tsunaimi Brand Colors */
          '--color-brand-primary': '#251c6b',
          '--color-brand-primary-light': '#7057a0',
          '--color-brand-primary-medium': '#5b4b8a',
          '--color-brand-primary-dark': '#362658',
          /* Supporting Colors */
          '--color-gray-light': '#e5e7eb',
          '--color-gray-dark': '#374151',
          '--color-background-light': '#f9fafb',
        },
      });
    },
  ],
} satisfies Config;

export default config; 