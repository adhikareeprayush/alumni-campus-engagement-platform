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
        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        onClick={handleVerify}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
        Verify
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-300 text-red-600 hover:bg-red-50"
        onClick={handleReject}
        disabled={isPending}
      >
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
