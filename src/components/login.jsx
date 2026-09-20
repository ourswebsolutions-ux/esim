"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login({ initialMode = "login" }) {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = () => {
    setIsSignUp((prev) => !prev);

    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const endpoint = isSignUp
        ? "/api/auth/signup"
        : "/api/auth/login";

      const payload = isSignUp
        ? {
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            confirmPassword,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (isSignUp
              ? "Unable to create your account."
              : "Unable to login.")
        );
      }

      setSuccess(
        data?.message ||
          (isSignUp
            ? "Account created successfully."
            : "Login successful.")
      );

      setPassword("");
      setConfirmPassword("");

      router.push("/purchase");
      router.refresh();
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(
      "Google sign-in is not connected yet. Email login is available."
    );
  };

  return (
    <div className="w-full text-gray-900 dark:text-white">
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl dark:border-transparent dark:bg-[#1a2332] sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Header */}
          <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {isSignUp ? "Create account" : "Sign in"}
          </h1>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-6 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-5 text-sm font-medium text-gray-900 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#344257] dark:bg-[#232f42] dark:text-white dark:hover:border-[#465872] dark:hover:bg-[#29374b]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-[18px] w-[18px] shrink-0"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>

            <span>
              {isSignUp
                ? "Sign up with Google"
                : "Sign in with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-[#344257]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-[#71819a]">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200 dark:bg-[#344257]" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            {isSignUp && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-[#b4c0d0]">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="name"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-white dark:placeholder:text-[#66768d] dark:hover:border-[#40516a] dark:focus:bg-[#202d3f]"
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-[#b4c0d0]">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-white dark:placeholder:text-[#66768d] dark:hover:border-[#40516a] dark:focus:bg-[#202d3f]"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-[#b4c0d0]">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 pr-11 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-white dark:placeholder:text-[#66768d] dark:hover:border-[#40516a] dark:focus:bg-[#202d3f]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed dark:text-[#71819a] dark:hover:text-white"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                      stroke="currentColor"
                      className="h-[18px] w-[18px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                      stroke="currentColor"
                      className="h-[18px] w-[18px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-[#b4c0d0]">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 pr-11 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-white dark:placeholder:text-[#66768d] dark:hover:border-[#40516a] dark:focus:bg-[#202d3f]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed dark:text-[#71819a] dark:hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.7}
                        stroke="currentColor"
                        className="h-[18px] w-[18px]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1 4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.7}
                        stroke="currentColor"
                        className="h-[18px] w-[18px]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {!isSignUp && (
              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery will be available soon."
                    )
                  }
                  className="text-xs font-medium text-[#3b82f6] transition-colors hover:text-[#2563eb] dark:text-[#60a5fa] dark:hover:text-[#93c5fd]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                {success}
              </div>
            )}

            {/* Cloudflare */}
            <div className="mb-6 flex min-h-[58px] w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 dark:border-[#344257] dark:bg-[#1b2636]">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="white"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Success!
                </span>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-orange-400"
                    fill="currentColor"
                  >
                    <path d="M16.5 4.5c-.8 0-1.5.3-2.1.8L12 7.7 9.6 5.3c-.6-.5-1.3-.8-2.1-.8C5.7 4.5 4.5 5.7 4.5 7.5c0 .8.3 1.5.8 2.1L12 16.5l6.7-6.9c.5-.6.8-1.3.8-2.1 0-1.8-1.2-3-3-3z" />
                  </svg>

                  <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-900 dark:text-white">
                    CLOUDFLARE
                  </span>
                </div>

                <div className="mt-1 flex gap-2 text-[10px] text-gray-400 dark:text-[#71819a]">
                  <button
                    type="button"
                    className="transition hover:text-gray-700 dark:hover:text-white"
                  >
                    Privacy
                  </button>

                  <span>·</span>

                  <button
                    type="button"
                    className="transition hover:text-gray-700 dark:hover:text-white"
                  >
                    Help
                  </button>
                </div>
              </div>
            </div>

            {/* Main Button */}
            <button
              type="submit"
              disabled={loading}
              className="mb-6 flex h-11 w-full items-center justify-center rounded-lg bg-[#3b82f6] text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-[#2563eb] hover:shadow-blue-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  {isSignUp
                    ? "Creating account..."
                    : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Create account" : "Login"
              )}
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-sm text-gray-500 dark:text-[#71819a]">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="font-medium text-[#3b82f6] transition-colors hover:text-[#2563eb] disabled:cursor-not-allowed dark:text-[#60a5fa] dark:hover:text-[#93c5fd]"
            >
              {isSignUp ? "Sign in" : "Registration"}
            </button>
          </p>
        </div>

        {/* FOOTER */}
        <div className="mx-auto mt-10 max-w-[1000px]">
          <div className="h-px w-full bg-gray-200 dark:bg-[#344257]" />

          <footer className="pb-2 pt-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {/* Brand */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                <a
                  href="https://5sim.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <img
                    src="https://5sim.net/logo.png"
                    alt="5sim"
                    className="mb-4 h-8 w-auto object-contain"
                  />
                </a>

                <p className="max-w-[180px] text-xs leading-5 text-gray-500 dark:text-[#71819a]">
                  © 2016-2026 5sim.net
                  <br />
                  All rights reserved.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Product
                </h3>

                <div className="space-y-2.5">
                  <a
                    href="https://5sim.net/prices"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Prices
                  </a>

                  <a
                    href="https://5sim.net/prices/statistics"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Statistics
                  </a>
                </div>
              </div>

              {/* 5SIM */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  5SIM
                </h3>

                <div className="space-y-2.5">
                  <a
                    href="https://5sim.net/contacts"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Contacts
                  </a>

                  <a
                    href="https://5sim.net/products"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Services Guides
                  </a>

                  <a
                    href="https://5sim.net/countries"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Countries Guides
                  </a>
                </div>
              </div>

              {/* Legal */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Legal
                </h3>

                <div className="space-y-2.5">
                  <a
                    href="https://5sim.net/rules"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Rules
                  </a>

                  <a
                    href="https://5sim.net/docs2/cookies.html"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Cookies
                  </a>

                  <a
                    href="https://5sim.net/docs2/delivery.html"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Delivery policy
                  </a>
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">
                  Support
                </h3>

                <div className="space-y-2.5">
                  <a
                    href="https://5sim.net/faq"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    FAQ
                  </a>

                  <a
                    href="https://5sim.net/support"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    Help Center
                  </a>

                  <a
                    href="https://5sim.net/manual"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-gray-500 transition hover:text-gray-900 dark:text-[#71819a] dark:hover:text-white"
                  >
                    How to buy?
                  </a>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-8 flex items-center gap-3 border-t border-gray-200 pt-5 dark:border-[#253247]">
              <a
                href="https://t.me/news_en_5sim"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white"
              >
                <span className="text-[10px] font-bold">
                  TG
                </span>
              </a>

              <a
                href="https://twitter.com/5simnet"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white"
              >
                <span className="text-sm font-bold">
                  𝕏
                </span>
              </a>

              <a
                href="https://www.facebook.com/5sim.fivesim"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white"
              >
                <span className="text-sm font-bold">
                  f
                </span>
              </a>

              <a
                href="https://www.instagram.com/sms5sim"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white"
              >
                <span className="text-[10px] font-bold">
                  IG
                </span>
              </a>

              <a
                href="https://www.youtube.com/channel/UCDAJsFOCzWStByc8lDXWexg"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white"
              >
                <span className="text-[10px] font-bold">
                  YT
                </span>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}