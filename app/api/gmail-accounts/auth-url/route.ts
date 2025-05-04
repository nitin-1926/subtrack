import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import gmailApi from '../gmailApi';

export async function GET(request: NextRequest) {
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
