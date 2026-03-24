import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, GraduationCap } from "lucide-react";

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
      <div className="group flex h-full flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
              {name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span>{program} · {batchYear}</span>
            </div>
          </div>
          <Badge variant={isEmployed ? "success" : "outline"} className="shrink-0 text-xs">
            {isEmployed ? "Employed" : "Open"}
          </Badge>
        </div>

        {/* Current role */}
        {(currentJobTitle || currentCompany) && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">
              {currentJobTitle}
              {currentJobTitle && currentCompany && " at "}
              {currentCompany && <span className="font-medium">{currentCompany}</span>}
            </span>
          </div>
        )}

        {/* Location */}
        {(currentLocation || country) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{currentLocation || country}</span>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((s) => (
              <Badge key={s.name} variant="secondary" className="text-xs">
                {s.name}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="outline" className="text-xs text-gray-400">
                +{skills.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
