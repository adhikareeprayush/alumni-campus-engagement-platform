"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Loader2, Eye } from "lucide-react";
import { appButtonOutline, appInput, appTextarea } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export function AnnouncementForm() {
  const [isPending, startTransition] = useTransition();
  const [publishNow, setPublishNow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("isPublished", publishNow ? "true" : "false");

    startTransition(async () => {
      const res = await createAnnouncement(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(publishNow ? "Announcement published!" : "Draft saved.");
        formRef.current?.reset();
        setPublishNow(false);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-zinc-400">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Alumni Reunion 2025 Registration Open"
          required
          disabled={isPending}
          className={appInput}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content" className="text-zinc-400">
          Content
        </Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Write your announcement here…"
          rows={4}
          required
          disabled={isPending}
          className={cn(appTextarea, "min-h-[100px] resize-none")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          type="submit"
          variant="outline"
          disabled={isPending}
          onClick={() => setPublishNow(false)}
          className={cn(appButtonOutline, "gap-1.5")}
        >
          {isPending && !publishNow ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          onClick={() => setPublishNow(true)}
          className="gap-1.5 bg-teal-600 hover:bg-teal-500"
        >
          {isPending && publishNow ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          Publish Now
        </Button>
      </div>
    </form>
  );
}
