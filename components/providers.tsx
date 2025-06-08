'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeInitializer } from '@/components/theme/theme-initializer';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<ThemeProvider>
				<NextThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<ThemeInitializer />
					{children}
					<Toaster />
					<SonnerToaster />
				</NextThemeProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}
