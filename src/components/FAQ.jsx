"use client";

import { useMemo, useState } from "react";

const faqCategories = [
  {
    title: "General Questions",
    description: "Everything about virtual numbers and availability.",
    questions: [
      {
        q: "When are new numbers added?",
        a: "New numbers are added regularly based on availability from our providers. If a country or service is temporarily unavailable, please check again later.",
      },
      {
        q: "Why was my account suspended?",
        a: "Accounts may be restricted when unusual activity, abuse, automated misuse, or violations of our platform rules are detected. If you believe this happened by mistake, please contact support.",
      },
      {
        q: "Why can't I purchase a number even though it is shown as available?",
        a: "Availability can change within seconds. A number may become unavailable when another customer purchases it or when the provider temporarily removes it.",
      },
      {
        q: "What are temporary numbers?",
        a: "Temporary numbers are virtual phone numbers intended for receiving SMS verification codes for supported services. They are generally suitable for one-time or short-term verification.",
      },
      {
        q: "Can I use a number for long-term purposes?",
        a: "Number availability and lifetime depend on the selected country, service, and provider. For long-term requirements, choose a number type specifically marked as suitable for continued use.",
      },
    ],
  },
  {
    title: "Balance & Payments",
    description: "Manage your balance, payments, and transactions.",
    questions: [
      {
        q: "How can I add balance to my account?",
        a: "Open your Balance or Wallet section, select an available payment method, choose your amount, and complete the payment.",
      },
      {
        q: "Is there a payment fee?",
        a: "Payment processing fees may vary depending on the selected payment method and transaction provider. Any applicable fee will be shown before completing your payment.",
      },
      {
        q: "My payment was successful but my balance was not updated. What should I do?",
        a: "First, verify that the payment was completed successfully. If your balance is still unchanged, contact support and provide your transaction details or payment reference.",
      },
      {
        q: "Can I withdraw my account balance?",
        a: "Withdrawals are subject to platform rules and the conditions of the specific balance or payment method. Contact support if you need assistance with an eligible withdrawal.",
      },
      {
        q: "Can I transfer balance to another account?",
        a: "Balance transfers may be available only for supported accounts and under specific conditions. Contact support if you need to transfer funds.",
      },
    ],
  },
  {
    title: "Low Rating & Insufficient Balance",
    description: "Understand balance and account rating messages.",
    questions: [
      {
        q: "Why am I seeing “Not enough balance”?",
        a: "Your available account balance is lower than the amount required to purchase the selected number. Add sufficient funds and try again.",
      },
      {
        q: "What does “Low rating” mean?",
        a: "Your account rating may affect access to certain numbers or services. Ratings can depend on account activity, successful transactions, cancellations, and other platform factors.",
      },
    ],
  },
  {
    title: "Registration, Login & Account",
    description: "Help with registration, login, and account security.",
    questions: [
      {
        q: "Why can't I create an account?",
        a: "Make sure all required information is valid and that your email address is not already registered. Also check that your password meets the required security rules.",
      },
      {
        q: "I can't log in to my account. What should I do?",
        a: "Verify your email and password first. If you have forgotten your password, use the password recovery option. If the problem continues, contact support.",
      },
      {
        q: "Can I change my account email?",
        a: "Email changes may require account verification. Contact support if your account settings do not provide an option to update your email address.",
      },
      {
        q: "What should I do if my account has been compromised?",
        a: "Contact support immediately and secure your email account. Never share your password, verification codes, API keys, or other private account information.",
      },
    ],
  },
  {
    title: "SMS & Verification",
    description: "Everything related to SMS delivery and verification.",
    questions: [
      {
        q: "What should I do if I don't receive an SMS?",
        a: "Wait for the service's normal delivery period and make sure the number is still active. If the SMS does not arrive within the allowed time, use the available cancellation or replacement options.",
      },
      {
        q: "Why did I receive an incorrect verification code?",
        a: "Verification messages are generated by the third-party service sending the SMS. Check the latest received message and make sure you are entering the correct code.",
      },
      {
        q: "Why does the service say that my phone number has already been used?",
        a: "Some services prevent the same number from being registered or verified multiple times. In this situation, you may need to use another available number.",
      },
      {
        q: "How can I receive a verification message again?",
        a: "If the supported service allows another verification attempt, follow its resend or retry process. Availability depends on the service you are verifying.",
      },
      {
        q: "Can I verify a service using a phone call?",
        a: "Call-based verification is only available when supported by both the selected number and the target service.",
      },
      {
        q: "How can I receive a call from a voice bot?",
        a: "If voice verification is supported, select a number and follow the verification instructions provided by the target service.",
      },
    ],
  },
  {
    title: "API & Developer Access",
    description: "Information for developers using our API.",
    questions: [
      {
        q: "How can I find my API key?",
        a: "Your API key can be found inside your account's API or developer settings. Keep your API key private and never expose it in public repositories or client-side applications.",
      },
      {
        q: "Can I purchase numbers through the API?",
        a: "Yes, supported services and countries can be accessed programmatically through the API. Refer to the API documentation for available endpoints and requirements.",
      },
      {
        q: "Why was my IP address blocked?",
        a: "An IP may be temporarily restricted when excessive requests, invalid traffic, or suspicious activity is detected. Reduce request frequency and review your API integration.",
      },
    ],
  },
  {
    title: "Cooperation",
    description: "Partnership and number provider opportunities.",
    questions: [
      {
        q: "Can I sell phone numbers through the platform?",
        a: "If you operate a legitimate number supply or telecommunications service and want to discuss cooperation, contact our business team with details about your available numbers and infrastructure.",
      },
    ],
  },
];

