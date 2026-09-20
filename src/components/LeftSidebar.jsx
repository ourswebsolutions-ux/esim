"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   5SIM response shape (unchanged):

   { success: true, data: { country: { product: { operator: { cost, count } } } } }
   ──────────────────────────────────────────────────────────── */

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function unwrapPrices(raw) {
  if (!isPlainObject(raw)) return null;
  if (raw.success === true && isPlainObject(raw.data)) return raw.data;
  if (isPlainObject(raw.data)) return raw.data;
  return raw;
}

function formatPrice(cost) {
  if (cost == null || Number.isNaN(Number(cost))) return "—";
  const n = Number(cost);
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function formatCount(count) {
  if (count == null || Number.isNaN(Number(count))) return null;
  return Number(count).toLocaleString("en-US");
}

function prettifyName(slug) {
  if (!slug) return "";
  return String(slug)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function getProductStats(tree, productId) {
  let minCost = Infinity;
  let totalCount = 0;
  if (!isPlainObject(tree)) return { minCost: null, totalCount: 0 };
  for (const countryData of Object.values(tree)) {
    if (!isPlainObject(countryData)) continue;
    const operators = countryData[productId];
    if (!isPlainObject(operators)) continue;
    for (const op of Object.values(operators)) {
      if (!isPlainObject(op)) continue;
      const cost = Number(op.cost);
      const count = Number(op.count) || 0;
      if (!Number.isNaN(cost) && cost < minCost) minCost = cost;
      totalCount += count;
    }
  }
  return {
    minCost: minCost === Infinity ? null : minCost,
    totalCount,
  };
}

function parseProducts(tree) {
  if (!isPlainObject(tree)) return [];
  const productSet = new Set();
  for (const countryData of Object.values(tree)) {
    if (!isPlainObject(countryData)) continue;
    for (const productId of Object.keys(countryData)) {
      productSet.add(productId);
    }
  }
  return Array.from(productSet)
    .sort((a, b) => a.localeCompare(b))
    .map((id) => {
      const { minCost, totalCount } = getProductStats(tree, id);
      return {
        id,
        name: prettifyName(id),
        price: formatPrice(minCost),
        cost: minCost,
        count: formatCount(totalCount),
        rawCount: totalCount,
      };
    });
}

function parseCountries(tree) {
  if (!isPlainObject(tree)) return [];
  return Object.keys(tree)
    .filter((key) => isPlainObject(tree[key]))
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({
      id,
      name: prettifyName(id),
      flag: getCountryFlag(id),
    }));
}

function parseOperators(rawResponse, countryId, productId) {
  const tree = unwrapPrices(rawResponse);
  if (!isPlainObject(tree)) return [];

  let operatorsMap = null;

  if (countryId && isPlainObject(tree[countryId])) {
    const countryNode = tree[countryId];
    if (productId && isPlainObject(countryNode[productId])) {
      operatorsMap = countryNode[productId];
    } else {
      const keys = Object.keys(countryNode);
      if (keys.length === 1 && isPlainObject(countryNode[keys[0]])) {
        operatorsMap = countryNode[keys[0]];
      }
    }
  }

  if (!operatorsMap && productId && isPlainObject(tree[productId])) {
    operatorsMap = tree[productId];
  }

  if (!operatorsMap) {
    const values = Object.values(tree);
    if (
      values.length > 0 &&
      isPlainObject(values[0]) &&
      ("cost" in values[0] || "count" in values[0])
    ) {
      operatorsMap = tree;
    }
  }

  if (!isPlainObject(operatorsMap)) return [];

  return Object.entries(operatorsMap)
    .filter(([, data]) => isPlainObject(data) && ("cost" in data || "count" in data))
    .map(([opId, data]) => ({
      id: opId,
      name: prettifyName(opId),
      cost: Number(data.cost),
      price: formatPrice(data.cost),
      count: Number(data.count) || 0,
      countFormatted: formatCount(data.count),
      rate: data.rate != null ? Number(data.rate) : null,
    }))
    .sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1;
      if (a.count === 0 && b.count > 0) return 1;
      return (a.cost || 0) - (b.cost || 0);
    });
}

