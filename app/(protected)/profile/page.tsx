import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { findStaffProfileByUserIdSafe } from "@/lib/staff-profile";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JobHistorySection } from "@/components/profile/JobHistorySection";
import { EducationSection } from "@/components/profile/EducationSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  GraduationCap,
  MapPin,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
  Clock,
  Pencil,
  Phone,
  Building2,
  Shield,
  School,
} from "lucide-react";
import { appButtonOutline, appPanel } from "@/lib/app-ui";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "My Profile" };

async function getProfile(userId: string) {
  return db.alumniProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true, image: true, createdAt: true } },
      skills: { include: { skill: true } },
      jobHistory: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startYear: "desc" } },
    },
  });
}

async function getUserBase(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, image: true },
  });
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAlumni = session.user.role === "ALUMNI";
  const isStudent = session.user.role === "STUDENT";
  const isStaff = session.user.role === "ADMIN" || session.user.role === "FACULTY";

  const [profile, baseUser, staffProfile, facultyPrograms, studentProfile] = await Promise.all([
    isAlumni ? getProfile(session.user.id) : Promise.resolve(null),
    getUserBase(session.user.id),
    isStaff ? findStaffProfileByUserIdSafe(session.user.id) : Promise.resolve(null),
    session.user.role === "FACULTY"
      ? db.facultyManagedProgram.findMany({
          where: { userId: session.user.id },
          select: { program: true },
        })
      : Promise.resolve([]),
    isStudent
      ? db.studentProfile.findUnique({ where: { userId: session.user.id } })
      : Promise.resolve(null),
  ]);

  if (isAlumni && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="mb-4 h-12 w-12 text-zinc-600" />
        <h2 className="text-lg font-semibold text-zinc-200">Profile not found</h2>
        <p className="mt-1 text-sm text-zinc-500">Something went wrong loading your profile.</p>
      </div>
    );
  }

  if (isStudent && !studentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <School className="mb-4 h-12 w-12 text-zinc-600" />
        <h2 className="text-lg font-semibold text-zinc-200">Student profile not found</h2>
        <p className="mt-1 text-sm text-zinc-500">Contact support if this persists.</p>
      </div>
    );
  }

  const userImage = profile?.user?.image ?? baseUser?.image ?? null;
  const userName = session.user.name ?? "User";
  const memberSince = profile?.user?.createdAt ?? baseUser?.createdAt;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <Card className={appPanel}>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar with upload */}
            <AvatarUpload currentImage={userImage} name={userName} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-50">{userName}</h2>
                {profile?.isVerified ? (
                  <Badge
                    variant="outline"
                    className="border-teal-500/35 bg-teal-950/50 text-teal-100 hover:bg-teal-950/50"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3 text-teal-400" aria-hidden />
                    Verified
                  </Badge>
                ) : isAlumni ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-950/45 text-amber-100 hover:bg-amber-950/45"
                  >
                    <Clock className="mr-1 h-3 w-3 text-amber-400/90" aria-hidden />
                    Pending verification
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className="border-zinc-600 bg-zinc-800/70 capitalize text-zinc-300 hover:bg-zinc-800/70"
                >
                  {session.user.role.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">{session.user.email}</p>
              {profile && (
                <p className="mt-1 text-sm text-zinc-500">
                  {profile.program} · Batch {profile.batchYear}
                </p>
              )}
              {studentProfile && (
                <p className="mt-1 text-sm text-zinc-500">
                  {studentProfile.program} · Batch {studentProfile.batchYear}
                  {studentProfile.rollNumber && (
                    <span className="text-zinc-500"> · Roll {studentProfile.rollNumber}</span>
                  )}
                </p>
              )}
              {profile?.currentJobTitle && (
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {profile.currentJobTitle}
                  {profile.currentCompany && (
                    <span className="font-normal text-zinc-500"> at {profile.currentCompany}</span>
                  )}
                </p>
              )}
              {(profile?.currentLocation || profile?.country) && (
                <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.district, profile.province, profile.country].filter(Boolean).join(", ")}
                </div>
              )}
              {profile?.bio && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              {isAlumni && (
                <Button variant="outline" size="sm" className={appButtonOutline} asChild>
                  <Link href="/profile/edit">
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit Info
                  </Link>
                </Button>
              )}
              {isStaff && (
                <Button variant="outline" size="sm" className={appButtonOutline} asChild>
                  <Link href="/profile/staff/edit">
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    Edit staff details
                  </Link>
                </Button>
              )}
              {isStudent && studentProfile && (
                <Button variant="outline" size="sm" className={appButtonOutline} asChild>
                  <Link href="/profile/student/edit">
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit academic info
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Social links */}
          {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
            <div className="mt-4 flex gap-4 border-t border-zinc-700/50 pt-4">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-teal-400 hover:underline"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:underline"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:underline"
                >
                  <Globe className="h-4 w-4" /> Portfolio
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campus staff directory fields */}
      {isStaff && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-zinc-50">
              <Shield className="h-4 w-4 text-teal-400" />
              Staff profile
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Visible on your account; use this for role, department, and how colleagues can reach
              you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {staffProfile?.title && (
              <p className="font-medium text-zinc-50">{staffProfile.title}</p>
            )}
            {staffProfile?.department && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Building2 className="h-4 w-4 shrink-0 text-zinc-500" />
                {staffProfile.department}
              </div>
            )}
            {staffProfile?.officeLocation && (
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-500" />
                {staffProfile.officeLocation}
              </div>
            )}
            {staffProfile?.phone && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
                {staffProfile.phone}
              </div>
            )}
            {staffProfile?.linkedinUrl && (
              <a
                href={staffProfile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-teal-400 hover:underline"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {staffProfile?.bio && (
              <p className="pt-1 leading-relaxed text-zinc-400">{staffProfile.bio}</p>
            )}
            {!staffProfile?.title &&
              !staffProfile?.department &&
              !staffProfile?.bio &&
              !staffProfile?.phone &&
              !staffProfile?.officeLocation &&
              !staffProfile?.linkedinUrl && (
                <p className="text-zinc-500">
                  You have not added staff details yet.{" "}
                  <Link href="/profile/staff/edit" className="text-teal-400 hover:underline">
                    Add them now
                  </Link>
                  .
                </p>
              )}
            {session.user.role === "FACULTY" && facultyPrograms.length > 0 && (
              <div className="mt-2 border-t border-zinc-700/50 pt-3">
                <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Programs you cover
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {facultyPrograms.map((r) => (
                    <Badge
                      key={r.program}
                      variant="outline"
                      className="border-zinc-600 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800/60"
                    >
                      {r.program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student academic summary */}
      {isStudent && studentProfile && (
        <Card className={cn(appPanel, "bg-gradient-to-br from-zinc-800/40 to-zinc-950/80")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-zinc-50">
              <School className="h-4 w-4 text-teal-400" />
              Academic profile
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Keep program and batch aligned with campus records. Visible to authorized faculty.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Program</p>
              <p className="font-semibold text-zinc-50">{studentProfile.program}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Batch</p>
              <p className="font-semibold text-zinc-50">{studentProfile.batchYear}</p>
            </div>
            {studentProfile.rollNumber && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Roll</p>
                <p className="font-semibold text-zinc-50">{studentProfile.rollNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills — live interactive section */}
      {isAlumni && profile && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-50">Skills</CardTitle>
            <CardDescription className="text-zinc-500">Click + to add new skills, × to remove them.</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillsSection skills={profile.skills.map((s) => ({ id: s.skillId, name: s.skill.name }))} />
          </CardContent>
        </Card>
      )}

      {/* Work Experience — live interactive section */}
      {isAlumni && profile && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-50">Work Experience</CardTitle>
            <CardDescription className="text-zinc-500">Add, edit, or remove career entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobHistorySection jobs={profile.jobHistory} />
          </CardContent>
        </Card>
      )}

      {/* Education — live interactive section */}
      {isAlumni && profile && (
        <Card className={appPanel}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-50">Education</CardTitle>
            <CardDescription className="text-zinc-500">Add, edit, or remove academic entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <EducationSection education={profile.education} />
          </CardContent>
        </Card>
      )}

      {/* Account info */}
      <Card className={appPanel}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-50">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Role</span>
            <Badge
              variant="outline"
              className="border-zinc-600 bg-zinc-800/70 capitalize text-zinc-300 hover:bg-zinc-800/70"
            >
              {session.user.role.toLowerCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Member since</span>
            <span className="text-zinc-200">{memberSince ? formatDate(memberSince) : "—"}</span>
          </div>
          {isAlumni && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Verification status</span>
              <span>
                {profile?.isVerified ? (
                  <span className="flex items-center gap-1 text-teal-400/95">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400/95">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Pending admin approval
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