const icons = ["◎", "◈", "◇", "○", "⌁", "⌘", "△"];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState(null);

  const filteredCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return faqCategories;

    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(value) ||
            item.a.toLowerCase().includes(value) ||
            category.title.toLowerCase().includes(value)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [search]);

  const toggleCategory = (index) => {
    setOpenCategory((prev) => (prev === index ? -1 : index));
    setOpenQuestion(null);
  };

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;

    setOpenQuestion((prev) => (prev === key ? null : key));
  };

  return (
    <div className="w-full text-gray-900 dark:text-white">
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-xl dark:border-transparent dark:bg-[#1a2332] sm:px-7 sm:py-9">
        {/* FAQ HEADER */}
        <div className="mx-auto w-full max-w-[760px]">
          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-lg text-[#2087e8] dark:border-[#344257] dark:bg-[#232f42] dark:text-[#60a5fa]">
              ?
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h1>

            <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-gray-600 dark:text-[#71819a]">
              Find quick answers about virtual numbers, SMS verification,
              payments, accounts, and API access.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-7">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 dark:text-[#71819a]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
              />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your question..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/15 dark:border-[#344257] dark:bg-[#1e2a3a] dark:text-white dark:placeholder:text-[#66768d] dark:hover:border-[#40516a] dark:focus:bg-[#202d3f]"
            />
          </div>

          {/* CATEGORIES */}
          <div className="space-y-3">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, categoryIndex) => {
                const isOpen = openCategory === categoryIndex;

                return (
                  <div
                    key={category.title}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 dark:border-[#344257] dark:bg-[#1e2a3a]"
                  >
                    {/* CATEGORY HEADER */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryIndex)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-100 sm:px-5 dark:hover:bg-[#232f42]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-base font-medium text-[#2087e8] dark:border-[#344257] dark:bg-[#232f42] dark:text-[#60a5fa]">
                        {icons[categoryIndex % icons.length]}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {category.title}
                          </h2>

                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:border-[#344257] dark:bg-[#232f42] dark:text-[#71819a]">
                            {category.questions.length}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500 dark:text-[#71819a]">
                          {category.description}
                        </p>
                      </div>

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 dark:text-[#71819a] ${
                          isOpen ? "rotate-180 text-[#2087e8] dark:text-[#60a5fa]" : ""
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m6 9 6 6 6-6"
                        />
                      </svg>
                    </button>

                    {/* QUESTIONS */}
                    {isOpen && (
                      <div className="border-t border-gray-200 dark:border-[#344257]">
                        {category.questions.map((item, questionIndex) => {
                          const questionKey = `${categoryIndex}-${questionIndex}`;
                          const isQuestionOpen =
                            openQuestion === questionKey;

                          return (
                            <div
                              key={item.q}
                              className="border-b border-gray-200 last:border-b-0 dark:border-[#2b394d]"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleQuestion(
                                    categoryIndex,
                                    questionIndex
                                  )
                                }
                                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-100 sm:px-5 dark:hover:bg-[#202d3f]"
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors ${
                                    isQuestionOpen
                                      ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                                      : "border-gray-300 text-gray-400 dark:border-[#465872] dark:text-[#71819a]"
                                  }`}
                                >
                                  +
                                </span>

                                <span className="flex-1 text-sm font-medium leading-5 text-gray-700 dark:text-[#dce5f0]">
                                  {item.q}
                                </span>

                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform dark:text-[#71819a] ${
                                    isQuestionOpen ? "rotate-180" : ""
                                  }`}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m6 9 6 6 6-6"
                                  />
                                </svg>
                              </button>

                              {isQuestionOpen && (
                                <div className="px-12 pb-5">
                                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-[#2f3d51] dark:bg-[#1a2535]">
                                    <p className="text-xs leading-6 text-gray-600 dark:text-[#8b9ab0]">
                                      {item.a}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center dark:border-[#344257] dark:bg-[#1e2a3a]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-[#232f42] dark:text-[#71819a]">
                  ?
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  No questions found
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-[#71819a]">
                  Try searching with different keywords.
                </p>
              </div>
            )}
          </div>

          {/* SUPPORT */}
          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center dark:border-[#344257] dark:bg-[#1e2a3a]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Still need help?
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#71819a]">
              Our support team is here to help with account, payment, and
              verification issues.
            </p>

            <a
              href="/support"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#3b82f6] px-5 text-xs font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-[#2563eb] hover:shadow-blue-500/20"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* SINGLE CONTINUOUS FOOTER */}
        <div className="mx-auto mt-10 max-w-[1000px]">
          <div className="h-px w-full bg-gray-200 dark:bg-[#344257]" />

          <footer className="pb-2 pt-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {/* BRAND */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                <a href="/" className="inline-block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-[#2087e8]">
                      <span className="text-lg font-extrabold text-white">
                        5<span className="text-xs">sim</span>
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
                  Reliable virtual numbers for SMS verification and online
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
              ].map(([label, text, size]) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 ${size} font-bold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-[#344257] dark:text-[#71819a] dark:hover:border-[#465872] dark:hover:bg-[#232f42] dark:hover:text-white`}
                >
                  {text}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}