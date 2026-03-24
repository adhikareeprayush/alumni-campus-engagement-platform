import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users, ExternalLink, Building2, Calendar } from "lucide-react";

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time", INTERNSHIP: "Internship",
  CONTRACT: "Contract", FREELANCE: "Freelance",
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

  const isOwner = session?.user.id === job.postedById ||
    session?.user.role === "ADMIN" ||
    session?.user.role === "FACULTY";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/jobs"><ArrowLeft className="mr-1 h-4 w-4" /> Back to jobs</Link>
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <div className="mt-1 flex items-center gap-1.5 text-gray-600">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.company}</span>
              </div>
            </div>
            <Badge variant={job.isActive ? "success" : "outline"}>
              {job.isActive ? JOB_TYPE_LABEL[job.type] ?? job.type : "Closed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Deadline: {formatDate(job.deadline)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {job._count.applications} applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Posted {formatDate(job.createdAt)}
            </span>
          </div>

          <Separator />

          {/* Description */}
          {job.description && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{job.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {job.isActive && (
              <>
                {job.applyLink ? (
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <ApplyButton jobId={job.id} hasApplied={hasApplied} isActive={job.isActive} />
                )}
              </>
            )}
            {isOwner && (
              <form action={`/api/jobs/${job.id}/toggle`} method="POST">
                <Button variant="outline" size="sm" type="submit">
                  {job.isActive ? "Close listing" : "Reopen listing"}
                </Button>
              </form>
            )}
          </div>

          <Separator />
          <p className="text-xs text-gray-400">Posted by {job.postedBy.name}</p>
        </CardContent>
      </Card>
    </div>
  );
}
