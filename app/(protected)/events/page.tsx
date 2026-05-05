import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { appEmptyState, appPageSubtitle, appPageTitle, appPrimaryBtn, appTabsList, appTabsTrigger } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Events" };

async function getEvents(userId: string) {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    db.event.findMany({
      where: { isPublished: true, startDate: { gte: now } },
      orderBy: { startDate: "asc" },
      include: {
        _count: { select: { rsvps: { where: { status: "ATTENDING" } } } },
        rsvps: { where: { userId }, select: { status: true } },
      },
    }),
    db.event.findMany({
      where: { isPublished: true, startDate: { lt: now } },
      orderBy: { startDate: "desc" },
      take: 20,
      include: {
        _count: { select: { rsvps: { where: { status: "ATTENDING" } } } },
        rsvps: { where: { userId }, select: { status: true } },
      },
    }),
  ]);

  return { upcoming, past };
}

export default async function EventsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const { upcoming, past } = await getEvents(userId);

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "FACULTY";

  type RsvpStatus = "ATTENDING" | "NOT_ATTENDING" | "MAYBE";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={appPageTitle}>Events</h1>
          <p className={appPageSubtitle}>Guest lectures, reunions, webinars, and more.</p>
        </div>
        {isAdmin && (
          <Button asChild className={appPrimaryBtn}>
            <Link href="/admin/events/new">
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Create event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className={cn(appTabsList, "w-full justify-start sm:w-auto")}>
          <TabsTrigger value="upcoming" className={appTabsTrigger}>
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className={appTabsTrigger}>
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 focus-visible:outline-none">
          {upcoming.length === 0 ? (
            <div className={appEmptyState}>
              <Calendar className="mb-4 h-12 w-12 text-zinc-600" aria-hidden />
              <h2 className="text-lg font-semibold text-zinc-300">No upcoming events</h2>
              {isAdmin && (
                <p className="mt-2 text-sm text-zinc-500">
                  <Link href="/admin/events/new" className="text-teal-400 hover:text-teal-300 hover:underline">
                    Create the first event
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventType={event.eventType}
                  venue={event.venue}
                  onlineLink={event.onlineLink}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  rsvpCount={event._count.rsvps}
                  userRsvpStatus={(event.rsvps[0]?.status as RsvpStatus) ?? null}
                  isPast={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 focus-visible:outline-none">
          {past.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">No past events.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventType={event.eventType}
                  venue={event.venue}
                  onlineLink={event.onlineLink}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  rsvpCount={event._count.rsvps}
                  userRsvpStatus={(event.rsvps[0]?.status as RsvpStatus) ?? null}
                  isPast={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
