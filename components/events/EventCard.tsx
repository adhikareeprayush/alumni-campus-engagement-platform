import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RsvpButton } from "./RsvpButton";
import { Calendar, MapPin, Video, Users, Clock } from "lucide-react";

const EVENT_TYPE_LABEL: Record<string, string> = {
  GUEST_LECTURE: "Guest Lecture",
  REUNION: "Reunion",
  WEBINAR: "Webinar",
  WORKSHOP: "Workshop",
  OTHER: "Event",
};

const EVENT_TYPE_COLOR: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  GUEST_LECTURE: "default",
  WEBINAR: "success",
  REUNION: "secondary",
  WORKSHOP: "warning",
  OTHER: "outline",
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
  const startStr = new Intl.DateTimeFormat("en-NP", opts).format(new Date(start));
  if (!end) return startStr;
  const endStr = new Intl.DateTimeFormat("en-NP", opts).format(new Date(end));
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
    <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant={EVENT_TYPE_COLOR[eventType] ?? "outline"}>
            {EVENT_TYPE_LABEL[eventType] ?? eventType}
          </Badge>
          {isPast && <Badge variant="outline" className="text-xs text-gray-400">Past</Badge>}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0" />
          {formatEventDate(startDate, endDate)}
        </div>
        {venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" /> {venue}
          </div>
        )}
        {onlineLink && (
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 shrink-0" />
            <a href={onlineLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
              Join online
            </a>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 shrink-0" /> {rsvpCount} attending
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-2">{description}</p>
      )}

      {/* RSVP */}
      {!isPast && (
        <div className="mt-4 border-t pt-3">
          <RsvpButton eventId={id} currentStatus={userRsvpStatus} />
        </div>
      )}
      {isPast && userRsvpStatus === "ATTENDING" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
          <Clock className="h-3.5 w-3.5" /> You attended this event
        </div>
      )}
    </div>
  );
}
