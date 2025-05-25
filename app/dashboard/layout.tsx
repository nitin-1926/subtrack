'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePathname } from 'next/navigation';
import './glassmorphism.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	
	// Function to get the current page title based on pathname
	const getPageTitle = () => {
		if (pathname === '/dashboard') return 'Dashboard';
		if (pathname.includes('/subscriptions')) return 'Subscriptions';
		if (pathname.includes('/expenses')) return 'Expenses';
		if (pathname.includes('/email-sync')) return 'Email Sync';
		if (pathname.includes('/reports')) return 'Reports';
		if (pathname.includes('/settings')) return 'Settings';
		return 'Dashboard';
	};

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Sidebar Panel */}
			<Sidebar />
			
			{/* Main Content Panel */}
			<div className="flex-1 overflow-hidden bg-background">
				<main className="h-full overflow-auto">
					<div className="h-full p-2">
						<div className="h-full overflow-hidden bg-card rounded-xl">
							<div className="px-6 py-4">
								<PageHeader />
								{children}
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
