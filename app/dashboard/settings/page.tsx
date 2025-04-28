'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Download, Trash2, Mail, LogOut, RefreshCw, CreditCard } from 'lucide-react';
import { useInsightsContext } from '@/components/insights/insights-provider';

export default function SettingsPage() {
	const { gmailAccounts } = useInsightsContext();
	const [userProfile, setUserProfile] = useState({
		name: 'John Doe',
		email: 'john.doe@example.com',
		avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff',
	});

	const [isLoading, setIsLoading] = useState(false);
	const [notificationSettings, setNotificationSettings] = useState({
		emailNotifications: true,
		monthlyReports: true,
		newSubscriptionsDetected: true,
		billingReminders: true,
	});

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// In a real app, this would update the profile
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	};

	const handleToggleNotification = (setting: keyof typeof notificationSettings) => {
		setNotificationSettings({
			...notificationSettings,
			[setting]: !notificationSettings[setting],
		});
	};

	const handleExportData = () => {
		// In a real app, this would export data
		alert('Data export initiated. Check your email for the download link.');
	};

	const handleDeleteAccount = () => {
		// In a real app, this would open a confirmation dialog
		alert('This action cannot be undone. Please contact support to delete your account.');
	};

	return (
		<div className="container-app animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Settings</h1>
			</div>

			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
					<TabsTrigger value="profile">
						<User className="mr-2 h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="notifications">
						<Bell className="mr-2 h-4 w-4" />
						Notifications
					</TabsTrigger>
					<TabsTrigger value="security">
						<Shield className="mr-2 h-4 w-4" />
						Security
					</TabsTrigger>
					<TabsTrigger value="accounts">
						<Mail className="mr-2 h-4 w-4" />
						Connected Accounts
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>Profile Settings</CardTitle>
							<CardDescription>Manage your profile information</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleProfileUpdate}>
								<div className="flex flex-col md:flex-row gap-8">
									<div className="flex flex-col items-center gap-4">
										<Avatar className="h-24 w-24">
											<AvatarImage src={userProfile.avatarUrl} />
											<AvatarFallback>{userProfile.name[0]}</AvatarFallback>
										</Avatar>
										<Button variant="outline" size="sm">
											Change Avatar
										</Button>
									</div>
									<div className="flex-1 space-y-4">
										<div className="grid gap-2">
											<Label htmlFor="name">Full Name</Label>
											<Input
												id="name"
												value={userProfile.name}
												onChange={e =>
													setUserProfile({
														...userProfile,
														name: e.target.value,
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="email">Email Address</Label>
											<Input
												id="email"
												type="email"
												value={userProfile.email}
												onChange={e =>
													setUserProfile({
														...userProfile,
														email: e.target.value,
													})
												}
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="current-password">Current Password</Label>
											<Input id="current-password" type="password" />
										</div>
										<div className="grid gap-2">
											<Label htmlFor="new-password">New Password</Label>
											<Input id="new-password" type="password" />
										</div>
									</div>
								</div>
							</form>
						</CardContent>
						<CardFooter className="border-t p-4 flex justify-end gap-2">
							<Button variant="outline">Cancel</Button>
							<Button onClick={handleProfileUpdate} disabled={isLoading}>
								{isLoading ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									'Save Changes'
								)}
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>

				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>Manage your notification settings</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">Email Notifications</h3>
										<p className="text-sm text-muted-foreground">
											Receive email notifications from the application
										</p>
									</div>
									<Switch
										checked={notificationSettings.emailNotifications}
										onCheckedChange={() => handleToggleNotification('emailNotifications')}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">Monthly Report Summary</h3>
										<p className="text-sm text-muted-foreground">
											Receive a monthly summary of your subscriptions and expenses
										</p>
									</div>
									<Switch
										checked={notificationSettings.monthlyReports}
										onCheckedChange={() => handleToggleNotification('monthlyReports')}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">New Subscription Alerts</h3>
										<p className="text-sm text-muted-foreground">
											Get notified when a new subscription is detected
										</p>
									</div>
									<Switch
										checked={notificationSettings.newSubscriptionsDetected}
										onCheckedChange={() => handleToggleNotification('newSubscriptionsDetected')}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">Billing Reminders</h3>
										<p className="text-sm text-muted-foreground">
											Receive reminders before subscription billing dates
										</p>
									</div>
									<Switch
										checked={notificationSettings.billingReminders}
										onCheckedChange={() => handleToggleNotification('billingReminders')}
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter className="border-t p-4 flex justify-end">
							<Button>Save Preferences</Button>
						</CardFooter>
					</Card>
				</TabsContent>

				<TabsContent value="security">
					<Card>
						<CardHeader>
							<CardTitle>Security & Privacy</CardTitle>
							<CardDescription>Manage your account security and privacy settings</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-medium mb-2">Export Your Data</h3>
									<p className="text-sm text-muted-foreground mb-2">
										Download a copy of all your data from SubTrack in CSV format
									</p>
									<Button variant="outline" className="flex items-center" onClick={handleExportData}>
										<Download className="mr-2 h-4 w-4" />
										Export Data
									</Button>
								</div>

								<div className="border-t pt-6">
									<h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
									<p className="text-sm text-muted-foreground mb-4">
										These actions are irreversible and will permanently affect your account
									</p>
									<div className="flex flex-col sm:flex-row gap-4">
										<Button variant="outline" className="text-destructive flex items-center">
											<RefreshCw className="mr-2 h-4 w-4" />
											Reset All Settings
										</Button>
										<Button
											variant="destructive"
											className="flex items-center"
											onClick={handleDeleteAccount}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete Account
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="accounts">
					<Card>
						<CardHeader>
							<CardTitle>Connected Accounts</CardTitle>
							<CardDescription>Manage your connected email and payment accounts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-medium mb-4">Email Accounts</h3>
									{gmailAccounts.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground border rounded-lg">
											<Mail className="mx-auto h-12 w-12 opacity-20 mb-4" />
											<p>No email accounts connected yet.</p>
											<p className="text-sm">
												Connect an account to start tracking your subscriptions.
											</p>
										</div>
									) : (
										<div className="space-y-4">
											{gmailAccounts.map(account => (
												<div
													key={account.id}
													className="flex items-center justify-between p-4 border rounded-lg"
												>
													<div className="flex items-center gap-4">
														<Avatar className="h-10 w-10">
															<AvatarImage src={account.avatarUrl} />
															<AvatarFallback>{account.name[0]}</AvatarFallback>
														</Avatar>
														<div>
															<h4 className="font-medium">{account.name}</h4>
															<p className="text-sm text-muted-foreground">
																{account.email}
															</p>
														</div>
													</div>
													<div className="flex gap-2">
														<Button size="sm" variant="outline">
															<RefreshCw className="h-4 w-4 mr-2" />
															Sync
														</Button>
														<Button
															size="sm"
															variant="outline"
															className="text-destructive"
														>
															<LogOut className="h-4 w-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								<div className="border-t pt-6">
									<h3 className="text-lg font-medium mb-4">Payment Methods</h3>
									<div className="text-center py-8 text-muted-foreground border rounded-lg">
										<CreditCard className="mx-auto h-12 w-12 opacity-20 mb-4" />
										<p>No payment methods added yet.</p>
										<p className="text-sm">Add a payment method to automatically track charges.</p>
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="border-t p-4 flex justify-end gap-2">
							<Button variant="outline">
								<Mail className="mr-2 h-4 w-4" />
								Connect Email
							</Button>
							<Button>
								<CreditCard className="mr-2 h-4 w-4" />
								Add Payment Method
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
