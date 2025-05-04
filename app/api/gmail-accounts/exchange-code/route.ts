import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import gmailApi from '../gmailApi';

export async function POST(request: NextRequest) {
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
