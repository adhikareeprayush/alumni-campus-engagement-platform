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
  Building2,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await db.alumniProfile.findUnique({ where: { id }, include: { user: { select: { name: true } } } });
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/alumni">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to directory
        </Link>
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{profile.user.name}</h1>
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                </Badge>
                <Badge variant={profile.isEmployed ? "secondary" : "outline"}>
                  {profile.isEmployed ? "Employed" : "Open to work"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                {profile.program} · Batch {profile.batchYear}
              </p>
              {profile.currentJobTitle && (
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {profile.currentJobTitle}
                  {profile.currentCompany && (
                    <span className="font-normal text-gray-500"> at {profile.currentCompany}</span>
                  )}
                </p>
              )}
              {(profile.currentLocation || profile.country) && (
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.district, profile.province, profile.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Social */}
          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
            <div className="mt-4 flex gap-4">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:underline">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:underline">
                  <Globe className="h-4 w-4" /> Portfolio
                </a>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{profile.bio}</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s.skillId} variant="secondary">{s.skill.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work experience */}
      {profile.jobHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Work Experience</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile.jobHistory.map((job, idx) => (
              <div key={job.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{job.jobTitle}</p>
                      {job.isCurrent && <Badge variant="success" className="text-xs">Current</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(job.startDate)} — {job.isCurrent ? "Present" : job.endDate ? formatDate(job.endDate) : ""}
                      {job.location && ` · ${job.location}`}
                    </p>
                    {job.description && <p className="mt-1 text-sm text-gray-500">{job.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Education</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, idx) => (
              <div key={edu.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.degree}{edu.field && ` in ${edu.field}`}</p>
                    <p className="text-xs text-gray-400">
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
