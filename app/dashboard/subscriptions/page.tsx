'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, BarChart, CalendarDays } from 'lucide-react';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { formatCurrency } from '@/lib/utils';
import { useInsightsContext } from '@/components/insights/insights-provider';
import { SubscriptionChart } from '@/components/dashboard/SubscriptionChart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
	const { subscriptions, categoryBreakdowns } = useInsightsContext();
	const [activeFilter, setActiveFilter] = useState('all');
	const [viewMode, setViewMode] = useState('list'); // "list" or "grid"

	const filteredSubscriptions =
		activeFilter === 'all' ? subscriptions : subscriptions.filter(sub => sub.category === activeFilter);

	const totalMonthly = subscriptions.reduce((total, sub) => total + sub.amount, 0);
	const categories = Array.from(new Set(subscriptions.map(sub => sub.category)));

	return (
		<div className="container-app animate-fade-in">
			<div className="grid gap-6 md:grid-cols-3 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<CreditCard className="h-8 w-8 mb-2 text-muted-foreground" />
							<div className="text-2xl font-bold">{subscriptions.length}</div>
							<p className="text-sm text-muted-foreground">Active Subscriptions</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<BarChart className="h-8 w-8 mb-2 text-muted-foreground" />
							<div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
							<p className="text-sm text-muted-foreground">Monthly Spending</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<CalendarDays className="h-8 w-8 mb-2 text-muted-foreground" />
							<div className="text-2xl font-bold">{categories.length}</div>
							<p className="text-sm text-muted-foreground">Categories</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="list">List View</TabsTrigger>
					<TabsTrigger value="grid">Grid View</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Subscription Distribution</CardTitle>
								<CardDescription>By category</CardDescription>
							</CardHeader>
							<CardContent>
								<SubscriptionChart data={categoryBreakdowns.subscriptions} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Top Subscriptions</CardTitle>
								<CardDescription>By monthly cost</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{subscriptions
										.sort((a, b) => b.amount - a.amount)
										.slice(0, 5)
										.map(sub => (
											<div key={sub.id} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={sub.logoUrl} />
														<AvatarFallback>{sub.serviceName[0]}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{sub.serviceName}</p>
														<p className="text-xs text-muted-foreground">{sub.category}</p>
													</div>
												</div>
												<span className="font-semibold">{formatCurrency(sub.amount)}</span>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="list">
					<div className="grid gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>All Subscriptions</CardTitle>
									<CardDescription>Manage your active subscriptions</CardDescription>
								</div>
								<Select value={activeFilter} onValueChange={setActiveFilter}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter by category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{categories.map(category => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</CardHeader>
							<CardContent>
								<SubscriptionList subscriptions={filteredSubscriptions} />
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="grid">
					<div className="grid gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>All Subscriptions</CardTitle>
									<CardDescription>Manage your active subscriptions</CardDescription>
								</div>
								<Select value={activeFilter} onValueChange={setActiveFilter}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter by category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{categories.map(category => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{filteredSubscriptions.map(subscription => (
										<div
											key={subscription.id}
											className="border rounded-lg p-4 hover:shadow-md transition-shadow"
										>
											<div className="flex flex-col h-full">
												<div className="flex items-center mb-3">
													<Avatar className="h-10 w-10 mr-3">
														<AvatarImage src={subscription.logoUrl} />
														<AvatarFallback>{subscription.serviceName[0]}</AvatarFallback>
													</Avatar>
													<div>
														<h3 className="font-medium">{subscription.serviceName}</h3>
														<Badge variant="outline">{subscription.category}</Badge>
													</div>
												</div>
												<div className="flex-grow"></div>
												<div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
													<div>
														<p className="text-xs text-muted-foreground">Amount</p>
														<p className="font-semibold">
															{formatCurrency(subscription.amount)}
														</p>
													</div>
													<div>
														<p className="text-xs text-muted-foreground">Next billing</p>
														<p className="font-medium">
															{format(new Date(subscription.billingDate), 'MMM d, yyyy')}
														</p>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
