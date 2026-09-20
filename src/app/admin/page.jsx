"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  ArrowLeftRight,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Minus,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  TrendingUp,
  Package,
  CreditCard,
  Activity,
  Eye,
} from "lucide-react";

// ─── API Helper ───────────────────────────────────────────────────────────────
async function adminApi(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatNumber(value) {
  if (value == null || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US").format(Number(value));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getInitials(name = "", email = "") {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Status / Role Badges ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    SUSPENDED: "bg-amber-50 text-amber-700 ring-amber-600/20",
    BANNED: "bg-red-50 text-red-700 ring-red-600/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status] || "bg-slate-50 text-slate-600 ring-slate-500/10"
      )}
    >
      {status || "—"}
    </span>
  );
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN: "bg-violet-50 text-violet-700 ring-violet-600/20",
    USER: "bg-slate-50 text-slate-600 ring-slate-500/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[role] || "bg-slate-50 text-slate-600 ring-slate-500/10"
      )}
    >
      {role || "—"}
    </span>
  );
}

function TxTypeBadge({ type }) {
  const styles = {
    DEPOSIT: "bg-emerald-50 text-emerald-700",
    PURCHASE: "bg-blue-50 text-blue-700",
    REFUND: "bg-amber-50 text-amber-700",
    BONUS: "bg-violet-50 text-violet-700",
    ADJUSTMENT: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[type] || "bg-slate-50 text-slate-600"
      )}
    >
      {type || "—"}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-100", className)} />;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg",
        type === "success"
          ? "border-emerald-200 bg-white text-emerald-800"
          : "border-red-200 bg-white text-red-800"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 rounded p-0.5 text-slate-400 hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50",
              confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Balance Modal ────────────────────────────────────────────────────────────
