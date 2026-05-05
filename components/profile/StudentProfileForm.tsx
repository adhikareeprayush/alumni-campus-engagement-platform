"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStudentProfile } from "@/lib/actions/student-profile";
import { Loader2, Save } from "lucide-react";
import { appButtonOutline, appInput, appSelect } from "@/lib/app-ui";
import type { StudentProfile } from "@/app/generated/prisma/client";

const PROGRAMS = [
  { value: "BCT", label: "BCT" },
  { value: "BEX", label: "BEX" },
  { value: "BIT", label: "BIT" },
  { value: "BCE", label: "BCE" },
  { value: "BME", label: "BME" },
  { value: "BEE", label: "BEE" },
  { value: "BAG", label: "BAG" },
  { value: "BAM", label: "BAM" },
  { value: "OTHER", label: "Other" },
];

const currentYear = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

type Props = {
  initial: StudentProfile;
};

export function StudentProfileForm({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [program, setProgram] = useState(initial.program);
  const [batchYear, setBatchYear] = useState(String(initial.batchYear));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateStudentProfile({
        batchYear,
        program,
        rollNumber: (fd.get("rollNumber") as string) ?? "",
      });
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Profile updated.");
        router.push("/profile");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-zinc-400">Program</Label>
          <Select value={program} onValueChange={(v) => setProgram(v as typeof program)} required>
            <SelectTrigger className={appSelect}>
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="batchYear" className="text-zinc-400">
            Batch year
          </Label>
          <Select value={batchYear} onValueChange={setBatchYear} required>
            <SelectTrigger id="batchYear" className={appSelect}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {BATCH_YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rollNumber" className="text-zinc-400">
          Roll number (optional)
        </Label>
        <Input
          id="rollNumber"
          name="rollNumber"
          defaultValue={initial.rollNumber ?? ""}
          maxLength={40}
          placeholder="Campus roll number"
          className={appInput}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-500">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-2">Save</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={appButtonOutline}
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
