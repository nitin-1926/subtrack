'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Calendar, TrendingUp, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { StatCard } from '@/components/dashboard/StatCard';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { SubscriptionChart } from '@/components/dashboard/SubscriptionChart';
import { useInsights } from '@/hooks/useInsights';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
	const {
		subscriptions,
		expenses,
		gmailAccounts,
		insightSummary,
		categoryBreakdowns,
		timelineData,
		isLoading,
		connectAccount,
	} = useInsights();

	const [newAccountEmail, setNewAccountEmail] = React.useState('');
	const [newAccountName, setNewAccountName] = React.useState('');
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);

	const handleConnect = async () => {
		if (newAccountEmail && newAccountName) {
			await connectAccount(newAccountEmail, newAccountName);
			setNewAccountEmail('');
			setNewAccountName('');
			setIsDialogOpen(false);
		}
	};

	// Get the most recent expenses
	const recentExpenses = [...expenses]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	return (
		<div className="container-app animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
			</div>

			{/* Insight Stats */}
			<div className="grid gap-6 md:grid-cols-2 mb-6">
				<StatCard
					title="Monthly Subscriptions"
					value={formatCurrency(insightSummary.totalSubscriptionAmount)}
					description={`${insightSummary.totalSubscriptions} active subscriptions`}
					icon={<CreditCard className="h-4 w-4" />}
				/>
				<StatCard
					title="Monthly Expenses"
					value={formatCurrency(insightSummary.monthlyExpenseAmount)}
					description={`${insightSummary.totalExpenses} transactions tracked`}
					icon={<TrendingUp className="h-4 w-4" />}
				/>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
					<TabsTrigger value="insights">Insights</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{/* Recent Expenses */}
						<Card className="md:col-span-2 lg:col-span-1">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Recent Expenses</CardTitle>
								<CardDescription>Your latest transactions</CardDescription>
							</CardHeader>
							<CardContent className="pb-2">
								{recentExpenses.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										No recent expenses found
									</div>
								) : (
									<div className="space-y-4">
										{recentExpenses.map(expense => (
											<div key={expense.id} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="h-9 w-9">
														<AvatarImage src={expense.logoUrl} />
														<AvatarFallback>{expense.merchant[0]}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{expense.merchant}</p>
														<p className="text-xs text-muted-foreground">
															{format(new Date(expense.date), 'MMM d, yyyy')}
														</p>
													</div>
												</div>
												<span className="font-semibold">{formatCurrency(expense.amount)}</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
							<CardFooter className="pt-0">
								<Button variant="ghost" size="sm" className="w-full" asChild>
									<Link href="/dashboard/expenses">
										View All Expenses
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</CardFooter>
						</Card>

						{/* Upcoming Subscriptions */}
						<Card className="md:col-span-2 lg:col-span-1">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Upcoming Subscriptions</CardTitle>
								<CardDescription>Due in the next 7 days</CardDescription>
							</CardHeader>
							<CardContent className="pb-2">
								{subscriptions.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										No upcoming subscriptions
									</div>
								) : (
									<div className="space-y-4">
										{subscriptions.slice(0, 3).map(subscription => (
											<div key={subscription.id} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="h-9 w-9">
														<AvatarImage src={subscription.logoUrl} />
														<AvatarFallback>{subscription.serviceName[0]}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{subscription.serviceName}</p>
														<p className="text-xs text-muted-foreground">
															Due on{' '}
															{format(new Date(subscription.billingDate), 'MMM d, yyyy')}
														</p>
													</div>
												</div>
												<span className="font-semibold">
													{formatCurrency(subscription.amount)}
												</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
							<CardFooter className="pt-0">
								<Button variant="ghost" size="sm" className="w-full" asChild>
									<Link href="/dashboard/subscriptions">
										View All Subscriptions
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</CardFooter>
						</Card>

						{/* Connected Accounts */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Connected Accounts</CardTitle>
								<CardDescription>Your Gmail accounts</CardDescription>
							</CardHeader>
							<CardContent className="pb-2">
								{gmailAccounts.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">No accounts connected</div>
								) : (
									<div className="space-y-4">
										{gmailAccounts.map(account => (
											<div key={account.id} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="h-9 w-9">
														<AvatarImage src={account.avatarUrl} />
														<AvatarFallback>{account.name[0]}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{account.name}</p>
														<p className="text-xs text-muted-foreground">{account.email}</p>
													</div>
												</div>
												<Badge variant={account.connected ? 'default' : 'outline'}>
													{account.connected ? 'Connected' : 'Disconnected'}
												</Badge>
											</div>
										))}
									</div>
								)}
							</CardContent>
							<CardFooter className="pt-0">
								<Button variant="ghost" size="sm" className="w-full" asChild>
									<Link href="/dashboard/email-sync">
										Manage Accounts
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="subscriptions">
					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>All Subscriptions</CardTitle>
								<CardDescription>Manage your active subscriptions</CardDescription>
							</CardHeader>
							<CardContent>
								<SubscriptionList subscriptions={subscriptions} />
							</CardContent>
							<CardFooter>
								<Button variant="outline" className="w-full" asChild>
									<Link href="/dashboard/subscriptions">View All Details</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="insights">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Spending by Category</CardTitle>
								<CardDescription>Your subscription distribution</CardDescription>
							</CardHeader>
							<CardContent className="pt-4">
								<SubscriptionChart data={categoryBreakdowns.subscriptions} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Monthly Spending</CardTitle>
								<CardDescription>Your expense trends</CardDescription>
							</CardHeader>
							<CardContent className="pt-4">
								<div className="h-[300px]">{/* Timeline chart component would go here */}</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
