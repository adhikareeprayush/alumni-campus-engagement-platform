"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { rsvpEvent, cancelRsvp } from "@/lib/actions/events";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    return (
      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Updating…
      </div>
    );
  }

  const outline = "border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-zinc-500">RSVP:</span>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          outline,
          currentStatus === "ATTENDING" && "border-teal-500/50 bg-teal-600 text-white hover:bg-teal-500 hover:text-white",
        )}
        onClick={() => handleRsvp("ATTENDING")}
        disabled={isPending}
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden /> Attending
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          outline,
          currentStatus === "MAYBE" && "border-zinc-500 bg-zinc-700 text-white",
        )}
        onClick={() => handleRsvp("MAYBE")}
        disabled={isPending}
      >
        <HelpCircle className="mr-1 h-3.5 w-3.5" aria-hidden /> Maybe
      </Button>
      {currentStatus && (
        <Button
          size="sm"
          variant="ghost"
          className="text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          onClick={handleCancel}
          disabled={isPending}
        >
          <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden /> Cancel
        </Button>
      )}
    </div>
  );
}
