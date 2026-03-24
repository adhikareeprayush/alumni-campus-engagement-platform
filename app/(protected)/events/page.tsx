import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-gray-500">Guest lectures, reunions, webinars, and more.</p>
        </div>
        {isAdmin && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/admin/events/new">
              <Plus className="mr-1 h-4 w-4" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center">
              <Calendar className="mb-4 h-12 w-12 text-gray-200" />
              <h2 className="text-lg font-semibold text-gray-500">No upcoming events</h2>
              {isAdmin && (
                <p className="mt-2 text-sm text-gray-400">
                  <Link href="/admin/events/new" className="text-indigo-600 hover:underline">Create the first event</Link>
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

        <TabsContent value="past" className="mt-4">
          {past.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No past events.</p>
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
