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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-600" />
            Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {published} published · {announcements.length - published} draft
            {announcements.length !== published && "s"}
          </p>
        </div>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">New Announcement</CardTitle>
          <CardDescription>
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
          <div className="rounded-xl border border-dashed py-16 text-center text-gray-400">
            <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-30" />
            <p className="text-sm">No announcements yet. Create one above.</p>
          </div>
        ) : (
          announcements.map((a, idx) => (
            <Card key={a.id} className={a.isPublished ? "" : "opacity-70"}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{a.title}</h3>
                      {a.isPublished ? (
                        <Badge variant="success" className="text-xs shrink-0">
                          <Eye className="mr-1 h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <EyeOff className="mr-1 h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                      {a.content}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
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
                {idx < announcements.length - 1 && <Separator className="mt-4" />}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
