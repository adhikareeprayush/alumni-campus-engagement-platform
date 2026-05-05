import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { toggleJobActiveFromForm } from "@/lib/actions/jobs";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users, ExternalLink, Building2, Calendar } from "lucide-react";
import { appGhostBtn, appPanel, appPrimaryBtn } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await db.jobPosting.findUnique({ where: { id }, select: { title: true } });
  return { title: job ? `${job.title} — Jobs` : "Job Details" };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const job = await db.jobPosting.findUnique({
    where: { id },
    include: {
      postedBy: { select: { name: true, id: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  const hasApplied = session
    ? !!(await db.jobApplication.findUnique({
        where: { jobId_userId: { jobId: id, userId: session.user.id } },
      }))
    : false;

  const canToggleListing =
    !!session && (session.user.id === job.postedById || session.user.role === "ADMIN");

  const outlineBtn = "border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className={appGhostBtn}>
        <Link href="/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> Back to jobs
        </Link>
      </Button>

      <Card className={appPanel}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-zinc-50">{job.title}</CardTitle>
              <div className="mt-1 flex items-center gap-1.5 text-zinc-400">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                <span className="font-medium text-zinc-200">{job.company}</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0",
                job.isActive
                  ? "border-teal-500/35 bg-teal-950/40 text-teal-100"
                  : "border-zinc-600 text-zinc-500",
              )}
            >
              {job.isActive ? JOB_TYPE_LABEL[job.type] ?? job.type : "Closed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {job.location}
              </span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" aria-hidden /> Deadline: {formatDate(job.deadline)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" aria-hidden /> {job._count.applications} applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden /> Posted {formatDate(job.createdAt)}
            </span>
          </div>

          <Separator className="bg-zinc-700/50" />

          {job.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{job.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {job.isActive && (
              <>
                {job.applyLink ? (
                  <Button asChild className={appPrimaryBtn}>
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply now <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                ) : (
                  <ApplyButton jobId={job.id} hasApplied={hasApplied} isActive={job.isActive} />
                )}
              </>
            )}
            {canToggleListing && (
              <form action={toggleJobActiveFromForm}>
                <input type="hidden" name="jobId" value={job.id} />
                <Button variant="outline" size="sm" type="submit" className={outlineBtn}>
                  {job.isActive ? "Close listing" : "Reopen listing"}
                </Button>
              </form>
            )}
          </div>

          <Separator className="bg-zinc-700/50" />
          <p className="text-xs text-zinc-500">Posted by {job.postedBy.name}</p>
        </CardContent>
      </Card>
    </div>
  );
}
