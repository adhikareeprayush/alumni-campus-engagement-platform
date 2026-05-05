"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertStaffProfile } from "@/lib/actions/staff-profile";
import { Loader2, Save } from "lucide-react";
import { appButtonOutline, appInput, appTextarea } from "@/lib/app-ui";
import { cn } from "@/lib/utils";
import type { StaffProfile } from "@/app/generated/prisma/client";

type StaffProfileFormProps = {
  initial: StaffProfile | null;
};

export function StaffProfileForm({ initial }: StaffProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertStaffProfile({
        title: (fd.get("title") as string) ?? "",
        department: (fd.get("department") as string) ?? "",
        phone: (fd.get("phone") as string) ?? "",
        officeLocation: (fd.get("officeLocation") as string) ?? "",
        bio: (fd.get("bio") as string) ?? "",
        linkedinUrl: (fd.get("linkedinUrl") as string) ?? "",
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Staff profile saved.");
        router.push("/profile");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400">
          Title / designation
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Assistant Professor, IT Coordinator"
          defaultValue={initial?.title ?? ""}
          maxLength={120}
          className={appInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department" className="text-zinc-400">
          Department
        </Label>
        <Input
          id="department"
          name="department"
          placeholder="e.g. Computer Engineering"
          defaultValue={initial?.department ?? ""}
          maxLength={120}
          className={appInput}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-zinc-400">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Contact number"
            defaultValue={initial?.phone ?? ""}
            maxLength={40}
            className={appInput}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="officeLocation" className="text-zinc-400">
            Office / room
          </Label>
          <Input
            id="officeLocation"
            name="officeLocation"
            placeholder="e.g. Block A, Room 201"
            defaultValue={initial?.officeLocation ?? ""}
            maxLength={200}
            className={appInput}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl" className="text-zinc-400">
          LinkedIn
        </Label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
          defaultValue={initial?.linkedinUrl ?? ""}
          maxLength={500}
          className={appInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-zinc-400">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          placeholder="Research interests, responsibilities, how you support alumni…"
          defaultValue={initial?.bio ?? ""}
          maxLength={4000}
          className={cn(appTextarea, "min-h-[120px] resize-y")}
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
