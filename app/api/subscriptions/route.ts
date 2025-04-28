import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/subscriptions - Get all subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Failed to get subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to get subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create a subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      gmailAccountId,
      name,
      amount,
      currency = "USD",
      frequency = "MONTHLY",
      category,
      lastBilledAt,
      nextBillingAt,
      status = "ACTIVE",
    } = body;

    // Verify the Gmail account belongs to the user
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: {
        id: gmailAccountId,
        userId,
      },
    });

    if (!gmailAccount) {
      return NextResponse.json(
        { error: "Gmail account not found or not authorized" },
        { status: 403 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        gmailAccountId,
        name,
        amount: parseFloat(amount),
        currency,
        frequency,
        category,
        lastBilledAt: lastBilledAt ? new Date(lastBilledAt) : null,
        nextBillingAt: nextBillingAt ? new Date(nextBillingAt) : null,
        status,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
