import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  appActionRow,
  appIconTile,
  appMeta,
  appPageSubtitle,
  appPageTitle,
  appPanel,
  appSectionTitle,
} from "@/lib/app-ui";
import { cn } from "@/lib/utils";

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
    { label: "Total alumni", value: totalAlumni, icon: Users },
    { label: "Verified", value: verifiedAlumni, icon: CheckCircle2 },
    { label: "Pending approval", value: pendingAlumni.length, icon: Clock },
    { label: "Students", value: totalStudents, icon: Users },
    { label: "Active jobs", value: activeJobs, icon: Briefcase },
    { label: "Published events", value: publishedEvents, icon: Calendar },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={appPageTitle}>Admin panel</h1>
          <p className={appPageSubtitle}>Manage users, events, and content.</p>
          {role === "FACULTY" && (managedPrograms?.length ?? 0) > 0 && (
            <p className="mt-2 text-xs text-teal-400/90">
              Your scope: alumni &amp; students in{" "}
              <span className="font-semibold text-teal-200">{managedPrograms!.join(", ")}</span> only.
            </p>
          )}
          {role === "FACULTY" && (managedPrograms?.length ?? 0) === 0 && (
            <p className="mt-2 text-xs text-amber-200/90">
              No programs assigned — contact a campus admin to assign programs.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-3 py-2">
          <ShieldCheck className="h-5 w-5 text-teal-400" aria-hidden />
          <Badge variant="outline" className="border-zinc-600 text-zinc-200">
            {role}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={appPanel}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn(appMeta, "truncate uppercase tracking-wide")}>{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-50">{stat.value}</p>
                  </div>
                  <div className={appIconTile}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className={`grid gap-4 ${role === "ADMIN" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        <Link href="/admin/analytics" className={appActionRow}>
          <div className={appIconTile}>
            <BarChart3 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-zinc-100">Analytics</p>
            <p className={appMeta}>Employment stats &amp; reports</p>
          </div>
        </Link>
        <Link href="/admin/events/new" className={appActionRow}>
          <div className={appIconTile}>
            <Calendar className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-zinc-100">Create event</p>
            <p className={appMeta}>Lecture, reunion, webinar</p>
          </div>
        </Link>
        <Link href="/admin/announcements" className={appActionRow}>
          <div className={appIconTile}>
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-zinc-100">Announcements</p>
            <p className={appMeta}>Campus updates</p>
          </div>
        </Link>
        {role === "ADMIN" && (
          <Link href="/admin/faculty-programs" className={appActionRow}>
            <div className={appIconTile}>
              <UserCog className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Faculty access</p>
              <p className={appMeta}>Program scopes</p>
            </div>
          </Link>
        )}
      </div>

      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className={appSectionTitle}>Pending profile verifications</CardTitle>
          <CardDescription className="text-zinc-500">
            {pendingAlumni.length === 0
              ? "All alumni profiles are verified."
              : `${pendingAlumni.length} profile${pendingAlumni.length === 1 ? "" : "s"} awaiting approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAlumni.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="mb-3 h-10 w-10 text-teal-500/80" aria-hidden />
              <p className="text-sm text-zinc-500">No pending verifications.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAlumni.map((alumni: PendingAlumni, idx: number) => (
                <div key={alumni.id}>
                  {idx > 0 && <Separator className="bg-zinc-700/50" />}
                  <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-teal-200 ring-1 ring-zinc-600/50">
                      {alumni.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-100">{alumni.user.name}</p>
                      <p className="truncate text-sm text-zinc-500">{alumni.user.email}</p>
                      <p className="text-xs text-zinc-500">
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
