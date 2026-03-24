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

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
];

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/jobs"><ArrowLeft className="mr-1 h-4 w-4" /> Back to jobs</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Post a Job / Internship</CardTitle>
          <CardDescription>Share an opportunity with the IOE Purwanchal community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="title" name="title" required placeholder="Software Engineer" disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" name="company" required placeholder="Your Company" disabled={isPending} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Job Type *</Label>
                <Select value={jobType} onValueChange={setJobType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Kathmandu / Remote" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Job responsibilities, requirements, compensation..." rows={5} disabled={isPending} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="applyLink">Apply Link</Label>
                <Input id="applyLink" name="applyLink" type="url" placeholder="https://..." disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input id="deadline" name="deadline" type="date" disabled={isPending} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isPending || !jobType}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post Job"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/jobs")} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
