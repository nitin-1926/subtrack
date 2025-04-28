import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/expenses - Get all expenses
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const searchParams = request.nextUrl.searchParams;

		// Parse filter parameters
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const category = searchParams.get('category');
		const merchant = searchParams.get('merchant');
		const minAmount = searchParams.get('minAmount');
		const maxAmount = searchParams.get('maxAmount');

		// Build the filter object
		const filter: Prisma.ExpenseWhereInput = {
			gmailAccount: {
				userId,
			},
		};

		// Date range filter
		if (startDate || endDate) {
			filter.date = {};
			if (startDate) filter.date.gte = new Date(startDate);
			if (endDate) filter.date.lte = new Date(endDate);
		}

		// Category filter
		if (category) filter.category = category;

		// Merchant filter
		if (merchant) filter.merchant = { contains: merchant, mode: 'insensitive' };

		// Amount range filter
		if (minAmount || maxAmount) {
			filter.amount = {};
			if (minAmount) filter.amount.gte = parseFloat(minAmount);
			if (maxAmount) filter.amount.lte = parseFloat(maxAmount);
		}

		const expenses = await prisma.expense.findMany({
			where: filter,
			include: {
				gmailAccount: {
					select: {
						email: true,
					},
				},
			},
			orderBy: {
				date: 'desc',
			},
		});

		return NextResponse.json(expenses);
	} catch (error) {
		console.error('Failed to get expenses:', error);
		return NextResponse.json({ error: 'Failed to get expenses' }, { status: 500 });
	}
}

// POST /api/expenses - Create an expense
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const body = await request.json();

		const { gmailAccountId, amount, currency = 'USD', merchant, category, date, description, receiptId } = body;

		// Verify the Gmail account belongs to the user
		const gmailAccount = await prisma.gmailAccount.findFirst({
			where: {
				id: gmailAccountId,
				userId,
			},
		});

		if (!gmailAccount) {
			return NextResponse.json({ error: 'Gmail account not found or not authorized' }, { status: 403 });
		}

		const expense = await prisma.expense.create({
			data: {
				gmailAccountId,
				amount: parseFloat(amount),
				currency,
				merchant,
				category,
				date: new Date(date),
				description,
				receiptId,
			},
		});

		return NextResponse.json(expense, { status: 201 });
	} catch (error) {
		console.error('Failed to create expense:', error);
		return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
	}
}
