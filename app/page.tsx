import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  ArrowRight,
  MapPin,
  Building2,
  Network,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Alumni Directory",
    description:
      "Search and connect with thousands of alumni by batch, program, company, or skill.",
  },
  {
    icon: Briefcase,
    title: "Job & Internship Portal",
    description: "Alumni post exclusive opportunities. Students apply directly through the portal.",
  },
  {
    icon: Calendar,
    title: "Events & RSVPs",
    description: "Stay updated on guest lectures, reunions, and webinars. RSVP in one click.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track employment rates, top companies, batch stats, and career progression insights.",
  },
  {
    icon: MapPin,
    title: "Global Network",
    description: "Connect with alumni across Nepal and around the world.",
  },
  {
    icon: Network,
    title: "Mentorship",
    description: "Alumni mentor current students through shared experiences and guidance.",
  },
];

const stats = [
  { label: "Alumni Registered", value: "2,500+" },
  { label: "Companies Represented", value: "300+" },
  { label: "Countries Reached", value: "25+" },
  { label: "Events Hosted", value: "50+" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Alumni Portal</span>
            <Badge variant="outline" className="ml-1 text-xs text-indigo-600 border-indigo-200">
              IOE Purwanchal Campus
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 px-6 py-28 text-center text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative mx-auto max-w-4xl">
          <Badge className="mb-6 bg-indigo-500/30 text-indigo-100 border-indigo-400/30 hover:bg-indigo-500/30">
            IOE Purwanchal Campus, Tribhuvan University
          </Badge>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Stay Connected with
            <br />
            <span className="text-indigo-300">Your Alma Mater</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100">
            The centralized alumni management system for IOE Purwanchal Campus. Update your career
            profile, network with peers, explore opportunities, and give back to the community.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="bg-white text-indigo-700 hover:bg-indigo-50 px-8">
              <Link href="/register">
                Join the Network <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-indigo-300 text-white hover:bg-indigo-800 bg-transparent px-8"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-gray-50 px-6 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-indigo-700">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Everything in one place</h2>
            <p className="text-gray-500">
              A complete ecosystem for alumni engagement and campus networking.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-700 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-indigo-300" />
          <h2 className="mb-3 text-3xl font-bold">Ready to reconnect?</h2>
          <p className="mb-8 text-indigo-200">
            Join hundreds of IOE Purwanchal alumni already on the platform. Registration takes under 2
            minutes.
          </p>
          <Button size="lg" asChild className="bg-white text-indigo-700 hover:bg-indigo-50 px-10">
            <Link href="/register">
              Register now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <span>Alumni Portal — IOE Purwanchal Campus, TU</span>
          </div>
          <p>DBMS Project — {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
