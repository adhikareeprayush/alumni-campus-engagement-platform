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
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Back to admin</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
          <CardDescription>Create a guest lecture, reunion, webinar, or workshop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" name="title" required placeholder="Annual Alumni Reunion 2026" disabled={isPending} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Event Type *</Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger>
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
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" placeholder="IOE Purwanchal Campus Auditorium" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onlineLink">Online Join Link</Label>
              <Input id="onlineLink" name="onlineLink" type="url" placeholder="https://meet.google.com/..." disabled={isPending} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input id="startDate" name="startDate" type="datetime-local" required disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input id="endDate" name="endDate" type="datetime-local" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="What's this event about?" rows={4} disabled={isPending} />
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isPending}
              />
              <div>
                <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">Publish immediately</label>
                <p className="text-xs text-gray-400">Alumni will be able to see and RSVP this event.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isPending || !eventType}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isPublished ? "Publish Event" : "Save Draft"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
