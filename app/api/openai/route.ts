import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import openaiApi from './openaiApi';

// POST /api/openai/analyze-email - Analyze a single email
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { emailContent, gmailAccountId } = body;

		if (!emailContent || !gmailAccountId) {
			return NextResponse.json({ error: 'Email content and Gmail account ID are required' }, { status: 400 });
		}

		const result = await openaiApi.analyzeEmail(emailContent, gmailAccountId);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Failed to analyze email:', error);
		return NextResponse.json({ error: 'Failed to analyze email' }, { status: 500 });
	}
}

// POST /api/openai/batch-analyze - Batch analyze multiple emails
export async function POST_BATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { emails, gmailAccountId } = body;

		if (!emails || !Array.isArray(emails) || !gmailAccountId) {
			return NextResponse.json({ error: 'Emails array and Gmail account ID are required' }, { status: 400 });
		}

		const results = await openaiApi.batchAnalyzeEmails(emails, gmailAccountId);
		return NextResponse.json(results);
	} catch (error) {
		console.error('Failed to batch analyze emails:', error);
		return NextResponse.json({ error: 'Failed to batch analyze emails' }, { status: 500 });
	}
}
