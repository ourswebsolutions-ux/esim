import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required",
        },
        { status: 400 }
      );
    }

    // Get logged-in session
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

    // Find session + user
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

    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired",
        },
        { status: 401 }
      );
    }

    if (session.user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 403 }
      );
    }

    // IMPORTANT:
    // Only allow this user to access his own order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    const hasOtp =
      Boolean(order.smsCode) ||
      Boolean(order.smsText);

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,

        fiveSimId: order.fiveSimId,

        phone: order.phone,

        country: order.country,

        operator: order.operator,

        product: order.product,

        price: Number(order.amount),

        providerPrice: order.providerPrice
          ? Number(order.providerPrice)
          : null,

        currency: order.currency,

        status: order.status,

        otp: order.smsCode || null,

        sms: order.smsText || null,

        hasOtp,

        otpStatus: hasOtp
          ? "RECEIVED"
          : "WAITING",

        expiresAt: order.expiresAt,

        completedAt: order.completedAt,

        cancelledAt: order.cancelledAt,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET_ORDER_DETAILS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch order details",
      },
      { status: 500 }
    );
  }
}