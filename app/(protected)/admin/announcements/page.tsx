import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Megaphone, Eye, EyeOff } from "lucide-react";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { AnnouncementActions } from "@/components/announcements/AnnouncementActions";
import { appEmptyState, appPageSubtitle, appPageTitle, appPanel } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Announcements" };

async function getAnnouncements() {
  return db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });
}

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") redirect("/dashboard");

  const announcements = await getAnnouncements();
  const published = announcements.filter((a) => a.isPublished).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(appPageTitle, "flex items-center gap-2")}>
            <Megaphone className="h-7 w-7 shrink-0 text-teal-400" aria-hidden />
            Announcements
          </h1>
          <p className={cn(appPageSubtitle, "mt-1")}>
            {published} published · {announcements.length - published}{" "}
            draft{announcements.length - published === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Create form */}
      <Card className={appPanel}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-zinc-50">New Announcement</CardTitle>
          <CardDescription className="text-zinc-500">
            Drafts are saved but not visible to alumni and students until published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className={`${appEmptyState} border-dashed py-16`}>
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-zinc-600" aria-hidden />
            <p className="text-sm text-zinc-500">No announcements yet. Create one above.</p>
          </div>
        ) : (
          announcements.map((a, idx) => (
            <Card key={a.id} className={cn(appPanel, !a.isPublished && "opacity-85")}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-zinc-50">{a.title}</h3>
                      {a.isPublished ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-teal-500/35 bg-teal-950/45 text-xs text-teal-100 hover:bg-teal-950/45"
                        >
                          <Eye className="mr-1 h-3 w-3" aria-hidden /> Published
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-zinc-600 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-800/60"
                        >
                          <EyeOff className="mr-1 h-3 w-3 opacity-80" aria-hidden /> Draft
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-zinc-400 line-clamp-3 whitespace-pre-line">
                      {a.content}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      By {a.createdBy.name} · {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <AnnouncementActions
                    id={a.id}
                    isPublished={a.isPublished}
                    title={a.title}
                    content={a.content}
                  />
                </div>
                {idx < announcements.length - 1 && <Separator className="mt-4 bg-zinc-700/50" />}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
