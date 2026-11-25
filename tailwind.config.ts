import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff', 'surface-dim': '#cbdbf5', 'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff', 'surface-container-low': '#eff4ff', 'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff', 'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30', 'on-surface-variant': '#464555', 'inverse-surface': '#213145', 'inverse-on-surface': '#eaf1ff',
        outline: '#777587', 'outline-variant': '#c7c4d8', 'surface-tint': '#4d44e3',
        primary: '#3525cd', 'on-primary': '#ffffff', 'primary-container': '#4f46e5', 'on-primary-container': '#dad7ff', 'inverse-primary': '#c3c0ff',
        secondary: '#0058be', 'on-secondary': '#ffffff', 'secondary-container': '#2170e4', 'on-secondary-container': '#fefcff',
        tertiary: '#004d70', 'on-tertiary': '#ffffff', 'tertiary-container': '#006693', 'on-tertiary-container': '#b8e0ff',
        error: '#ba1a1a', 'on-error': '#ffffff', 'error-container': '#ffdad6', 'on-error-container': '#93000a',
        'primary-fixed': '#e2dfff', 'primary-fixed-dim': '#c3c0ff', 'on-primary-fixed': '#0f0069', 'on-primary-fixed-variant': '#3323cc',
        'secondary-fixed': '#d8e2ff', 'secondary-fixed-dim': '#adc6ff', 'on-secondary-fixed': '#001a42', 'on-secondary-fixed-variant': '#004395',
        'tertiary-fixed': '#c9e6ff', 'tertiary-fixed-dim': '#89ceff', 'on-tertiary-fixed': '#001e2f', 'on-tertiary-fixed-variant': '#004c6e',
        background: '#f8f9ff', 'on-background': '#0b1c30', 'surface-variant': '#d3e4fe',
      },
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
      fontSize: {
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-mobile': ['30px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
export default config;