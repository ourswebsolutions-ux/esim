import { NextResponse } from "next/server";
import { cookies } from "next/headers";


import { prisma } from "../../../lib/prisma";

// =====================================================
// ADMIN AUTH
// =====================================================

async function requireAdmin() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      ),
    };
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
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid session",
        },
        { status: 401 }
      ),
    };
  }

  if (session.expiresAt <= new Date()) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Session expired",
        },
        { status: 401 }
      ),
    };
  }

  if (session.user.status !== "ACTIVE") {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 403 }
      ),
    };
  }

  if (session.user.role !== "USER") {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    user: session.user,
  };
}


// =====================================================
// GET
// =====================================================

export async function GET(request) {
  try {
    const auth = await requireAdmin();

    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const action = searchParams.get("action") || "dashboard";

    // =================================================
    // DASHBOARD
    // =================================================

    if (action === "dashboard") {
      const now = new Date();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);

      const monthStart = new Date(todayStart);
      monthStart.setDate(monthStart.getDate() - 30);

      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        bannedUsers,

        newUsersToday,
        newUsersWeek,
        newUsersMonth,

        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,

        totalSales,
        todaySales,
        yesterdaySales,
        weekSales,
        monthSales,

        totalRefunds,
        todayRefunds,

        totalTransactions,
        todayTransactions,

        providerCost,
      ] = await Promise.all([
        // USERS
        prisma.user.count(),

        prisma.user.count({
          where: {
            status: "ACTIVE",
          },
        }),

        prisma.user.count({
          where: {
            status: "SUSPENDED",
          },
        }),

        prisma.user.count({
          where: {
            status: "BANNED",
          },
        }),

        // NEW USERS
        prisma.user.count({
          where: {
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        prisma.user.count({
          where: {
            createdAt: {
              gte: weekStart,
            },
          },
        }),

        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
            },
          },
        }),

        // ORDERS
        prisma.order.count(),

        prisma.order.count({
          where: {
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        prisma.order.count({
          where: {
            createdAt: {
              gte: weekStart,
            },
          },
        }),

        prisma.order.count({
          where: {
            createdAt: {
              gte: monthStart,
            },
          },
        }),

        // TOTAL SALES
        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),

        // TODAY SALES
        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: todayStart,
            },
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),

        // YESTERDAY SALES
        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: yesterdayStart,
              lt: todayStart,
            },
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),

        // 7 DAYS SALES
        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: weekStart,
            },
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),

        // 30 DAYS SALES
        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: monthStart,
            },
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),

        // REFUNDS
        prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: "REFUND",
          },
        }),

        prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: "REFUND",
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        // TRANSACTIONS
        prisma.transaction.count(),

        prisma.transaction.count({
          where: {
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        // PROVIDER COST
        prisma.order.aggregate({
          _sum: {
            providerPrice: true,
          },
          where: {
            status: {
              in: ["COMPLETED", "SMS_RECEIVED", "ACTIVE"],
            },
          },
        }),
      ]);


      const sales = Number(totalSales._sum.amount || 0);

      const todaySale = Number(
        todaySales._sum.amount || 0
      );

      const yesterdaySale = Number(
        yesterdaySales._sum.amount || 0
      );

      const weeklySale = Number(
        weekSales._sum.amount || 0
      );

      const monthlySale = Number(
        monthSales._sum.amount || 0
      );

      const refunds = Number(
        totalRefunds._sum.amount || 0
      );

      const todayRefund = Number(
        todayRefunds._sum.amount || 0
      );

      const cost = Number(
        providerCost._sum.providerPrice || 0
      );

      const grossProfit = sales - cost;

      const profitMargin =
        sales > 0
          ? Number(
              ((grossProfit / sales) * 100).toFixed(2)
            )
          : 0;


      // TOP CUSTOMERS
      const topCustomers = await prisma.user.findMany({
        where: {
          orders: {
            some: {
              status: {
                in: [
                  "COMPLETED",
                  "SMS_RECEIVED",
                  "ACTIVE",
                ],
              },
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          balance: true,

          _count: {
            select: {
              orders: true,
            },
          },

          orders: {
            where: {
              status: {
                in: [
                  "COMPLETED",
                  "SMS_RECEIVED",
                  "ACTIVE",
                ],
              },
            },
            select: {
              amount: true,
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });


      const formattedTopCustomers =
        topCustomers
          .map((user) => {
            const spent = user.orders.reduce(
              (total, order) =>
                total + Number(order.amount),
              0
            );

            return {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              balance: Number(user.balance),
              purchases: user._count.orders,
              spent,
            };
          })
          .sort((a, b) => b.spent - a.spent);


      // RECENT ORDERS
      const recentOrders = await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });


      // RECENT TRANSACTIONS
      const recentTransactions =
        await prisma.transaction.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });


      return NextResponse.json({
        success: true,

        dashboard: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            banned: bannedUsers,

            newToday: newUsersToday,
            newThisWeek: newUsersWeek,
            newThisMonth: newUsersMonth,
          },

          purchases: {
            total: totalOrders,
            today: todayOrders,
            thisWeek: weekOrders,
            thisMonth: monthOrders,
          },

          sales: {
            total: sales,
            today: todaySale,
            yesterday: yesterdaySale,
            thisWeek: weeklySale,
            thisMonth: monthlySale,
          },

          refunds: {
            total: refunds,
            today: todayRefund,
          },

          transactions: {
            total: totalTransactions,
            today: todayTransactions,
          },

          finance: {
            grossRevenue: sales,
            providerCost: cost,
            grossProfit,
            netRevenue: sales - refunds,
            profitMargin,
          },

          topCustomers: formattedTopCustomers,

          recentOrders,

          recentTransactions,
        },
      });
    }


    // =================================================
    // USERS
    // =================================================

    if (action === "users") {
      const page = Math.max(
        Number(searchParams.get("page") || 1),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(searchParams.get("limit") || 20),
          1
        ),
        100
      );

      const search =
        searchParams.get("search")?.trim() || "";

      const status =
        searchParams.get("status") || "";

      const role =
        searchParams.get("role") || "";

      const where = {};

      if (search) {
        where.OR = [
          {
            fullName: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ];
      }

      if (
        ["ACTIVE", "SUSPENDED", "BANNED"].includes(status)
      ) {
        where.status = status;
      }

      if (["USER", "ADMIN"].includes(role)) {
        where.role = role;
      }

      const [users, total] =
        await Promise.all([
          prisma.user.findMany({
            where,

            orderBy: {
              createdAt: "desc",
            },

            skip: (page - 1) * limit,

            take: limit,

            select: {
              id: true,
              fullName: true,
              email: true,
              image: true,
              balance: true,
              role: true,
              status: true,
              createdAt: true,
              updatedAt: true,

              _count: {
                select: {
                  orders: true,
                },
              },

              orders: {
                select: {
                  amount: true,
                },
              },
            },
          }),

          prisma.user.count({
            where,
          }),
        ]);


      const formattedUsers = users.map(
        (user) => {
          const spent = user.orders.reduce(
            (total, order) =>
              total + Number(order.amount),
            0
          );

          const purchases =
            user._count.orders;

          return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            image: user.image,
            balance: Number(user.balance),
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            totalPurchases: purchases,
            totalSpent: spent,

            averagePurchase:
              purchases > 0
                ? Number(
                    (spent / purchases).toFixed(2)
                  )
                : 0,
          };
        }
      );


      return NextResponse.json({
        success: true,

        users: formattedUsers,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
        },
      });
    }


    // =================================================
    // SINGLE USER
    // =================================================

    if (action === "user") {
      const userId = searchParams.get("id");

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required",
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          orders: {
            orderBy: {
              createdAt: "desc",
            },
            take: 20,
          },

          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 20,
          },

          _count: {
            select: {
              orders: true,
              transactions: true,
            },
          },
        },
      });


      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }


      const totalSpent =
        user.orders.reduce(
          (total, order) =>
            total + Number(order.amount),
          0
        );


      return NextResponse.json({
        success: true,

        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          image: user.image,
          balance: Number(user.balance),
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,

          totalPurchases:
            user._count.orders,

          totalTransactions:
            user._count.transactions,

          totalSpent,

          averagePurchase:
            user._count.orders > 0
              ? Number(
                  (
                    totalSpent /
                    user._count.orders
                  ).toFixed(2)
                )
              : 0,

          recentOrders: user.orders,

          recentTransactions:
            user.transactions,
        },
      });
    }


    // =================================================
    // USER STATS
    // =================================================

    if (action === "user-stats") {
      const userId = searchParams.get("id");

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required",
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }


      const now = new Date();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date(todayStart);
      weekStart.setDate(
        weekStart.getDate() - 7
      );

      const monthStart = new Date(todayStart);
      monthStart.setDate(
        monthStart.getDate() - 30
      );


      const [
        total,
        today,
        weekly,
        monthly,
        totalSpent,
        todaySpent,
        weeklySpent,
        monthlySpent,
      ] = await Promise.all([
        prisma.order.count({
          where: {
            userId,
          },
        }),

        prisma.order.count({
          where: {
            userId,
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        prisma.order.count({
          where: {
            userId,
            createdAt: {
              gte: weekStart,
            },
          },
        }),

        prisma.order.count({
          where: {
            userId,
            createdAt: {
              gte: monthStart,
            },
          },
        }),

        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
          },
        }),

        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
            createdAt: {
              gte: weekStart,
            },
          },
        }),

        prisma.order.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
            createdAt: {
              gte: monthStart,
            },
          },
        }),
      ]);


      const totalAmount =
        Number(totalSpent._sum.amount || 0);

      return NextResponse.json({
        success: true,

        stats: {
          totalPurchases: total,
          todayPurchases: today,
          weeklyPurchases: weekly,
          monthlyPurchases: monthly,

          totalSpent: totalAmount,

          todaySpent: Number(
            todaySpent._sum.amount || 0
          ),

          weeklySpent: Number(
            weeklySpent._sum.amount || 0
          ),

          monthlySpent: Number(
            monthlySpent._sum.amount || 0
          ),

          averagePurchase:
            total > 0
              ? Number(
                  (
                    totalAmount / total
                  ).toFixed(2)
                )
              : 0,
        },
      });
    }


    // =================================================
    // ORDERS
    // =================================================

    if (action === "orders") {
      const page = Math.max(
        Number(searchParams.get("page") || 1),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(searchParams.get("limit") || 30),
          1
        ),
        100
      );

      const status =
        searchParams.get("status");

      const userId =
        searchParams.get("userId");

      const where = {};

      if (
        [
          "PENDING",
          "ACTIVE",
          "SMS_RECEIVED",
          "COMPLETED",
          "CANCELLED",
          "EXPIRED",
          "REFUNDED",
          "FAILED",
        ].includes(status)
      ) {
        where.status = status;
      }

      if (userId) {
        where.userId = userId;
      }


      const [orders, total] =
        await Promise.all([
          prisma.order.findMany({
            where,

            orderBy: {
              createdAt: "desc",
            },

            skip: (page - 1) * limit,

            take: limit,

            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          }),

          prisma.order.count({
            where,
          }),
        ]);


      const formattedOrders =
        orders.map((order) => {
          const amount =
            Number(order.amount);

          const providerPrice =
            order.providerPrice !== null
              ? Number(order.providerPrice)
              : null;

          return {
            id: order.id,
            fiveSimId: order.fiveSimId,
            user: order.user,

            country: order.country,
            operator: order.operator,
            product: order.product,
            phone: order.phone,

            amount,

            providerPrice,

            profit:
              providerPrice !== null
                ? amount - providerPrice
                : null,

            currency: order.currency,
            status: order.status,

            createdAt: order.createdAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt,
          };
        });


      return NextResponse.json({
        success: true,

        orders: formattedOrders,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
        },
      });
    }


    // =================================================
    // TRANSACTIONS
    // =================================================

    if (action === "transactions") {
      const page = Math.max(
        Number(searchParams.get("page") || 1),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(searchParams.get("limit") || 30),
          1
        ),
        100
      );

      const type =
        searchParams.get("type");

      const userId =
        searchParams.get("userId");

      const where = {};

      if (
        [
          "DEPOSIT",
          "PURCHASE",
          "REFUND",
          "BONUS",
          "ADJUSTMENT",
        ].includes(type)
      ) {
        where.type = type;
      }

      if (userId) {
        where.userId = userId;
      }


      const [transactions, total] =
        await Promise.all([
          prisma.transaction.findMany({
            where,

            orderBy: {
              createdAt: "desc",
            },

            skip: (page - 1) * limit,

            take: limit,

            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          }),

          prisma.transaction.count({
            where,
          }),
        ]);


      return NextResponse.json({
        success: true,

        transactions: transactions.map(
          (transaction) => ({
            id: transaction.id,
            user: transaction.user,

            type: transaction.type,

            amount:
              Number(transaction.amount),

            balanceBefore:
              Number(
                transaction.balanceBefore
              ),

            balanceAfter:
              Number(
                transaction.balanceAfter
              ),

            currency:
              transaction.currency,

            description:
              transaction.description,

            createdAt:
              transaction.createdAt,
          })
        ),

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
        },
      });
    }


    // =================================================
    // UNKNOWN ACTION
    // =================================================

    return NextResponse.json(
      {
        success: false,
        error: `Unknown action: ${action}`,
      },
      { status: 400 }
    );

  } catch (error) {
    console.error(
      "ADMIN_GET_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to process admin request",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// POST
// =====================================================

export async function POST(request) {
  try {
    const auth = await requireAdmin();

    if (!auth.success) {
      return auth.response;
    }

    const body = await request.json();

    const {
      action,
      userId,
    } = body;


    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: "Action is required",
        },
        { status: 400 }
      );
    }


    // =================================================
    // BALANCE
    // =================================================

    if (action === "balance") {
      const {
        operation,
        amount,
        reason,
      } = body;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required",
          },
          { status: 400 }
        );
      }

      if (
        !["ADD", "DEDUCT"].includes(
          operation
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Operation must be ADD or DEDUCT",
          },
          { status: 400 }
        );
      }

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid amount",
          },
          { status: 400 }
        );
      }


      const result =
        await prisma.$transaction(
          async (tx) => {
            const user =
              await tx.user.findUnique({
                where: {
                  id: userId,
                },
              });

            if (!user) {
              throw new Error(
                "USER_NOT_FOUND"
              );
            }

            const balanceBefore =
              Number(user.balance);

            let balanceAfter;

            if (
              operation === "ADD"
            ) {
              balanceAfter =
                balanceBefore +
                numericAmount;
            } else {
              balanceAfter =
                balanceBefore -
                numericAmount;

              if (balanceAfter < 0) {
                throw new Error(
                  "INSUFFICIENT_BALANCE"
                );
              }
            }


            const updatedUser =
              await tx.user.update({
                where: {
                  id: userId,
                },

                data: {
                  balance:
                    balanceAfter,
                },
              });


            const transaction =
              await tx.transaction.create({
                data: {
                  userId,

                  type: "ADJUSTMENT",

                  amount:
                    numericAmount,

                  balanceBefore,

                  balanceAfter,

                  currency:
                    user.currency ||
                    "USD",

                  description:
                    reason ||
                    `Admin ${
                      operation === "ADD"
                        ? "added"
                        : "deducted"
                    } balance`,
                },
              });


            return {
              updatedUser,
              transaction,
              balanceBefore,
              balanceAfter,
            };
          }
        );


      return NextResponse.json({
        success: true,

        message:
          operation === "ADD"
            ? "Balance added successfully"
            : "Balance deducted successfully",

        user: {
          id: result.updatedUser.id,
          balance:
            Number(
              result.updatedUser.balance
            ),
        },

        transaction: {
          id:
            result.transaction.id,
          type:
            result.transaction.type,
          amount:
            Number(
              result.transaction.amount
            ),
          balanceBefore:
            result.balanceBefore,
          balanceAfter:
            result.balanceAfter,
        },
      });
    }


    // =================================================
    // STATUS
    // =================================================

    if (action === "status") {
      const { status } = body;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required",
          },
          { status: 400 }
        );
      }

      if (
        ![
          "ACTIVE",
          "SUSPENDED",
          "BANNED",
        ].includes(status)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid user status",
          },
          { status: 400 }
        );
      }


      const user =
        await prisma.user.update({
          where: {
            id: userId,
          },

          data: {
            status,
          },

          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        });


      return NextResponse.json({
        success: true,

        message:
          "User status updated successfully",

        user,
      });
    }


    // =================================================
    // ROLE
    // =================================================

    if (action === "role") {
      const { role } = body;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required",
          },
          { status: 400 }
        );
      }

      if (
        !["USER", "ADMIN"].includes(role)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid user role",
          },
          { status: 400 }
        );
      }


      const user =
        await prisma.user.update({
          where: {
            id: userId,
          },

          data: {
            role,
          },

          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });


      return NextResponse.json({
        success: true,

        message:
          "User role updated successfully",

        user,
      });
    }


    return NextResponse.json(
      {
        success: false,
        error: `Unknown action: ${action}`,
      },
      { status: 400 }
    );

  } catch (error) {
    console.error(
      "ADMIN_POST_API_ERROR:",
      error
    );

    if (
      error?.message ===
      "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    if (
      error?.message ===
      "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User does not have enough balance",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to process admin action",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// DELETE
// =====================================================

export async function DELETE(request) {
  try {
    const auth = await requireAdmin();

    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } =
      new URL(request.url);

    const action =
      searchParams.get("action");

    const userId =
      searchParams.get("id");


    if (action !== "user") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid delete action",
        },
        { status: 400 }
      );
    }


    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }


    if (
      userId === auth.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot delete your own admin account",
        },
        { status: 400 }
      );
    }


    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });


    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }


    await prisma.user.delete({
      where: {
        id: userId,
      },
    });


    return NextResponse.json({
      success: true,

      message:
        "User deleted successfully",

      deletedUserId: userId,
    });

  } catch (error) {
    console.error(
      "ADMIN_DELETE_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to delete user",
      },
      { status: 500 }
    );
  }
}