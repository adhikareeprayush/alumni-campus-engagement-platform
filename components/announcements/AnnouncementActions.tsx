"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  toggleAnnouncementPublished,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/announcements";
import { Eye, EyeOff, Pencil, Trash2, Loader2 } from "lucide-react";
import { appButtonOutline, appDialogContent, appInput, appTextarea } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  isPublished: boolean;
  title: string;
  content: string;
}

export function AnnouncementActions({ id, isPublished, title, content }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleAnnouncementPublished(id);
      const err = (res as { error?: string }).error;
      if (err) toast.error(err);
      else toast.success(isPublished ? "Moved to drafts." : "Published!");
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      const err = (res as { error?: string }).error;
      if (err) toast.error(err);
      else toast.success("Announcement deleted.");
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", editTitle);
    fd.set("content", editContent);
    fd.set("isPublished", isPublished ? "true" : "false");

    startTransition(async () => {
      const res = await updateAnnouncement(id, fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Announcement updated.");
        setEditOpen(false);
      }
    });
  };

  return (
    <>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button
          size="sm"
          variant="outline"
          className={cn(appButtonOutline, "text-xs")}
          onClick={handleToggle}
          disabled={isPending}
          title={isPublished ? "Unpublish" : "Publish"}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublished ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          <span className="ml-1 hidden sm:inline">
            {isPublished ? "Unpublish" : "Publish"}
          </span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className={cn(appButtonOutline, "text-xs")}
          onClick={() => setEditOpen(true)}
          disabled={isPending}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="ml-1 hidden sm:inline">Edit</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="border-red-500/40 bg-red-950/20 text-xs text-red-300 hover:bg-red-950/35 hover:text-red-200"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="ml-1 hidden sm:inline">Delete</span>
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className={cn(appDialogContent, "sm:max-w-lg")}>
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-zinc-400">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                disabled={isPending}
                className={appInput}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-content" className="text-zinc-400">
                Content
              </Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                required
                disabled={isPending}
                className={cn(appTextarea, "min-h-[120px] resize-none")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={isPending}
                className={appButtonOutline}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-500">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
