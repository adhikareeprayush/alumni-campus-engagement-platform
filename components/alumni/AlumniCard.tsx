import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlumniCardProps {
  id: string;
  name: string;
  program: string;
  batchYear: number;
  currentJobTitle: string | null;
  currentCompany: string | null;
  currentLocation: string | null;
  country: string;
  isEmployed: boolean;
  skills: { name: string }[];
}

export function AlumniCard({
  id,
  name,
  program,
  batchYear,
  currentJobTitle,
  currentCompany,
  currentLocation,
  country,
  isEmployed,
  skills,
}: AlumniCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/alumni/${id}`} className="block">
      <div
        className={cn(
          "group flex h-full flex-col rounded-2xl border border-zinc-700/50 bg-zinc-900/60 p-5 shadow-sm shadow-black/20 backdrop-blur-md transition-all",
          "hover:border-teal-600/35 hover:bg-zinc-900/80",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-600/50 text-sm font-bold text-teal-200">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-50 transition-colors group-hover:text-teal-300">{name}</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <GraduationCap className="h-3 w-3 shrink-0" aria-hidden />
              <span>
                {program} · {batchYear}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 border text-xs",
              isEmployed
                ? "border-teal-500/35 bg-teal-950/40 text-teal-200"
                : "border-zinc-600 bg-zinc-800/80 text-zinc-400",
            )}
          >
            {isEmployed ? "Employed" : "Open"}
          </Badge>
        </div>

        {(currentJobTitle || currentCompany) && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
            <span className="truncate">
              {currentJobTitle}
              {currentJobTitle && currentCompany && " at "}
              {currentCompany && <span className="font-medium text-zinc-300">{currentCompany}</span>}
            </span>
          </div>
        )}

        {(currentLocation || country) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{currentLocation || country}</span>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((s) => (
              <Badge
                key={s.name}
                variant="outline"
                className="border-zinc-600/60 bg-zinc-800/50 text-xs text-zinc-300"
              >
                {s.name}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-500">
                +{skills.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
