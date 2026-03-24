import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { JobHistorySection } from "@/components/profile/JobHistorySection";
import { EducationSection } from "@/components/profile/EducationSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
  Clock,
  Pencil,
} from "lucide-react";

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

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAlumni = session.user.role === "ALUMNI";
  const profile = isAlumni ? await getProfile(session.user.id) : null;

  if (isAlumni && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-700">Profile not found</h2>
        <p className="mt-1 text-sm text-gray-400">Something went wrong loading your profile.</p>
      </div>
    );
  }

  const userImage = profile?.user?.image ?? null;
  const userName = session.user.name ?? "User";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar with upload */}
            <AvatarUpload
              currentImage={userImage}
              name={userName}
              userId={session.user.id}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
                {profile?.isVerified ? (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : isAlumni ? (
                  <Badge variant="warning">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending verification
                  </Badge>
                ) : null}
                <Badge variant="outline">{session.user.role}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{session.user.email}</p>
              {profile && (
                <p className="mt-1 text-sm text-gray-500">
                  {profile.program} · Batch {profile.batchYear}
                </p>
              )}
              {profile?.currentJobTitle && (
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {profile.currentJobTitle}
                  {profile.currentCompany && (
                    <span className="font-normal text-gray-500"> at {profile.currentCompany}</span>
                  )}
                </p>
              )}
              {(profile?.currentLocation || profile?.country) && (
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.district, profile.province, profile.country].filter(Boolean).join(", ")}
                </div>
              )}
              {profile?.bio && (
                <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">{profile.bio}</p>
              )}
            </div>

            {isAlumni && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit Info
                </Link>
              </Button>
            )}
          </div>

          {/* Social links */}
          {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
            <div className="mt-4 flex gap-4 border-t pt-4">
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
        </CardContent>
      </Card>

      {/* Skills — live interactive section */}
      {isAlumni && profile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>Click + to add new skills, × to remove them.</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillsSection
              profileId={profile.id}
              skills={profile.skills.map((s) => ({ id: s.skillId, name: s.skill.name }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Work Experience — live interactive section */}
      {isAlumni && profile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Work Experience</CardTitle>
            <CardDescription>Add, edit, or remove career entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobHistorySection
              profileId={profile.id}
              jobs={profile.jobHistory}
            />
          </CardContent>
        </Card>
      )}

      {/* Education — live interactive section */}
      {isAlumni && profile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Education</CardTitle>
            <CardDescription>Add, edit, or remove academic entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <EducationSection
              profileId={profile.id}
              education={profile.education}
            />
          </CardContent>
        </Card>
      )}

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <Badge variant="outline">{session.user.role}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-700">
              {profile?.user?.createdAt ? formatDate(profile.user.createdAt) : "—"}
            </span>
          </div>
          {isAlumni && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Verification status</span>
              <span>
                {profile?.isVerified ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3.5 w-3.5" /> Pending admin approval
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
