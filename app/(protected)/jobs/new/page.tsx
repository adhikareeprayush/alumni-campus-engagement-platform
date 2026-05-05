"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createJobPosting } from "@/lib/actions/jobs";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { appGhostBtn, appInput, appPanel, appTextarea } from "@/lib/app-ui";
import { BRAND } from "@/lib/brand";

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
];

const selectDark =
  "h-10 w-full rounded-lg border-zinc-600/50 bg-zinc-800/50 text-zinc-100 focus:ring-teal-500/35";

const labelCls = "text-zinc-400";

export default function NewJobPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobType, setJobType] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createJobPosting({
        title: fd.get("title") as string,
        company: fd.get("company") as string,
        location: fd.get("location") as string,
        type: jobType as "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE",
        description: fd.get("description") as string,
        applyLink: fd.get("applyLink") as string,
        deadline: fd.get("deadline") as string,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Job posted successfully!");
        router.push("/jobs");
      }
    });
  };

  const outlineBtn = "border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className={appGhostBtn}>
        <Link href="/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> Back to jobs
        </Link>
      </Button>

      <Card className={appPanel}>
        <CardHeader>
          <CardTitle className="text-zinc-50">Post a job / internship</CardTitle>
          <CardDescription className="text-zinc-500">
            Share an opportunity with the {BRAND.siteName} network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className={labelCls}>
                  Job title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Software Engineer"
                  disabled={isPending}
                  className={appInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className={labelCls}>
                  Company *
                </Label>
                <Input
                  id="company"
                  name="company"
                  required
                  placeholder="Company name"
                  disabled={isPending}
                  className={appInput}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelCls}>Job type *</Label>
                <Select value={jobType} onValueChange={setJobType} required>
                  <SelectTrigger className={selectDark}>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className={labelCls}>
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City / Remote"
                  disabled={isPending}
                  className={appInput}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className={labelCls}>
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Responsibilities, requirements, compensation…"
                rows={5}
                disabled={isPending}
                className={appTextarea}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="applyLink" className={labelCls}>
                  Apply link
                </Label>
                <Input
                  id="applyLink"
                  name="applyLink"
                  type="url"
                  placeholder="https://…"
                  disabled={isPending}
                  className={appInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className={labelCls}>
                  Application deadline
                </Label>
                <Input id="deadline" name="deadline" type="date" disabled={isPending} className={appInput} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-500" disabled={isPending || !jobType}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Posting…
                  </>
                ) : (
                  "Post job"
                )}
              </Button>
              <Button type="button" variant="outline" className={outlineBtn} onClick={() => router.push("/jobs")} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
