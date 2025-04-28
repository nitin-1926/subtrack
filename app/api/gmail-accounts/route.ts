import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
