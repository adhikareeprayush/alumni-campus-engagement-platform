import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Program } from "@/app/generated/prisma/client";

interface AlumniFiltersProps {
  searchParams: {
    search?: string;
    program?: string;
    batch?: string;
    country?: string;
    employed?: string;
  };
  /** When set (faculty), only these programs appear in the program filter. */
  allowedPrograms?: Program[];
}

const ALL_PROGRAMS: Program[] = [
  "BCT",
  "BEX",
  "BIT",
  "BCE",
  "BME",
  "BEE",
  "BAG",
  "BAM",
  "OTHER",
];
const currentYear = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

export function AlumniFilters({ searchParams, allowedPrograms }: AlumniFiltersProps) {
  const programOptions =
    allowedPrograms && allowedPrograms.length > 0
      ? allowedPrograms
      : ALL_PROGRAMS;

  return (
    <form method="GET" action="/alumni" className="space-y-4">
      {/* Search */}
      <div className="space-y-1.5">
        <Label htmlFor="search" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Search
        </Label>
        <Input
          id="search"
          name="search"
          defaultValue={searchParams.search}
          placeholder="Name, company, skill..."
          className="text-sm"
        />
      </div>

      {/* Program */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Program</Label>
        <select
          name="program"
          defaultValue={searchParams.program ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">
            {allowedPrograms && allowedPrograms.length > 0
              ? "All your programs"
              : "All programs"}
          </option>
          {programOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {allowedPrograms && allowedPrograms.length > 0 && (
          <p className="text-[10px] text-muted-foreground">Limited to programs you manage.</p>
        )}
      </div>

      {/* Batch year */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch Year</Label>
        <select
          name="batch"
          defaultValue={searchParams.batch ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All batches</option>
          {BATCH_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country</Label>
        <select
          name="country"
          defaultValue={searchParams.country ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
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

      {/* Employment */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</Label>
        <select
          name="employed"
          defaultValue={searchParams.employed ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All</option>
          <option value="true">Employed</option>
          <option value="false">Not employed</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Apply
        </Button>
        <Button type="reset" size="sm" variant="outline" asChild>
          <a href="/alumni">Clear</a>
        </Button>
      </div>
    </form>
  );
}
