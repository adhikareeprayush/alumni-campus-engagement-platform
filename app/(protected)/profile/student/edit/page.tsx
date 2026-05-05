import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StudentProfileForm } from "@/components/profile/StudentProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { appGhostBtn, appPanel } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit student profile" };

export default async function StudentProfileEditPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/profile");

  const profile = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-zinc-500">
        Student profile missing. Contact support.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className={cn("-ml-1", appGhostBtn)}>
        <Link href="/profile">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to profile
        </Link>
      </Button>
      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-zinc-50">Academic profile</CardTitle>
          <CardDescription className="text-zinc-500">
            Keep your program and batch accurate so faculty can identify you in campus systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentProfileForm initial={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
