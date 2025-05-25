'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, defaultTheme } from '@/lib/theme-config';

type ThemeContextType = {
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme: initialTheme = defaultTheme,
}: {
  children: ReactNode;
  defaultTheme?: ThemeConfig;
}) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(initialTheme);
  const [mounted, setMounted] = useState(false);

  // Update theme when it changes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to set a new theme
  const setTheme = (newTheme: ThemeConfig) => {
    setCurrentTheme(newTheme);
    // You could persist the theme to localStorage or an API here if needed
  };

  // Only render the provider when mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </NextThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
