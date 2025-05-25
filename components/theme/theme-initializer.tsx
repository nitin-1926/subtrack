'use client';

import { useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { defaultTheme } from '@/lib/theme-config';

/**
 * This component initializes CSS variables based on the current theme
 * It should be included once at the app root level
 */
export function ThemeInitializer() {
	const { theme: currentTheme } = useNextTheme();

	useEffect(() => {
		// Apply the theme CSS variables to the document root
		const root = document.documentElement;
		const themeValues = currentTheme === 'dark' ? defaultTheme.dark : defaultTheme.light;

		// Set CSS variables for colors
		root.style.setProperty('--background', themeValues.background);
		root.style.setProperty('--foreground', themeValues.foreground);
		root.style.setProperty('--card', themeValues.card);
		root.style.setProperty('--card-foreground', themeValues.cardForeground);
		root.style.setProperty('--popover', themeValues.popover);
		root.style.setProperty('--popover-foreground', themeValues.popoverForeground);
		root.style.setProperty('--primary', themeValues.primary);
		root.style.setProperty('--primary-foreground', themeValues.primaryForeground);
		root.style.setProperty('--secondary', themeValues.secondary);
		root.style.setProperty('--secondary-foreground', themeValues.secondaryForeground);
		root.style.setProperty('--muted', themeValues.muted);
		root.style.setProperty('--muted-foreground', themeValues.mutedForeground);
		root.style.setProperty('--accent', themeValues.accent);
		root.style.setProperty('--accent-foreground', themeValues.accentForeground);
		root.style.setProperty('--destructive', themeValues.destructive);
		root.style.setProperty('--border', themeValues.border);
		root.style.setProperty('--input', themeValues.input);
		root.style.setProperty('--ring', themeValues.ring);
		root.style.setProperty('--chart-1', themeValues.chart1);
		root.style.setProperty('--chart-2', themeValues.chart2);
		root.style.setProperty('--chart-3', themeValues.chart3);
		root.style.setProperty('--chart-4', themeValues.chart4);
		root.style.setProperty('--chart-5', themeValues.chart5);
		root.style.setProperty('--sidebar', themeValues.sidebar);
		root.style.setProperty('--sidebar-foreground', themeValues.sidebarForeground);
		root.style.setProperty('--sidebar-primary', themeValues.sidebarPrimary);
		root.style.setProperty('--sidebar-primary-foreground', themeValues.sidebarPrimaryForeground);
		root.style.setProperty('--sidebar-accent', themeValues.sidebarAccent);
		root.style.setProperty('--sidebar-accent-foreground', themeValues.sidebarAccentForeground);
		root.style.setProperty('--sidebar-border', themeValues.sidebarBorder);
		root.style.setProperty('--sidebar-ring', themeValues.sidebarRing);

		// Set font variables
		root.style.setProperty(
			'--font-sans',
			"'Geist', 'Geist Fallback', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
		);
		root.style.setProperty(
			'--font-serif',
			"'Geist', 'Geist Fallback', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
		);
		root.style.setProperty(
			'--font-mono',
			"'Geist Mono', 'Geist Mono Fallback', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		);

		// Set radius variables
		root.style.setProperty('--radius', '0.5rem');

		// Set shadow variables
		root.style.setProperty('--shadow-2xs', '0 1px 3px 0px rgb(0 0 0 / 0.03)');
		root.style.setProperty('--shadow-xs', '0 1px 3px 0px rgb(0 0 0 / 0.03)');
		root.style.setProperty('--shadow-sm', '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)');
		root.style.setProperty('--shadow', '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)');
		root.style.setProperty('--shadow-md', '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.05)');
		root.style.setProperty('--shadow-lg', '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 4px 6px -1px rgb(0 0 0 / 0.05)');
		root.style.setProperty('--shadow-xl', '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 8px 10px -1px rgb(0 0 0 / 0.05)');
		root.style.setProperty('--shadow-2xl', '0 1px 3px 0px rgb(0 0 0 / 0.13)');
	}, [currentTheme]);

	return null;
}
