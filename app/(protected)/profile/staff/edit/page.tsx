import { auth } from "@/lib/auth";
import { findStaffProfileByUserIdSafe } from "@/lib/staff-profile";
import { redirect } from "next/navigation";
import { StaffProfileForm } from "@/components/profile/StaffProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { appGhostBtn, appPanel } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit staff profile" };

export default async function StaffProfileEditPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") redirect("/profile");

  const initial = await findStaffProfileByUserIdSafe(session.user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className={cn("-ml-1", appGhostBtn)}>
          <Link href="/profile">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-zinc-50">Staff directory profile</CardTitle>
          <CardDescription className="text-zinc-500">
            This information is visible on your profile as campus staff. Alumni see their own
            extended profile; you can add title, department, and contact details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffProfileForm initial={initial} />
        </CardContent>
      </Card>
    </div>
  );
}
