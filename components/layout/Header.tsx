'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export const Header = () => {
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
		<header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
			<div className="flex items-center">
				<h1 className="text-xl font-semibold">{getPageTitle()}</h1>
			</div>
		</header>
	);
};
