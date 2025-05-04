import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import gmailApi from './gmailApi';

// GET /api/gmail-accounts - Get all Gmail accounts
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		const accounts = await prisma.gmailAccount.findMany({
			where: { userId },
		});

		return NextResponse.json(accounts);
	} catch (error) {
		console.error('Failed to get Gmail accounts:', error);
		return NextResponse.json({ error: 'Failed to get Gmail accounts' }, { status: 500 });
	}
}

// POST /api/gmail-accounts - Create a Gmail account
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const body = await request.json();

		const { email, accessToken, refreshToken, expiresAt } = body;

		// Check if account already exists
		const existingAccount = await prisma.gmailAccount.findUnique({
			where: { email },
		});

		if (existingAccount) {
			// If the account exists but belongs to another user, return error
			if (existingAccount.userId !== userId) {
				return NextResponse.json({ error: 'Email account already connected to another user' }, { status: 403 });
			}

			// Otherwise update the existing account
			const updatedAccount = await prisma.gmailAccount.update({
				where: { id: existingAccount.id },
				data: {
					accessToken,
					refreshToken,
					expiresAt: expiresAt ? new Date(expiresAt) : null,
				},
			});

			return NextResponse.json(updatedAccount);
		}

		// Create a new account
		const newAccount = await prisma.gmailAccount.create({
			data: {
				userId,
				email,
				accessToken,
				refreshToken,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
			},
		});

		return NextResponse.json(newAccount, { status: 201 });
	} catch (error) {
		console.error('Failed to create/update Gmail account:', error);
		return NextResponse.json({ error: 'Failed to create/update Gmail account' }, { status: 500 });
	}
}

// GET /api/gmail-accounts/auth-url - Get Gmail OAuth URL
export async function GET_AUTH_URL(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const authUrl = gmailApi.getAuthUrl();
		return NextResponse.json({ authUrl });
	} catch (error) {
		console.error('Failed to get Gmail auth URL:', error);
		return NextResponse.json({ error: 'Failed to get Gmail auth URL' }, { status: 500 });
	}
}

// POST /api/gmail-accounts/exchange-code - Exchange authorization code for tokens
export async function POST_EXCHANGE_CODE(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { code } = body;

		if (!code) {
			return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
		}

		const tokens = await gmailApi.exchangeCodeForTokens(code);
		return NextResponse.json(tokens);
	} catch (error) {
		console.error('Failed to exchange code for tokens:', error);
		return NextResponse.json({ error: 'Failed to exchange code for tokens' }, { status: 500 });
	}
}

// GET /api/gmail-accounts/messages - Get Gmail messages
export async function GET_MESSAGES(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const { searchParams } = new URL(request.url);
		const accountId = searchParams.get('accountId');
		const query = searchParams.get('query') || '';
		const maxResults = parseInt(searchParams.get('maxResults') || '50');

		if (!accountId) {
			return NextResponse.json({ error: 'Gmail account ID is required' }, { status: 400 });
		}

		// Get the Gmail account
		const account = await prisma.gmailAccount.findUnique({
			where: { id: accountId },
		});

		if (!account || account.userId !== userId) {
			return NextResponse.json({ error: 'Gmail account not found' }, { status: 404 });
		}

		// Check if token needs refresh
		if (account.expiresAt && account.expiresAt < new Date()) {
			if (!account.refreshToken) {
				return NextResponse.json({ error: 'Refresh token not found' }, { status: 400 });
			}
			const newTokens = await gmailApi.refreshAccessToken(account.refreshToken as string);
			await prisma.gmailAccount.update({
				where: { id: accountId },
				data: {
					accessToken: newTokens.access_token,
					expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
				},
			});
			account.accessToken = newTokens.access_token;
		}

		const messages = await gmailApi.getMessages(account.accessToken as string, query, maxResults);
		return NextResponse.json(messages);
	} catch (error) {
		console.error('Failed to get Gmail messages:', error);
		return NextResponse.json({ error: 'Failed to get Gmail messages' }, { status: 500 });
	}
}

// GET /api/gmail-accounts/subscription-emails - Search for subscription emails
export async function GET_SUBSCRIPTION_EMAILS(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const { searchParams } = new URL(request.url);
		const accountId = searchParams.get('accountId');

		if (!accountId) {
			return NextResponse.json({ error: 'Gmail account ID is required' }, { status: 400 });
		}

		// Get the Gmail account
		const account = await prisma.gmailAccount.findUnique({
			where: { id: accountId },
		});

		if (!account || account.userId !== userId) {
			return NextResponse.json({ error: 'Gmail account not found' }, { status: 404 });
		}

		// Check if token needs refresh
		if (account.expiresAt && account.expiresAt < new Date()) {
			if (!account.refreshToken) {
				return NextResponse.json({ error: 'Refresh token not found' }, { status: 400 });
			}
			const newTokens = await gmailApi.refreshAccessToken(account.refreshToken as string);
			await prisma.gmailAccount.update({
				where: { id: accountId },
				data: {
					accessToken: newTokens.access_token,
					expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
				},
			});
			account.accessToken = newTokens.access_token;
		}

		// Ensure accessToken is not null before passing to API
		if (!account.accessToken) {
			return NextResponse.json({ error: 'Access token not found' }, { status: 400 });
		}

		const messages = await gmailApi.searchSubscriptionEmails(account.accessToken as string);
		return NextResponse.json(messages);
	} catch (error) {
		console.error('Failed to search subscription emails:', error);
		return NextResponse.json({ error: 'Failed to search subscription emails' }, { status: 500 });
	}
}
