"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createEvent } from "@/lib/actions/events";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { appButtonOutline, appGhostBtn, appInput, appPanel, appSelect, appTextarea } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "GUEST_LECTURE", label: "Guest Lecture" },
  { value: "REUNION", label: "Alumni Reunion" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "OTHER", label: "Other" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventType, setEventType] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createEvent({
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        eventType: eventType as "GUEST_LECTURE" | "REUNION" | "WEBINAR" | "WORKSHOP" | "OTHER",
        venue: fd.get("venue") as string,
        onlineLink: fd.get("onlineLink") as string,
        startDate: fd.get("startDate") as string,
        endDate: fd.get("endDate") as string,
        isPublished,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isPublished ? "Event published!" : "Event saved as draft.");
        router.push("/events");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className={cn("-ml-1", appGhostBtn)}>
        <Link href="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Back to admin</Link>
      </Button>

      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-zinc-50">Create Event</CardTitle>
          <CardDescription className="text-zinc-500">
            Create a guest lecture, reunion, webinar, or workshop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-zinc-400">
                Event Title *
              </Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Annual Alumni Reunion 2026"
                disabled={isPending}
                className={appInput}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-zinc-400">Event Type *</Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger className={appSelect}>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venue" className="text-zinc-400">
                  Venue
                </Label>
                <Input
                  id="venue"
                  name="venue"
                  placeholder="Sterling Auditorium · MVTU"
                  disabled={isPending}
                  className={appInput}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onlineLink" className="text-zinc-400">
                Online Join Link
              </Label>
              <Input
                id="onlineLink"
                name="onlineLink"
                type="url"
                placeholder="https://meet.google.com/..."
                disabled={isPending}
                className={appInput}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-zinc-400">
                  Start Date & Time *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  required
                  disabled={isPending}
                  className={appInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-zinc-400">
                  End Date & Time
                </Label>
                <Input id="endDate" name="endDate" type="datetime-local" disabled={isPending} className={appInput} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-zinc-400">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What's this event about?"
                rows={4}
                disabled={isPending}
                className={cn(appTextarea, "min-h-[100px]")}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-teal-600"
                disabled={isPending}
              />
              <div>
                <label htmlFor="isPublished" className="cursor-pointer text-sm font-medium text-zinc-200">
                  Publish immediately
                </label>
                <p className="text-xs text-zinc-500">Alumni will be able to see and RSVP this event.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-500" disabled={isPending || !eventType}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isPublished ? "Publish Event" : "Save Draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={appButtonOutline}
                onClick={() => router.push("/admin")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
