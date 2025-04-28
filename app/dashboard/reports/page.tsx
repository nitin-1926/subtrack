'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
	BarChart as BarChartIcon,
	PieChart as PieChartIcon,
	ArrowRight,
	CreditCard,
	TrendingUp,
	Download,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useInsightsContext } from '@/components/insights/insights-provider';
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	LineChart,
	Line,
} from 'recharts';

// Chart colors
const COLORS = [
	'#A78BFA', // Muted purple
	'#93C5FD', // Soft blue
	'#6EE7B7', // Pastel green
	'#FCD34D', // Soft yellow
	'#FDA4AF', // Pastel red
	'#F9A8D4', // Soft pink
	'#A5B4FC', // Pastel indigo
	'#C4B5FD', // Lavender
	'#5EEAD4', // Pastel teal
];

export default function ReportsPage() {
	const { subscriptions, expenses, categoryBreakdowns, timelineData, accountInsights } = useInsightsContext();

	const [timeRange, setTimeRange] = useState('6months');

	// Calculate summary statistics
	const totalMonthlySubscriptions = subscriptions.reduce((total, sub) => total + sub.amount, 0);
	const totalExpenses = expenses.reduce((total, exp) => total + exp.amount, 0);
	const totalSpending = totalMonthlySubscriptions + totalExpenses;

	// Prepare timeline data based on selected time range
	const timeRangeMap = {
		'1month': 1,
		'3months': 3,
		'6months': 6,
		'1year': 12,
	};

	const selectedMonths = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 6;
	const filteredTimelineData = {
		expenses: timelineData.expenses.slice(-selectedMonths),
		subscriptions: timelineData.subscriptions.slice(-selectedMonths),
	};

	// Format data for combined line chart
	const combinedTimelineData = filteredTimelineData.expenses.map((item, index) => ({
		date: item.date,
		expenses: item.amount,
		subscriptions: filteredTimelineData.subscriptions[index]?.amount || 0,
		total: item.amount + (filteredTimelineData.subscriptions[index]?.amount || 0),
	}));

	return (
		<div className="container-app animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Reports & Analytics</h1>
				<div className="flex gap-2">
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Time Range" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1month">Last Month</SelectItem>
							<SelectItem value="3months">Last 3 Months</SelectItem>
							<SelectItem value="6months">Last 6 Months</SelectItem>
							<SelectItem value="1year">Last Year</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" size="icon">
						<Download className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<CreditCard className="h-8 w-8 mb-2 text-muted-foreground" />
							<div className="text-2xl font-bold">{formatCurrency(totalMonthlySubscriptions)}</div>
							<p className="text-sm text-muted-foreground">Monthly Subscriptions</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<TrendingUp className="h-8 w-8 mb-2 text-muted-foreground" />
							<div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
							<p className="text-sm text-muted-foreground">Total Expenses</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center">
							<div className="text-2xl font-bold">{formatCurrency(totalSpending)}</div>
							<p className="text-sm text-muted-foreground">Total Spending</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="spending-trends" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
					<TabsTrigger value="spending-trends">
						<TrendingUp className="mr-2 h-4 w-4" />
						Spending Trends
					</TabsTrigger>
					<TabsTrigger value="category-breakdown">
						<PieChartIcon className="mr-2 h-4 w-4" />
						Category Breakdown
					</TabsTrigger>
					<TabsTrigger value="account-insights">
						<BarChartIcon className="mr-2 h-4 w-4" />
						Account Insights
					</TabsTrigger>
				</TabsList>

				<TabsContent value="spending-trends">
					<Card>
						<CardHeader>
							<CardTitle>Spending Over Time</CardTitle>
							<CardDescription>Track your expenses and subscriptions over time</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={combinedTimelineData}
										margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickFormatter={value => {
												const date = new Date(value);
												return format(date, 'MMM yy');
											}}
										/>
										<YAxis
											tickFormatter={value => {
												return formatCurrency(value).split('.')[0];
											}}
										/>
										<Tooltip
											formatter={(value: number) => [formatCurrency(value), 'Amount']}
											labelFormatter={label => {
												const date = new Date(label);
												return format(date, 'MMMM yyyy');
											}}
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey="expenses"
											stroke={COLORS[0]}
											strokeWidth={2}
											activeDot={{ r: 8 }}
										/>
										<Line
											type="monotone"
											dataKey="subscriptions"
											stroke={COLORS[2]}
											strokeWidth={2}
											activeDot={{ r: 8 }}
										/>
										<Line
											type="monotone"
											dataKey="total"
											stroke={COLORS[4]}
											strokeWidth={2}
											strokeDasharray="5 5"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="category-breakdown">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Subscription Categories</CardTitle>
								<CardDescription>Distribution of your subscriptions by category</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[350px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categoryBreakdowns.subscriptions}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={120}
												fill="#8884d8"
												dataKey="value"
												nameKey="name"
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
											>
												{categoryBreakdowns.subscriptions.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Expense Categories</CardTitle>
								<CardDescription>Distribution of your expenses by category</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[350px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categoryBreakdowns.expenses}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={120}
												fill="#8884d8"
												dataKey="value"
												nameKey="name"
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
											>
												{categoryBreakdowns.expenses.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="account-insights">
					<Card>
						<CardHeader>
							<CardTitle>Account Spending Comparison</CardTitle>
							<CardDescription>Compare spending across your connected accounts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={accountInsights}
										margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="accountName" />
										<YAxis
											tickFormatter={value => {
												return formatCurrency(value).split('.')[0];
											}}
										/>
										<Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
										<Legend />
										<Bar dataKey="totalAmount" name="Total Amount" fill={COLORS[0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
