// @ts-nocheck
import { default as flattenColorPalette } from 'tailwindcss/lib/util/flattenColorPalette';
import scrollbar from 'tailwind-scrollbar';
import defaultTheme from 'tailwindcss/defaultTheme';
import animate from 'tailwindcss-animate';

export default {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Theme-driven colors using CSS variables
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)',
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)',
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)',
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)',
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)',
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)',
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				chart: {
					1: 'var(--chart-1)',
					2: 'var(--chart-2)',
					3: 'var(--chart-3)',
					4: 'var(--chart-4)',
					5: 'var(--chart-5)',
				},
				sidebar: {
					DEFAULT: 'var(--sidebar)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)',
				},
			},
			borderRadius: {
				xs: 'var(--radius-sm)',
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)',
			},
			fontFamily: {
				sans: ['var(--font-sans)'],
				mono: ['var(--font-mono)'],
				serif: ['var(--font-serif)'],
			},
			boxShadow: {
				'2xs': 'var(--shadow-2xs)',
				xs: 'var(--shadow-xs)',
				sm: 'var(--shadow-sm)',
				DEFAULT: 'var(--shadow)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
			},
			keyframes: {
				'fade-up': {
					'0%': {
						transform: 'translateY(10px)',
					},
					'100%': {
						transform: 'translateY(0)',
					},
				},
				moveUp: {
					'0%': {
						transform: 'translateY(90px)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1',
					},
				},
				fadeIn: {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				shine: {
					from: {
						backgroundPosition: '200% 0',
					},
					to: {
						backgroundPosition: '-200% 0',
					},
				},
				'shine-slow': {
					from: {
						backgroundPosition: '200% 0',
					},
					to: {
						backgroundPosition: '-200% 0',
					},
				},
				'accordion-down': {
					from: {
						height: '0',
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
					},
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
					},
					to: {
						height: '0',
					},
				},
				gauge_fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				gauge_fill: {
					from: { 'stroke-dashoffset': '332', opacity: '0' },
					to: { opacity: '1' },
				},
			},
			animation: {
				'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'move-up': 'moveUp 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'fade-in': 'fadeIn 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				shine: 'shine 4s linear infinite',
				'shine-slow': 'shine-slow 8s linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				gauge_fadeIn: 'gauge_fadeIn 1s ease forwards',
				gauge_fill: 'gauge_fill 1s ease forwards',
			},
		},
	},
	plugins: [
		animate,
		addVariablesForColors,
		function ({ matchUtilities, theme }) {
			matchUtilities({ values: flattenColorPalette(theme('backgroundColor')), type: 'color' });
		},
		scrollbar({
			nocompatible: true,
			preferredStrategy: 'pseudoelements',
		}),
	],
};

function addVariablesForColors({ addBase, theme }) {
	const allColors = flattenColorPalette(theme('colors'));
	const newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

	addBase({
		':root': newVars,
	});
}
