import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string;
  deadline: Date | null;
  postedBy: string;
  applicationCount: number;
  isActive: boolean;
}

function daysLeft(deadline: Date) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return "Expired";
  if (diff === 0) return "Today";
  return `${diff}d left`;
}

export function JobCard({
  id,
  title,
  company,
  location,
  type,
  deadline,
  postedBy,
  applicationCount,
  isActive,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`} className="block">
      <div
        className={cn(
          "group flex flex-col rounded-2xl border border-zinc-700/50 bg-zinc-900/60 p-5 shadow-sm shadow-black/20 backdrop-blur-md transition-all",
          "hover:border-teal-600/35 hover:bg-zinc-900/80",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-50 transition-colors group-hover:text-teal-300">{title}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
              <span className="truncate">{company}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-zinc-600/60 bg-zinc-800/80 text-xs text-zinc-200"
          >
            {JOB_TYPE_LABEL[type] ?? type}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden /> {location}
            </span>
          )}
          {deadline && (
            <span
              className={cn(
                "flex items-center gap-1",
                daysLeft(deadline) === "Expired" ? "text-red-400/90" : "",
              )}
            >
              <Clock className="h-3 w-3" aria-hidden /> {daysLeft(deadline)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" aria-hidden />
            {applicationCount} applied
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-600">Posted by {postedBy}</p>

        {!isActive && (
          <div className="mt-2">
            <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-500">
              Closed
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
