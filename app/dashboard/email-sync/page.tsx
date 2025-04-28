'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, Mail, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useInsightsContext } from '@/components/insights/insights-provider';
import { format } from 'date-fns';

export default function EmailSyncPage() {
	const { gmailAccounts, connectAccount } = useInsightsContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleConnect = async () => {
		setIsLoading(true);
		// Simulate OAuth process
		setTimeout(() => {
			// After successful OAuth, we would create a new account
			const mockEmail = 'user.oauth@gmail.com';
			const mockName = 'OAuth User';
			connectAccount(mockEmail, mockName);
			setIsLoading(false);
			setIsDialogOpen(false);
		}, 1500);
	};

	const handleSyncAccount = async (accountId: string) => {
		setIsLoading(true);
		// In a real app, this would trigger a sync
		setTimeout(() => {
			setIsLoading(false);
		}, 1500);
	};

	const handleDisconnect = async (accountId: string) => {
		setIsLoading(true);
		// In a real app, this would disconnect the account
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	};

	return (
		<div className="container-app animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Email Sync</h1>
				<div className="flex gap-2">
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="flex items-center gap-2" disabled={isLoading}>
								<Mail className="h-4 w-4" />
								{isLoading ? 'Connecting...' : 'Connect Gmail Account'}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Connect Gmail Account</DialogTitle>
								<DialogDescription>
									Connect your Gmail account to automatically detect subscriptions and analyze your
									spending.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="items-center gap-4">
									<div className="space-y-4">
										<Alert>
											<AlertCircle className="h-4 w-4" />
											<AlertTitle>Secure OAuth Authentication</AlertTitle>
											<AlertDescription>
												You'll be redirected to Google to securely authorize access to your
												Gmail account. We never see or store your password.
											</AlertDescription>
										</Alert>

										<div className="flex items-center space-x-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>Detects subscription emails</span>
										</div>

										<div className="flex items-center space-x-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>Identifies recurring payments</span>
										</div>

										<div className="flex items-center space-x-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span>Helps you track forgotten subscriptions</span>
										</div>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button onClick={handleConnect} disabled={isLoading} className="w-full">
									{isLoading ? 'Connecting...' : 'Connect with Google'}
									{!isLoading && <ExternalLink className="ml-2 h-4 w-4" />}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Connected Gmail Accounts</CardTitle>
						<CardDescription>
							Manage your connected email accounts for subscription tracking
						</CardDescription>
					</CardHeader>
					<CardContent>
						{gmailAccounts.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Mail className="mx-auto h-12 w-12 opacity-20 mb-4" />
								<p>No Gmail accounts connected yet.</p>
								<p className="text-sm">Connect an account to start tracking your subscriptions.</p>
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
												<p className="text-sm text-muted-foreground">{account.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="flex flex-col items-end mr-4">
												<Badge variant={account.connected ? 'default' : 'outline'}>
													{account.connected ? 'Connected' : 'Disconnected'}
												</Badge>
												{account.lastSynced && (
													<span className="text-xs text-muted-foreground">
														Last synced:{' '}
														{format(new Date(account.lastSynced), 'MMM d, yyyy HH:mm')}
													</span>
												)}
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSyncAccount(account.id)}
													disabled={isLoading || !account.connected}
												>
													<RefreshCw className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="text-destructive"
													onClick={() => handleDisconnect(account.id)}
													disabled={isLoading || !account.connected}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
					<CardFooter className="border-t p-4 bg-muted/10">
						<div className="flex flex-col space-y-2 w-full text-sm">
							<h4 className="font-semibold">About Gmail Integration</h4>
							<p className="text-muted-foreground">
								Our Gmail integration scans your emails for subscription confirmation and payment
								receipts. We never store your actual emails, only extract subscription data.
							</p>
							<div className="flex justify-end">
								<Button variant="link" className="p-0 h-auto" asChild>
									<a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center">
										Learn more about data privacy <ExternalLink className="ml-1 h-3 w-3" />
									</a>
								</Button>
							</div>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
