"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { rsvpEvent, cancelRsvp } from "@/lib/actions/events";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";

interface Props {
  eventId: string;
  currentStatus: "ATTENDING" | "NOT_ATTENDING" | "MAYBE" | null;
}

export function RsvpButton({ eventId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRsvp = (status: "ATTENDING" | "NOT_ATTENDING" | "MAYBE") => {
    startTransition(async () => {
      const res = await rsvpEvent(eventId, status);
      if (res?.error) toast.error(res.error);
      else toast.success(status === "ATTENDING" ? "You're attending!" : "RSVP updated.");
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelRsvp(eventId);
      if (res?.error) toast.error(res.error);
      else toast.success("RSVP cancelled.");
    });
  };

  if (isPending) {
    return <div className="flex items-center gap-1.5 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Updating...</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">RSVP:</span>
      <Button
        size="sm"
        variant={currentStatus === "ATTENDING" ? "default" : "outline"}
        className={currentStatus === "ATTENDING" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}
        onClick={() => handleRsvp("ATTENDING")}
        disabled={isPending}
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Attending
      </Button>
      <Button
        size="sm"
        variant={currentStatus === "MAYBE" ? "secondary" : "outline"}
        onClick={() => handleRsvp("MAYBE")}
        disabled={isPending}
      >
        <HelpCircle className="mr-1 h-3.5 w-3.5" /> Maybe
      </Button>
      {currentStatus && (
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={handleCancel} disabled={isPending}>
          <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
        </Button>
      )}
    </div>
  );
}
