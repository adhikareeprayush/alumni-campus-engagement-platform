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
    // Fetch the current user's own profile to read the real isVerified value
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
  const { totalAlumni, totalJobs, upcomingEvents, recentAlumni, alumniProfile } =
    await getDashboardStats(session.user.id, managed);

  const stats = [
    {
      title: "Verified Alumni",
      value: totalAlumni.toLocaleString(),
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/alumni",
    },
    {
      title: "Active Job Posts",
      value: totalJobs.toLocaleString(),
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/jobs",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents.toLocaleString(),
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/events",
    },
  ];

  const isAlumni = session?.user?.role === "ALUMNI";
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "FACULTY";

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s what&apos;s happening at IOE Purwanchal Alumni Network.
          </p>
        </div>
        {isAlumni && alumniProfile && (
          alumniProfile.isVerified ? (
            <Badge variant="success">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Profile verified
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
              <Clock className="mr-1 h-3 w-3" />
              Pending verification
            </Badge>
          )
        )}
        {isAdmin && (
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Joined Alumni */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recently Joined Alumni</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
              <Link href="/alumni">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlumni.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No alumni yet.</p>
            ) : (
              recentAlumni.map((alumni: RecentAlumni) => (
                <div key={alumni.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {alumni.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{alumni.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {alumni.program} · Batch {alumni.batchYear}
                    </p>
                  </div>
                  {alumni.currentCompany && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Building2 className="h-3 w-3" />
                      <span className="max-w-[80px] truncate">{alumni.currentCompany}</span>
                    </div>
                  )}
                  {alumni.country && !alumni.currentCompany && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{alumni.country}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isAlumni && (
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                  <p className="text-xs text-gray-400">Add job history, skills, and location</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
              </Link>
            )}
            <Link
              href="/jobs"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Browse opportunities</p>
                <p className="text-xs text-gray-400">Latest jobs and internships</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Calendar className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Upcoming events</p>
                <p className="text-xs text-gray-400">RSVP to guest lectures and reunions</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
            </Link>
            <Link
              href="/alumni"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Search alumni directory</p>
                <p className="text-xs text-gray-400">Find and connect with peers</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
