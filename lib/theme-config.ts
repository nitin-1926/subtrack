/**
 * Theme configuration for SubTrack
 * This file contains all theme variables and can be easily modified
 * to change the application's appearance
 */

export type ThemeConfig = {
  light: ThemeColors;
  dark: ThemeColors;
};

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type ThemeFonts = {
  sans: string;
  serif: string;
  mono: string;
};

export type ThemeRadii = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeShadows = {
  '2xs': string;
  xs: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

export const defaultTheme: ThemeConfig = {
  light: {
    background: 'rgb(255 255 255)',
    foreground: 'rgb(31 31 31)',
    card: 'rgb(255 255 255)',
    cardForeground: 'rgb(31 31 31)',
    popover: 'rgb(255 255 255)',
    popoverForeground: 'rgb(31 31 31)',
    primary: 'rgb(67 125 251)',
    primaryForeground: 'rgb(255 255 255)',
    secondary: 'rgb(245 245 245)',
    secondaryForeground: 'rgb(31 31 31)',
    muted: 'rgb(245 245 245)',
    mutedForeground: 'rgb(109 109 109)',
    accent: 'rgb(245 245 245)',
    accentForeground: 'rgb(31 31 31)',
    destructive: 'rgb(217 48 54)',
    border: 'rgb(234 234 234)',
    input: 'rgb(234 234 234)',
    ring: 'rgb(67 125 251)',
    chart1: 'rgb(67 125 251)',
    chart2: 'rgb(245 245 245)',
    chart3: 'rgb(234 234 234)',
    chart4: 'rgb(109 109 109)',
    chart5: 'rgb(31 31 31)',
    sidebar: 'rgb(252 252 252)',
    sidebarForeground: 'rgb(31 31 31)',
    sidebarPrimary: 'rgb(67 125 251)',
    sidebarPrimaryForeground: 'rgb(255 255 255)',
    sidebarAccent: 'rgb(245 245 245)',
    sidebarAccentForeground: 'rgb(31 31 31)',
    sidebarBorder: 'rgb(234 234 234)',
    sidebarRing: 'rgb(67 125 251)',
  },
  dark: {
    background: 'rgb(20 20 20)', 
    foreground: 'rgb(247 247 247)', 
    card: 'rgb(26 26 26)', 
    cardForeground: 'rgb(247 247 247)', 
    popover: 'rgb(26 26 26)', 
    popoverForeground: 'rgb(247 247 247)', 
    primary: 'rgb(139 92 246)', 
    primaryForeground: 'rgb(255 255 255)', 
    secondary: 'rgb(37 37 37)', 
    secondaryForeground: 'rgb(247 247 247)', 
    muted: 'rgb(37 37 37)', 
    mutedForeground: 'rgb(138 138 139)', 
    accent: 'rgb(32 32 32)', 
    accentForeground: 'rgb(247 247 247)', 
    destructive: 'rgb(239 68 68)', 
    border: 'rgb(37 37 37)', 
    input: 'rgb(37 37 37)', 
    ring: 'rgb(139 92 246)', 
    chart1: 'rgb(139 92 246)', 
    chart2: 'rgb(37 37 37)', 
    chart3: 'rgb(32 32 32)', 
    chart4: 'rgb(138 138 139)', 
    chart5: 'rgb(247 247 247)', 
    sidebar: 'rgb(20 20 20)', 
    sidebarForeground: 'rgb(247 247 247)', 
    sidebarPrimary: 'rgb(139 92 246)', 
    sidebarPrimaryForeground: 'rgb(255 255 255)', 
    sidebarAccent: 'rgb(32 32 32)', 
    sidebarAccentForeground: 'rgb(247 247 247)', 
    sidebarBorder: 'rgb(49 49 53)', 
    sidebarRing: 'rgb(139 92 246)', 
  },
};

export const themeFonts: ThemeFonts = {
  sans: "'Geist', 'Geist Fallback', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  serif: "'Geist', 'Geist Fallback', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  mono: "'Geist Mono', 'Geist Mono Fallback', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

export const themeRadii: ThemeRadii = {
  sm: 'calc(0.5rem - 4px)',
  md: 'calc(0.5rem - 2px)',
  lg: '0.5rem',
  xl: 'calc(0.5rem + 4px)',
};

export const themeShadows: ThemeShadows = {
  '2xs': '0 1px 3px 0px rgb(0 0 0 / 0.03)',
  xs: '0 1px 3px 0px rgb(0 0 0 / 0.03)',
  sm: '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  md: '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.05)',
  lg: '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 4px 6px -1px rgb(0 0 0 / 0.05)',
  xl: '0 1px 3px 0px rgb(0 0 0 / 0.05), 0 8px 10px -1px rgb(0 0 0 / 0.05)',
  '2xl': '0 1px 3px 0px rgb(0 0 0 / 0.13)',
};

// Helper function to convert RGB to HSL for CSS variables
export function rgbToHsl(rgb: string): string {
  // Extract RGB values
  const rgbMatch = rgb.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\)/);
  if (!rgbMatch) return '0 0% 0%';
  
  const r = parseInt(rgbMatch[1], 10) / 255;
  const g = parseInt(rgbMatch[2], 10) / 255;
  const b = parseInt(rgbMatch[3], 10) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Helper function to generate CSS variables from theme config
export function generateCssVariables(theme: ThemeConfig): Record<string, Record<string, string>> {
  const lightHsl: Record<string, string> = {};
  const darkHsl: Record<string, string> = {};
  
  // Convert RGB values to HSL for CSS variables
  Object.entries(theme.light).forEach(([key, value]) => {
    lightHsl[key] = rgbToHsl(value);
  });
  
  Object.entries(theme.dark).forEach(([key, value]) => {
    darkHsl[key] = rgbToHsl(value);
  });
  
  return {
    light: lightHsl,
    dark: darkHsl
  };
}
