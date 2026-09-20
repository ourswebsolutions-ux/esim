import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // Get session cookie
    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Find logged-in user
    const session = await prisma.session.findUnique({
      where: {
        sessionToken,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session",
        },
        { status: 401 }
      );
    }

    // Check session expiry
    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired",
        },
        { status: 401 }
      );
    }

    // Check account status
    if (session.user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 403 }
      );
    }

    // Fetch user's orders from database
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        fiveSimId: true,

        country: true,
        operator: true,
        product: true,

        phone: true,

        amount: true,
        providerPrice: true,
        currency: true,

        status: true,

        expiresAt: true,
        completedAt: true,
        cancelledAt: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    // Format response
    const formattedOrders = orders.map((order) => ({
      id: order.id,

      fiveSimId: order.fiveSimId,

      country: order.country,
      operator: order.operator,
      product: order.product,

      phone: order.phone,

      price: Number(order.amount),

      providerPrice: order.providerPrice
        ? Number(order.providerPrice)
        : null,

      currency: order.currency,

      status: order.status,

      expiresAt: order.expiresAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      success: true,

      count: formattedOrders.length,

      orders: formattedOrders,
    });
  } catch (error) {
    console.error(
      "GET_ORDERS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch orders",
      },
      { status: 500 }
    );
  }
}