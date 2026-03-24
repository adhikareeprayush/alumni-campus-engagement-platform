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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to profile
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Keep your information up to date.</p>
      </div>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>Your professional summary and location.</CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoForm profile={profile} />
        </CardContent>
      </Card>

      {/* Work experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work Experience</CardTitle>
          <CardDescription>Add or update your career history.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobHistorySection profileId={profile.id} jobs={profile.jobHistory} />
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Education</CardTitle>
          <CardDescription>Your academic background.</CardDescription>
        </CardHeader>
        <CardContent>
          <EducationSection profileId={profile.id} education={profile.education} />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
          <CardDescription>Technical and professional skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsSection
            profileId={profile.id}
            skills={profile.skills.map((s) => ({ id: s.skillId, name: s.skill.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
