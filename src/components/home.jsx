"use client";

import React from "react";
import Link from "next/link";

import {
  Globe2,
  CalendarDays,
  Smartphone,
  Percent,
  Headphones,
  ShieldCheck,
  Plane,
  Code2,
  BriefcaseBusiness,
  MessageSquareText,
  ArrowRight,
  Bot,
  Eye,
  BarChart3,
  RotateCcw,
} from "lucide-react";

const features = [
  {
    icon: Globe2,
    title: "Over 500,000 numbers originating from around 180 countries online",
    text: "Here you can find virtual numbers from more than 180 countries. Find phone numbers from Sweden, Germany, France, India, Indonesia, Malaysia, Cambodia, Mongolia, Canada, Thailand, the Netherlands, Spain and many more.",
  },
  {
    icon: CalendarDays,
    title: "New virtual numbers added daily",
    text: "New numbers are added regularly. Pricing starts from $0.008 for a single number, without the cost of monthly SIM plans.",
  },
  {
    icon: Smartphone,
    title: "Single-use numbers to receive SMS",
    text: "Get a phone number whenever you need one. Use a private additional virtual number to receive SMS verification codes.",
  },
  {
    icon: Percent,
    title: "Low commission fees",
    text: "Add funds to your balance while keeping commission fees as low as possible.",
  },
  {
    icon: Headphones,
    title: "Support available 24/7",
    text: "Get help whenever you need it. Our support team is available to help you find and purchase suitable numbers.",
  },
];

const useCases = [
  {
    icon: ShieldCheck,
    title: "Privacy protection",
    text: "Register and log in to websites without sharing your personal phone number with marketers and data brokers.",
  },
  {
    icon: Plane,
    title: "Travel",
    text: "Receive SMS from local services abroad without roaming or purchasing a local SIM card.",
  },
  {
    icon: Code2,
    title: "Development and QA",
    text: "Test custom SMS scripts such as OTPs and notifications across different markets.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Separation of work and personal life",
    text: "Use a separate phone number for ads, deliveries and one-time transactions.",
  },
  {
    icon: MessageSquareText,
    title: "Temporary confirmations",
    text: "Receive one-time SMS messages for services that you use occasionally.",
  },
];

const advantages = [
  {
    icon: BarChart3,
    title: "Smart Buy",
    text: "Automatically select numbers with strong SMS delivery performance using live country and operator statistics.",
  },
  {
    icon: Bot,
    title: "AI assistant",
    text: "Get assistance with support questions and choosing the most suitable available number.",
  },
  {
    icon: Eye,
    title: "No registration needed to browse",
    text: "Explore countries, services, prices and availability before creating an account.",
  },
  {
    icon: BarChart3,
    title: "Transparent success rates",
    text: "View live SMS delivery statistics for countries and operators before purchasing.",
  },
  {
    icon: RotateCcw,
    title: "Instant refunds",
    text: "If an eligible activation does not receive an SMS, the amount can be refunded automatically.",
  },
];

