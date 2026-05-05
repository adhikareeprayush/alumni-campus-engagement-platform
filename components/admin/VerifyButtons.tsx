"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { verifyAlumni, rejectAlumni } from "@/lib/actions/admin";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  profileId: string;
}

export function VerifyButtons({ profileId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(async () => {
      const res = await verifyAlumni(profileId);
      const err = (res as { error?: string }).error;
      if (err) toast.error(err);
      else toast.success("Profile verified.");
    });
  };

  const handleReject = () => {
    if (!confirm("Reject and delete this profile? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await rejectAlumni(profileId);
      const err = (res as { error?: string }).error;
      if (err) toast.error(err);
      else toast.success("Profile rejected and removed.");
    });
  };

  return (
    <div className="flex shrink-0 gap-2">
      <Button
        size="sm"
        variant="outline"
        className="border-teal-500/40 bg-teal-950/40 text-teal-100 hover:bg-teal-900/50"
        onClick={handleVerify}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
        )}
        Verify
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-500/35 bg-red-950/30 text-red-200 hover:bg-red-950/50"
        onClick={handleReject}
        disabled={isPending}
      >
        <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
        Reject
      </Button>
    </div>
  );
}
