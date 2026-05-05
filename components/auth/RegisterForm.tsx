"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { AuthShell } from "@/components/auth/AuthShell";
import { cn } from "@/lib/utils";

const PROGRAMS = [
  { value: "BCT", label: "BCT — Computer Engineering" },
  { value: "BEX", label: "BEX — Electronics Engineering" },
  { value: "BIT", label: "BIT — Information Technology" },
  { value: "BCE", label: "BCE — Civil Engineering" },
  { value: "BME", label: "BME — Mechanical Engineering" },
  { value: "BEE", label: "BEE — Electrical Engineering" },
  { value: "BAG", label: "BAG — Agriculture Engineering" },
  { value: "BAM", label: "BAM — Architecture" },
  { value: "OTHER", label: "Other" },
];

const currentYear = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

const inputDark =
  "border-white/12 bg-white/[0.06] text-white placeholder:text-zinc-500 focus-visible:border-teal-400/45 focus-visible:ring-teal-400/25 focus-visible:ring-offset-0";

const selectTriggerDark =
  "h-11 rounded-xl border-white/12 bg-white/[0.06] text-zinc-100 focus:ring-teal-400/25 focus:ring-offset-0";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"ALUMNI" | "STUDENT">("ALUMNI");
  const [program, setProgram] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerUser({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role,
        batchYear: parseInt(batchYear, 10),
        program: program as "BCT" | "BEX" | "BIT" | "BCE" | "BME" | "BEE" | "BAG" | "BAM" | "OTHER",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/login?registered=true");
      }
    });
  };

  return (
    <AuthShell
      wide
      title="Create an account"
      description={
        <>
          Join <span className="text-zinc-200">{BRAND.siteName}</span> for {BRAND.institutionShort}.
        </>
      }
      alternatePrompt="Already registered?"
      alternateLinkText="Sign in"
      alternateHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setRole("ALUMNI")}
            className={cn(
              "rounded-full py-2.5 text-sm font-semibold transition-all",
              role === "ALUMNI"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/40"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Alumni
          </button>
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={cn(
              "rounded-full py-2.5 text-sm font-semibold transition-all",
              role === "STUDENT"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/40"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Student
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Jordan Hayes"
            required
            disabled={isPending}
            className={cn("h-11 rounded-xl", inputDark)}
          />
        </div>

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
            placeholder="At least 8 characters"
            required
            minLength={8}
            disabled={isPending}
            className={cn("h-11 rounded-xl", inputDark)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Program</Label>
            <Select value={program} onValueChange={setProgram} required>
              <SelectTrigger className={selectTriggerDark}>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Batch year</Label>
            <Select value={batchYear} onValueChange={setBatchYear} required>
              <SelectTrigger className={selectTriggerDark}>
                <SelectValue placeholder="Year…" />
              </SelectTrigger>
              <SelectContent>
                {BATCH_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !program || !batchYear}
          className="h-12 w-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 font-semibold text-white shadow-lg shadow-teal-950/50 transition-opacity hover:opacity-[0.96] disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
