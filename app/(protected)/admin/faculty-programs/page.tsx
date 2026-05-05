import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { addFacultyProgram, removeFacultyProgram } from "@/lib/actions/faculty-programs";
import type { Program } from "@/app/generated/prisma/client";
import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";
import { appGhostBtn, appPanel, appSelect } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Faculty program access" };

const ALL_PROGRAMS: Program[] = [
  "BCT",
  "BEX",
  "BIT",
  "BCE",
  "BME",
  "BEE",
  "BAG",
  "BAM",
  "OTHER",
];

export default async function FacultyProgramsAdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const facultyUsers = await db.user.findMany({
    where: { role: "FACULTY" },
    orderBy: { email: "asc" },
    include: { facultyPrograms: { select: { program: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className={cn("mb-2 -ml-2", appGhostBtn)}>
          <Link href="/admin">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to admin
          </Link>
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-50">
          <UserCog className="h-7 w-7 text-teal-400" />
          Faculty program access
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Faculty accounts only see alumni and students in the programs you assign here. Campus admins
          (this page) see everyone.
        </p>
      </div>

      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-base text-zinc-50">Faculty members</CardTitle>
          <CardDescription className="text-zinc-500">
            Add or remove program rows for each faculty user. An account with no programs sees an empty
            directory until you assign at least one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {facultyUsers.length === 0 ? (
            <p className="text-sm text-zinc-500">No faculty users yet.</p>
          ) : (
            facultyUsers.map((u, i) => {
              const assigned = new Set(u.facultyPrograms.map((fp) => fp.program));
              const available = ALL_PROGRAMS.filter((p) => !assigned.has(p));
              return (
                <div key={u.id}>
                  {i > 0 && <Separator className="mb-6 bg-zinc-700/50" />}
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-zinc-50">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {u.facultyPrograms.length === 0 ? (
                        <span className="text-xs text-amber-400/95">No programs assigned</span>
                      ) : (
                        u.facultyPrograms.map((fp) => (
                          <form key={fp.program} action={removeFacultyProgram} className="inline">
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="program" value={fp.program} />
                            <Badge
                              variant="outline"
                              className="gap-1 border-zinc-600 bg-zinc-800/60 pr-1 text-zinc-200 hover:bg-zinc-800/60"
                            >
                              {fp.program}
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1 text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300"
                              >
                                ×
                              </Button>
                            </Badge>
                          </form>
                        ))
                      )}
                    </div>
                    {available.length > 0 && (
                      <form action={addFacultyProgram} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-500">Add program</label>
                          <select name="program" className={cn(appSelect, "h-9 px-2")} required>
                            <option value="">Select…</option>
                            {available.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-500">
                          Add
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
