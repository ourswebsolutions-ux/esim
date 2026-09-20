"use client";

import { useEffect, useState } from "react";

import {
  Smartphone,
  WalletCards,
  Building2,
  ChevronDown,
  Clock3,
  Calendar,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

const paymentMethods = [
  {
    id: "jazzcash",
    title: "Pay using JazzCash",
    description: "Send your payment directly through JazzCash.",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
        <Smartphone className="h-5 w-5 text-red-500" />
      </div>
    ),
    details: {
      accountTitle: "JazzCash Account",
      accountName: "Ali Hamza",
      accountNumber: "+92 3245237429",
    },
  },
  {
    id: "easypaisa",
    title: "Pay using Easypaisa",
    description: "Send your payment directly through Easypaisa.",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10">
        <WalletCards className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
    ),
    details: {
      accountTitle: "Easypaisa Account",
      accountName: "Ali Hamza",
      accountNumber: "+92 3245237429",
    },
  },
  {
    id: "bank",
    title: "Pay using Bank Account",
    description: "Transfer funds directly to our bank account.",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    ),
    details: {
      accountTitle: "Bank Account",
      accountName: "Ali Hamza",
      accountNumber: "XXXX-XXXX-XXXX",
    },
  },
];

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status) {
  switch (status) {
    case "ACTIVE":
      return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400";

    case "SMS_RECEIVED":
    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400";

    case "CANCELLED":
    case "EXPIRED":
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";

    case "REFUNDED":
      return "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";

    case "PENDING":
      return "border-gray-200 bg-gray-50 text-gray-600 dark:border-[#344257] dark:bg-[#232f42] dark:text-[#a0aec0]";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600 dark:border-[#344257] dark:bg-[#232f42] dark:text-[#a0aec0]";
  }
}

export default function Recharge() {
  const [activeTab, setActiveTab] = useState("recharge");
  const [openMethod, setOpenMethod] = useState(null);

  // History filters
  const [operation, setOperation] = useState("all");
  const [date, setDate] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Single order
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);

  // Copy
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  const toggleMethod = (id) => {
    setOpenMethod((prev) => (prev === id ? null : id));
  };

  /*
   * GET ALL ORDERS
   *
   * API:
   * GET /api/5sim/order
   */
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await fetch("/api/5sim/order", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "Unable to fetch orders"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "ORDERS_FETCH_ERROR:",
        error
      );

      setOrdersError(
        error?.message ||
          "Unable to fetch orders"
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  /*
   * GET SPECIFIC ORDER
   *
   * API:
   * GET /api/5sim/order/[orderId]
   *
   * This only fetches the selected order
   * from our database.
   */
  const fetchSingleOrder = async (orderId) => {
    if (!orderId) {
      return null;
    }

    try {
      setSelectedOrderLoading(true);

      const response = await fetch(
        `/api/5sim/order/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            "Unable to fetch order"
        );
      }

      setSelectedOrder(data.order);

      return data.order;
    } catch (error) {
      console.error(
        "SINGLE_ORDER_FETCH_ERROR:",
        error
      );

      return null;
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  /*
   * Load orders whenever History opens
   */
  useEffect(() => {
    if (activeTab === "history") {
      fetchOrders();
    }
  }, [activeTab]);

  /*
   * COPY ORDER ID
   */
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(
        orderId
      );

      setCopiedOrderId(orderId);

      setTimeout(() => {
        setCopiedOrderId(null);
      }, 1500);
    } catch (error) {
      console.error(
        "COPY_ERROR:",
        error
      );
    }
  };

  /*
   * OPERATION FILTER
   */
  const filteredOrders = orders.filter(
    (order) => {
      if (operation === "all") {
        return true;
      }

      if (operation === "purchase") {
        return true;
      }

      return false;
    }
  );

  /*
   * DATE FILTER
   */
  const finalOrders = filteredOrders.filter(
    (order) => {
      if (!date) {
        return true;
      }

      const orderDate = new Date(
        order.createdAt
      );

      if (
        Number.isNaN(
          orderDate.getTime()
        )
      ) {
        return false;
      }

      const [day, month, year] =
        date.split("-");

      if (
        !day ||
        !month ||
        !year
      ) {
        return true;
      }

      return (
        orderDate.getDate() ===
          Number(day) &&
        orderDate.getMonth() + 1 ===
          Number(month) &&
        orderDate.getFullYear() ===
          Number(year)
      );
    }
  );

  return (
    <div className="w-full text-gray-900 dark:text-white">
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-xl dark:border-transparent dark:bg-[#1a2332] sm:px-7 sm:py-9">
        <div className="mx-auto w-full max-w-[760px]">

          {/* HEADER / TABS */}
          <div className="mb-8 flex items-center justify-center gap-10">
            <button
              type="button"
              onClick={() =>
                setActiveTab("recharge")
              }
              className={`relative pb-2 text-sm font-semibold transition-colors ${
                activeTab === "recharge"
                  ? "text-[#f97316]"
                  : "text-gray-500 hover:text-gray-700 dark:text-[#71819a] dark:hover:text-white"
              }`}
            >
              Recharge

              {activeTab === "recharge" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#f97316]" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("history")
              }
              className={`relative pb-2 text-sm font-semibold transition-colors ${
                activeTab === "history"
                  ? "text-[#f97316]"
                  : "text-gray-500 hover:text-gray-700 dark:text-[#71819a] dark:hover:text-white"
              }`}
            >
              History

              {activeTab === "history" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#f97316]" />
              )}
            </button>
          </div>

          {/* RECHARGE TAB */}
          {activeTab === "recharge" && (
            <div className="space-y-3">
              {paymentMethods.map(
                (method) => {
                  const isOpen =
                    openMethod ===
                    method.id;

                  return (
                    <div
                      key={method.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 dark:border-[#344257] dark:bg-[#1e2a3a]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleMethod(
                            method.id
                          )
                        }
                        className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-100 sm:px-5 dark:hover:bg-[#232f42]"
                      >
                        <div className="shrink-0">
                          {method.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                            {method.title}
                          </h2>

                          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#71819a]">
                            {
                              method.description
                            }
                          </p>
                        </div>

                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 dark:text-[#71819a] ${
                            isOpen
                              ? "rotate-180 text-[#2087e8] dark:text-[#60a5fa]"
                              : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-200 px-5 py-5 dark:border-[#344257]">
                          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#2f3d51] dark:bg-[#1a2535]">

                            <div className="mb-5">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-[#71819a]">
                                Payment Details
                              </p>

                              <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {
                                  method
                                    .details
                                    .accountTitle
                                }
                              </h3>
                            </div>

                            <div className="space-y-3">

                              <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-[#202c3e]">
                                <span className="text-xs text-gray-500 dark:text-[#71819a]">
                                  Account Name
                                </span>

                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {
                                    method
                                      .details
                                      .accountName
                                  }
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-[#202c3e]">
                                <span className="text-xs text-gray-500 dark:text-[#71819a]">
                                  {method.id ===
                                  "bank"
                                    ? "Account Number"
                                    : "Mobile Number"}
                                </span>

                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {
                                    method
                                      .details
                                      .accountNumber
                                  }
                                </span>
                              </div>

                              {method.id ===
                                "bank" && (
                                <>
                                  <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-[#202c3e]">
                                    <span className="text-xs text-gray-500 dark:text-[#71819a]">
                                      Bank
                                    </span>

                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                      Your Bank Name
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-[#202c3e]">
                                    <span className="text-xs text-gray-500 dark:text-[#71819a]">
                                      IBAN
                                    </span>

                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                      PKXX XXXX XXXX XXXX
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
                              <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                                After making the payment,
                                send your payment
                                screenshot to support
                                so your balance can be
                                verified and added to
                                your account.
                              </p>
                            </div>

                            <a
                              href="https://wa.me/923245237429"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[#3b82f6] px-4 text-xs font-semibold text-white transition-all hover:bg-[#2563eb]"
                            >
                              Contact Support
                            </a>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">

              {/* ALL + REFRESH */}
              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setOperation("all");
                    setDate("");
                  }}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#3b82f6] text-sm font-semibold text-white transition-all hover:bg-[#2563eb]"
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  aria-label="Refresh orders"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-[#71819a] dark:hover:bg-[#232f42]"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      ordersLoading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </button>

              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Operation */}
                <div className="relative min-w-[140px]">
                  <select
                    value={operation}
                    onChange={(e) =>
                      setOperation(
                        e.target.value
                      )
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-9 text-sm text-gray-700 outline-none transition focus:border-[#3b82f6] dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-[#dce5f0] dark:focus:border-[#3b82f6]"
                  >
                    <option value="all">
                      Operation
                    </option>

                    <option value="purchase">
                      Purchase
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#71819a]" />
                </div>

                {/* Date */}
                <div className="relative min-w-[160px]">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                    placeholder="dd-mm-yyyy"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#3b82f6] dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-[#dce5f0] dark:placeholder:text-[#66768d] dark:focus:border-[#3b82f6]"
                  />

                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#71819a]" />
                </div>

              </div>

              {/* ERROR */}
              {ordersError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {ordersError}
                </div>
              )}

              {/* SELECTED ORDER LOADING */}
              {selectedOrderLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading order details...
                </div>
              )}

              {/* TABLE */}
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#344257]">

                {/* TABLE HEADER */}
                <div className="grid grid-cols-4 bg-gray-100 dark:bg-[#232f42]">

                  <div className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-[#a0aec0]">
                    Date
                  </div>

                  <div className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-[#a0aec0]">
                    Operation
                  </div>

                  <div className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-[#a0aec0]">
                    Type
                  </div>

                  <div className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-[#a0aec0]">
                    Amount
                  </div>

                </div>

                {/* LOADING */}
                {ordersLoading && (
                  <div className="flex flex-col items-center justify-center bg-gray-50 px-6 py-14 dark:bg-[#1e2a3a]">
                    <RefreshCw className="mb-3 h-5 w-5 animate-spin text-[#3b82f6]" />

                    <p className="text-xs text-gray-500 dark:text-[#71819a]">
                      Loading your orders...
                    </p>
                  </div>
                )}

                {/* EMPTY */}
                {!ordersLoading &&
                  !ordersError &&
                  finalOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center bg-gray-50 px-6 py-14 dark:bg-[#1e2a3a]">

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-[#232f42] dark:text-[#71819a]">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        No orders yet
                      </h3>

                      <p className="mt-1 text-center text-xs text-gray-500 dark:text-[#71819a]">
                        Your purchased numbers
                        will appear here.
                      </p>

                    </div>
                  )}

                {/* ORDERS */}
                {!ordersLoading &&
                  finalOrders.length > 0 && (
                    <div className="divide-y divide-gray-200 dark:divide-[#344257]">

                      {finalOrders.map(
                        (order) => (
                          <div
                            key={order.id}
                            className="bg-gray-50 px-4 py-4 transition hover:bg-gray-100 dark:bg-[#1e2a3a] dark:hover:bg-[#202c3e]"
                          >

                            {/* Main row */}
                            <div className="grid grid-cols-4 items-center gap-2">

                              {/* Date */}
                              <div className="text-center">
                                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                                  {formatDate(
                                    order.createdAt
                                  )}
                                </p>

                                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-[#71819a]">
                                  {formatTime(
                                    order.createdAt
                                  )}
                                </p>
                              </div>

                              {/* Operation */}
                              <div className="text-center">
                                <span className="text-xs font-medium text-gray-700 dark:text-[#dce5f0]">
                                  Purchase
                                </span>
                              </div>

                              {/* Type */}
                              <div className="flex justify-center">
                                <span
                                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                                    order.status
                                  )}`}
                                >
                                  {formatStatus(
                                    order.status
                                  )}
                                </span>
                              </div>

                              {/* Amount */}
                              <div className="text-center">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  {order.currency}{" "}
                                  {Number(
                                    order.price || 0
                                  ).toFixed(2)}
                                </p>
                              </div>

                            </div>

                            {/* ORDER DETAILS */}
                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-[#344257] dark:bg-[#202c3e]">

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                                {/* Phone */}
                                <div>
                                  <p className="text-[10px] text-gray-400 dark:text-[#71819a]">
                                    Phone Number
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                    {order.phone ||
                                      "Number pending"}
                                  </p>
                                </div>

                                {/* Service */}
                                <div>
                                  <p className="text-[10px] text-gray-400 dark:text-[#71819a]">
                                    Service
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                    {order.product ||
                                      "-"}
                                  </p>
                                </div>

                                {/* Country */}
                                <div>
                                  <p className="text-[10px] text-gray-400 dark:text-[#71819a]">
                                    Country
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                    {order.country ||
                                      "-"}
                                  </p>
                                </div>

                                {/* Operator */}
                                <div>
                                  <p className="text-[10px] text-gray-400 dark:text-[#71819a]">
                                    Operator
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                    {order.operator ||
                                      "-"}
                                  </p>
                                </div>

                              </div>

                              {/* OTP */}
                              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 dark:border-blue-500/20 dark:bg-blue-500/[0.06]">

                                <div className="flex items-center justify-between gap-3">

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-[#71819a]">
                                      Verification Code
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-[#dce5f0]">
                                      {selectedOrder?.id ===
                                        order.id &&
                                      selectedOrder?.otp
                                        ? selectedOrder.otp
                                        : "Waiting for OTP..."}
                                    </p>
                                  </div>

                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                                    <Clock3 className="h-4 w-4 text-blue-500" />
                                  </div>

                                </div>

                              </div>

                              {/* ORDER ID */}
                              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-[#1a2535]">

                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 dark:text-[#71819a]">
                                    Order ID
                                  </p>

                                  <p className="mt-0.5 truncate font-mono text-[10px] text-gray-700 dark:text-[#dce5f0]">
                                    {order.id}
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">

                                  {/* Load specific order */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      fetchSingleOrder(
                                        order.id
                                      )
                                    }
                                    disabled={
                                      selectedOrderLoading
                                    }
                                    className="flex h-7 items-center justify-center rounded-md border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#344257] dark:bg-[#202c3e] dark:text-[#71819a] dark:hover:bg-[#2a374b]"
                                  >
                                    {selectedOrderLoading &&
                                    selectedOrder?.id ===
                                      order.id ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "View"
                                    )}
                                  </button>

                                  {/* Copy */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyOrderId(
                                        order.id
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 dark:border-[#344257] dark:bg-[#202c3e] dark:text-[#71819a] dark:hover:bg-[#2a374b]"
                                    title="Copy Order ID"
                                  >
                                    {copiedOrderId ===
                                    order.id ? (
                                      <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>

                                </div>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

              </div>

            </div>
          )}

          {/* SUPPORT BOX */}
          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center dark:border-[#344257] dark:bg-[#1e2a3a]">

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Need help with payments?
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#71819a]">
              Our support team can assist with
              balance, transactions, and payment
              issues.
            </p>

            <a
              href="https://wa.me/923245237429"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#3b82f6] px-5 text-xs font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-[#2563eb] hover:shadow-blue-500/20"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Support
            </a>

          </div>

        </div>

        {/* FOOTER */}
        <div className="mx-auto mt-10 max-w-[1000px]">

          <div className="h-px w-full bg-gray-200 dark:bg-[#344257]" />

          <footer className="pb-2 pt-8">

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">

              {/* BRAND */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1">

                <a
                  href="/"
                  className="inline-block"
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-[#2087e8]">
                      <span className="text-lg font-extrabold text-white">
                        5
                        <span className="text-xs">
                          sim
                        </span>
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Virtual Numbers
                      </div>

                      <div className="text-[10px] text-gray-500 dark:text-[#71819a]">
                        SMS Verification
                      </div>
                    </div>

                  </div>
                </a>

                <p className="mt-4 max-w-[190px] text-xs leading-5 text-gray-500 dark:text-[#71819a]">
                  Reliable virtual numbers for
                  SMS verification and online
                  services.
                </p>

              </div>

              {/* PRODUCT */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Product
                </h3>

                <div className="space-y-2.5">

                  <a
                    href="/prices"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Prices
                  </a>

                  <a
                    href="/statistics"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Statistics
                  </a>

                  <a
                    href="/services"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Services
                  </a>

                </div>
              </div>

              {/* PLATFORM */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Platform
                </h3>

                <div className="space-y-2.5">

                  <a
                    href="/countries"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Countries
                  </a>

                  <a
                    href="/api"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    API
                  </a>

                  <a
                    href="/how-to-buy"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    How to buy?
                  </a>

                </div>
              </div>

              {/* LEGAL */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Legal
                </h3>

                <div className="space-y-2.5">

                  <a
                    href="/rules"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Rules
                  </a>

                  <a
                    href="/privacy"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Privacy
                  </a>

                  <a
                    href="/terms"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Terms
                  </a>

                </div>
              </div>

              {/* SUPPORT */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Support
                </h3>

                <div className="space-y-2.5">

                  <a
                    href="/faq"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    FAQ
                  </a>

                  <a
                    href="/support"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Help Center
                  </a>

                  <a
                    href="/contact"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Contact
                  </a>

                </div>
              </div>

            </div>

            {/* SOCIAL */}
            <div className="mt-8 flex items-center gap-3 border-t border-gray-200 pt-5 dark:border-[#253247]">

              {[
                ["Telegram", "TG", "text-[10px]"],
                ["X", "𝕏", "text-sm"],
                ["Facebook", "f", "text-sm"],
                ["Instagram", "IG", "text-[10px]"],
                ["YouTube", "YT", "text-[10px]"],
              ].map(
                ([label, text, size]) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 ${size} font-bold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white`}
                  >
                    {text}
                  </a>
                )
              )}

            </div>

          </footer>
        </div>

      </div>
    </div>
  );
}