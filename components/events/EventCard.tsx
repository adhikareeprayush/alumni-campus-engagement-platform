import { Badge } from "@/components/ui/badge";
import { RsvpButton } from "./RsvpButton";
import { Calendar, MapPin, Video, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_TYPE_LABEL: Record<string, string> = {
  GUEST_LECTURE: "Guest Lecture",
  REUNION: "Reunion",
  WEBINAR: "Webinar",
  WORKSHOP: "Workshop",
  OTHER: "Event",
};

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  venue: string | null;
  onlineLink: string | null;
  startDate: Date;
  endDate: Date | null;
  rsvpCount: number;
  userRsvpStatus: "ATTENDING" | "NOT_ATTENDING" | "MAYBE" | null;
  isPast: boolean;
}

function formatEventDate(start: Date, end: Date | null) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startStr = new Intl.DateTimeFormat("en-US", opts).format(new Date(start));
  if (!end) return startStr;
  const endStr = new Intl.DateTimeFormat("en-US", opts).format(new Date(end));
  return `${startStr} – ${endStr}`;
}

export function EventCard({
  id,
  title,
  description,
  eventType,
  venue,
  onlineLink,
  startDate,
  endDate,
  rsvpCount,
  userRsvpStatus,
  isPast,
}: EventCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-zinc-700/50 bg-zinc-900/60 p-5 shadow-sm shadow-black/20 backdrop-blur-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-50">{title}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="outline" className="border-zinc-600/60 bg-zinc-800/80 text-zinc-200">
            {EVENT_TYPE_LABEL[eventType] ?? eventType}
          </Badge>
          {isPast && (
            <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-500">
              Past
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          {formatEventDate(startDate, endDate)}
        </div>
        {venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden /> {venue}
          </div>
        )}
        {onlineLink && (
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
            <a
              href={onlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-teal-400 hover:text-teal-300 hover:underline"
            >
              Join online
            </a>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden /> {rsvpCount} attending
        </div>
      </div>

      {description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">{description}</p>
      )}

      {!isPast && (
        <div className="mt-4 border-t border-zinc-700/50 pt-3">
          <RsvpButton eventId={id} currentStatus={userRsvpStatus} />
        </div>
      )}
      {isPast && userRsvpStatus === "ATTENDING" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-400/90">
          <Clock className="h-3.5 w-3.5" aria-hidden /> You attended this event
        </div>
      )}
    </div>
  );
}
