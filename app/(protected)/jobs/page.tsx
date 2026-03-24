import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs & Internships</h1>
          <p className="mt-1 text-gray-500">Opportunities posted by IOE Purwanchal alumni.</p>
        </div>
        {canPost && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/jobs/new">
              <Plus className="mr-1 h-4 w-4" /> Post a Job
            </Link>
          </Button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/jobs"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            !params.type ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        {JOB_TYPES.map((t) => (
          <Link
            key={t}
            href={`/jobs?type=${t}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              params.type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {JOB_TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      {/* Job grid */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-24 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-500">No jobs posted yet</h2>
          {canPost && (
            <p className="mt-2 text-sm text-gray-400">
              Be the first to{" "}
              <Link href="/jobs/new" className="text-indigo-600 hover:underline">post an opportunity</Link>.
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
