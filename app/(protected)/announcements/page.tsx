import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublishedAnnouncements } from "@/lib/data/announcements";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { Button } from "@/components/ui/button";
import { appEmptyState, appPageSubtitle, appPageTitle, appPrimaryBtn } from "@/lib/app-ui";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const items = await getPublishedAnnouncements(100);

  const canManage = session.user.role === "ADMIN" || session.user.role === "FACULTY";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={appPageTitle}>Announcements</h1>
          <p className={appPageSubtitle}>Updates from campus administration and faculty.</p>
        </div>
        {canManage && (
          <Button asChild size="sm" className={`${appPrimaryBtn} w-fit`}>
            <Link href="/admin/announcements">Create or manage</Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className={`${appEmptyState} px-6 py-10`}>
          <p className="text-sm text-zinc-500">No published announcements yet. Check back later.</p>
        </div>
      ) : (
        <AnnouncementFeed items={items} compact={false} />
      )}
    </div>
  );
}
