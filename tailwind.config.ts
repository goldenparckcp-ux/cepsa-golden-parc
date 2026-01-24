import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // Master Prompt Design System
            'bg-dark': '#0A1929',
            'bg-card': '#1E293B',
            'bg-nav': '#0F172A',

            // Primary (Cyan/Blue)
            primary: '#06B6D4',
            'primary-dark': '#0891B2',
            'primary-light': '#22D3EE',

            // Accent
            accent: '#3B82F6',
            'accent-red': '#EF4444',

            // Text
            'text-primary': '#F8FAFC',
            'text-secondary': '#94A3B8',

            // Status
            'status-pending': '#EAB308',
            'status-preparing': '#3B82F6',
            'status-ready': '#10B981',
            'status-completed': '#6B7280',

            // Legacy / Compatibility (keep if needed, otherwise rely on new system)
            'cepsa-red': '#D6001C',
            'premium-gold': '#EAB308',

            fontFamily: {
                sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
                body: ['var(--font-noto-sans)', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};

export default config;
