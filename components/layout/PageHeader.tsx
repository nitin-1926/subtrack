'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, ShoppingBag, Mail, Calendar, Settings } from 'lucide-react';

interface PageHeaderProps {
	title?: string;
	children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
	const pathname = usePathname();

	const getPageTitle = () => {
		if (title) return title;
		if (pathname === '/dashboard') return 'Dashboard';
		if (pathname.includes('/subscriptions')) return 'Subscriptions';
		if (pathname.includes('/expenses')) return 'Expenses';
		if (pathname.includes('/email-sync')) return 'Email Sync';
		if (pathname.includes('/reports')) return 'Reports';
		if (pathname.includes('/settings')) return 'Settings';
		return 'Dashboard';
	};

	const getPageIcon = () => {
		if (pathname === '/dashboard') return Home;
		if (pathname.includes('/subscriptions')) return CreditCard;
		if (pathname.includes('/expenses')) return ShoppingBag;
		if (pathname.includes('/email-sync')) return Mail;
		if (pathname.includes('/reports')) return Calendar;
		if (pathname.includes('/settings')) return Settings;
		return Home;
	};

	const PageIcon = getPageIcon();

	return (
		<div className="flex items-center justify-between mb-6 pt-2">
			<div className="flex items-center">
				<PageIcon className="h-5 w-5 text-muted-foreground mr-2" />
				<h1 className="text-lg font-normal text-foreground">{getPageTitle()}</h1>
			</div>
			{children && <div className="flex items-center space-x-2">{children}</div>}
		</div>
	);
}
