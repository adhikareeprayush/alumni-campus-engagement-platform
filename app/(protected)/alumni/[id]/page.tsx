import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getFacultyManagedPrograms, alumniProgramWhere } from "@/lib/faculty-scope";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  MapPin,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { appGhostBtn, appIconTile, appPanel, appSectionTitle } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await db.alumniProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  return { title: profile ? `${profile.user.name} — Alumni` : "Alumni Profile" };
}

export default async function AlumniDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const managed = await getFacultyManagedPrograms(session.user.id, session.user.role);
  const scope = alumniProgramWhere(managed);

  const profile = await db.alumniProfile.findFirst({
    where: { id, isVerified: true, ...scope },
    include: {
      user: { select: { name: true, email: true } },
      skills: { include: { skill: true } },
      jobHistory: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startYear: "desc" } },
    },
  });

  if (!profile) notFound();

  const initials = profile.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const linkCls = "flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 hover:underline";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className={appGhostBtn}>
        <Link href="/alumni">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> Back to directory
        </Link>
      </Button>

      <Card className={appPanel}>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-teal-200 ring-1 ring-zinc-600/50">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold text-zinc-50">{profile.user.name}</h1>
                <Badge variant="outline" className="border-teal-500/35 bg-teal-950/40 text-teal-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden /> Verified
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    profile.isEmployed
                      ? "border-zinc-600 bg-zinc-800/80 text-zinc-300"
                      : "border-amber-500/30 bg-amber-950/40 text-amber-100",
                  )}
                >
                  {profile.isEmployed ? "Employed" : "Open to work"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">
                {profile.program} · Batch {profile.batchYear}
              </p>
              {profile.currentJobTitle && (
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {profile.currentJobTitle}
                  {profile.currentCompany && (
                    <span className="font-normal text-zinc-500"> at {profile.currentCompany}</span>
                  )}
                </p>
              )}
              {(profile.currentLocation || profile.country) && (
                <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {[profile.district, profile.province, profile.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>

          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
            <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-700/50 pt-4">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  <Github className="h-4 w-4" aria-hidden /> GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  <Globe className="h-4 w-4" aria-hidden /> Portfolio
                </a>
              )}
            </div>
          )}

          {profile.bio && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{profile.bio}</p>}
        </CardContent>
      </Card>

      {profile.skills.length > 0 && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className={appSectionTitle}>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s.skillId} variant="outline" className="border-zinc-600/60 bg-zinc-800/50 text-zinc-300">
                  {s.skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.jobHistory.length > 0 && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className={appSectionTitle}>Work experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.jobHistory.map((job, idx) => (
              <div key={job.id}>
                {idx > 0 && <Separator className="mb-4 bg-zinc-700/50" />}
                <div className="flex gap-3">
                  <div className={appIconTile}>
                    <Briefcase className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-zinc-100">{job.jobTitle}</p>
                      {job.isCurrent && (
                        <Badge variant="outline" className="border-teal-500/35 text-xs text-teal-200">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{job.company}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(job.startDate)} —{" "}
                      {job.isCurrent ? "Present" : job.endDate ? formatDate(job.endDate) : ""}
                      {job.location && ` · ${job.location}`}
                    </p>
                    {job.description && <p className="mt-1 text-sm text-zinc-500">{job.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile.education.length > 0 && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className={appSectionTitle}>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, idx) => (
              <div key={edu.id}>
                {idx > 0 && <Separator className="mb-4 bg-zinc-700/50" />}
                <div className="flex gap-3">
                  <div className={appIconTile}>
                    <GraduationCap className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{edu.institution}</p>
                    <p className="text-sm text-zinc-400">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {edu.startYear} — {edu.isOngoing ? "Ongoing" : (edu.endYear ?? "")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
