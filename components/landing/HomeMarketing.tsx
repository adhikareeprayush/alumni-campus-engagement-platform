import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  ArrowRight,
  MapPin,
  Building2,
  Network,
  Megaphone,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  GraduationCap,
  LineChart,
  Zap,
  MousePointer2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingBackdrop } from "@/components/shell/MarketingBackdrop";
import type { PublicHomeStats } from "@/lib/data/public-stats";

const offerings = [
  {
    icon: Users,
    title: "Verified directory",
    description:
      "Staff-backed profiles with filters for batch, program, employer, skills, and geography—built for trust.",
    span: "lg:col-span-2 lg:row-span-2",
    accent: "from-teal-400/20 via-teal-500/5 to-transparent",
  },
  {
    icon: Briefcase,
    title: "Jobs & applications",
    description: "Post roles with deadlines; members apply without leaving the hub.",
    span: "",
    accent: "from-amber-400/15 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Analytics export",
    description: "Slice employment and mobility trends; download CSV when leadership asks.",
    span: "",
    accent: "from-emerald-400/15 to-transparent",
  },
  {
    icon: Calendar,
    title: "Events & RSVPs",
    description: "Panels, reunions, webinars—with clear headcounts for organizers.",
    span: "",
    accent: "from-teal-400/12 to-transparent",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description: "Broadcast deadlines and employer programs to signed-in members.",
    span: "lg:col-span-2",
    accent: "from-amber-400/12 via-transparent to-teal-400/10",
  },
];

const personas = [
  {
    title: "Students",
    subtitle: "Explore mentors and openings early.",
    icon: GraduationCap,
    points: ["Browse verified alumni", "Apply to campus-listed roles", "RSVP to career events"],
  },
  {
    title: "Alumni",
    subtitle: "Stay visible and give back.",
    icon: Network,
    points: ["Rich employment timeline", "Share jobs in minutes", "Reconnect by program & batch"],
  },
  {
    title: "Staff",
    subtitle: "Operate from one source of truth.",
    icon: ShieldCheck,
    points: ["Verify profiles", "Faculty program scopes", "Analytics & CSV exports"],
  },
];

const faq = [
  {
    q: "Who can register?",
    a: "Alumni and students create accounts with campus or approved email. Faculty and admin accounts are issued by the institution.",
  },
  {
    q: "What can staff export?",
    a: "Authorized staff choose CSV bundles—employment summaries, employers, countries, skills, applications, signups, and more.",
  },
  {
    q: "Is alumni data exposed on the open web?",
    a: `${BRAND.siteName} is oriented around signed-in members, with verification workflows that balance discoverability and privacy.`,
  },
];

