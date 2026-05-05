"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/actions/auth";
import { cn, safeInternalPath } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { AuthShell } from "@/components/auth/AuthShell";

const inputDark =
  "border-white/12 bg-white/[0.06] text-white placeholder:text-zinc-500 focus-visible:border-teal-400/45 focus-visible:ring-teal-400/25 focus-visible:ring-offset-0";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safeInternalPath(searchParams.get("callbackUrl"));
  const registered = searchParams.get("registered") === "true";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginUser({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.assign(callbackUrl);
      }
    });
  };

  return (
    <AuthShell
      title="Sign in"
      description={
        <>
          Continue to <span className="text-zinc-200">{BRAND.siteName}</span> — {BRAND.institutionShort}.
        </>
      }
      alternatePrompt="New here?"
      alternateLinkText="Create an account"
      alternateHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {registered && (
          <div className="rounded-xl border border-teal-500/25 bg-teal-500/10 px-3 py-3 text-sm text-teal-100">
            Account created. Sign in with your email and password.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@mvtu.demo.edu"
            required
            autoComplete="email"
            disabled={isPending}
            className={cn("h-11 rounded-xl", inputDark)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={isPending}
            className={cn("h-11 rounded-xl", inputDark)}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 font-semibold text-white shadow-lg shadow-teal-950/50 transition-opacity hover:opacity-[0.96]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
