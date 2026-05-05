"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyForJob } from "@/lib/actions/jobs";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  jobId: string;
  hasApplied: boolean;
  isActive: boolean;
}

export function ApplyButton({ jobId, hasApplied, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  if (hasApplied) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-teal-400">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> Applied
      </div>
    );
  }

  const handleApply = () => {
    startTransition(async () => {
      const res = await applyForJob(jobId);
      if (res?.error) toast.error(res.error);
      else toast.success("Application submitted!");
    });
  };

  return (
    <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleApply} disabled={isPending || !isActive}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
      Apply via portal
    </Button>
  );
}
