import { prisma } from "./prisma";

const MAX_ATTEMPTS = Number(
  process.env.PURCHASE_RATE_LIMIT || 5
);

const WINDOW_SECONDS = Number(
  process.env.PURCHASE_RATE_WINDOW_SECONDS || 60
);

export async function checkPurchaseRateLimit(userId) {
  const now = new Date();

  const limit =
    Number.isFinite(MAX_ATTEMPTS) && MAX_ATTEMPTS > 0
      ? Math.floor(MAX_ATTEMPTS)
      : 5;

  const windowSeconds =
    Number.isFinite(WINDOW_SECONDS) && WINDOW_SECONDS > 0
      ? Math.floor(WINDOW_SECONDS)
      : 60;

  const existing = await prisma.purchaseRateLimit.findUnique({
    where: {
      userId,
    },
  });

  // No previous window
  if (!existing) {
    const windowStartedAt = now;
    const windowEndsAt = new Date(
      now.getTime() + windowSeconds * 1000
    );

    await prisma.purchaseRateLimit.create({
      data: {
        userId,
        attempts: 1,
        windowStartedAt,
        windowEndsAt,
      },
    });

    return {
      allowed: true,
      attempts: 1,
      remaining: Math.max(limit - 1, 0),
      retryAfter: 0,
    };
  }

  // Previous window expired
  if (existing.windowEndsAt <= now) {
    const windowStartedAt = now;
    const windowEndsAt = new Date(
      now.getTime() + windowSeconds * 1000
    );

    const updated = await prisma.purchaseRateLimit.update({
      where: {
        userId,
      },
      data: {
        attempts: 1,
        windowStartedAt,
        windowEndsAt,
      },
    });

    return {
      allowed: true,
      attempts: updated.attempts,
      remaining: Math.max(limit - updated.attempts, 0),
      retryAfter: 0,
    };
  }

  // Limit reached
  if (existing.attempts >= limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil(
        (existing.windowEndsAt.getTime() - now.getTime()) /
          1000
      )
    );

    return {
      allowed: false,
      attempts: existing.attempts,
      remaining: 0,
      retryAfter,
    };
  }

  // Increment attempt
  const updated = await prisma.purchaseRateLimit.update({
    where: {
      userId,
    },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });

  return {
    allowed: true,
    attempts: updated.attempts,
    remaining: Math.max(limit - updated.attempts, 0),
    retryAfter: 0,
  };
}