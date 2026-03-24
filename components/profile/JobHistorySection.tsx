"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addJobHistory, updateJobHistory, deleteJobHistory } from "@/lib/actions/profile";
import { Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react";

type Job = {
  id: string;
  company: string;
  jobTitle: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
};

interface Props {
  profileId: string;
  jobs: Job[];
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date));
}

function toInputDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function JobForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial?: Job;
  onSubmit: (data: Parameters<typeof addJobHistory>[0]) => void;
  isPending: boolean;
}) {
  const [isCurrent, setIsCurrent] = useState(initial?.isCurrent ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      company: fd.get("company") as string,
      jobTitle: fd.get("jobTitle") as string,
      location: fd.get("location") as string,
      startDate: fd.get("startDate") as string,
      endDate: isCurrent ? undefined : (fd.get("endDate") as string) || undefined,
      isCurrent,
      description: fd.get("description") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input id="jobTitle" name="jobTitle" defaultValue={initial?.jobTitle} required placeholder="Software Engineer" disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company *</Label>
          <Input id="company" name="company" defaultValue={initial?.company} required placeholder="Leapfrog Technology" disabled={isPending} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={initial?.location ?? ""} placeholder="Kathmandu, Nepal" disabled={isPending} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toInputDate(initial?.startDate ?? null)} required disabled={isPending} />
        </div>
        {!isCurrent && (
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" name="endDate" type="date" defaultValue={toInputDate(initial?.endDate ?? null)} disabled={isPending} />
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        I currently work here
      </label>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} placeholder="Key responsibilities and achievements..." rows={3} disabled={isPending} />
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function JobHistorySection({ profileId: _profileId, jobs: initialJobs }: Props) {
  const [jobs, setJobs] = useState(initialJobs);
  const [openAdd, setOpenAdd] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (data: Parameters<typeof addJobHistory>[0]) => {
    startTransition(async () => {
      const res = await addJobHistory(data);
      if (res?.error) { toast.error(res.error); return; }
      toast.success("Experience added.");
      setOpenAdd(false);
      // optimistic: refresh via revalidatePath in server action
    });
  };

  const handleUpdate = (data: Parameters<typeof addJobHistory>[0]) => {
    if (!editJob) return;
    startTransition(async () => {
      const res = await updateJobHistory(editJob.id, data);
      if (res?.error) { toast.error(res.error); return; }
      toast.success("Experience updated.");
      setEditJob(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteJobHistory(id);
      if (res?.error) { toast.error(res.error); return; }
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Experience removed.");
    });
  };

  return (
    <div className="space-y-4">
      {jobs.length === 0 && (
        <p className="text-sm text-gray-400">No work experience added yet.</p>
      )}
      {jobs.map((job, idx) => (
        <div key={job.id}>
          {idx > 0 && <Separator className="mb-4" />}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Briefcase className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{job.jobTitle}</p>
                {job.isCurrent && <Badge variant="success" className="text-xs">Current</Badge>}
              </div>
              <p className="text-sm text-gray-600">{job.company}</p>
              <p className="text-xs text-gray-400">
                {formatMonthYear(job.startDate)} — {job.isCurrent ? "Present" : job.endDate ? formatMonthYear(job.endDate) : ""}
                {job.location && ` · ${job.location}`}
              </p>
              {job.description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{job.description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Dialog open={editJob?.id === job.id} onOpenChange={(o) => !o && setEditJob(null)}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditJob(job)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Edit Experience</DialogTitle></DialogHeader>
                  <JobForm initial={job} onSubmit={handleUpdate} isPending={isPending} />
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(job.id)} disabled={isPending}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Experience
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Work Experience</DialogTitle></DialogHeader>
          <JobForm onSubmit={handleAdd} isPending={isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
