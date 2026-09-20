"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCreditCard,
  HiOutlinePlus,
} from "react-icons/hi";

import {
  IoChevronDown,
  IoPersonOutline,
  IoLogOutOutline,
  IoCheckmark,
} from "react-icons/io5";

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    direction: "ltr",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    direction: "ltr",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    direction: "ltr",
  },
];

const translations = {
  en: {
    home: "Home",
    faq: "FAQ",
    howToBuy: "How to buy?",
    wallet: "Wallet",
    addBalance: "Add Balance",
    login: "Login",
    signup: "Sign up",
    profile: "Profile",
    logout: "Logout",
    viewProfile: "View Profile",
    availableBalance: "Available balance",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    selectLanguage: "Select language",
    addBalanceTitle: "Add Balance",
    addBalanceDescription:
      "Contact our support team to recharge your wallet.",
    addBalanceViaWhatsApp: "Add balance via WhatsApp",
    whatsappDescription:
      "To add funds to your account, contact us on WhatsApp. Our support team will guide you through the payment process.",
    whatsapp: "WhatsApp",
    available: "Available",
    contactWhatsApp: "Contact on WhatsApp",
    balanceConfirmation:
      "Balance will be added to your wallet after payment confirmation.",
  },

  hi: {
    home: "होम",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    howToBuy: "कैसे खरीदें?",
    wallet: "वॉलेट",
    addBalance: "बैलेंस जोड़ें",
    login: "लॉगिन",
    signup: "साइन अप",
    profile: "प्रोफ़ाइल",
    logout: "लॉग आउट",
    viewProfile: "प्रोफ़ाइल देखें",
    availableBalance: "उपलब्ध बैलेंस",
    switchToLight: "लाइट मोड पर जाएं",
    switchToDark: "डार्क मोड पर जाएं",
    selectLanguage: "भाषा चुनें",
    addBalanceTitle: "बैलेंस जोड़ें",
    addBalanceDescription:
      "अपने वॉलेट में बैलेंस जोड़ने के लिए हमारी सपोर्ट टीम से संपर्क करें।",
    addBalanceViaWhatsApp: "WhatsApp से बैलेंस जोड़ें",
    whatsappDescription:
      "अपने अकाउंट में पैसे जोड़ने के लिए WhatsApp पर हमसे संपर्क करें। हमारी सपोर्ट टीम भुगतान प्रक्रिया में आपकी सहायता करेगी।",
    whatsapp: "WhatsApp",
    available: "उपलब्ध",
    contactWhatsApp: "WhatsApp पर संपर्क करें",
    balanceConfirmation:
      "भुगतान की पुष्टि के बाद बैलेंस आपके वॉलेट में जोड़ दिया जाएगा।",
  },

  bn: {
    home: "হোম",
    faq: "সাধারণ জিজ্ঞাসা",
    howToBuy: "কীভাবে কিনবেন?",
    wallet: "ওয়ালেট",
    addBalance: "ব্যালেন্স যোগ করুন",
    login: "লগইন",
    signup: "সাইন আপ",
    profile: "প্রোফাইল",
    logout: "লগআউট",
    viewProfile: "প্রোফাইল দেখুন",
    availableBalance: "উপলব্ধ ব্যালেন্স",
    switchToLight: "লাইট মোডে যান",
    switchToDark: "ডার্ক মোডে যান",
    selectLanguage: "ভাষা নির্বাচন করুন",
    addBalanceTitle: "ব্যালেন্স যোগ করুন",
    addBalanceDescription:
      "আপনার ওয়ালেটে ব্যালেন্স যোগ করতে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
    addBalanceViaWhatsApp: "WhatsApp-এর মাধ্যমে ব্যালেন্স যোগ করুন",
    whatsappDescription:
      "আপনার অ্যাকাউন্টে টাকা যোগ করতে WhatsApp-এ আমাদের সাথে যোগাযোগ করুন। আমাদের সাপোর্ট টিম পেমেন্ট প্রক্রিয়ায় আপনাকে সাহায্য করবে।",
    whatsapp: "WhatsApp",
    available: "উপলব্ধ",
    contactWhatsApp: "WhatsApp-এ যোগাযোগ করুন",
    balanceConfirmation:
      "পেমেন্ট নিশ্চিত হওয়ার পর আপনার ওয়ালেটে ব্যালেন্স যোগ করা হবে।",
  },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const profileRef = useRef(null);
  const languageRef = useRef(null);

  /*
   * CURRENT TRANSLATIONS
   */
  const t = translations[language];

  const currentLanguage =
    languages.find((item) => item.code === language) || languages[0];

  const navItems = [
    {
      label: t.home,
      href: "/",
    },
    {
      label: t.faq,
      href: "/faq",
    },
    {
      label: t.howToBuy,
      href: "/how-to-buy",
    },
  ];

  /*
   * LOAD THEME + LANGUAGE
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedLanguage = localStorage.getItem("language");

    /*
     * THEME
     */
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    /*
     * LANGUAGE
     */
    if (
      savedLanguage &&
      languages.some((item) => item.code === savedLanguage)
    ) {
      setLanguage(savedLanguage);
    } else {
      setLanguage("en");
    }
  }, []);

  /*
   * UPDATE HTML DIRECTION
   */
  useEffect(() => {
    const selectedLanguage =
      languages.find((item) => item.code === language) ||
      languages[0];

    document.documentElement.lang = selectedLanguage.code;
    document.documentElement.dir = selectedLanguage.direction;

    document.body.dir = selectedLanguage.direction;

    return () => {
      document.documentElement.dir = "ltr";
      document.body.dir = "ltr";
    };
  }, [language]);

  /*
   * AUTH CHECK
   */
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!mounted) return;

        if (response.ok && data.authenticated && data.user) {
          setUser(data.user);
          setBalance(Number(data.user.balance ?? 0));
        } else {
          setUser(null);
          setBalance(0);
        }
      } catch (error) {
        console.error("AUTH_CHECK_ERROR:", error);

        if (mounted) {
          setUser(null);
          setBalance(0);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * CLOSE DROPDOWNS OUTSIDE CLICK
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        languageRef.current &&
        !languageRef.current.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * ESC CLOSE
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAddBalanceOpen(false);
        setProfileOpen(false);
        setLanguageOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * CHANGE LANGUAGE
   */
  const changeLanguage = (code) => {
    const selectedLanguage = languages.find(
      (item) => item.code === code
    );

    if (!selectedLanguage) return;

    setLanguage(code);

    localStorage.setItem("language", code);

    document.documentElement.lang = selectedLanguage.code;
    document.documentElement.dir = selectedLanguage.direction;
    document.body.dir = selectedLanguage.direction;

    setLanguageOpen(false);
  };

  /*
   * THEME TOGGLE
   */
  const toggleTheme = () => {
    const nextTheme = !darkMode;

    setDarkMode(nextTheme);

    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
    } finally {
      setUser(null);
      setBalance(0);
      setProfileOpen(false);
      setMobileOpen(false);

      window.location.href = "/";
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const firstLetter =
    user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="relative z-40 w-full">
      {/* FULL WIDTH BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="h-14 w-full bg-white dark:bg-[#172235]" />

        <div className="h-[38px] w-full border-t border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-[#111b2b]" />
      </div>

      {/* 12 COLUMN GRID */}
      <div className="grid w-full grid-cols-12">
        {/* LEFT EMPTY */}
        <div className="hidden lg:col-span-2 lg:block" />

        {/* MAIN APPLICATION AREA */}
        <div className="relative col-span-12 lg:col-span-9">
          {/* TOP RIGHT ACTIONS */}
          <div className="flex h-14 w-full items-center justify-end px-4 sm:px-6 lg:mr-4 lg:px-0">
            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center gap-2.5 md:flex lg:mr-8">
              {/* WALLET */}
              <Link
                href="/purchase"
                className="
                  flex h-10 items-center gap-2
                  rounded-xl
                  border border-blue-500/25
                  bg-blue-500/[0.06]
                  px-3.5
                  text-[14px] font-semibold
                  text-blue-600
                  transition-all
                  hover:border-blue-500/45
                  hover:bg-blue-500/[0.11]
                  hover:text-blue-700
                  dark:border-blue-400/25
                  dark:bg-blue-400/[0.07]
                  dark:text-blue-300
                  dark:hover:border-blue-400/45
                  dark:hover:bg-blue-400/[0.12]
                  dark:hover:text-blue-200
                "
              >
                <HiOutlineCreditCard className="h-[18px] w-[18px]" />

                <span>{t.wallet}</span>

                <span
                  className="
                    rounded-md
                    bg-blue-500/10
                    px-1.5 py-0.5
                    text-[12px]
                    font-bold
                    text-blue-600
                    dark:bg-blue-400/10
                    dark:text-blue-300
                  "
                >
                  ${balance.toFixed(2)}
                </span>
              </Link>

              {/* ADD BALANCE */}
              <button
                type="button"
                onClick={() => setAddBalanceOpen(true)}
                aria-label={t.addBalance}
                title={t.addBalance}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-emerald-500/30
                  bg-emerald-500/[0.07]
                  text-emerald-600
                  transition-all
                  hover:border-emerald-500/50
                  hover:bg-emerald-500/[0.13]
                  hover:text-emerald-700
                  dark:border-emerald-400/30
                  dark:bg-emerald-400/[0.08]
                  dark:text-emerald-300
                  dark:hover:border-emerald-400/50
                  dark:hover:bg-emerald-400/[0.14]
                  dark:hover:text-emerald-200
                "
              >
                <HiOutlinePlus className="h-[19px] w-[19px]" />
              </button>

              {/* AUTH */}
              {authLoading ? (
                <div className="h-10 w-[150px] animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.05]" />
              ) : !user ? (
                <>
                  {/* LOGIN */}
                  <Link
                    href="/login"
                    className="
                      flex h-10 items-center rounded-xl px-3.5
                      text-[15px] font-medium
                      text-gray-700
                      transition-all
                      hover:bg-gray-900/[0.05]
                      hover:text-gray-950
                      dark:text-[#d9e4f2]
                      dark:hover:bg-white/[0.06]
                      dark:hover:text-white
                    "
                  >
                    {t.login}
                  </Link>

                  {/* SIGN UP */}
                  <Link
                    href="/signup"
                    className="
                      flex h-10 items-center justify-center
                      rounded-xl
                      border border-blue-500/50
                      bg-blue-500/[0.08]
                      px-4
                      text-[15px] font-semibold
                      text-blue-600
                      transition-all
                      hover:border-blue-500
                      hover:bg-blue-500/[0.14]
                      hover:text-blue-700
                      dark:border-[#4ca8ff]/70
                      dark:bg-[#2087e8]/10
                      dark:text-[#8ecbff]
                      dark:hover:border-[#63b8ff]
                      dark:hover:bg-[#2087e8]/20
                      dark:hover:text-white
                    "
                  >
                    {t.signup}
                  </Link>
                </>
              ) : (
                /* LOGGED IN PROFILE */
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setProfileOpen((value) => !value)
                    }
                    className="
                      flex h-10 items-center gap-2.5
                      rounded-xl
                      border border-gray-200
                      bg-gray-50
                      px-2.5
                      transition-all
                      hover:border-blue-400/60
                      hover:bg-blue-50
                      dark:border-[#344257]
                      dark:bg-[#1d293a]
                      dark:hover:border-blue-400/50
                      dark:hover:bg-[#24344a]
                    "
                  >
                    <span
                      className="
                        flex h-7 w-7 items-center justify-center
                        rounded-lg
                        bg-blue-500
                        text-[12px]
                        font-bold
                        text-white
                      "
                    >
                      {firstLetter}
                    </span>

                    <span
                      className="
                        hidden max-w-[110px]
                        truncate
                        text-[13px] font-semibold
                        text-gray-800
                        lg:block
                        dark:text-white
                      "
                    >
                      {user.fullName}
                    </span>

                    <IoChevronDown
                      className={`
                        h-3.5 w-3.5
                        text-gray-400
                        transition-transform
                        dark:text-[#91a1b5]
                        ${profileOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileOpen && (
                    <div
                      className="
                        absolute right-0 top-[48px]
                        z-[100]
                        w-[245px]
                        overflow-hidden
                        rounded-2xl
                        border border-gray-200
                        bg-white
                        shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]
                        dark:border-[#2d3a4d]
                        dark:bg-[#151f2e]
                        dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)]
                      "
                    >
                      {/* USER HEADER */}
                      <div className="border-b border-gray-200 px-4 py-4 dark:border-white/[0.07]">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex h-10 w-10 shrink-0
                              items-center justify-center
                              rounded-xl
                              bg-blue-500
                              text-sm font-bold
                              text-white
                            "
                          >
                            {firstLetter}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-[#7f90a5]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* BALANCE */}
                        <div
                          className="
                            mt-3 flex items-center
                            justify-between
                            rounded-xl
                            border border-blue-500/10
                            bg-blue-500/[0.05]
                            px-3 py-2.5
                            dark:border-blue-400/10
                            dark:bg-blue-400/[0.06]
                          "
                        >
                          <span className="text-[11px] font-medium text-gray-500 dark:text-[#8495aa]">
                            {t.availableBalance}
                          </span>

                          <span className="text-[13px] font-bold text-blue-600 dark:text-blue-300">
                            ${balance.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* MENU */}
                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="
                            flex items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-[13px] font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-100
                            dark:text-[#d6e1ee]
                            dark:hover:bg-white/[0.05]
                          "
                        >
                          <IoPersonOutline className="h-[18px] w-[18px] text-gray-400 dark:text-[#8495aa]" />

                          <span>{t.profile}</span>
                        </Link>

                        <Link
                          href="/purchase"
                          onClick={() => setProfileOpen(false)}
                          className="
                            flex items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-[13px] font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-100
                            dark:text-[#d6e1ee]
                            dark:hover:bg-white/[0.05]
                          "
                        >
                          <HiOutlineCreditCard className="h-[18px] w-[18px] text-gray-400 dark:text-[#8495aa]" />

                          <span>{t.wallet}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setAddBalanceOpen(true);
                          }}
                          className="
                            flex w-full items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-left
                            text-[13px] font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-100
                            dark:text-[#d6e1ee]
                            dark:hover:bg-white/[0.05]
                          "
                        >
                          <HiOutlinePlus className="h-[18px] w-[18px] text-emerald-500 dark:text-emerald-400" />

                          <span>{t.addBalance}</span>
                        </button>
                      </div>

                      {/* LOGOUT */}
                      <div className="border-t border-gray-200 p-2 dark:border-white/[0.07]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="
                            flex w-full items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-left
                            text-[13px] font-medium
                            text-red-600
                            transition
                            hover:bg-red-500/[0.07]
                            dark:text-red-400
                            dark:hover:bg-red-400/[0.08]
                          "
                        >
                          <IoLogOutOutline className="h-[18px] w-[18px]" />

                          <span>{t.logout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* THEME */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  darkMode ? t.switchToLight : t.switchToDark
                }
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  text-gray-600
                  transition
                  hover:bg-gray-900/[0.05]
                  hover:text-gray-950
                  dark:text-[#c8d5e5]
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-white
                "
              >
                {darkMode ? (
                  <HiOutlineSun className="h-[19px] w-[19px]" />
                ) : (
                  <HiOutlineMoon className="h-[19px] w-[19px]" />
                )}
              </button>

              {/* LANGUAGE */}
              <div ref={languageRef} className="relative">
                <button
                  type="button"
                  aria-label={t.selectLanguage}
                  onClick={() =>
                    setLanguageOpen((value) => !value)
                  }
                  className="
                    flex h-10 items-center gap-1.5
                    rounded-xl px-2
                    text-gray-700
                    transition
                    hover:bg-gray-900/[0.05]
                    dark:text-[#d5e0ed]
                    dark:hover:bg-white/[0.06]
                  "
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[14px]">
                    {currentLanguage.flag}
                  </span>

                  <IoChevronDown
                    className={`
                      h-3.5 w-3.5
                      text-gray-400
                      transition-transform
                      dark:text-[#9aabc0]
                      ${languageOpen ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* LANGUAGE DROPDOWN */}
                {languageOpen && (
                  <div
                    className="
                      absolute right-0 top-[48px]
                      z-[120]
                      w-[190px]
                      overflow-hidden
                      rounded-2xl
                      border border-gray-200
                      bg-white
                      p-1.5
                      shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]
                      dark:border-[#2d3a4d]
                      dark:bg-[#151f2e]
                      dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)]
                    "
                  >
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400 dark:text-[#718299]">
                        Language
                      </p>
                    </div>

                    {languages.map((item) => {
                      const selected = language === item.code;

                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() =>
                            changeLanguage(item.code)
                          }
                          className={`
                            flex w-full items-center gap-3
                            rounded-xl
                            px-3 py-2.5
                            text-left
                            transition
                            ${
                              selected
                                ? "bg-blue-500/[0.08] text-blue-600 dark:bg-blue-400/[0.08] dark:text-blue-300"
                                : "text-gray-700 hover:bg-gray-100 dark:text-[#d6e1ee] dark:hover:bg-white/[0.05]"
                            }
                          `}
                        >
                          <span className="text-[18px]">
                            {item.flag}
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="text-[13px] font-semibold">
                              {item.nativeName}
                            </span>

                            <span className="text-[10px] text-gray-400 dark:text-[#718299]">
                              {item.name}
                            </span>
                          </span>

                          {selected && (
                            <IoCheckmark className="h-4 w-4 text-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE BUTTON */}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                text-gray-700
                transition
                hover:bg-gray-900/[0.05]
                dark:text-[#dce7f4]
                dark:hover:bg-white/[0.06]
                md:hidden
              "
            >
              {mobileOpen ? (
                <HiOutlineX className="h-6 w-6" />
              ) : (
                <HiOutlineMenu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* FLOATING BRAND CARD */}
          <div className="absolute left-0 top-[14px] z-50 hidden md:block">
            <Link
              href="/"
              className="
                group flex h-[88px]
                w-[390px]
                items-center gap-4
                rounded-[22px]
                border border-white/[0.10]
                bg-[#1b78d1]
                px-4
                shadow-[0_14px_35px_-12px_rgba(0,0,0,0.55)]
                transition-all duration-300
                hover:-translate-y-[1px]
                hover:bg-[#2184e4]
                hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)]
                lg:w-[410px]
                lg:px-5
                xl:w-[420px]
              "
            >
              {/* LOGO */}
              <div
                className="
                  flex h-12 w-[66px] shrink-0
                  items-center justify-center
                  rounded-2xl
                  border border-white/[0.12]
                  bg-[#3d9cf0]
                "
              >
                <span className="text-[22px] font-extrabold leading-none text-white">
                  5
                  <span className="text-[15px] font-bold">
                    sim
                  </span>
                </span>
              </div>

              {/* BRAND */}
              <div className="flex min-w-0 flex-col justify-center leading-tight">
                <span className="text-[19px] font-bold tracking-tight text-white lg:text-[20px]">
                  Virtual Numbers
                </span>

                <span className="mt-1 text-[13px] font-medium text-white/80 lg:text-[14px]">
                  for Receiving SMS
                </span>
              </div>
            </Link>
          </div>

          {/* NAV LINKS */}
          <nav className="hidden h-[38px] items-center md:flex">
            <ul
              className="
                ml-[390px]
                flex h-full items-center gap-1
                lg:ml-[410px]
                xl:ml-[420px]
              "
            >
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      flex h-[38px]
                      items-center
                      rounded-lg
                      px-4
                      text-[15px]
                      font-medium
                      text-gray-600
                      transition-all
                      hover:bg-gray-900/[0.04]
                      hover:text-gray-950
                      dark:text-[#b9c7d8]
                      dark:hover:bg-white/[0.045]
                      dark:hover:text-white
                    "
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* RIGHT EMPTY */}
        <div className="hidden lg:col-span-1 lg:block" />
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          className="
            border-t border-gray-200
            bg-white
            px-4 py-5
            dark:border-white/[0.07]
            dark:bg-[#172235]
            md:hidden
          "
        >
          <div className="w-full">
            {/* NAV */}
            <nav>
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="
                        block rounded-xl
                        px-4 py-3
                        text-[15px] font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-900/[0.05]
                        hover:text-gray-950
                        dark:text-[#d5e0ed]
                        dark:hover:bg-white/[0.06]
                        dark:hover:text-white
                      "
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* MOBILE ACCOUNT */}
            <div
              className="
                mt-4
                border-t border-gray-200
                pt-4
                dark:border-white/[0.07]
              "
            >
              <div className="flex flex-col gap-1">
                {/* WALLET */}
                <Link
                  href="/purchase"
                  onClick={closeMobileMenu}
                  className="
                    flex items-center justify-between
                    rounded-xl
                    px-4 py-3
                    text-[15px] font-semibold
                    text-blue-600
                    transition
                    hover:bg-blue-500/[0.07]
                    dark:text-blue-300
                    dark:hover:bg-blue-400/[0.08]
                  "
                >
                  <span className="flex items-center gap-2">
                    <HiOutlineCreditCard className="h-[19px] w-[19px]" />

                    <span>{t.wallet}</span>
                  </span>

                  <span
                    className="
                      rounded-md
                      bg-blue-500/10
                      px-2 py-1
                      text-xs font-bold
                      text-blue-600
                      dark:bg-blue-400/10
                      dark:text-blue-300
                    "
                  >
                    ${balance.toFixed(2)}
                  </span>
                </Link>

                {/* ADD BALANCE */}
                <button
                  type="button"
                  onClick={() => {
                    setAddBalanceOpen(true);
                    setMobileOpen(false);
                  }}
                  className="
                    flex items-center gap-2
                    rounded-xl
                    px-4 py-3
                    text-left
                    text-[15px] font-semibold
                    text-emerald-600
                    transition
                    hover:bg-emerald-500/[0.07]
                    dark:text-emerald-300
                    dark:hover:bg-emerald-400/[0.08]
                  "
                >
                  <HiOutlinePlus className="h-[19px] w-[19px]" />

                  <span>{t.addBalance}</span>
                </button>

                {/* MOBILE AUTH */}
                {authLoading ? (
                  <div className="mt-2 h-11 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.05]" />
                ) : !user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="
                        rounded-xl px-4 py-3
                        text-[15px] font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-900/[0.05]
                        hover:text-gray-950
                        dark:text-[#d5e0ed]
                        dark:hover:bg-white/[0.06]
                        dark:hover:text-white
                      "
                    >
                      {t.login}
                    </Link>

                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="
                        mt-1
                        flex h-11 items-center justify-center
                        rounded-xl
                        border border-blue-500/50
                        bg-blue-500/[0.08]
                        text-[15px] font-semibold
                        text-blue-600
                        transition
                        hover:bg-blue-500/[0.14]
                        dark:border-[#4ca8ff]/70
                        dark:bg-[#2087e8]/10
                        dark:text-[#8ecbff]
                      "
                    >
                      {t.signup}
                    </Link>
                  </>
                ) : (
                  <>
                    {/* MOBILE USER */}
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="
                        mt-1 flex items-center gap-3
                        rounded-xl
                        border border-gray-200
                        bg-gray-50
                        px-4 py-3
                        dark:border-[#344257]
                        dark:bg-[#1d293a]
                      "
                    >
                      <span
                        className="
                          flex h-9 w-9 items-center justify-center
                          rounded-lg
                          bg-blue-500
                          text-xs font-bold
                          text-white
                        "
                      >
                        {firstLetter}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-gray-900 dark:text-white">
                          {user.fullName}
                        </span>

                        <span className="block text-[11px] text-gray-500 dark:text-[#8192a7]">
                          {t.viewProfile}
                        </span>
                      </span>
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        mt-1 flex items-center gap-2
                        rounded-xl
                        px-4 py-3
                        text-left
                        text-[15px] font-medium
                        text-red-600
                        transition
                        hover:bg-red-500/[0.07]
                        dark:text-red-400
                        dark:hover:bg-red-400/[0.08]
                      "
                    >
                      <IoLogOutOutline className="h-[19px] w-[19px]" />

                      <span>{t.logout}</span>
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE THEME + LANGUAGE */}
              <div
                className="
                  mt-4
                  flex items-center gap-2
                  border-t border-gray-200
                  pt-4
                  dark:border-white/[0.07]
                "
              >
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    darkMode
                      ? t.switchToLight
                      : t.switchToDark
                  }
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    text-gray-600
                    transition
                    hover:bg-gray-900/[0.05]
                    hover:text-gray-950
                    dark:text-[#c8d5e5]
                    dark:hover:bg-white/[0.06]
                    dark:hover:text-white
                  "
                >
                  {darkMode ? (
                    <HiOutlineSun className="h-5 w-5" />
                  ) : (
                    <HiOutlineMoon className="h-5 w-5" />
                  )}
                </button>

                {/* MOBILE LANGUAGE */}
                <div ref={languageRef} className="relative">
                  <button
                    type="button"
                    aria-label={t.selectLanguage}
                    onClick={() =>
                      setLanguageOpen((value) => !value)
                    }
                    className="
                      flex h-10 items-center gap-1.5
                      rounded-xl px-2
                      text-gray-700
                      transition
                      hover:bg-gray-900/[0.05]
                      dark:text-[#d5e0ed]
                      dark:hover:bg-white/[0.06]
                    "
                  >
                    <span className="text-[14px]">
                      {currentLanguage.flag}
                    </span>

                    <IoChevronDown
                      className={`
                        h-3.5 w-3.5
                        text-gray-400
                        transition-transform
                        dark:text-[#9aabc0]
                        ${languageOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {languageOpen && (
                    <div
                      className="
                        absolute left-0 bottom-[48px]
                        z-[120]
                        w-[190px]
                        overflow-hidden
                        rounded-2xl
                        border border-gray-200
                        bg-white
                        p-1.5
                        shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]
                        dark:border-[#2d3a4d]
                        dark:bg-[#151f2e]
                        dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)]
                      "
                    >
                      {languages.map((item) => {
                        const selected =
                          language === item.code;

                        return (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() =>
                              changeLanguage(item.code)
                            }
                            className={`
                              flex w-full items-center gap-3
                              rounded-xl
                              px-3 py-2.5
                              text-left
                              transition
                              ${
                                selected
                                  ? "bg-blue-500/[0.08] text-blue-600 dark:bg-blue-400/[0.08] dark:text-blue-300"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-[#d6e1ee] dark:hover:bg-white/[0.05]"
                              }
                            `}
                          >
                            <span className="text-[18px]">
                              {item.flag}
                            </span>

                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="text-[13px] font-semibold">
                                {item.nativeName}
                              </span>

                              <span className="text-[10px] text-gray-400 dark:text-[#718299]">
                                {item.name}
                              </span>
                            </span>

                            {selected && (
                              <IoCheckmark className="h-4 w-4 text-blue-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD BALANCE MODAL */}
      {addBalanceOpen && (
        <div
          className="
            fixed inset-0 z-[200]
            flex items-center justify-center
            bg-black/45
            px-4
            backdrop-blur-[4px]
          "
          onClick={() => setAddBalanceOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
              w-full max-w-[420px]
              overflow-hidden
              rounded-2xl
              border border-gray-200
              bg-white
              shadow-[0_25px_80px_-20px_rgba(0,0,0,0.35)]
              dark:border-[#2d3a4d]
              dark:bg-[#151f2e]
              dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)]
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/[0.07]">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                  {t.addBalanceTitle}
                </h3>

                <p className="mt-1 text-[12px] text-gray-500 dark:text-[#8192a7]">
                  {t.addBalanceDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddBalanceOpen(false)}
                aria-label="Close"
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                  dark:text-[#8b9bb0]
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-white
                "
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="px-5 py-5">
              <div
                className="
                  rounded-xl
                  border border-emerald-500/15
                  bg-emerald-500/[0.05]
                  p-4
                  dark:border-emerald-400/15
                  dark:bg-emerald-400/[0.06]
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-emerald-500
                      text-white
                    "
                  >
                    <span className="text-lg">✆</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-white">
                      {t.addBalanceViaWhatsApp}
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-gray-600 dark:text-[#91a2b6]">
                      {t.whatsappDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* WHATSAPP */}
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-[#718299]">
                  {t.whatsapp}
                </p>

                <div
                  className="
                    flex items-center justify-between
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3
                    dark:border-[#2d3a4d]
                    dark:bg-[#1d293a]
                  "
                >
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                    +92 324 5237429
                  </span>

                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {t.available}
                  </span>
                </div>
              </div>

              {/* WHATSAPP BUTTON */}
              <a
                href="https://wa.me/923245237429"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-4 flex h-11 w-full
                  items-center justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-500
                  text-[14px] font-semibold
                  text-white
                  transition-all
                  hover:bg-emerald-600
                  hover:shadow-lg
                  hover:shadow-emerald-500/20
                "
              >
                <span className="text-base">✆</span>

                {t.contactWhatsApp}
              </a>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-200 px-5 py-3 dark:border-white/[0.07]">
              <p className="text-center text-[11px] text-gray-400 dark:text-[#718299]">
                {t.balanceConfirmation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR FLOATING BRAND SPACE */}
      <div className="h-[48px]" aria-hidden="true" />
    </header>
  );
}