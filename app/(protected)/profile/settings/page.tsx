import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NameForm } from "@/components/settings/NameForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { Settings, User, KeyRound, ShieldCheck, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { appPageSubtitle, appPageTitle, appPanel } from "@/lib/app-ui";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true,
    },
  });

  if (!user) redirect("/login");

  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-teal-400" aria-hidden />
        <h1 className={appPageTitle}>Settings</h1>
      </div>
      <p className={appPageSubtitle}>Manage how your account appears and sign-in credentials.</p>

      {/* Account overview */}
      <Card className={appPanel}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-zinc-500" aria-hidden />
            <CardTitle className="text-base text-zinc-50">Account Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Email</span>
            <span className="font-medium text-zinc-100">{user.email}</span>
          </div>
          <Separator className="bg-zinc-700/50" />
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Role</span>
            <Badge
              variant="outline"
              className="border-zinc-600 bg-zinc-800/70 capitalize text-zinc-300 hover:bg-zinc-800/70"
            >
              {roleLabel}
            </Badge>
          </div>
          <Separator className="bg-zinc-700/50" />
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Member since</span>
            <span className="text-zinc-200">{formatDate(user.createdAt)}</span>
          </div>
          <Separator className="bg-zinc-700/50" />
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Account status</span>
            <span className="flex items-center gap-1 font-medium text-teal-400/95">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden /> Active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Display name */}
      <Card className={appPanel}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-500" aria-hidden />
            <CardTitle className="text-base text-zinc-50">Display Name</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">
            Update the name shown across the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NameForm currentName={user.name} />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className={appPanel}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-zinc-500" aria-hidden />
            <CardTitle className="text-base text-zinc-50">Change Password</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">
            Choose a strong password with at least 8 characters, one uppercase
            letter, and one number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