/* ─── Country flags ─── */
const COUNTRY_ISO = {
  afghanistan: "AF", albania: "AL", algeria: "DZ", angola: "AO", argentina: "AR",
  armenia: "AM", australia: "AU", austria: "AT", azerbaijan: "AZ", bahrain: "BH",
  bangladesh: "BD", belarus: "BY", belgium: "BE", bolivia: "BO", bosnia: "BA",
  brazil: "BR", bulgaria: "BG", cambodia: "KH", cameroon: "CM", canada: "CA",
  chile: "CL", china: "CN", colombia: "CO", croatia: "HR", cyprus: "CY",
  czech: "CZ", denmark: "DK", ecuador: "EC", egypt: "EG", england: "GB",
  estonia: "EE", ethiopia: "ET", finland: "FI", france: "FR", georgia: "GE",
  germany: "DE", ghana: "GH", greece: "GR", hongkong: "HK", hungary: "HU",
  india: "IN", indonesia: "ID", iran: "IR", iraq: "IQ", ireland: "IE",
  israel: "IL", italy: "IT", ivorycoast: "CI", japan: "JP", jordan: "JO",
  kazakhstan: "KZ", kenya: "KE", kuwait: "KW", kyrgyzstan: "KG", laos: "LA",
  latvia: "LV", lithuania: "LT", luxembourg: "LU", malaysia: "MY", mexico: "MX",
  moldova: "MD", mongolia: "MN", morocco: "MA", myanmar: "MM", nepal: "NP",
  netherlands: "NL", newzealand: "NZ", nigeria: "NG", norway: "NO", oman: "OM",
  pakistan: "PK", peru: "PE", philippines: "PH", poland: "PL", portugal: "PT",
  qatar: "QA", romania: "RO", russia: "RU", saudiarabia: "SA", serbia: "RS",
  singapore: "SG", slovakia: "SK", slovenia: "SI", southafrica: "ZA",
  southkorea: "KR", spain: "ES", srilanka: "LK", sweden: "SE", switzerland: "CH",
  taiwan: "TW", tajikistan: "TJ", thailand: "TH", tunisia: "TN", turkey: "TR",
  uganda: "UG", ukraine: "UA", uae: "AE", unitedarabemirates: "AE",
  unitedkingdom: "GB", uk: "GB", usa: "US", uzbekistan: "UZ", venezuela: "VE",
  vietnam: "VN", yemen: "YE", zambia: "ZM", zimbabwe: "ZW",
};

