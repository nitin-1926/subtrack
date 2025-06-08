'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { useInsights } from '@/hooks/useInsights';
import { useGmailSync } from '@/hooks/useGmailSync';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

export default function EmailSyncPage() {
	const { gmailAccounts, syncAccount, connectAccount, disconnectAccount, isLoading: insightsLoading } = useInsights();
	const [syncingId, setSyncingId] = useState<string | null>(null);
	const [syncProgress, setSyncProgress] = useState<number>(0);
	const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
	const [newAccountEmail, setNewAccountEmail] = useState('');
	const [newAccountName, setNewAccountName] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [syncOptions, setSyncOptions] = useState({
		subscriptions: true,
		newsletters: true,
		expenses: true,
		syncDepth: '3months',
	});

	// Gmail OAuth integration
	const searchParams = useSearchParams();
	const {
		isAuthenticated,
		isLoading,
		error,
		startAuthFlow,
		handleAuthCallback,
		scanEmails,
		subscriptionCandidates,
		disconnect,
	} = useGmailSync({
		onAuthSuccess: tokens => {
			console.log('Gmail authentication successful');
			setNewAccountEmail('Gmail Account');
			setNewAccountName('Gmail');
			setSyncStatus('success');
		},
		onError: error => {
			console.error('Gmail authentication error:', error);
			setSyncStatus('error');
		},
	});

	// Handle OAuth callback
	useEffect(() => {
		const code = searchParams.get('code');
		if (code) {
			handleAuthCallback(code);
			// Clean up the URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, [searchParams, handleAuthCallback]);

	const handleSync = async (accountId: string) => {
		setSyncingId(accountId);
		setSyncStatus('syncing');
		setSyncProgress(0);

		const interval = setInterval(() => {
			setSyncProgress(prev => {
				if (prev >= 100) {
					clearInterval(interval);
					return 100;
				}
				return prev + 10;
			});
		}, 300);

		try {
			// Use the scanEmails function from our hook
			const results = await scanEmails();
			console.log('Subscription scan results:', results);

			if (subscriptionCandidates.length > 0) {
				console.log('Found subscription candidates:', subscriptionCandidates);
				// Here you would typically send these to your backend
			}

			setSyncStatus('success');
			setSyncProgress(100);
		} catch (error) {
			console.error('Sync error:', error);
			setSyncStatus('error');
			clearInterval(interval);
		} finally {
			setSyncingId(null);
			setTimeout(() => {
				setSyncStatus('idle');
			}, 3000);
		}
	};

	const handleConnect = async () => {
		startAuthFlow();
	};

	const handleDisconnect = async (accountId: string) => {
		disconnect();
		await disconnectAccount(accountId);
	};

	const handleSyncOptionChange = (option: keyof typeof syncOptions, value: boolean | string) => {
		setSyncOptions(prev => ({
			...prev,
			[option]: value,
		}));
	};

	return (
		<div className="container-app animate-fade-in">
			<div className="flex justify-end mb-6">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button className="flex items-center gap-2" disabled={isLoading}>
							<Mail className="h-4 w-4" />
							{isLoading ? 'Connecting...' : 'Connect Gmail Account'}
						</Button>
					</DialogTrigger>
				</Dialog>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Connect Gmail Account</DialogTitle>
						<DialogDescription>
							Connect your Gmail account to automatically detect subscriptions and analyze your spending.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="items-center gap-4">
							<div className="space-y-4">
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Secure OAuth Authentication</AlertTitle>
									<AlertDescription>
										You'll be redirected to Google to securely authorize access to your Gmail
										account. We never see or store your password.
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
										<div className="flex items-center space-x-4">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={`https://ui-avatars.com/api/?name=${account.name}&background=8B5CF6&color=fff`}
												/>
												<AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{account.name}</p>
												<p className="text-sm text-muted-foreground">{account.email}</p>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											{syncingId === account.id ? (
												<div className="flex items-center">
													<p className="text-sm mr-2">{syncProgress}%</p>
													<RefreshCw className="h-4 w-4 animate-spin" />
												</div>
											) : (
												<>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleSync(account.id)}
														disabled={syncingId !== null}
													>
														<RefreshCw className="h-4 w-4 mr-1" />
														Sync
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDisconnect(account.id)}
														disabled={syncingId !== null}
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Disconnect
													</Button>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
					<CardFooter>
						{syncStatus === 'success' && (
							<div className="w-full">
								<Alert className="bg-green-500/10 text-green-500 border-green-500/20">
									<CheckCircle className="h-4 w-4" />
									<AlertTitle>Sync Complete</AlertTitle>
									<AlertDescription>Email analysis completed successfully.</AlertDescription>
								</Alert>
							</div>
						)}
						{syncStatus === 'error' && (
							<div className="w-full">
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Sync Failed</AlertTitle>
									<AlertDescription>There was an error during the email analysis.</AlertDescription>
								</Alert>
							</div>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
