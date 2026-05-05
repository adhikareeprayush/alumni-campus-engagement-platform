"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateName } from "@/lib/actions/settings";
import { Loader2, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { appInput } from "@/lib/app-ui";

interface Props {
  currentName: string;
}

export function NameForm({ currentName }: Props) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const { update: updateSession } = useSession();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateName(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Display name updated.");
        // Refresh JWT so the Header name updates immediately
        await updateSession();
      }
    });
  };

  const isDirty = name.trim() !== currentName;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-zinc-400">
          Display name
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          disabled={isPending}
          className={appInput}
        />
        <p className="text-xs text-zinc-500">This is the name shown across the platform.</p>
      </div>
      <Button type="submit" disabled={isPending || !isDirty} className="bg-teal-600 hover:bg-teal-500">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Save name
      </Button>
    </form>
  );
}
