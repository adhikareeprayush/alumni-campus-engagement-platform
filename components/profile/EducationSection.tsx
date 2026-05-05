"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { addEducation, updateEducation, deleteEducation } from "@/lib/actions/profile";
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";
import { appButtonOutline, appDialogContent, appInput } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

type Edu = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  startYear: number;
  endYear: number | null;
  isOngoing: boolean;
};

interface Props {
  education: Edu[];
}

function EduForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial?: Edu;
  onSubmit: (data: Parameters<typeof addEducation>[0]) => void;
  isPending: boolean;
}) {
  const [isOngoing, setIsOngoing] = useState(initial?.isOngoing ?? false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      institution: fd.get("institution") as string,
      degree: fd.get("degree") as string,
      field: fd.get("field") as string,
      startYear: parseInt(fd.get("startYear") as string, 10),
      endYear: isOngoing ? undefined : parseInt(fd.get("endYear") as string, 10) || undefined,
      isOngoing,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="institution" className="text-zinc-400">
          Institution *
        </Label>
        <Input
          id="institution"
          name="institution"
          defaultValue={initial?.institution}
          required
          placeholder="Meridian Valley Technical University"
          disabled={isPending}
          className={appInput}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="degree" className="text-zinc-400">
            Degree *
          </Label>
          <Input id="degree" name="degree" defaultValue={initial?.degree} required placeholder="B.E." disabled={isPending} className={appInput} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="field" className="text-zinc-400">
            Field of Study
          </Label>
          <Input
            id="field"
            name="field"
            defaultValue={initial?.field ?? ""}
            placeholder="Computer Engineering"
            disabled={isPending}
            className={appInput}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startYear" className="text-zinc-400">
            Start Year *
          </Label>
          <Input
            id="startYear"
            name="startYear"
            type="number"
            min={1970}
            max={currentYear}
            defaultValue={initial?.startYear}
            required
            disabled={isPending}
            className={appInput}
          />
        </div>
        {!isOngoing && (
          <div className="space-y-1.5">
            <Label htmlFor="endYear" className="text-zinc-400">
              End Year
            </Label>
            <Input
              id="endYear"
              name="endYear"
              type="number"
              min={1970}
              max={currentYear + 6}
              defaultValue={initial?.endYear ?? ""}
              disabled={isPending}
              className={appInput}
            />
          </div>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={isOngoing} onChange={(e) => setIsOngoing(e.target.checked)} className="h-4 w-4 rounded border-zinc-600" />
        Currently studying here
      </label>
      <DialogFooter>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-500" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EducationSection({ education: initialEdu }: Props) {
  const [education, setEducation] = useState(initialEdu);
  const [openAdd, setOpenAdd] = useState(false);
  const [editEdu, setEditEdu] = useState<Edu | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (data: Parameters<typeof addEducation>[0]) => {
    startTransition(async () => {
      const res = await addEducation(data);
      if (res?.error) { toast.error(res.error); return; }
      toast.success("Education added.");
      setOpenAdd(false);
    });
  };

  const handleUpdate = (data: Parameters<typeof addEducation>[0]) => {
    if (!editEdu) return;
    startTransition(async () => {
      const res = await updateEducation(editEdu.id, data);
      if (res?.error) { toast.error(res.error); return; }
      toast.success("Education updated.");
      setEditEdu(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteEducation(id);
      if (res?.error) { toast.error(res.error); return; }
      setEducation((prev) => prev.filter((e) => e.id !== id));
      toast.success("Education removed.");
    });
  };

  return (
    <div className="space-y-4">
      {education.length === 0 && (
        <p className="text-sm text-zinc-500">No education entries added yet.</p>
      )}
      {education.map((edu, idx) => (
        <div key={edu.id}>
          {idx > 0 && <Separator className="mb-4 bg-zinc-700/50" />}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/90 ring-1 ring-zinc-600/50">
              <GraduationCap className="h-4 w-4 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-50">{edu.institution}</p>
              <p className="text-sm text-zinc-400">{edu.degree}{edu.field && ` in ${edu.field}`}</p>
              <p className="text-xs text-zinc-500">
                {edu.startYear} — {edu.isOngoing ? "Ongoing" : (edu.endYear ?? "")}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Dialog open={editEdu?.id === edu.id} onOpenChange={(o) => !o && setEditEdu(null)}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => setEditEdu(edu)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn(appDialogContent)}>
                  <DialogHeader>
                    <DialogTitle className="text-zinc-50">Edit Education</DialogTitle>
                  </DialogHeader>
                  <EduForm initial={edu} onSubmit={handleUpdate} isPending={isPending} />
                </DialogContent>
              </Dialog>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-400 hover:bg-red-500/15 hover:text-red-300"
                onClick={() => handleDelete(edu.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={appButtonOutline}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Education
          </Button>
        </DialogTrigger>
        <DialogContent className={cn(appDialogContent)}>
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Add Education</DialogTitle>
          </DialogHeader>
          <EduForm onSubmit={handleAdd} isPending={isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
