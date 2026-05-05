import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Program } from "@/app/generated/prisma/client";
import { appInput, appLabel, appSelect } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

const outlineBtn =
  "border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800 hover:text-white";

interface AlumniFiltersProps {
  searchParams: {
    search?: string;
    program?: string;
    batch?: string;
    country?: string;
    employed?: string;
  };
  allowedPrograms?: Program[];
}

const ALL_PROGRAMS: Program[] = ["BCT", "BEX", "BIT", "BCE", "BME", "BEE", "BAG", "BAM", "OTHER"];
const currentYear = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

export function AlumniFilters({ searchParams, allowedPrograms }: AlumniFiltersProps) {
  const programOptions = allowedPrograms && allowedPrograms.length > 0 ? allowedPrograms : ALL_PROGRAMS;

  return (
    <form method="GET" action="/alumni" className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="search" className={appLabel}>
          Search
        </Label>
        <Input
          id="search"
          name="search"
          defaultValue={searchParams.search}
          placeholder="Name, company, skill…"
          className={cn(appInput, "h-9")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className={appLabel}>Program</Label>
        <select name="program" defaultValue={searchParams.program ?? ""} className={cn(appSelect, "h-9")}>
          <option value="">
            {allowedPrograms && allowedPrograms.length > 0 ? "All your programs" : "All programs"}
          </option>
          {programOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {allowedPrograms && allowedPrograms.length > 0 && (
          <p className="text-[10px] text-zinc-500">Limited to programs you manage.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className={appLabel}>Batch year</Label>
        <select name="batch" defaultValue={searchParams.batch ?? ""} className={cn(appSelect, "h-9")}>
          <option value="">All batches</option>
          {BATCH_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className={appLabel}>Country</Label>
        <select name="country" defaultValue={searchParams.country ?? ""} className={cn(appSelect, "h-9")}>
          <option value="">All countries</option>
          <option value="Nepal">Nepal</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Australia">Australia</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
          <option value="Japan">Japan</option>
          <option value="UAE">UAE</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className={appLabel}>Status</Label>
        <select name="employed" defaultValue={searchParams.employed ?? ""} className={cn(appSelect, "h-9")}>
          <option value="">All</option>
          <option value="true">Employed</option>
          <option value="false">Not employed</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-500">
          Apply
        </Button>
        <Button type="reset" size="sm" variant="outline" asChild className={outlineBtn}>
          <Link href="/alumni">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
