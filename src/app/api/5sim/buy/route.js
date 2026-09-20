import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { checkPurchaseRateLimit } from "../../../../lib/purchase-rate-limit";

const FIVESIM_BASE_URL =
  process.env.FIVESIM_BASE_URL || "https://5sim.net/v1";

const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY;

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    // ==================================================
    // 1. Validate 5SIM configuration
    // ==================================================

    if (!FIVESIM_API_KEY) {
      console.error("FIVESIM_API_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          error: "5SIM API is not configured",
        },
        { status: 500 }
      );
    }

    // ==================================================
    // 2. Get authenticated user
    // ==================================================

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

    // ==================================================
    // 3. Session expiry
    // ==================================================

    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired",
        },
        { status: 401 }
      );
    }

    // ==================================================
    // 4. Account status
    // ==================================================

    if (session.user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 403 }
      );
    }

    // ==================================================
    // 5. PURCHASE RATE LIMIT
    // ==================================================

    const rateLimit = await checkPurchaseRateLimit(
      session.user.id
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many purchase attempts",
          message: `Please wait ${rateLimit.retryAfter} seconds before trying again.`,
          retryAfter: rateLimit.retryAfter,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              rateLimit.retryAfter
            ),
          },
        }
      );
    }

    // ==================================================
    // 6. Read request body
    // ==================================================

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const country = String(body?.country || "")
      .trim()
      .toLowerCase();

    const operator = String(body?.operator || "")
      .trim()
      .toLowerCase();

    const product = String(body?.product || "")
      .trim()
      .toLowerCase();

    // ==================================================
    // 7. Validate parameters
    // ==================================================

    if (!country || !operator || !product) {
      return NextResponse.json(
        {
          success: false,
          error:
            "country, operator and product are required",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 8. Get current 5SIM price
    // ==================================================

    const priceUrl =
      `${FIVESIM_BASE_URL}/guest/prices` +
      `?country=${encodeURIComponent(country)}` +
      `&product=${encodeURIComponent(product)}`;

    const priceResponse = await fetch(priceUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const priceData =
      await parseJson(priceResponse);

    if (!priceResponse.ok) {
      console.error(
        "5SIM PRICE ERROR:",
        priceData
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify current price",
        },
        {
          status:
            priceResponse.status >= 400 &&
            priceResponse.status < 600
              ? priceResponse.status
              : 502,
        }
      );
    }

    // ==================================================
    // 9. Find country
    // ==================================================

    const countryData =
      priceData?.data?.[country] ||
      priceData?.[country];

    if (!countryData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Selected country is no longer available",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // 10. Find product
    // ==================================================

    const productData =
      countryData?.[product] ||
      countryData?.products?.[product];

    if (!productData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Selected service is no longer available",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // 11. Find operator
    // ==================================================

    const operatorData =
      productData?.[operator];

    if (!operatorData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Selected operator is no longer available",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // 12. Validate price
    // ==================================================

    const price = Number(operatorData.cost);

    const count = Number(
      operatorData.count || 0
    );

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid 5SIM price",
        },
        { status: 502 }
      );
    }

    // ==================================================
    // 13. Check availability
    // ==================================================

    if (!Number.isFinite(count) || count <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No numbers are currently available",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // 14. Check wallet balance
    // ==================================================

    const currentBalance =
      Number(session.user.balance);

    if (!Number.isFinite(currentBalance)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid account balance",
        },
        { status: 500 }
      );
    }

    if (currentBalance < price) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient balance",
          balance: currentBalance,
          required: price,
        },
        { status: 402 }
      );
    }

    // ==================================================
    // 15. Buy number from 5SIM
    // ==================================================

    const purchaseUrl =
      `${FIVESIM_BASE_URL}/user/buy/activation/` +
      `${encodeURIComponent(country)}/` +
      `${encodeURIComponent(operator)}/` +
      `${encodeURIComponent(product)}`;

    const purchaseResponse = await fetch(
      purchaseUrl,
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${FIVESIM_API_KEY}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const purchaseData =
      await parseJson(purchaseResponse);

    // ==================================================
    // 16. 5SIM purchase failed
    // ==================================================

    if (!purchaseResponse.ok) {
      console.error(
        "5SIM PURCHASE ERROR:",
        purchaseData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            purchaseData?.message ||
            purchaseData?.error ||
            "5SIM purchase failed",
        },
        {
          status:
            purchaseResponse.status >= 400 &&
            purchaseResponse.status < 600
              ? purchaseResponse.status
              : 502,
        }
      );
    }

    // ==================================================
    // 17. Provider price
    // ==================================================

    const providerPriceValue = Number(
      purchaseData?.price ?? price
    );

    const providerPrice =
      Number.isFinite(providerPriceValue) &&
      providerPriceValue > 0
        ? providerPriceValue
        : price;

    // ==================================================
    // 18. Save order + deduct wallet
    // ==================================================

    const result =
      await prisma.$transaction(async (tx) => {
        // Re-read user inside transaction
        const user = await tx.user.findUnique({
          where: {
            id: session.user.id,
          },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("ACCOUNT_NOT_ACTIVE");
        }

        const balanceBefore =
          Number(user.balance);

        if (!Number.isFinite(balanceBefore)) {
          throw new Error("INVALID_BALANCE");
        }

        if (balanceBefore < providerPrice) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const balanceAfter = Number(
          (balanceBefore - providerPrice).toFixed(2)
        );

        // ----------------------------------------------
        // Create order
        // ----------------------------------------------

        const createdOrder =
          await tx.order.create({
            data: {
              userId: user.id,

              fiveSimId:
                purchaseData?.id != null
                  ? String(purchaseData.id)
                  : null,

              country:
                purchaseData?.country || country,

              operator:
                purchaseData?.operator || operator,

              product:
                purchaseData?.product || product,

              phone:
                purchaseData?.phone || null,

              amount: providerPrice,

              providerPrice,

              currency: "USD",

              status: "ACTIVE",

              expiresAt:
                purchaseData?.expires
                  ? new Date(
                      purchaseData.expires
                    )
                  : null,
            },
          });

        // ----------------------------------------------
        // Deduct balance
        // ----------------------------------------------

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            balance: balanceAfter,
          },
        });

        // ----------------------------------------------
        // Create transaction
        // ----------------------------------------------

        await tx.transaction.create({
          data: {
            userId: user.id,

            orderId: createdOrder.id,

            type: "PURCHASE",

            amount: providerPrice,

            balanceBefore,

            balanceAfter,

            currency: "USD",

            description:
              `5SIM ${product} number purchase`,
          },
        });

        return {
          order: createdOrder,
          balanceBefore,
          balanceAfter,
        };
      });

    // ==================================================
    // 19. Success
    // ==================================================

    return NextResponse.json({
      success: true,

      order: {
        id: result.order.id,

        fiveSimId:
          result.order.fiveSimId,

        phone:
          result.order.phone,

        country:
          result.order.country,

        operator:
          result.order.operator,

        product:
          result.order.product,

        price:
          Number(result.order.amount),

        providerPrice:
          Number(
            result.order.providerPrice || 0
          ),

        status:
          result.order.status,

        expires:
          result.order.expiresAt,

        sms:
          purchaseData?.sms || null,

        created_at:
          result.order.createdAt,
      },

      balance:
        result.balanceAfter,

      rateLimit: {
        remaining:
          rateLimit.remaining,
      },

      message:
        "Number purchased successfully",
    });
  } catch (error) {
    console.error(
      "5SIM_BUY_ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient balance",
        },
        { status: 402 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "ACCOUNT_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "User account not found",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_BALANCE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid account balance",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete purchase",
      },
      { status: 500 }
    );
  }
}