import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink, Building2 } from "lucide-react";

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

const JOB_TYPE_COLOR: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  FULL_TIME: "default",
  INTERNSHIP: "success",
  PART_TIME: "secondary",
  CONTRACT: "warning",
  FREELANCE: "outline",
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
      <div className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
              {title}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{company}</span>
            </div>
          </div>
          <Badge variant={isActive ? JOB_TYPE_COLOR[type] ?? "outline" : "outline"} className="shrink-0">
            {JOB_TYPE_LABEL[type] ?? type}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </span>
          )}
          {deadline && (
            <span className={`flex items-center gap-1 ${daysLeft(deadline) === "Expired" ? "text-red-400" : ""}`}>
              <Clock className="h-3 w-3" /> {daysLeft(deadline)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {applicationCount} applied
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-400">Posted by {postedBy}</p>

        {!isActive && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs text-gray-400">Closed</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
