import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BasicInfoForm } from "@/components/profile/BasicInfoForm";
import { JobHistorySection } from "@/components/profile/JobHistorySection";
import { EducationSection } from "@/components/profile/EducationSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appGhostBtn, appPageSubtitle, appPageTitle, appPanel } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ALUMNI") redirect("/profile");

  const profile = await db.alumniProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true } },
      jobHistory: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startYear: "desc" } },
    },
  });

  if (!profile) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className={cn("-ml-1", appGhostBtn)}>
          <Link href="/profile">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to profile
          </Link>
        </Button>
      </div>

      <div>
        <h1 className={appPageTitle}>Edit Profile</h1>
        <p className={cn(appPageSubtitle, "mt-1")}>Keep your information up to date.</p>
      </div>

      {/* Basic info */}
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-base text-zinc-50">Basic Information</CardTitle>
          <CardDescription className="text-zinc-500">
            Your professional summary and location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoForm profile={profile} />
        </CardContent>
      </Card>

      {/* Work experience */}
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-base text-zinc-50">Work Experience</CardTitle>
          <CardDescription className="text-zinc-500">Add or update your career history.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobHistorySection jobs={profile.jobHistory} />
        </CardContent>
      </Card>

      {/* Education */}
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-base text-zinc-50">Education</CardTitle>
          <CardDescription className="text-zinc-500">Your academic background.</CardDescription>
        </CardHeader>
        <CardContent>
          <EducationSection education={profile.education} />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-base text-zinc-50">Skills</CardTitle>
          <CardDescription className="text-zinc-500">Technical and professional skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsSection
            skills={profile.skills.map((s) => ({ id: s.skillId, name: s.skill.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