export function HomeMarketing({ stats }: { stats: PublicHomeStats }) {
  const statItems = [
    { label: "Verified alumni", value: stats.verifiedAlumni },
    { label: "Open roles", value: stats.activeJobs },
    { label: "Live events", value: stats.publishedEvents },
    { label: "Students", value: stats.students },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <MarketingBackdrop className="fixed inset-0 z-0" />
      <div className="relative z-10">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandLogo size={40} className="rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10" />
            <div className="min-w-0 text-left">
              <span className="block truncate font-semibold tracking-tight text-white">{BRAND.siteName}</span>
              <span className="text-xs text-teal-400/90">{BRAND.institutionShort}</span>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:bg-white/5 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-5 font-semibold text-white shadow-lg shadow-teal-950/50 hover:opacity-[0.96]"
            >
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-5 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-teal-100/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              {BRAND.institutionFull}
            </div>
            <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Alumni momentum,
              <span className="block bg-gradient-to-r from-teal-200 via-white to-amber-200 bg-clip-text text-transparent">
                one connected surface.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
              {BRAND.tagline} Directory, hiring, events, analytics, and broadcasts—without stitching spreadsheets.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-white px-8 font-semibold text-zinc-950 shadow-xl shadow-teal-950/30 hover:bg-zinc-100"
              >
                <Link href="/register">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-full border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-2">
              {["Directory", "Jobs", "Events", "Analytics", "Announcements"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview stack */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="absolute -left-6 -top-6 hidden h-28 w-28 rounded-full bg-teal-500/25 blur-3xl md:block" />
            <div className="absolute -bottom-10 -right-4 hidden h-36 w-36 rounded-full bg-amber-400/15 blur-3xl md:block" />

            <div className="relative space-y-4 rounded-[1.75rem] border border-white/[0.08] bg-zinc-900/50 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_40px_100px_-40px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-950/40">
                    <MousePointer2 className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Live snapshot</p>
                    <p className="text-xs text-zinc-500">Updates as your campus engages</p>
                  </div>
                </div>
                <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20">Live</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 ring-1 ring-white/[0.03]"
                  >
                    <p className="text-2xl font-semibold tabular-nums text-white md:text-3xl">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <LineChart className="h-4 w-4 text-teal-400" aria-hidden />
                  Trend-ready exports
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Slice verified alumni, employers, and mobility—then package CSVs for leadership reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-b border-white/[0.06] bg-zinc-900/40 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3 text-zinc-400">
            <Zap className="h-5 w-5 text-amber-400" aria-hidden />
            <p className="max-w-md text-center text-sm leading-relaxed md:text-left">
              Built for technical campuses that want <span className="text-zinc-200">credibility</span>,{" "}
              <span className="text-zinc-200">speed</span>, and <span className="text-zinc-200">measurable outcomes</span>.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            {["Role-aware access", "Staff verification", "CSV-ready analytics"].map((x) => (
              <span
                key={x}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-400/90">Audience</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Designed around real campus roles</h2>
            <p className="mt-3 text-zinc-400 md:text-lg">
              Same platform—different superpowers for students, graduates, and operators.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl transition-opacity group-hover:opacity-100" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{p.subtitle}</p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bento capabilities */}
      <section className="border-y border-white/[0.06] bg-zinc-900/35 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-400/90">Capabilities</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">A modular surface—not a patchwork.</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
              Dense workflows stay calm: hiring, events, and announcements inherit the same roles and analytics substrate.
            </p>
          </div>
          <div className="grid auto-rows-fr gap-4 lg:grid-cols-3">
            {offerings.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-zinc-950/40 p-7 ring-1 ring-white/[0.03] transition-colors hover:border-teal-500/25 ${item.span}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 ${item.accent}`}
                    aria-hidden
                  />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-teal-200 ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="px-5 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl">From signup to signal</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
            A straightforward arc—so teams spend less time reconciling data and more time opening doors.
          </p>
          <div className="relative mt-16 grid gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-teal-500/35 to-transparent md:block" />
            {[
              {
                step: "01",
                title: "Join & enrich",
                body: "Students and alumni register, attach program and batch, then layer roles, skills, and milestones.",
              },
              {
                step: "02",
                title: "Verify & trust",
                body: "Staff review alumni listings so directories stay credible for hiring partners and mentorship.",
              },
              {
                step: "03",
                title: "Engage & export",
                body: "Publish roles, host events, broadcast updates, and pull CSV slices when leadership needs proof.",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center md:text-left">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-teal-950/45 md:mx-0">
                  {s.step}
                </span>
                <h3 className="mt-6 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical campuses */}
      <section className="border-y border-white/[0.06] bg-gradient-to-b from-zinc-900/60 to-zinc-950 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Grounded in how engineering schools operate</h2>
            <p className="mt-4 text-zinc-400">
              Batch-aware storytelling, global mobility context, and hiring pipelines that stay tied to verified profiles.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-zinc-400">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                Geography views anchored to your institution&apos;s home region—with sensible abroad signals.
              </li>
              <li className="flex gap-3">
                <Network className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                Skills and timelines that surface mentorship intros—not cold outreach spam.
              </li>
              <li className="flex gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                A single opportunity board with tracked applications for students and recruiters alike.
              </li>
            </ul>
          </div>
          <div className="relative rounded-[1.5rem] border border-white/[0.08] bg-zinc-900/60 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">Editorial</p>
            <p className="mt-6 text-xl font-medium leading-relaxed text-white md:text-2xl">
              “When alumni truth lives in one verified hub, we defend credibility with employers—and move faster for students.”
            </p>
            <p className="mt-6 text-sm text-zinc-500">Advancement & career services collaboration pattern</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold text-white">FAQ</h2>
          <div className="mt-10 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-1 open:bg-zinc-900/60 open:ring-1 open:ring-teal-500/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-white">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-white/[0.06] pb-4 pt-3 text-sm leading-relaxed text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-5 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-600/25 via-emerald-900/40 to-zinc-950" />
        <div className="relative mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-zinc-950/60 px-8 py-14 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl md:px-14">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">Ship your alumni hub this week</h2>
          <p className="mt-4 text-zinc-400">
            Students and alumni can register in minutes. Campus operators sign in with issued accounts to verify, scope programs,
            and monitor analytics.
          </p>
          <Button
            size="lg"
            asChild
            className="mt-10 h-12 rounded-full bg-amber-400 px-10 font-semibold text-zinc-950 shadow-xl hover:bg-amber-300"
          >
            <Link href="/register">
              Create account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-zinc-950 px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-3">
            <BrandLogo size={32} className="rounded-lg ring-1 ring-white/10" />
            <span className="max-w-xs text-center sm:text-left">{BRAND.footerLine}</span>
          </div>
          <p>
            © {new Date().getFullYear()} {BRAND.siteName}
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
