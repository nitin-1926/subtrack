import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/subscriptions/[id] - Get a subscription by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const id = params.id;

		const subscription = await prisma.subscription.findFirst({
			where: {
				id,
				gmailAccount: {
					userId,
				},
			},
			include: {
				gmailAccount: {
					select: {
						email: true,
					},
				},
			},
		});

		if (!subscription) {
			return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
		}

		return NextResponse.json(subscription);
	} catch (error) {
		console.error('Failed to get subscription:', error);
		return NextResponse.json({ error: 'Failed to get subscription' }, { status: 500 });
	}
}

// PUT /api/subscriptions/[id] - Update a subscription
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const id = params.id;
		const body = await request.json();

		// Verify the subscription belongs to the user
		const existingSubscription = await prisma.subscription.findFirst({
			where: {
				id,
				gmailAccount: {
					userId,
				},
			},
		});

		if (!existingSubscription) {
			return NextResponse.json({ error: 'Subscription not found or not authorized' }, { status: 404 });
		}

		const { name, amount, currency, frequency, category, lastBilledAt, nextBillingAt, status } = body;

		const updatedSubscription = await prisma.subscription.update({
			where: { id },
			data: {
				name: name !== undefined ? name : undefined,
				amount: amount !== undefined ? parseFloat(amount) : undefined,
				currency: currency !== undefined ? currency : undefined,
				frequency: frequency !== undefined ? frequency : undefined,
				category: category !== undefined ? category : undefined,
				lastBilledAt: lastBilledAt !== undefined ? new Date(lastBilledAt) : undefined,
				nextBillingAt: nextBillingAt !== undefined ? new Date(nextBillingAt) : undefined,
				status: status !== undefined ? status : undefined,
			},
		});

		return NextResponse.json(updatedSubscription);
	} catch (error) {
		console.error('Failed to update subscription:', error);
		return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
	}
}

// DELETE /api/subscriptions/[id] - Delete a subscription
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const id = params.id;

		// Verify the subscription belongs to the user
		const existingSubscription = await prisma.subscription.findFirst({
			where: {
				id,
				gmailAccount: {
					userId,
				},
			},
		});

		if (!existingSubscription) {
			return NextResponse.json({ error: 'Subscription not found or not authorized' }, { status: 404 });
		}

		await prisma.subscription.delete({
			where: { id },
		});

		return NextResponse.json({ message: 'Subscription deleted successfully' });
	} catch (error) {
		console.error('Failed to delete subscription:', error);
		return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
	}
}
