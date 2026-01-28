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
            'bg-dark': '#0F172A',
            'bg-card': '#1E293B',
            'bg-nav': '#0F172A',

            // Primary (Cepsa Red) - NO MORE CYAN
            primary: '#D6001C',
            'primary-dark': '#A00015',
            'primary-light': '#FF1A33',

            // Accent (Gold)
            accent: '#D4AF37',       // Premium Gold
            'accent-gold': '#EAB308',
            'accent-red': '#D6001C',

            // Text
            'text-primary': '#F8FAFC',
            'text-secondary': '#94A3B8',

            // Status
            'status-pending': '#EAB308',    // Gold
            'status-preparing': '#D6001C',  // Red (was Blue)
            'status-ready': '#10B981',      // Green
            'status-completed': '#6B7280',  // Gray

            // Legacy / Compatibility
            'cepsa-red': '#D6001C',
            'premium-gold': '#D4AF37',

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
