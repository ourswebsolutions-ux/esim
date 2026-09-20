"use client";

import React from "react";
import Link from "next/link";

import {
  UserPlus,
  WalletCards,
  Search,
  Globe2,
  Radio,
  ShoppingCart,
  Copy,
  Smartphone,
  MessageSquareText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Settings2,
} from "lucide-react";

const orderSteps = [
  {
    number: "01",
    icon: Search,
    title: "Select service",
    text: "Search for the platform where you need to receive an SMS, such as WhatsApp, Telegram, OpenAI, Amazon or another supported service.",
  },
  {
    number: "02",
    icon: Globe2,
    title: "Select country",
    text: "Choose the country you want your virtual phone number to originate from.",
  },
  {
    number: "03",
    icon: Radio,
    title: "Select operator",
    text: "Choose an available operator based on price, availability and delivery performance.",
  },
  {
    number: "04",
    icon: ShoppingCart,
    title: "Buy number",
    text: "Review your selection and click Buy to create the virtual number order.",
  },
];

export default function HowToBuy() {
  return (
    <div className="w-full pb-10">
      <div
        className="
          w-full rounded-2xl
          border border-gray-200
          bg-white
          px-6 py-8
          shadow-xl
          sm:px-8 sm:py-10

          dark:border-transparent
          dark:bg-[#1a2332]
        "
      >
        <div className="mx-auto w-full max-w-[760px]">
          {/* HEADER */}
          <header>
            <p
              className="
                mb-2
                text-[11px] font-semibold uppercase
                tracking-[0.16em]
                text-blue-600
                dark:text-[#62b7ff]
              "
            >
              Getting Started
            </p>

            <h1
              className="
                text-2xl font-bold tracking-tight
                text-gray-900
                sm:text-[28px]
                dark:text-white
              "
            >
              How to buy a virtual number
            </h1>

            <p
              className="
                mt-3 max-w-[680px]
                text-[13px] leading-6
                text-gray-600
                dark:text-[#93a5ba]
              "
            >
              Follow these simple steps to choose a service, select a country,
              purchase a virtual number and receive your verification SMS.
            </p>
          </header>

          {/* =========================================
              1. ACCOUNT SETUP
          ========================================= */}
          <section className="mt-8">
            <SectionHeading
              number="01"
              title="Account setup & top-up"
              text="Create an account and make sure your balance is ready before purchasing a number."
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={UserPlus}
                title="Sign up or log in"
                text="Create your account or sign in to your existing account before purchasing a virtual number."
              />

              <InfoCard
                icon={WalletCards}
                title="Top up your balance"
                text="Add funds to your account using one of the available payment methods."
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/login"
                className="
                  flex h-10 flex-1 items-center justify-center
                  rounded-xl
                  border border-gray-200
                  bg-gray-50
                  text-[12px] font-semibold
                  text-gray-700
                  transition
                  hover:border-gray-300
                  hover:bg-gray-100

                  dark:border-white/[0.08]
                  dark:bg-[#111a27]
                  dark:text-[#dbe7f2]
                  dark:hover:border-white/[0.14]
                  dark:hover:bg-[#182333]
                "
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="
                  flex h-10 flex-1 items-center justify-center
                  rounded-xl
                  bg-[#2087e8]
                  text-[12px] font-semibold
                  text-white
                  transition
                  hover:bg-[#3195ef]
                "
              >
                Create account
              </Link>
            </div>
          </section>

          {/* =========================================
              2. CONFIGURE ORDER
          ========================================= */}
          <section
            className="
              mt-10
              border-t border-gray-200
              pt-8
              dark:border-white/[0.07]
            "
          >
            <SectionHeading
              number="02"
              title="Configure your order"
              text="Choose how you want to purchase your virtual number and configure the required options."
            />

            {/* BUY MODES */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ModeCard
                icon={Settings2}
                title="Manual Buy"
                text="Choose the service, country and operator yourself for complete control over your order."
              />

              <ModeCard
                icon={Zap}
                title="Smart Buy"
                text="Let the system automatically select a suitable number based on availability and delivery performance."
                featured
              />
            </div>

            {/* ORDER STEPS */}
            <div className="mt-5 space-y-3">
              {orderSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="
                      flex gap-4
                      rounded-2xl
                      border border-gray-200
                      bg-gray-50
                      p-4
                      sm:p-5

                      dark:border-white/[0.06]
                      dark:bg-[#151e2c]
                    "
                  >
                    <div className="flex shrink-0 flex-col items-center">
                      <div
                        className="
                          flex h-10 w-10 items-center justify-center
                          rounded-xl
                          bg-blue-50

                          dark:bg-[#2087e8]/10
                        "
                      >
                        <Icon
                          className="
                            h-[18px] w-[18px]
                            text-blue-600
                            dark:text-[#69baff]
                          "
                        />
                      </div>

                      <span
                        className="
                          mt-2
                          text-[9px] font-bold
                          tracking-wider
                          text-gray-400

                          dark:text-[#506176]
                        "
                      >
                        {step.number}
                      </span>
                    </div>

                    <div className="pt-0.5">
                      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>

                      <p
                        className="
                          mt-1.5
                          text-[12px] leading-5
                          text-gray-600
                          dark:text-[#8194aa]
                        "
                      >
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =========================================
              3. RECEIVE SMS
          ========================================= */}
          <section
            className="
              mt-10
              border-t border-gray-200
              pt-8
              dark:border-white/[0.07]
            "
          >
            <SectionHeading
              number="03"
              title="Receive the SMS"
              text="Once your number has been purchased, use it on the target service and wait for the verification message."
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ReceiveStep
                number="01"
                icon={Copy}
                title="Copy the number"
                text="Your purchased virtual number will appear in your active order."
              />

              <ReceiveStep
                number="02"
                icon={Smartphone}
                title="Enter it in the app"
                text="Paste the virtual number into the website or application requesting verification."
              />

              <ReceiveStep
                number="03"
                icon={MessageSquareText}
                title="Get the code"
                text="The incoming verification SMS will appear in your active order."
              />
            </div>
          </section>

          {/* =========================================
              SMS FLOW
          ========================================= */}
          <section className="mt-8">
            <div
              className="
                rounded-2xl
                border border-blue-200
                bg-blue-50/60
                p-5

                dark:border-[#2087e8]/15
                dark:bg-[#2087e8]/[0.05]
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-blue-100

                    dark:bg-[#2087e8]/10
                  "
                >
                  <MessageSquareText
                    className="
                      h-5 w-5
                      text-blue-600
                      dark:text-[#69baff]
                    "
                  />
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                    Your verification flow
                  </h3>

                  <p
                    className="
                      mt-1.5
                      text-[12px] leading-5
                      text-gray-600
                      dark:text-[#8194aa]
                    "
                  >
                    Purchase a number → enter it into the target service →
                    wait for the SMS → use the received verification code.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <FlowBadge text="Purchase number" />

                <ArrowRight
                  className="
                    hidden h-4 w-4
                    text-gray-400
                    sm:block
                    dark:text-[#52667c]
                  "
                />

                <FlowBadge text="Enter number" />

                <ArrowRight
                  className="
                    hidden h-4 w-4
                    text-gray-400
                    sm:block
                    dark:text-[#52667c]
                  "
                />

                <FlowBadge text="Receive SMS" />

                <ArrowRight
                  className="
                    hidden h-4 w-4
                    text-gray-400
                    sm:block
                    dark:text-[#52667c]
                  "
                />

                <FlowBadge text="Verify" />
              </div>
            </div>
          </section>

          {/* =========================================
              IMPORTANT NOTES
          ========================================= */}
          <section className="mt-8">
            <div
              className="
                rounded-2xl
                border border-gray-200
                bg-gray-50
                p-5

                dark:border-white/[0.06]
                dark:bg-[#151e2c]
              "
            >
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                Important notes
              </h2>

              <div className="mt-4 space-y-3">
                <Note text="Make sure your account has sufficient balance before purchasing a number." />
                <Note text="Choose the correct service and country before placing your order." />
                <Note text="Use the purchased number only for the service selected during the order." />
                <Note text="SMS delivery time can vary depending on the service, country and operator." />
                <Note text="Use the platform only for lawful and permitted purposes." />
              </div>
            </div>
          </section>

          {/* =========================================
              CTA
          ========================================= */}
          <div
            className="
              mt-7
              flex flex-col items-center justify-between gap-3
              rounded-2xl
              border border-blue-200
              bg-blue-50/60
              p-4
              sm:flex-row sm:px-5

              dark:border-[#2087e8]/15
              dark:bg-[#2087e8]/[0.05]
            "
          >
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                Ready to buy your first number?
              </h3>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-gray-600
                  dark:text-[#8195aa]
                "
              >
                Sign in to your account and start your order.
              </p>
            </div>

            <Link
              href="/"
              className="
                flex h-9 shrink-0 items-center gap-2
                rounded-lg
                bg-[#2087e8]
                px-4
                text-[12px] font-semibold
                text-white
                transition
                hover:bg-[#3195ef]
              "
            >
              Start buying

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* DISCLAIMER */}
          <div
            className="
              mt-6
              border-t border-gray-200
              pt-5
              dark:border-white/[0.06]
            "
          >
            <p
              className="
                text-[10px] leading-5
                text-gray-500
                dark:text-[#66798e]
              "
            >
              The service is intended for lawful use only. Outgoing SMS and
              calls are not supported. Availability, delivery time and
              verification success may vary by service, country and operator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   SECTION HEADING
========================================= */

function SectionHeading({ number, title, text }) {
  return (
    <div className="flex gap-3">
      <div
        className="
          flex h-7 w-7 shrink-0
          items-center justify-center
          rounded-lg
          bg-[#2087e8]
          text-[9px] font-bold
          text-white
        "
      >
        {number}
      </div>

      <div>
        <h2
          className="
            text-xl font-bold tracking-tight
            text-gray-900
            sm:text-[21px]

            dark:text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-1.5
            text-[12px] leading-5
            text-gray-600
            dark:text-[#8497ac]
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================
   INFO CARD
========================================= */

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div
      className="
        rounded-2xl
        border border-gray-200
        bg-gray-50
        p-4
        sm:p-5

        dark:border-white/[0.06]
        dark:bg-[#151e2c]
      "
    >
      <div
        className="
          flex h-10 w-10 items-center justify-center
          rounded-xl
          bg-blue-50

          dark:bg-[#2087e8]/10
        "
      >
        <Icon
          className="
            h-[18px] w-[18px]
            text-blue-600
            dark:text-[#69baff]
          "
        />
      </div>

      <h3 className="mt-4 text-[13px] font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p
        className="
          mt-1.5
          text-[12px] leading-5
          text-gray-600
          dark:text-[#8194aa]
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================
   BUY MODE CARD
========================================= */

function ModeCard({ icon: Icon, title, text, featured }) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-4
        sm:p-5

        ${
          featured
            ? "border-blue-200 bg-blue-50/60 dark:border-[#2087e8]/20 dark:bg-[#2087e8]/[0.06]"
            : "border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-[#151e2c]"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl
            bg-blue-50

            dark:bg-[#2087e8]/10
          "
        >
          <Icon
            className="
              h-[18px] w-[18px]
              text-blue-600
              dark:text-[#69baff]
            "
          />
        </div>

        {featured && (
          <span
            className="
              rounded-md
              bg-blue-100
              px-2 py-1
              text-[9px] font-bold
              uppercase tracking-wider
              text-blue-600

              dark:bg-[#2087e8]/10
              dark:text-[#69baff]
            "
          >
            Recommended
          </span>
        )}
      </div>

      <h3 className="mt-4 text-[13px] font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p
        className="
          mt-1.5
          text-[12px] leading-5
          text-gray-600
          dark:text-[#8194aa]
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================
   RECEIVE STEP
========================================= */

function ReceiveStep({ number, icon: Icon, title, text }) {
  return (
    <div
      className="
        rounded-2xl
        border border-gray-200
        bg-gray-50
        p-4

        dark:border-white/[0.06]
        dark:bg-[#151e2c]
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg
            bg-blue-50

            dark:bg-[#2087e8]/10
          "
        >
          <Icon
            className="
              h-4 w-4
              text-blue-600
              dark:text-[#69baff]
            "
          />
        </div>

        <span
          className="
            text-[9px] font-bold
            tracking-wider
            text-gray-400

            dark:text-[#506176]
          "
        >
          {number}
        </span>
      </div>

      <h3 className="mt-4 text-[13px] font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p
        className="
          mt-1.5
          text-[11px] leading-5
          text-gray-600
          dark:text-[#8194aa]
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================
   FLOW BADGE
========================================= */

function FlowBadge({ text }) {
  return (
    <div
      className="
        flex flex-1 items-center justify-center
        rounded-lg
        border border-gray-200
        bg-white
        px-3 py-2.5
        text-[10px] font-medium
        text-gray-600

        dark:border-white/[0.06]
        dark:bg-[#111a27]
        dark:text-[#a1b1c3]
      "
    >
      {text}
    </div>
  );
}

/* =========================================
   NOTE
========================================= */

function Note({ text }) {
  return (
    <div className="flex gap-2.5">
      <CheckCircle2
        className="
          mt-0.5
          h-3.5 w-3.5
          shrink-0
          text-blue-500

          dark:text-[#55b5ff]
        "
      />

      <p
        className="
          text-[11px] leading-5
          text-gray-600
          dark:text-[#8194aa]
        "
      >
        {text}
      </p>
    </div>
  );
}