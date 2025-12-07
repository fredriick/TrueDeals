/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2D3436', // Charcoal
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#FDCB6E', // Mustard Yellow (Retro vibe)
                    foreground: '#2D3436',
                },
                accent: {
                    DEFAULT: '#E17055', // Terracotta
                    foreground: '#FFFFFF',
                },
                background: '#FAFAFA', // Off-white
                surface: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Assuming Inter is available or fallback
            },
            borderRadius: {
                lg: '0.75rem',
                xl: '1rem',
            }
        },
    },
    plugins: [],
}
