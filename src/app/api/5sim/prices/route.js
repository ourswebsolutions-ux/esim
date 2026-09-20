import { NextResponse } from "next/server";

const FIVESIM_BASE_URL =
  process.env.FIVESIM_BASE_URL || "https://5sim.net/v1";

const MARKUP = Number(process.env.FIVESIM_MARKUP || 0);

/**
 * Calculate customer price.
 *
 * Provider: $0.25 
 * fsdf
 * Markup:   $0.10
 * Customer: $0.35
 */
function addMarkup(cost) {
  const providerCost = Number(cost);

  if (!Number.isFinite(providerCost)) {
    return cost;
  }

  return Number((providerCost + MARKUP).toFixed(4));
}

/**
 * Recursively add markup to every "cost" field.
 */
function applyMarkupToPrices(value) {
  if (Array.isArray(value)) {
    return value.map(applyMarkupToPrices);
  }

  if (value !== null && typeof value === "object") {
    const result = {};

    for (const [key, val] of Object.entries(value)) {
      if (key === "cost" && Number.isFinite(Number(val))) {
        result[key] = addMarkup(val);
      } else {
        result[key] = applyMarkupToPrices(val);
      }
    }

    return result;
  }

  return value;
}

/**
 * Fetch 5SIM API and return formatted response.
 */
async function fetchFiveSim(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
    };
  }

  return {
    ok: true,
    status: 200,
    data,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const country = searchParams.get("country");
    const product = searchParams.get("product");
    const operator = searchParams.get("operator");

    /*
     * ============================================================
     * 1. ALL PRICES
     *
     * GET /api/5sim/prices
     * ============================================================
     */

    if (!country && !product && !operator) {
      const result = await fetchFiveSim(
        `${FIVESIM_BASE_URL}/guest/prices`
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: result.data,
          },
          {
            status: result.status,
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: applyMarkupToPrices(result.data),
        markup: MARKUP,
      });
    }

    /*
     * ============================================================
     * 2. COUNTRY + OPERATOR
     *
     * GET /api/5sim/prices?country=england&operator=vodafone
     * ============================================================
     */

    if (country && operator && !product) {
      const url =
        `${FIVESIM_BASE_URL}/guest/products/` +
        `${encodeURIComponent(country)}/` +
        `${encodeURIComponent(operator)}`;

      const result = await fetchFiveSim(url);

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: result.data,
          },
          {
            status: result.status,
          }
        );
      }

      return NextResponse.json({
        success: true,
        country,
        operator,
        data: applyMarkupToPrices(result.data),
        markup: MARKUP,
      });
    }

    /*
     * ============================================================
     * 3. COUNTRY
     *
     * GET /api/5sim/prices?country=england
     * ============================================================
     */

    if (country && !product && !operator) {
      const url =
        `${FIVESIM_BASE_URL}/guest/prices` +
        `?country=${encodeURIComponent(country)}`;

      const result = await fetchFiveSim(url);

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: result.data,
          },
          {
            status: result.status,
          }
        );
      }

      return NextResponse.json({
        success: true,
        country,
        data: applyMarkupToPrices(result.data),
        markup: MARKUP,
      });
    }

    /*
     * ============================================================
     * 4. COUNTRY + PRODUCT
     *
     * GET /api/5sim/prices?country=england&product=facebook
     * ============================================================
     */

    if (country && product) {
      const url =
        `${FIVESIM_BASE_URL}/guest/prices` +
        `?country=${encodeURIComponent(country)}` +
        `&product=${encodeURIComponent(product)}`;

      const result = await fetchFiveSim(url);

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: result.data,
          },
          {
            status: result.status,
          }
        );
      }

      return NextResponse.json({
        success: true,
        country,
        product,
        data: applyMarkupToPrices(result.data),
        markup: MARKUP,
      });
    }

    /*
     * ============================================================
     * INVALID PARAMETERS
     * ============================================================
     */

    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid parameters. Use country, product and/or operator.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error("5SIM_PRICES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to 5SIM API",
      },
      {
        status: 500,
      }
    );
  }
}