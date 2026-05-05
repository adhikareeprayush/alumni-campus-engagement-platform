import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import {
  appEmptyState,
  appPageSubtitle,
  appPageTitle,
  appPillActive,
  appPillIdle,
  appPrimaryBtn,
} from "@/lib/app-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Jobs & Internships" };

interface SearchParams {
  type?: string;
  search?: string;
}

async function getJobs(params: SearchParams) {
  return db.jobPosting.findMany({
    where: {
      isActive: true,
      ...(params.type ? { type: params.type as never } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search } },
              { company: { contains: params.search } },
              { location: { contains: params.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      postedBy: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    take: 50,
  });
}

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"];
const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const jobs = await getJobs(params);

  const canPost =
    session?.user.role === "ALUMNI" ||
    session?.user.role === "ADMIN" ||
    session?.user.role === "FACULTY";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={appPageTitle}>Jobs & internships</h1>
          <p className={appPageSubtitle}>
            Roles shared by {BRAND.siteName} alumni and campus partners.
          </p>
        </div>
        {canPost && (
          <Button asChild className={appPrimaryBtn}>
            <Link href="/jobs/new">
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Post a job
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/jobs" className={cn(!params.type ? appPillActive : appPillIdle)}>
          All
        </Link>
        {JOB_TYPES.map((t) => (
          <Link
            key={t}
            href={`/jobs?type=${t}`}
            className={cn(params.type === t ? appPillActive : appPillIdle)}
          >
            {JOB_TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className={appEmptyState}>
          <Briefcase className="mb-4 h-12 w-12 text-zinc-600" aria-hidden />
          <h2 className="text-lg font-semibold text-zinc-300">No jobs posted yet</h2>
          {canPost && (
            <p className="mt-2 text-sm text-zinc-500">
              Be the first to{" "}
              <Link href="/jobs/new" className="text-teal-400 hover:text-teal-300 hover:underline">
                post an opportunity
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              type={job.type}
              deadline={job.deadline}
              postedBy={job.postedBy.name}
              applicationCount={job._count.applications}
              isActive={job.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
