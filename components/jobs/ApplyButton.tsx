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
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
        <CheckCircle2 className="h-4 w-4" /> Applied
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
    <Button
      className="bg-indigo-600 hover:bg-indigo-700"
      onClick={handleApply}
      disabled={isPending || !isActive}
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Apply via Portal
    </Button>
  );
}
