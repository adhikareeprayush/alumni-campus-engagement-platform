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
        <Settings className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Account overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-base">Account Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{user.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Role</span>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-700">{formatDate(user.createdAt)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Account status</span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <ShieldCheck className="h-4 w-4" /> Active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Display name */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-base">Display Name</CardTitle>
          </div>
          <CardDescription>
            Update the name shown across the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NameForm currentName={user.name} />
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>
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
