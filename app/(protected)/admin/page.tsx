import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { VerifyButtons } from "@/components/admin/VerifyButtons";
import {
  Users,
  Clock,
  CheckCircle2,
  Briefcase,
  Calendar,
  ShieldCheck,
  BarChart3,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import type { Program } from "@/app/generated/prisma/client";
import {
  getFacultyManagedPrograms,
  alumniProgramWhere,
  studentProgramWhere,
} from "@/lib/faculty-scope";

export const metadata = { title: "Admin Panel" };

type PendingAlumni = Awaited<ReturnType<typeof getAdminData>>["pendingAlumni"][number];

async function getAdminData(managedPrograms: Program[] | null) {
  const ap = alumniProgramWhere(managedPrograms);
  const sp = studentProgramWhere(managedPrograms);

  const [
    pendingAlumni,
    totalAlumni,
    verifiedAlumni,
    totalStudents,
    activeJobs,
    publishedEvents,
  ] = await Promise.all([
    db.alumniProfile.findMany({
      where: { isVerified: false, ...ap },
      include: { user: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.alumniProfile.count({ where: ap }),
    db.alumniProfile.count({ where: { isVerified: true, ...ap } }),
    db.studentProfile.count({ where: sp }),
    db.jobPosting.count({ where: { isActive: true } }),
    db.event.count({ where: { isPublished: true } }),
  ]);

  return {
    pendingAlumni,
    totalAlumni,
    verifiedAlumni,
    totalStudents,
    activeJobs,
    publishedEvents,
  };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "FACULTY") redirect("/dashboard");

  const managedPrograms = await getFacultyManagedPrograms(session.user.id, role);

  const {
    pendingAlumni,
    totalAlumni,
    verifiedAlumni,
    totalStudents,
    activeJobs,
    publishedEvents,
  } = await getAdminData(managedPrograms);

  const adminStats = [
    {
      label: "Total Alumni",
      value: totalAlumni,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Verified",
      value: verifiedAlumni,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Approval",
      value: pendingAlumni.length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Students",
      value: totalStudents,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Published Events",
      value: publishedEvents,
      icon: Calendar,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-500">Manage users, events, and content.</p>
          {role === "FACULTY" && (managedPrograms?.length ?? 0) > 0 && (
            <p className="mt-2 text-xs text-indigo-600">
              Your scope: alumni &amp; students in{" "}
              <span className="font-semibold">{managedPrograms!.join(", ")}</span> only.
            </p>
          )}
          {role === "FACULTY" && (managedPrograms?.length ?? 0) === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              No programs assigned to your account — contact a campus admin to assign programs.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <Badge variant="secondary">{role}</Badge>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick admin actions */}
      <div className={`grid gap-4 ${role === "ADMIN" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Analytics</p>
            <p className="text-xs text-gray-400">Employment stats & reports</p>
          </div>
        </Link>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Create Event</p>
            <p className="text-xs text-gray-400">Guest lecture, reunion, webinar</p>
          </div>
        </Link>
        <Link
          href="/admin/announcements"
          className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Announcements</p>
            <p className="text-xs text-gray-400">Post campus updates</p>
          </div>
        </Link>
        {role === "ADMIN" && (
          <Link
            href="/admin/faculty-programs"
            className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <UserCog className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Faculty access</p>
              <p className="text-xs text-gray-400">Which programs each faculty sees</p>
            </div>
          </Link>
        )}
      </div>

      {/* Pending verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending Profile Verifications</CardTitle>
          <CardDescription>
            {pendingAlumni.length === 0
              ? "All alumni profiles are verified."
              : `${pendingAlumni.length} profile${pendingAlumni.length === 1 ? "" : "s"} awaiting approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAlumni.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-300" />
              <p className="text-sm text-gray-400">No pending verifications — all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAlumni.map((alumni: PendingAlumni, idx: number) => (
                <div key={alumni.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                      {alumni.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">{alumni.user.name}</p>
                      <p className="truncate text-sm text-gray-400">{alumni.user.email}</p>
                      <p className="text-xs text-gray-400">
                        {alumni.program} · Batch {alumni.batchYear} · Registered{" "}
                        {formatDate(alumni.user.createdAt)}
                      </p>
                    </div>
                    <VerifyButtons profileId={alumni.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
