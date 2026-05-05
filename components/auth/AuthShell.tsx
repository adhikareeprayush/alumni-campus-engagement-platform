"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, ShieldCheck, Sparkles, Users } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingBackdrop } from "@/components/shell/MarketingBackdrop";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: Users, label: "Verified directory & mentorship paths" },
  { icon: Briefcase, label: "Jobs, events, and announcements" },
  { icon: ShieldCheck, label: "Role-aware access for campus teams" },
];

export type AuthShellProps = {
  title: string;
  description: React.ReactNode;
  alternatePrompt: string;
  alternateLinkText: string;
  alternateHref: string;
  wide?: boolean;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  alternatePrompt,
  alternateLinkText,
  alternateHref,
  wide = false,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50 antialiased">
      <MarketingBackdrop className="z-0" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <aside className="relative hidden flex-col justify-between border-white/[0.06] bg-gradient-to-br from-teal-950/90 via-emerald-950/85 to-zinc-950/95 p-10 backdrop-blur-[2px] lg:flex lg:border-r">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%20fill=%22none%22%3E%3Ccircle%20cx=%221%22%20cy=%221%22%20r=%221%22%20fill=%22white%22%20opacity=%22.06%22/%3E%3C/svg%3E')] opacity-40" />
          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-100/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </Link>
            <div className="mt-14 flex items-center gap-4">
              <BrandLogo size={56} className="rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">{BRAND.siteName}</p>
                <p className="mt-1 max-w-[28ch] text-sm leading-snug text-teal-100/85">{BRAND.tagline}</p>
              </div>
            </div>
            <h2 className="mt-12 max-w-lg text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">
              One hub for your campus network.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-teal-100/75">
              Profiles, hiring, events, and analytics—aligned with how {BRAND.institutionShort} runs today.
            </p>
          </div>
          <ul className="relative mt-auto space-y-4 pt-16">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3 text-sm text-teal-50/90">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-amber-200" aria-hidden />
                </span>
                <span className="pt-1.5 leading-snug">{label}</span>
              </li>
            ))}
          </ul>
          <p className="relative mt-10 text-xs leading-relaxed text-teal-200/45">{BRAND.footerLine}</p>
        </aside>

        <main className="relative flex flex-col justify-center overflow-y-auto px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo size={44} className="rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10" />
              <div className="min-w-0 text-left">
                <span className="block truncate text-sm font-semibold text-white">{BRAND.siteName}</span>
                <span className="block truncate text-xs text-teal-400/90">{BRAND.institutionShort}</span>
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-teal-300/90 underline-offset-4 hover:text-teal-200 hover:underline"
            >
              Home
            </Link>
          </div>

          <div className="mx-auto w-full lg:mx-0 lg:max-w-none">
            <div
              className={cn(
                "rounded-[1.75rem] border border-white/[0.08] bg-zinc-900/50 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_24px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-10",
                wide ? "max-w-lg sm:mx-auto lg:mx-0 lg:max-w-[480px]" : "max-w-md sm:mx-auto lg:mx-0",
              )}
            >
              <div className="mb-6 hidden items-center gap-2 lg:flex">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-teal-100/90 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                  Secure access
                </div>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
              <div className="mt-8">{children}</div>
              <p className="mt-8 border-t border-white/[0.06] pt-8 text-center text-sm text-zinc-500">
                {alternatePrompt}{" "}
                <Link
                  href={alternateHref}
                  className="font-semibold text-teal-400 underline-offset-4 transition-colors hover:text-teal-300 hover:underline"
                >
                  {alternateLinkText}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