function BalanceModal({ open, mode, user, loading, onSubmit, onClose }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setReason(mode === "ADD" ? "Admin adjustment" : "Balance correction");
    }
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    onSubmit({ amount: num, reason: reason.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {mode === "ADD" ? "Add Balance" : "Deduct Balance"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {user?.name || user?.email} · Current: {formatCurrency(user?.balance)}
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="Optional reason"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50",
                mode === "ADD" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "ADD" ? "Add Balance" : "Deduct Balance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-50 p-2.5">
            <Icon className="h-4.5 w-4.5 text-slate-400" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, onPageChange, loading }) {
  if (meta.totalPages <= 1 && meta.total === 0) return null;
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, meta.page - Math.floor(maxVisible / 2));
  let end = Math.min(meta.totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{formatNumber(meta.total)}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1 || loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={cn(
              "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium",
              p === meta.page
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages || loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [section, setSection] = useState("dashboard");
  const [toast, setToast] = useState(null);

  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const searchTimeout = useRef(null);

  // User drawer
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);

  // Balance modal
  const [balanceModal, setBalanceModal] = useState({ open: false, mode: "ADD" });
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    confirmVariant: "danger",
    action: null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [txMeta, setTxMeta] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);

  const [actionMenuId, setActionMenuId] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 });
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Close actions menu on scroll or resize so it never floats in the wrong place
  useEffect(() => {
    if (!actionMenuId) return;
    const close = () => setActionMenuId(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [actionMenuId]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // ─── Fetch Dashboard ──────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await adminApi("/api/admin?action=dashboard");
      setDashboard(data.data || data);
    } catch (err) {
      setDashboardError(err.message);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ─── Fetch Users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (page = 1, search = searchQuery, status = statusFilter, role = roleFilter) => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const params = new URLSearchParams({
          action: "users",
          page: String(page),
          limit: "20",
        });
        if (search.trim()) params.set("search", search.trim());
        if (status) params.set("status", status);
        if (role) params.set("role", role);

        const data = await adminApi(`/api/admin?${params}`);
        const payload = data.data || data;
        setUsers(payload.users || payload.items || []);
        setUsersMeta({
          page: payload.page || page,
          limit: payload.limit || 20,
          total: payload.total || 0,
          totalPages: payload.totalPages || 1,
        });
      } catch (err) {
        setUsersError(err.message);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    },
    [searchQuery, statusFilter, roleFilter]
  );

  // ─── Fetch User Detail + Stats ────────────────────────────────────────────
  const fetchUserDetail = useCallback(async (id) => {
    setDrawerLoading(true);
    setDrawerError(null);
    setUserDetail(null);
    setUserStats(null);
    try {
      const [userRes, statsRes] = await Promise.all([
        adminApi(`/api/admin?action=user&id=${id}`),
        adminApi(`/api/admin?action=user-stats&id=${id}`).catch(() => null),
      ]);
      setUserDetail(userRes.data || userRes);
      if (statsRes) setUserStats(statsRes.data || statsRes);
    } catch (err) {
      setDrawerError(err.message);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  // ─── Fetch Orders ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await adminApi(`/api/admin?action=orders&page=${page}&limit=30`);
      const payload = data.data || data;
      setOrders(payload.orders || payload.items || []);
      setOrdersMeta({
        page: payload.page || page,
        limit: payload.limit || 30,
        total: payload.total || 0,
        totalPages: payload.totalPages || 1,
      });
    } catch (err) {
      setOrdersError(err.message);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ─── Fetch Transactions ───────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 1) => {
    setTxLoading(true);
    setTxError(null);
    try {
      const data = await adminApi(`/api/admin?action=transactions&page=${page}&limit=30`);
      const payload = data.data || data;
      setTransactions(payload.transactions || payload.items || []);
      setTxMeta({
        page: payload.page || page,
        limit: payload.limit || 30,
        total: payload.total || 0,
        totalPages: payload.totalPages || 1,
      });
    } catch (err) {
      setTxError(err.message);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (section === "users") fetchUsers(1);
    if (section === "orders") fetchOrders(1);
    if (section === "transactions") fetchTransactions(1);
  }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Search debounce ──────────────────────────────────────────────────────
  useEffect(() => {
    if (section !== "users") return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers(1, searchQuery, statusFilter, roleFilter);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, statusFilter, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Open user drawer ─────────────────────────────────────────────────────
  const openUser = (id) => {
    setSelectedUserId(id);
    setActionMenuId(null);
    fetchUserDetail(id);
  };

  const closeDrawer = () => {
    setSelectedUserId(null);
    setUserDetail(null);
    setUserStats(null);
  };

  // ─── Balance action ───────────────────────────────────────────────────────
  const handleBalance = async ({ amount, reason }) => {
    if (!selectedUserId) return;
    setBalanceLoading(true);
    try {
      await adminApi("/api/admin", {
        method: "POST",
        body: JSON.stringify({
          action: "balance",
          userId: selectedUserId,
          operation: balanceModal.mode,
          amount,
          reason,
        }),
      });
      showToast(
        balanceModal.mode === "ADD" ? "Balance added successfully" : "Balance deducted successfully"
      );
      setBalanceModal({ open: false, mode: "ADD" });
      await Promise.all([
        fetchUserDetail(selectedUserId),
        fetchUsers(usersMeta.page),
        fetchDashboard(),
      ]);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBalanceLoading(false);
    }
  };

  // ─── Status / Role / Delete ───────────────────────────────────────────────
  const runConfirmAction = async () => {
    if (!confirm.action) return;
    setConfirmLoading(true);
    try {
      await confirm.action();
      setConfirm((c) => ({ ...c, open: false }));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirmLoading(false);
    }
  };

  const changeStatus = (userId, status) => {
    const labels = { ACTIVE: "Activate", SUSPENDED: "Suspend", BANNED: "Ban" };
    setConfirm({
      open: true,
      title: `${labels[status]} User?`,
      description:
        status === "BANNED"
          ? "This will permanently ban the user. They will no longer be able to access the platform."
          : status === "SUSPENDED"
          ? "The user will be temporarily suspended and unable to make purchases."
          : "The user will be reactivated and regain full access.",
      confirmLabel: labels[status],
      confirmVariant: status === "ACTIVE" ? "default" : "danger",
      action: async () => {
        await adminApi("/api/admin", {
          method: "POST",
          body: JSON.stringify({ action: "status", userId, status }),
        });
        showToast(`User status updated to ${status}`);
        if (selectedUserId === userId) await fetchUserDetail(userId);
        await Promise.all([fetchUsers(usersMeta.page), fetchDashboard()]);
      },
    });
  };

  const changeRole = (userId, role) => {
    setConfirm({
      open: true,
      title: `Change Role to ${role}?`,
      description: `This will update the user's role to ${role}. ${
        role === "ADMIN"
          ? "They will gain administrative privileges."
          : "They will lose administrative privileges."
      }`,
      confirmLabel: "Change Role",
      confirmVariant: "default",
      action: async () => {
        await adminApi("/api/admin", {
          method: "POST",
          body: JSON.stringify({ action: "role", userId, role }),
        });
        showToast(`Role updated to ${role}`);
        if (selectedUserId === userId) await fetchUserDetail(userId);
        await fetchUsers(usersMeta.page);
      },
    });
  };

  const deleteUser = (userId) => {
    setConfirm({
      open: true,
      title: "Delete User?",
      description:
        "This action permanently removes this user and related data. This cannot be undone.",
      confirmLabel: "Delete User",
      confirmVariant: "danger",
      action: async () => {
        await adminApi(`/api/admin?action=user&id=${userId}`, { method: "DELETE" });
        showToast("User deleted successfully");
        closeDrawer();
        await Promise.all([fetchUsers(1), fetchDashboard()]);
      },
    });
  };

  // ─── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    if (section === "dashboard") fetchDashboard();
    else if (section === "users") fetchUsers(usersMeta.page);
    else if (section === "orders") fetchOrders(ordersMeta.page);
    else if (section === "transactions") fetchTransactions(txMeta.page);
  };

  // ─── Nav tabs ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  ];

  // ─── Dashboard data accessors ─────────────────────────────────────────────
  const d = dashboard || {};
  const usersStats = d.users || d.Users || {};
  const purchases = d.purchases || d.Purchases || {};
  const sales = d.sales || d.Sales || {};
  const finance = d.finance || d.Finance || {};
  const txStats = d.transactions || d.Transactions || {};
  const recentOrders = d.recentOrders || [];
  const recentTransactions = d.recentTransactions || [];
  const topCustomers = d.topCustomers || [];

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">
      {/* ── Sticky Top Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <LayoutDashboard className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:block">
              Admin
            </span>
          </div>

          {/* Horizontal Tabs — scrollable on mobile */}
          <nav className="flex flex-1 items-center justify-center overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-0.5 rounded-lg bg-slate-100/80 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = section === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSection(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {section === "dashboard" && (
          <div className="space-y-8">
            {dashboardError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {dashboardError}
                <button onClick={fetchDashboard} className="ml-3 font-medium underline">
                  Retry
                </button>
              </div>
            )}

            {/* Users */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Users
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                <StatCard
                  label="Total Users"
                  value={formatNumber(usersStats.total ?? usersStats.totalUsers)}
                  icon={Users}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Active"
                  value={formatNumber(usersStats.active ?? usersStats.activeUsers)}
                  icon={CheckCircle2}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Suspended"
                  value={formatNumber(usersStats.suspended ?? usersStats.suspendedUsers)}
                  icon={AlertTriangle}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Banned"
                  value={formatNumber(usersStats.banned ?? usersStats.bannedUsers)}
                  icon={Ban}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="New Today"
                  value={formatNumber(usersStats.newToday)}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="New This Month"
                  value={formatNumber(usersStats.newThisMonth)}
                  loading={dashboardLoading}
                />
              </div>
            </section>

            {/* Purchases & Sales */}
            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Purchases
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Total"
                    value={formatNumber(purchases.total ?? purchases.totalPurchases)}
                    icon={Package}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="Today"
                    value={formatNumber(purchases.today ?? purchases.todaysPurchases)}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="7 Day"
                    value={formatNumber(purchases.last7Days ?? purchases.sevenDayPurchases)}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="30 Day"
                    value={formatNumber(purchases.last30Days ?? purchases.thirtyDayPurchases)}
                    loading={dashboardLoading}
                  />
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sales
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Total"
                    value={formatCurrency(sales.total ?? sales.totalSales)}
                    icon={TrendingUp}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="Today"
                    value={formatCurrency(sales.today ?? sales.todaysSales)}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="7 Day"
                    value={formatCurrency(sales.last7Days ?? sales.sevenDaySales)}
                    loading={dashboardLoading}
                  />
                  <StatCard
                    label="30 Day"
                    value={formatCurrency(sales.last30Days ?? sales.thirtyDaySales)}
                    loading={dashboardLoading}
                  />
                </div>
              </section>
            </div>

            {/* Finance */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Finance
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard
                  label="Gross Revenue"
                  value={formatCurrency(finance.grossRevenue)}
                  icon={CreditCard}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Provider Cost"
                  value={formatCurrency(finance.providerCost)}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Gross Profit"
                  value={formatCurrency(finance.grossProfit)}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Net Revenue"
                  value={formatCurrency(finance.netRevenue)}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Profit Margin"
                  value={
                    finance.profitMargin != null
                      ? `${Number(finance.profitMargin).toFixed(1)}%`
                      : "—"
                  }
                  loading={dashboardLoading}
                />
              </div>
            </section>

            {/* Transactions summary */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Transactions
              </h2>
              <div className="grid max-w-md grid-cols-2 gap-3">
                <StatCard
                  label="Total"
                  value={formatNumber(txStats.total ?? txStats.totalTransactions)}
                  icon={Activity}
                  loading={dashboardLoading}
                />
                <StatCard
                  label="Today"
                  value={formatNumber(txStats.today ?? txStats.todaysTransactions)}
                  loading={dashboardLoading}
                />
              </div>
            </section>

            {/* Bottom grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Orders */}
              <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
                  <button
                    onClick={() => setSection("orders")}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {dashboardLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">
                      No recent orders
                    </div>
                  ) : (
                    recentOrders.slice(0, 6).map((order, i) => (
                      <div key={order.id || i} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {(order.user?.name || order.userName || "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {order.product || order.productName || "Order"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {order.user?.email || order.userEmail || order.phone || "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(order.amount)}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Top Customers */}
              <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">Top Customers</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {dashboardLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : topCustomers.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">
                      No customer data yet
                    </div>
                  ) : (
                    topCustomers.slice(0, 6).map((c, i) => (
                      <div key={c.id || i} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="w-5 text-center text-xs font-semibold text-slate-400">
                          {i + 1}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {getInitials(c.name, c.email)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {c.name || c.email || "—"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatNumber(c.purchases ?? c.totalPurchases)} purchases
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(c.spent ?? c.totalSpent)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Bal: {formatCurrency(c.balance)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Recent Transactions */}
            <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
                <button
                  onClick={() => setSection("transactions")}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dashboardLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-5 py-3"><Skeleton className="h-5 w-16" /></td>
                          <td className="px-5 py-3"><Skeleton className="h-5 w-28" /></td>
                          <td className="px-5 py-3"><Skeleton className="h-5 w-16" /></td>
                          <td className="px-5 py-3"><Skeleton className="h-5 w-32" /></td>
                          <td className="px-5 py-3"><Skeleton className="h-5 w-20" /></td>
                        </tr>
                      ))
                    ) : recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                          No recent transactions
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.slice(0, 8).map((tx, i) => (
                        <tr key={tx.id || i} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3">
                            <TxTypeBadge type={tx.type} />
                          </td>
                          <td className="px-5 py-3 text-slate-700">
                            {tx.user?.email || tx.userEmail || tx.userId || "—"}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="max-w-[200px] truncate px-5 py-3 text-slate-500">
                            {tx.description || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            {formatDateTime(tx.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════ USERS ═══════════════ */}
        {section === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email…"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {usersError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {usersError}
                <button
                  onClick={() => fetchUsers(usersMeta.page)}
                  className="ml-3 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Balance</th>
                      <th className="px-5 py-3.5">Purchases</th>
                      <th className="px-5 py-3.5">Spent</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usersLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-9 w-9 rounded-full" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-3.5 w-28" />
                                <Skeleton className="h-3 w-36" />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="h-4 w-10" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="h-5 w-14" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="h-5 w-16" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-5 py-3.5"><Skeleton className="ml-auto h-4 w-8" /></td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <Users className="mx-auto h-10 w-10 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-600">No users found</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="group cursor-pointer hover:bg-slate-50/60"
                          onClick={() => openUser(user.id)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {user.image || user.avatar ? (
                                <img
                                  src={user.image || user.avatar}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                  {getInitials(user.name, user.email)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {user.name || "—"}
                                </p>
                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {formatCurrency(user.balance)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatNumber(user.purchases ?? user.totalPurchases ?? 0)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatCurrency(user.spent ?? user.totalSpent)}
                          </td>
                          <td className="px-5 py-3.5">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actionMenuId === user.id) {
                                  setActionMenuId(null);
                                  return;
                                }
                                const rect = e.currentTarget.getBoundingClientRect();
                                const menuWidth = 176; // w-44
                                const menuHeight = 220; // approximate
                                let top = rect.bottom + 4;
                                let left = rect.right - menuWidth;

                                // Flip upward if near bottom of viewport
                                if (top + menuHeight > window.innerHeight - 8) {
                                  top = rect.top - menuHeight - 4;
                                  if (top < 8) top = 8;
                                }
                                // Keep within horizontal bounds
                                if (left < 8) left = 8;
                                if (left + menuWidth > window.innerWidth - 8) {
                                  left = window.innerWidth - menuWidth - 8;
                                }

                                setActionMenuPosition({ top, left });
                                setActionMenuId(user.id);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                meta={usersMeta}
                onPageChange={(p) => fetchUsers(p)}
                loading={usersLoading}
              />
            </div>
          </div>
        )}

        {/* ═══════════════ ORDERS ═══════════════ */}
        {section === "orders" && (
          <div className="space-y-4">
            {ordersError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {ordersError}
                <button
                  onClick={() => fetchOrders(ordersMeta.page)}
                  className="ml-3 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Country</th>
                      <th className="px-5 py-3.5">Operator</th>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Phone</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Provider</th>
                      <th className="px-5 py-3.5">Profit</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ordersLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 11 }).map((_, j) => (
                            <td key={j} className="px-5 py-3.5">
                              <Skeleton className="h-4 w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-5 py-16 text-center">
                          <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-600">No orders found</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                            {(order.id || "").slice(0, 8)}…
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-900">
                              {order.user?.name || order.userName || "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.user?.email || order.userEmail || ""}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{order.country || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{order.operator || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-700">
                            {order.product || order.productName || "—"}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                            {order.phone || "—"}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatCurrency(order.providerPrice ?? order.providerCost)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-emerald-700">
                            {order.profit != null ? formatCurrency(order.profit) : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              {order.status || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {formatDateTime(order.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination meta={ordersMeta} onPageChange={fetchOrders} loading={ordersLoading} />
            </div>
          </div>
        )}

        {/* ═══════════════ TRANSACTIONS ═══════════════ */}
        {section === "transactions" && (
          <div className="space-y-4">
            {txError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {txError}
                <button
                  onClick={() => fetchTransactions(txMeta.page)}
                  className="ml-3 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Transaction ID</th>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Before</th>
                      <th className="px-5 py-3.5">After</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {txLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-5 py-3.5">
                              <Skeleton className="h-4 w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <ArrowLeftRight className="mx-auto h-10 w-10 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-600">
                            No transactions found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                            {(tx.id || "").slice(0, 8)}…
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-900">
                              {tx.user?.name || tx.userName || "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {tx.user?.email || tx.userEmail || ""}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <TxTypeBadge type={tx.type} />
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatCurrency(tx.balanceBefore)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                          <td className="max-w-[200px] truncate px-5 py-3.5 text-slate-500">
                            {tx.description || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {formatDateTime(tx.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                meta={txMeta}
                onPageChange={fetchTransactions}
                loading={txLoading}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── User Details Drawer ───────────────────────────────────────────── */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={closeDrawer}
          />
          <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">User Details</h2>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {drawerLoading ? (
                <div className="space-y-5 p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : drawerError ? (
                <div className="p-5">
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {drawerError}
                    <button
                      onClick={() => fetchUserDetail(selectedUserId)}
                      className="ml-2 font-medium underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : userDetail ? (
                <div className="space-y-6 p-5">
                  {/* Profile */}
                  <div className="flex items-start gap-4">
                    {userDetail.image || userDetail.avatar ? (
                      <img
                        src={userDetail.image || userDetail.avatar}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                        {getInitials(userDetail.name, userDetail.email)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {userDetail.name || "—"}
                      </h3>
                      <p className="truncate text-sm text-slate-500">{userDetail.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <RoleBadge role={userDetail.role} />
                        <StatusBadge status={userDetail.status} />
                      </div>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
                      <p className="text-xs font-medium text-slate-400">Balance</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatCurrency(userDetail.balance)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
                      <p className="text-xs font-medium text-slate-400">Joined</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(userDetail.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
                      <p className="text-xs font-medium text-slate-400">Updated</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(userDetail.updatedAt)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
                      <p className="text-xs font-medium text-slate-400">User ID</p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-600">
                        {userDetail.id}
                      </p>
                    </div>
                  </div>

                  {/* Balance actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBalanceModal({ open: true, mode: "ADD" })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" /> Add Balance
                    </button>
                    <button
                      onClick={() => setBalanceModal({ open: true, mode: "DEDUCT" })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                    >
                      <Minus className="h-4 w-4" /> Deduct
                    </button>
                  </div>

                  {/* User Stats */}
                  {userStats && (
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          {
                            label: "Today's Purchases",
                            value: formatNumber(
                              userStats.todayPurchases ?? userStats.todaysPurchases
                            ),
                          },
                          {
                            label: "Weekly Purchases",
                            value: formatNumber(userStats.weeklyPurchases),
                          },
                          {
                            label: "Monthly Purchases",
                            value: formatNumber(userStats.monthlyPurchases),
                          },
                          {
                            label: "Total Purchases",
                            value: formatNumber(
                              userStats.totalPurchases ?? userDetail.purchases
                            ),
                          },
                          {
                            label: "Today's Spent",
                            value: formatCurrency(
                              userStats.todaySpent ?? userStats.todaysSpent
                            ),
                          },
                          {
                            label: "Weekly Spent",
                            value: formatCurrency(userStats.weeklySpent),
                          },
                          {
                            label: "Monthly Spent",
                            value: formatCurrency(userStats.monthlySpent),
                          },
                          {
                            label: "Total Spent",
                            value: formatCurrency(
                              userStats.totalSpent ?? userDetail.spent
                            ),
                          },
                          {
                            label: "Avg Purchase",
                            value: formatCurrency(userStats.averagePurchase),
                          },
                          {
                            label: "Total Transactions",
                            value: formatNumber(
                              userStats.totalTransactions ?? userDetail.totalTransactions
                            ),
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="rounded-lg border border-slate-100 px-3 py-2.5"
                          >
                            <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900">
                              {s.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status / Role actions */}
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {userDetail.status !== "ACTIVE" && (
                          <button
                            onClick={() => changeStatus(userDetail.id, "ACTIVE")}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Activate
                          </button>
                        )}
                        {userDetail.status !== "SUSPENDED" && (
                          <button
                            onClick={() => changeStatus(userDetail.id, "SUSPENDED")}
                            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                          >
                            Suspend
                          </button>
                        )}
                        {userDetail.status !== "BANNED" && (
                          <button
                            onClick={() => changeStatus(userDetail.id, "BANNED")}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userDetail.role !== "USER" && (
                          <button
                            onClick={() => changeRole(userDetail.id, "USER")}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Set as User
                          </button>
                        )}
                        {userDetail.role !== "ADMIN" && (
                          <button
                            onClick={() => changeRole(userDetail.id, "ADMIN")}
                            className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
                          >
                            Set as Admin
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteUser(userDetail.id)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete User
                      </button>
                    </div>
                  </div>

                  {/* Recent orders */}
                  {(userDetail.recentOrders || userDetail.orders) && (
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Recent Orders
                      </h4>
                      <div className="space-y-2">
                        {(userDetail.recentOrders || userDetail.orders || [])
                          .slice(0, 5)
                          .map((o, i) => (
                            <div
                              key={o.id || i}
                              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {o.product || o.productName || "Order"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatDate(o.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-slate-900">
                                {formatCurrency(o.amount)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Recent transactions */}
                  {(userDetail.recentTransactions || userDetail.transactions) && (
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Recent Transactions
                      </h4>
                      <div className="space-y-2">
                        {(userDetail.recentTransactions || userDetail.transactions || [])
                          .slice(0, 5)
                          .map((t, i) => (
                            <div
                              key={t.id || i}
                              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
                            >
                              <div>
                                <TxTypeBadge type={t.type} />
                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(t.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-slate-900">
                                {formatCurrency(t.amount)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Actions dropdown (viewport portal) ───────────────────────────── */}
      {portalReady &&
        actionMenuId &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setActionMenuId(null)}
            />
            <div
              className="fixed z-[9999] w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              style={{
                top: actionMenuPosition.top,
                left: actionMenuPosition.left,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const id = actionMenuId;
                  setActionMenuId(null);
                  openUser(id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" /> View details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const id = actionMenuId;
                  setActionMenuId(null);
                  changeStatus(id, "ACTIVE");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Activate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const id = actionMenuId;
                  setActionMenuId(null);
                  changeStatus(id, "SUSPENDED");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Suspend
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const id = actionMenuId;
                  setActionMenuId(null);
                  changeStatus(id, "BANNED");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Ban className="h-3.5 w-3.5" /> Ban
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const id = actionMenuId;
                  setActionMenuId(null);
                  deleteUser(id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </>,
          document.body
        )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <BalanceModal
        open={balanceModal.open}
        mode={balanceModal.mode}
        user={userDetail}
        loading={balanceLoading}
        onSubmit={handleBalance}
        onClose={() => setBalanceModal({ open: false, mode: "ADD" })}
      />

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        confirmVariant={confirm.confirmVariant}
        loading={confirmLoading}
        onConfirm={runConfirmAction}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}