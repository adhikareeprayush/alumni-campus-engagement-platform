import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  MapPin,
} from "lucide-react";
import type { Program } from "@/app/generated/prisma/client";
import { getFacultyManagedPrograms, alumniProgramWhere } from "@/lib/faculty-scope";
import { getPublishedAnnouncements } from "@/lib/data/announcements";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { BRAND } from "@/lib/brand";
import {
  appActionRow,
  appGhostBtn,
  appIconTile,
  appPanel,
  appPrimaryBtn,
} from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

type RecentAlumni = Awaited<ReturnType<typeof getDashboardStats>>["recentAlumni"][number];

async function getDashboardStats(userId: string | undefined, managed: Program[] | null) {
  const ap = alumniProgramWhere(managed);
  const [totalAlumni, totalJobs, upcomingEvents, recentAlumni, alumniProfile] = await Promise.all([
    db.alumniProfile.count({ where: { isVerified: true, ...ap } }),
    db.jobPosting.count({ where: { isActive: true } }),
    db.event.count({
      where: { isPublished: true, startDate: { gte: new Date() } },
    }),
    db.alumniProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { isVerified: true, ...ap },
      include: { user: { select: { name: true } } },
    }),
    userId
      ? db.alumniProfile.findUnique({
          where: { userId },
          select: { isVerified: true },
        })
      : Promise.resolve(null),
  ]);

  return { totalAlumni, totalJobs, upcomingEvents, recentAlumni, alumniProfile };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const managed = await getFacultyManagedPrograms(session.user.id, session.user.role);
  const [dashboardStats, publishedAnnouncements] = await Promise.all([
    getDashboardStats(session.user.id, managed),
    getPublishedAnnouncements(6),
  ]);
  const { totalAlumni, totalJobs, upcomingEvents, recentAlumni, alumniProfile } = dashboardStats;

  const stats = [
    { title: "Verified alumni", value: totalAlumni.toLocaleString(), icon: Users, href: "/alumni" },
    { title: "Active job posts", value: totalJobs.toLocaleString(), icon: Briefcase, href: "/jobs" },
    { title: "Upcoming events", value: upcomingEvents.toLocaleString(), icon: Calendar, href: "/events" },
  ];

  const isAlumni = session?.user?.role === "ALUMNI";
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "FACULTY";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Here&apos;s what&apos;s happening on {BRAND.siteName} at {BRAND.institutionShort}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isAlumni && alumniProfile && (
            alumniProfile.isVerified ? (
              <Badge
                variant="outline"
                className="border-teal-500/35 bg-teal-950/50 px-2.5 py-1 text-xs font-medium text-teal-200"
              >
                <CheckCircle2 className="mr-1 h-3 w-3 text-teal-400" />
                Profile verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-200"
              >
                <Clock className="mr-1 h-3 w-3 text-amber-400/90" />
                Pending verification
              </Badge>
            )
          )}
          {isAdmin && (
            <Button asChild size="sm" className={appPrimaryBtn}>
              <Link href="/admin">Admin panel</Link>
            </Button>
          )}
        </div>
      </div>

      {publishedAnnouncements.length > 0 && (
        <AnnouncementFeed items={publishedAnnouncements} compact viewAllHref="/announcements" />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card
                className={cn(
                  appPanel,
                  "cursor-pointer transition-all hover:border-teal-600/35 hover:bg-zinc-900/80",
                )}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{stat.title}</p>
                      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-zinc-50 sm:text-3xl">
                        {stat.value}
                      </p>
                    </div>
                    <div className={appIconTile}>
                      <Icon className="h-5 w-5 text-teal-400/90" aria-hidden />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={appPanel}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-zinc-50">Recently joined alumni</CardTitle>
            <Button variant="ghost" size="sm" asChild className={appGhostBtn}>
              <Link href="/alumni">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 pt-2">
            {recentAlumni.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No alumni yet.</p>
            ) : (
              recentAlumni.map((alumni: RecentAlumni) => (
                <div
                  key={alumni.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-zinc-800/40"
                >
                  <div
                    className={cn(appIconTile, "h-9 w-9 rounded-full text-sm font-semibold text-teal-100")}
                  >
                    {alumni.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{alumni.user.name}</p>
                    <p className="text-xs text-zinc-500">
                      {alumni.program} · Batch {alumni.batchYear}
                    </p>
                  </div>
                  {alumni.currentCompany && (
                    <div className="flex max-w-[100px] items-center gap-1 text-xs text-zinc-500 sm:max-w-[140px]">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
                      <span className="truncate">{alumni.currentCompany}</span>
                    </div>
                  )}
                  {alumni.country && !alumni.currentCompany && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
                      <span>{alumni.country}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={appPanel}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-50">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pt-2">
            {isAlumni && (
              <Link href="/profile" className={appActionRow}>
                <div className={appIconTile}>
                  <CheckCircle2 className="h-5 w-5 text-teal-400/90" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100">Complete your profile</p>
                  <p className="text-xs text-zinc-500">Job history, skills, and location</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              </Link>
            )}
            <Link href="/jobs" className={appActionRow}>
              <div className={appIconTile}>
                <Briefcase className="h-5 w-5 text-teal-400/90" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">Browse opportunities</p>
                <p className="text-xs text-zinc-500">Jobs and internships</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            </Link>
            <Link href="/events" className={appActionRow}>
              <div className={appIconTile}>
                <Calendar className="h-5 w-5 text-teal-400/90" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">Upcoming events</p>
                <p className="text-xs text-zinc-500">RSVP to campus events</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            </Link>
            <Link href="/alumni" className={appActionRow}>
              <div className={appIconTile}>
                <Users className="h-5 w-5 text-teal-400/90" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">Alumni directory</p>
                <p className="text-xs text-zinc-500">Search verified profiles</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
