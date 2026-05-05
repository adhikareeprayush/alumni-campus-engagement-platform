"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/actions/settings";
import { Loader2, KeyRound } from "lucide-react";
import { appInput } from "@/lib/app-ui";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePassword(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully.");
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-zinc-400">
          Current password
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          autoComplete="current-password"
          className={appInput}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-zinc-400">
          New password
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          autoComplete="new-password"
          className={appInput}
        />
        <p className="text-xs text-zinc-500">
          At least 8 characters, one uppercase letter, and one number.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-zinc-400">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          autoComplete="new-password"
          className={appInput}
        />
      </div>

      <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-500">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="mr-2 h-4 w-4" />
        )}
        Change password
      </Button>
    </form>
  );
}
