import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { TooltipProvider } from '@/components/ui/tooltip';
import { InsightsProvider } from '@/components/insights/insights-provider';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'SubTrack - Email Subscription Tracker',
	description: 'Track and manage your email subscriptions and expenses',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<InsightsProvider>
						<TooltipProvider>
							<div className="flex min-h-screen flex-col">{children}</div>
						</TooltipProvider>
					</InsightsProvider>
				</Providers>
			</body>
		</html>
	);
}