export default function Home() {
  return (
    <div className="w-full pb-10">
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl dark:border-transparent dark:bg-[#1a2332] sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-[760px]">
          {/* HEADER */}
          <header>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2087e8] dark:text-[#62b7ff]">
              Virtual Numbers
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[28px]">
              Virtual numbers for receiving SMS
            </h1>

            <p className="mt-3 max-w-[680px] text-[13px] leading-6 text-gray-600 dark:text-[#93a5ba]">
              Get virtual phone numbers from countries around the world and
              receive SMS verification messages whenever you need them.
            </p>
          </header>

          {/* FEATURE GRID */}
          <section className="mt-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {features.slice(0, 4).map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  text={feature.text}
                />
              ))}
            </div>

            {/* Centered 5th feature */}
            <div className="mt-3 flex justify-center">
              <div className="w-full sm:w-[calc(50%-6px)]">
                <FeatureCard
                  icon={features[4].icon}
                  title={features[4].title}
                  text={features[4].text}
                />
              </div>
            </div>
          </section>

          {/* USE CASES */}
          <section className="mt-10 border-t border-gray-200 pt-8 dark:border-white/[0.07]">
            <SectionHeading
              title="When would you need a temporary phone number?"
              text="Temporary virtual numbers can be useful in several everyday and professional situations."
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.07] dark:bg-[#151e2c]">
              {useCases.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex gap-3 p-4 sm:p-5 ${
                      index !== useCases.length - 1
                        ? "border-b border-gray-200 dark:border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2087e8]/10">
                      <Icon className="h-4 w-4 text-[#2087e8] dark:text-[#69baff]" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-[#dce7f2]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-[12px] leading-5 text-gray-600 dark:text-[#8194a9]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mt-10 border-t border-gray-200 pt-8 dark:border-white/[0.07]">
            <SectionHeading
              title="How to receive an SMS using a virtual number"
              text={
                <>
                  Start off by{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#2087e8] hover:text-[#1268bd] dark:text-[#66baff] dark:hover:text-white"
                  >
                    Logging in
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#2087e8] hover:text-[#1268bd] dark:text-[#66baff] dark:hover:text-white"
                  >
                    Signing up
                  </Link>
                  .
                </>
              }
            />

            <div className="relative mt-6">
              {/* Desktop connecting line */}
              <div className="absolute left-[16.66%] right-[16.66%] top-5 hidden h-px bg-gray-200 dark:bg-white/[0.08] sm:block" />

              <div className="grid gap-3 sm:grid-cols-3">
                <StepCard
                  number="1"
                  title="Choose country, service and get a virtual phone number"
                />

                <StepCard
                  number="2"
                  title="Use the virtual phone number to receive an SMS"
                />

                <StepCard
                  number="3"
                  title="Use SMS for successful completion"
                />
              </div>
            </div>
          </section>

          {/* ADVANTAGES */}
          <section className="mt-10 border-t border-gray-200 pt-8 dark:border-white/[0.07]">
            <SectionHeading
              title="Why 5SIM beats other SMS verification services"
              text="A simple virtual-number experience built around availability, transparency and convenience."
            />

            <div className="mt-5 space-y-2.5">
              {advantages.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-white/[0.06] dark:bg-[#151e2c] dark:hover:border-white/[0.1]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2087e8]/10">
                      <Icon className="h-4 w-4 text-[#2087e8] dark:text-[#69baff]" />
                    </div>

                    <div>
                      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-[#dce7f2]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-[12px] leading-5 text-gray-600 dark:text-[#8194a9]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LEGAL / DISCLAIMER */}
          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 dark:border-white/[0.06] dark:bg-[#131c29]">
            <p className="text-[11px] leading-5 text-gray-500 dark:text-[#74879c]">
              The service does not support sending outgoing SMS or calls.
              Virtual numbers are intended for lawful use only. Please follow
              applicable laws, service rules and our acceptable-use policies.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#2087e8]/15 bg-[#2087e8]/[0.05] p-4 sm:flex-row sm:px-5">
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                Ready to get a virtual number?
              </h3>

              <p className="mt-1 text-[11px] text-gray-600 dark:text-[#8195aa]">
                Choose a service and country to get started.
              </p>
            </div>

            <Link
              href="/signup"
              className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#2087e8] px-4 text-[12px] font-semibold text-white transition hover:bg-[#3195ef]"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* FEATURE CARD */

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 dark:border-white/[0.07] dark:bg-[#151e2c] dark:hover:border-white/[0.11] dark:hover:bg-[#172131] sm:p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2087e8]/15 bg-[#2087e8]/10">
        <Icon className="h-5 w-5 text-[#2087e8] dark:text-[#69baff]" />
      </div>

      <h2 className="mt-4 text-[14px] font-semibold leading-5 text-gray-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-2 text-[12px] leading-5 text-gray-600 dark:text-[#8194aa]">
        {text}
      </p>
    </article>
  );
}

/* SECTION HEADING */

function SectionHeading({ title, text }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[21px]">
        {title}
      </h2>

      <p className="mt-2 max-w-[680px] text-[12px] leading-5 text-gray-600 dark:text-[#8497ac]">
        {text}
      </p>
    </div>
  );
}

/* STEP CARD */

function StepCard({ number, title }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.07] dark:bg-[#151e2c] sm:p-5">
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2087e8] text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(32,135,232,0.7)]">
        {number}
      </div>

      <h3 className="mt-4 text-[13px] font-semibold leading-5 text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
  );
}