function getCountryFlag(countryId) {
  const key = String(countryId || "").toLowerCase().replace(/[\s_-]+/g, "");
  const iso = COUNTRY_ISO[key] || COUNTRY_ISO[countryId?.toLowerCase()];
  if (!iso || iso.length !== 2) return "🏳️";
  const codePoints = [...iso.toUpperCase()].map(
    (c) => 0x1f1e6 - 65 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

/* ─── Brand service icons ─── */
function ServiceIcon({ id, className = "h-5 w-5" }) {
  const key = String(id || "").toLowerCase();
  const props = { className, viewBox: "0 0 24 24", fill: "currentColor" };

  switch (key) {
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...props}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "google":
    case "gmail":
    case "youtube":
      return (
        <svg {...props}>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...props}>
          <path fill="#f25022" d="M1 1h10v10H1z" />
          <path fill="#00a4ef" d="M13 1h10v10H13z" />
          <path fill="#7fba00" d="M1 13h10v10H1z" />
          <path fill="#ffb900" d="M13 13h10v10H13z" />
        </svg>
      );
    case "amazon":
      return (
        <svg {...props}>
          <path d="M.045 18.02c.072-.116.187-.124.348-.048 3.784 1.77 6.953 2.292 9.961 2.292 3.015 0 5.918-.763 8.437-2.293.126-.076.214-.053.274.05.062.107.042.185-.078.267-1.334.923-3.043 1.72-5.043 2.351a18.766 18.766 0 01-6.14.99c-2.707 0-5.506-.573-8.338-1.76-.125-.052-.185-.124-.18-.214.002-.03.01-.06.022-.085l.027-.05z" />
        </svg>
      );
    case "openai":
    case "chatgpt":
      return (
        <svg {...props}>
          <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.997 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.08 4.779-2.76a.795.795 0 00.392-.681v-6.736l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494z" />
        </svg>
      );
    case "twitter":
    case "x":
      return (
        <svg {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...props}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "discord":
      return (
        <svg {...props}>
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
        </svg>
      );
    default: {
      const letter = (key[0] || "?").toUpperCase();
      return (
        <span
          className={`inline-flex items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-[#2a384c] dark:text-[#9aabbf] ${className}`}
          style={{ width: "1.25rem", height: "1.25rem" }}
        >
          {letter}
        </span>
      );
    }
  }
}

function getServiceAccent(id) {
  const map = {
    whatsapp: "text-[#25D366]",
    telegram: "text-[#229ED9]",
    facebook: "text-[#1877F2]",
    instagram: "text-[#E1306C]",
    google: "text-[#4285F4]",
    gmail: "text-[#EA4335]",
    youtube: "text-[#FF0000]",
    microsoft: "text-[#00A4EF]",
    amazon: "text-[#FF9900]",
    openai: "text-[#10A37F]",
    chatgpt: "text-[#10A37F]",
    twitter: "text-gray-900 dark:text-white",
    x: "text-gray-900 dark:text-white",
    tiktok: "text-gray-900 dark:text-white",
    discord: "text-[#5865F2]",
  };
  return map[String(id || "").toLowerCase()] || "text-gray-500 dark:text-gray-400";
}

/* ──────────────────────────────────────────────────────────── */

const RATE_LIMIT_STORAGE_KEY = "purchaseRateLimitEndsAt";

/** Priority order for Top Trending section. First match wins; missing IDs are skipped. */
const TRENDING_PRIORITY = [
  "whatsapp",
  "tiktok",
  "facebook",
  "instagram",
  "threads",
  "twitter",
  "x",
  "openai",
  "chatgpt",
  "google",
  "youtube",
  "gmail",
  "telegram",
  "microsoft",
  "amazon",
];

function formatCountdown(ms) {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function LeftSidebar({
  onServiceSelect,
  onCountrySelect,
  onOperatorSelect,
  onPurchaseSuccess,
}) {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);

  const [serviceSearch, setServiceSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  const [buyMode, setBuyMode] = useState("manual");
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [serviceCollapsed, setServiceCollapsed] = useState(false);
  const [countryCollapsed, setCountryCollapsed] = useState(false);

  const [services, setServices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [operators, setOperators] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const [operatorsLoading, setOperatorsLoading] = useState(false);
  const [operatorsError, setOperatorsError] = useState(null);

  // Purchase state
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // Rate-limit countdown (button label only)
  const [rateLimitEndsAt, setRateLimitEndsAt] = useState(null);
  const [countdownLabel, setCountdownLabel] = useState(null);
  const rateLimitIntervalRef = useRef(null);

  const initialAbortRef = useRef(null);
  const operatorsAbortRef = useRef(null);
  const operatorsRequestIdRef = useRef(0);

  /* ─── Rate-limit timer helpers ─── */
  const clearRateLimitTimer = useCallback(() => {
    if (rateLimitIntervalRef.current) {
      clearInterval(rateLimitIntervalRef.current);
      rateLimitIntervalRef.current = null;
    }
  }, []);

  const startRateLimitCountdown = useCallback(
    (endsAt) => {
      clearRateLimitTimer();
      setRateLimitEndsAt(endsAt);
      try {
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(endsAt));
      } catch {
        // ignore
      }

      const tick = () => {
        const remaining = endsAt - Date.now();
        if (remaining <= 0) {
          clearRateLimitTimer();
          setRateLimitEndsAt(null);
          setCountdownLabel(null);
          try {
            localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
          } catch {
            // ignore
          }
          return;
        }
        setCountdownLabel(formatCountdown(remaining));
      };

      tick(); // immediate paint
      rateLimitIntervalRef.current = setInterval(tick, 1000);
    },
    [clearRateLimitTimer]
  );

  // Resume timer from localStorage on mount
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    } catch {
      // ignore
    }

    if (stored) {
      const endsAt = Number(stored);
      if (Number.isFinite(endsAt) && endsAt > Date.now()) {
        startRateLimitCountdown(endsAt);
      } else {
        try {
          localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    }

    return () => {
      clearRateLimitTimer();
    };
  }, [startRateLimitCountdown, clearRateLimitTimer]);

  /* ─── Data fetching (unchanged) ─── */
  const fetchInitialPrices = useCallback(async () => {
    if (initialAbortRef.current) initialAbortRef.current.abort();
    const controller = new AbortController();
    initialAbortRef.current = controller;
    setInitialLoading(true);
    setInitialError(null);
    try {
      const res = await fetch("/api/5sim/prices", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (controller.signal.aborted) return;
      const tree = unwrapPrices(json);
      if (!tree) throw new Error("Invalid prices response");
      setServices(parseProducts(tree));
      setCountries(parseCountries(tree));
      setInitialError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setInitialError(err.message || "Failed to load");
      setServices([]);
      setCountries([]);
    } finally {
      if (!controller.signal.aborted) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialPrices();
    return () => {
      if (initialAbortRef.current) initialAbortRef.current.abort();
    };
  }, [fetchInitialPrices]);

  const fetchOperators = useCallback(async (countryId, productId) => {
    if (!countryId || !productId) {
      setOperators([]);
      setOperatorsError(null);
      setOperatorsLoading(false);
      return;
    }
    if (operatorsAbortRef.current) operatorsAbortRef.current.abort();
    const controller = new AbortController();
    operatorsAbortRef.current = controller;
    const requestId = ++operatorsRequestIdRef.current;
    setOperatorsLoading(true);
    setOperatorsError(null);
    setOperators([]);
    try {
      const url = `/api/5sim/prices?country=${encodeURIComponent(countryId)}&product=${encodeURIComponent(productId)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (requestId !== operatorsRequestIdRef.current) return;
      if (controller.signal.aborted) return;
      setOperators(parseOperators(json, countryId, productId));
      setOperatorsError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (requestId !== operatorsRequestIdRef.current) return;
      setOperatorsError(err.message || "Failed to load operators");
      setOperators([]);
    } finally {
      if (requestId === operatorsRequestIdRef.current) setOperatorsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedService && selectedCountry) {
      fetchOperators(selectedCountry, selectedService);
    } else {
      setOperators([]);
      setOperatorsError(null);
      setOperatorsLoading(false);
    }
    return () => {
      if (operatorsAbortRef.current) operatorsAbortRef.current.abort();
    };
  }, [selectedService, selectedCountry, fetchOperators]);

  /* ─── Callbacks ─── */
  useEffect(() => {
    const serviceObj = services.find((s) => s.id === selectedService) || null;
    onServiceSelect?.(serviceObj);
  }, [selectedService, services, onServiceSelect]);

  useEffect(() => {
    const countryObj = countries.find((c) => c.id === selectedCountry) || null;
    onCountrySelect?.(countryObj);
  }, [selectedCountry, countries, onCountrySelect]);

  useEffect(() => {
    onOperatorSelect?.(selectedOperator);
  }, [selectedOperator, onOperatorSelect]);

  /* ─── Selection handlers ─── */
  const handleServiceClick = (service) => {
    if (selectedService === service.id) {
      setSelectedService(null);
      setServiceCollapsed(false);
      setSelectedCountry(null);
      setCountryCollapsed(false);
      setSelectedOperator(null);
      setPurchaseError(null);
      setPurchaseSuccess(null);
      return;
    }
    setSelectedService(service.id);
    setServiceCollapsed(true);
    setSelectedCountry(null);
    setCountryCollapsed(false);
    setSelectedOperator(null);
    setServiceSearch("");
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const handleCountryClick = (country) => {
    if (selectedCountry === country.id) {
      setSelectedCountry(null);
      setCountryCollapsed(false);
      setSelectedOperator(null);
      setPurchaseError(null);
      setPurchaseSuccess(null);
      return;
    }
    setSelectedCountry(country.id);
    setCountryCollapsed(true);
    setSelectedOperator(null);
    setCountrySearch("");
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const handleOperatorClick = (op) => {
    if (selectedOperator?.operator === op.id) {
      setSelectedOperator(null);
      setPurchaseError(null);
      setPurchaseSuccess(null);
      return;
    }
    setSelectedOperator({
      country: selectedCountry,
      product: selectedService,
      operator: op.id,
      price: op.cost,
      count: op.count,
      name: op.name,
      priceFormatted: op.price,
      rate: op.rate,
    });
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const handleChangeService = () => setServiceCollapsed(false);
  const handleChangeCountry = () => setCountryCollapsed(false);

  /* ─── Purchase ─── */
  const handlePurchase = async () => {
    if (
      purchasing ||
      rateLimitEndsAt != null ||
      !selectedService ||
      !selectedCountry ||
      !selectedOperator?.operator
    ) {
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      const res = await fetch("/api/5sim/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          country: selectedCountry,
          operator: selectedOperator.operator,
          product: selectedService,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        // Rate limit → lock button with in-button countdown
        if (res.status === 429) {
          const retryAfterSec =
            Number(data?.retryAfter) ||
            Number(res.headers.get("Retry-After")) ||
            0;

          const endsAt =
            data?.windowEndsAt != null && Number.isFinite(Number(data.windowEndsAt))
              ? Number(data.windowEndsAt)
              : Date.now() + Math.max(0, retryAfterSec) * 1000;

          startRateLimitCountdown(endsAt);

          setPurchaseError(
            data?.message ||
              data?.error ||
              "Too many purchase attempts. Please wait."
          );
          return;
        }

        let message = "Purchase failed";

        if (res.status === 401) {
          message = data?.error || "Please log in to purchase";
        } else if (res.status === 402) {
          message = data?.error || "Insufficient balance";
        } else if (res.status === 403) {
          message = data?.error || "Your account is not active";
        } else if (res.status === 409) {
          message = data?.error || "This number is no longer available";
        } else if (res.status === 500) {
          message = data?.error || "Server error. Please try again.";
        } else {
          message = data?.error || "Unable to complete purchase";
        }

        setPurchaseError(message);
        return;
      }

      // Successful purchase
      const order = data.order;

      setPurchaseSuccess(order);

      if (typeof data.balance === "number") {
        // optional: parent may expose setBalance
        // setBalance?.(data.balance);
      }

      onPurchaseSuccess?.(order, data);
    } catch (error) {
      console.error("PURCHASE_ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete purchase";

      setPurchaseError(message);
    } finally {
      setPurchasing(false);
    }
  };

  /* ─── Filtering ─── */
  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [services, serviceSearch]);

  const trendingServices = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const pid of TRENDING_PRIORITY) {
      const found = filteredServices.find(
        (s) => s.id.toLowerCase() === pid.toLowerCase()
      );
      if (found && !seen.has(found.id)) {
        result.push(found);
        seen.add(found.id);
      }
    }
    return result;
  }, [filteredServices]);

  const otherServices = useMemo(() => {
    const trendingIds = new Set(trendingServices.map((s) => s.id));
    return filteredServices.filter((s) => !trendingIds.has(s.id));
  }, [filteredServices, trendingServices]);

  const visibleOtherServices = showAllServices
    ? otherServices
    : otherServices.slice(0, 8);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [countries, countrySearch]);

  const visibleCountries = showAllCountries
    ? filteredCountries
    : filteredCountries.slice(0, 8);

  const selectedServiceObj = services.find((s) => s.id === selectedService) || null;
  const selectedCountryObj = countries.find((c) => c.id === selectedCountry) || null;
  const canLoadOperators = Boolean(selectedService && selectedCountry);

  const Spinner = ({ size = "h-3.5 w-3.5" }) => (
    <svg className={`${size} animate-spin text-blue-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const renderServiceButton = (service) => {
    const isSelected = selectedService === service.id;
    return (
      <button
        key={service.id}
        type="button"
        onClick={() => handleServiceClick(service)}
        className={`
          flex w-full items-center gap-2.5 border-b border-gray-100 px-2.5 py-2 text-left
          transition-colors last:border-b-0 dark:border-[#253346]
          ${isSelected ? "bg-blue-50 dark:bg-[#193455]" : "hover:bg-gray-50 dark:hover:bg-[#1a2738]"}
        `}
      >
        <span className={`flex-shrink-0 ${getServiceAccent(service.id)}`}>
          <ServiceIcon id={service.id} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800 dark:text-[#d5dce6]">
          {service.name}
        </span>
        <div className="flex flex-shrink-0 flex-col items-end leading-none">
          <span className="text-[12px] font-semibold text-gray-800 dark:text-[#d5dce6]">
            {service.price}
          </span>
          {service.count != null && (
            <span className="mt-0.5 text-[9px] text-emerald-500">{service.count}</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-[#344257] dark:bg-[#151f2e] dark:text-[#b4c0d0] dark:hover:bg-[#1d293a] lg:hidden"
        aria-label="Open sidebar"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex  flex-col overflow-hidden
          border-r border-gray-200 bg-white
          transition-transform duration-200 ease-out
          dark:border-[#263449] dark:bg-[#111a27]
          lg:static lg:z-auto lg:h-auto lg:w-full lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 dark:border-[#263449]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Number Store
              </p>
              <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                Buy Virtual Number
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-50 dark:border-[#344257] dark:text-[#71819a] dark:hover:bg-[#1b2636] lg:hidden"
              aria-label="Close"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Buy mode */}
          <div className="border-b border-gray-200 px-4 py-2 dark:border-[#202d3f]">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setBuyMode("manual")}
                className={`relative pb-1.5 text-[11px] font-semibold transition-colors ${
                  buyMode === "manual"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:text-[#71819a]"
                }`}
              >
                Manual Buy
                {buyMode === "manual" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-blue-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setBuyMode("smart")}
                className={`relative flex items-center gap-1 pb-1.5 text-[11px] font-semibold transition-colors ${
                  buyMode === "smart"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:text-[#71819a]"
                }`}
              >
                Smart Buy
                <span className="rounded bg-blue-500 px-1 py-[2px] text-[7px] font-bold leading-none text-white">
                  NEW
                </span>
                {buyMode === "smart" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-blue-500" />
                )}
              </button>
            </div>
          </div>

          {/* ════════════ SERVICE ════════════ */}
          <section className="border-b border-gray-100 px-4 py-3 dark:border-[#1e2a3a]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#66768d]">
                Service
              </span>
              {selectedServiceObj && serviceCollapsed && (
                <button
                  type="button"
                  onClick={handleChangeService}
                  className="text-[10px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Change
                </button>
              )}
            </div>

            {selectedServiceObj && serviceCollapsed ? (
              <button
                type="button"
                onClick={handleChangeService}
                className="flex w-full items-center gap-2.5 rounded-md border border-blue-200 bg-blue-50/70 px-2.5 py-2 text-left transition hover:bg-blue-50 dark:border-blue-500/25 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
              >
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className={`flex-shrink-0 ${getServiceAccent(selectedServiceObj.id)}`}>
                  <ServiceIcon id={selectedServiceObj.id} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900 dark:text-white">
                  {selectedServiceObj.name}
                </span>
                <span className="flex-shrink-0 text-[12px] font-semibold text-gray-700 dark:text-[#d5dce6]">
                  {selectedServiceObj.price}
                </span>
              </button>
            ) : (
              <>
                <div className="relative mb-2">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services"
                    className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-2.5 text-[12px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-[#344257] dark:bg-[#171f2d] dark:text-white dark:placeholder:text-[#66768d]"
                  />
                </div>

                <div
                  className={`overflow-hidden rounded-md border border-gray-200 dark:border-[#29384b] ${
                    showAllServices ? "max-h-[300px] overflow-y-auto" : ""
                  }`}
                >
                  {initialLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Spinner />
                      <span className="text-[12px] text-gray-400">Loading…</span>
                    </div>
                  ) : initialError ? (
                    <div className="flex flex-col items-center gap-1.5 py-5">
                      <span className="text-[12px] text-red-500">Unable to load services</span>
                      <button type="button" onClick={fetchInitialPrices} className="text-[11px] font-medium text-blue-600 hover:underline">
                        Retry
                      </button>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="py-5 text-center text-[12px] text-gray-400">No services found</div>
                  ) : (
                    <>
                      {trendingServices.length > 0 && (
                        <>
                          <div className="border-b border-gray-100 bg-gray-50/80 px-2.5 py-1.5 dark:border-[#253346] dark:bg-[#151f2e]/60">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7a8ba3]">
                              Top Trending
                            </span>
                          </div>
                          {trendingServices.map(renderServiceButton)}
                        </>
                      )}

                      {otherServices.length > 0 && (
                        <>
                          {trendingServices.length > 0 && (
                            <div className="border-b border-gray-100 bg-gray-50/80 px-2.5 py-1.5 dark:border-[#253346] dark:bg-[#151f2e]/60">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7a8ba3]">
                                All Services
                              </span>
                            </div>
                          )}
                          {visibleOtherServices.map(renderServiceButton)}
                        </>
                      )}
                    </>
                  )}
                </div>

                {!initialLoading && !initialError && otherServices.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllServices((c) => !c)}
                    className="mt-1.5 w-full text-center text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showAllServices ? "Show less" : `Show all ${otherServices.length}`}
                  </button>
                )}
              </>
            )}
          </section>

          {/* ════════════ COUNTRY ════════════ */}
          <section className="border-b border-gray-100 px-4 py-3 dark:border-[#1e2a3a]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#66768d]">
                Country
              </span>
              {selectedCountryObj && countryCollapsed && (
                <button
                  type="button"
                  onClick={handleChangeCountry}
                  className="text-[10px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Change
                </button>
              )}
            </div>

            {selectedCountryObj && countryCollapsed ? (
              <button
                type="button"
                onClick={handleChangeCountry}
                className="flex w-full items-center gap-2.5 rounded-md border border-blue-200 bg-blue-50/70 px-2.5 py-2 text-left transition hover:bg-blue-50 dark:border-blue-500/25 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
              >
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[16px] leading-none">{selectedCountryObj.flag}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900 dark:text-white">
                  {selectedCountryObj.name}
                </span>
              </button>
            ) : (
              <>
                <div className="relative mb-2">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search countries"
                    className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-2.5 text-[12px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-[#344257] dark:bg-[#171f2d] dark:text-white dark:placeholder:text-[#66768d]"
                  />
                </div>

                <div
                  className={`overflow-hidden rounded-md border border-gray-200 dark:border-[#29384b] ${
                    showAllCountries ? "max-h-[300px] overflow-y-auto" : ""
                  }`}
                >
                  {initialLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Spinner />
                      <span className="text-[12px] text-gray-400">Loading…</span>
                    </div>
                  ) : initialError ? (
                    <div className="flex flex-col items-center gap-1.5 py-5">
                      <span className="text-[12px] text-red-500">Unable to load countries</span>
                      <button type="button" onClick={fetchInitialPrices} className="text-[11px] font-medium text-blue-600 hover:underline">
                        Retry
                      </button>
                    </div>
                  ) : visibleCountries.length === 0 ? (
                    <div className="py-5 text-center text-[12px] text-gray-400">No countries found</div>
                  ) : (
                    visibleCountries.map((country) => {
                      const isSelected = selectedCountry === country.id;
                      return (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => handleCountryClick(country)}
                          className={`
                            flex w-full items-center gap-2.5 border-b border-gray-100 px-2.5 py-2 text-left
                            transition-colors last:border-b-0 dark:border-[#253346]
                            ${isSelected ? "bg-blue-50 dark:bg-[#193455]" : "hover:bg-gray-50 dark:hover:bg-[#1a2738]"}
                          `}
                        >
                          <span className="text-[15px] leading-none">{country.flag}</span>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800 dark:text-[#d5dce6]">
                            {country.name}
                          </span>
                          {isSelected && (
                            <svg className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {!initialLoading && !initialError && countries.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCountries((c) => !c)}
                    className="mt-1.5 w-full text-center text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showAllCountries ? "Show less" : `Show all ${filteredCountries.length}`}
                  </button>
                )}
              </>
            )}
          </section>

          {/* ════════════ OPERATOR ════════════ */}
          <section className="px-4 py-3">
            <div className="mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#66768d]">
                Operator
              </span>
            </div>

            {!canLoadOperators ? (
              <p className="py-3 text-[12px] text-gray-400 dark:text-[#56657a]">
                Select service and country to view operators
              </p>
            ) : operatorsLoading ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <Spinner />
                <span className="text-[12px] text-gray-400">Loading operators…</span>
              </div>
            ) : operatorsError ? (
              <div className="flex flex-col items-center gap-1.5 py-5">
                <span className="text-[12px] text-red-500">Unable to load operators</span>
                <button
                  type="button"
                  onClick={() => fetchOperators(selectedCountry, selectedService)}
                  className="text-[11px] font-medium text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : operators.length === 0 ? (
              <p className="py-3 text-center text-[12px] text-gray-400">No operators available</p>
            ) : (
              <div className="max-h-[280px] overflow-y-auto overflow-hidden rounded-md border border-gray-200 dark:border-[#29384b]">
                {operators.map((op) => {
                  const isSelected = selectedOperator?.operator === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => handleOperatorClick(op)}
                      className={`
                        flex w-full items-center gap-2.5 border-b border-gray-100 px-2.5 py-2 text-left
                        transition-colors last:border-b-0 dark:border-[#253346]
                        ${isSelected ? "bg-blue-50 dark:bg-[#193455]" : "hover:bg-gray-50 dark:hover:bg-[#1a2738]"}
                      `}
                    >
                      <span
                        className={`
                          flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border
                          ${isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 dark:border-[#4d5c71]"
                          }
                        `}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-gray-800 dark:text-[#d5dce6]">
                          {op.name}
                        </span>
                        <span
                          className={`text-[10px] ${
                            op.count > 0 ? "text-emerald-500" : "text-gray-400 dark:text-[#66768d]"
                          }`}
                        >
                          {op.count > 0 ? `Available · ${op.countFormatted}` : "Out of stock"}
                        </span>
                      </div>

                      <span className="flex-shrink-0 text-[12px] font-semibold text-gray-800 dark:text-[#d5dce6]">
                        {op.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Purchase footer ── */}
        {selectedOperator && selectedServiceObj && selectedCountryObj && (
          <div className="flex-shrink-0 border-t border-gray-200 px-4  dark:border-[#263449]">
            {purchaseSuccess ? (
              /* Success state */
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[12px] font-semibold">Number purchased</span>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <p className="text-[14px] font-mono font-semibold text-gray-900 dark:text-white">
                    {purchaseSuccess.phone}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-[#66768d]">
                    Order #{purchaseSuccess.id} · {purchaseSuccess.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseSuccess(null);
                    setSelectedOperator(null);
                  }}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#344257] dark:bg-[#1b2636] dark:text-[#d5dce6] dark:hover:bg-[#243044]"
                >
                  Buy another
                </button>
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                    Buy {selectedServiceObj.name} Number
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#66768d]">
                    {selectedCountryObj.name} · {selectedOperator.name}
                  </p>
                </div>

                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[11px] text-gray-400">Price</span>
                  <span className="text-[16px] font-bold text-gray-900 dark:text-white">
                    {selectedOperator.priceFormatted}
                  </span>
                </div>

                {purchaseError && (
                  <div className="mb-2.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {purchaseError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={purchasing || rateLimitEndsAt != null}
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-md bg-blue-600 px-3 py-2
                    text-[13px] font-semibold text-white
                    transition hover:bg-blue-700 active:bg-blue-800
                    disabled:cursor-not-allowed disabled:opacity-60
                    dark:bg-blue-500 dark:hover:bg-blue-600
                  "
                >
                  {purchasing ? (
                    <>
                      <Spinner size="h-4 w-4" />
                      Purchasing…
                    </>
                  ) : rateLimitEndsAt != null && countdownLabel ? (
                    `Wait ${countdownLabel}`
                  ) : (
                    "Purchase Number"
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}