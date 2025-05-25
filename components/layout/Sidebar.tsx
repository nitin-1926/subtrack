'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, CreditCard, Home, LogOut, Mail, Settings, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false });
			router.push('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	const navigation = [
		{ name: 'Dashboard', to: '/dashboard', icon: Home },
		{ name: 'Subscriptions', to: '/dashboard/subscriptions', icon: CreditCard },
		{ name: 'Expenses', to: '/dashboard/expenses', icon: ShoppingBag },
		{ name: 'Email Sync', to: '/dashboard/email-sync', icon: Mail },
		{ name: 'Reports', to: '/dashboard/reports', icon: Calendar },
		{ name: 'Settings', to: '/dashboard/settings', icon: Settings },
	];

	const getUserInitials = () => {
		if (!session?.user?.name) return 'U';
		const nameParts = session.user.name.split(' ');
		if (nameParts.length >= 2) {
			return `${nameParts[0][0]}${nameParts[1][0]}`;
		}
		return nameParts[0][0];
	};

	return (
		<div className="hidden md:flex flex-col w-56 bg-sidebar">
			{/* Sidebar Header */}
			<div className="flex items-center h-16 px-6">
				<span className="text-lg font-normal text-sidebar-foreground tracking-tight">SubTrack</span>
			</div>

			{/* Navigation */}
			<div className="flex flex-col justify-between flex-1 overflow-y-auto">
				<nav className="p-3 space-y-3">
					{navigation.map(item => {
						// Only match exact paths or direct children, not all descendants
						let isActive = false;
						if (item.to === '/dashboard') {
							isActive = pathname === '/dashboard';
						} else {
							isActive = pathname.startsWith(item.to);
						}
						return (
							<Link
								key={item.name}
								href={item.to}
								className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ${isActive ? 'bg-sidebar-active text-sidebar-active-foreground font-medium border-l-2 border-sidebar-primary shadow-sm' : 'text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-hover-foreground hover:border-l-2 hover:border-sidebar-primary/70'}`}
							>
								<item.icon className="mr-3 h-4 w-4" />
								{item.name}
							</Link>
						);
					})}
				</nav>

				{/* User Profile */}
				<div className="p-4 mt-auto">
					<div className="flex items-center">
						<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sidebar-foreground">
							<span className="text-sm font-normal">{session?.user?.name?.charAt(0) || 'N'}</span>
						</div>
						<div className="ml-3">
							<p className="text-sm font-normal text-sidebar-foreground">{session?.user?.name || 'Nitin'}</p>
							<p className="text-xs text-muted-foreground">{session?.user?.email || 'nitin@gmail.com'}</p>
						</div>
						<button
							className="ml-auto p-1 rounded-md hover:bg-sidebar-hover text-muted-foreground hover:text-sidebar-hover-foreground"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
