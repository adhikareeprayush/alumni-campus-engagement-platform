"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlumniFilters } from "@/components/alumni/AlumniFilters";
import type { Program } from "@/app/generated/prisma/client";

type SearchParams = {
  search?: string;
  program?: string;
  batch?: string;
  country?: string;
  employed?: string;
};

export function AlumniFiltersMobile({
  searchParams,
  allowedPrograms,
}: {
  searchParams: SearchParams;
  allowedPrograms?: Program[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Dialog key={JSON.stringify(searchParams)} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mb-4 gap-2 border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800"
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filters
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[min(90vh,32rem)] gap-0 overflow-y-auto rounded-2xl border-zinc-700/50 bg-zinc-900 p-0 text-zinc-100 sm:max-w-md">
          <DialogHeader className="border-b border-zinc-700/50 px-6 py-4 text-left">
            <DialogTitle className="text-lg font-semibold text-zinc-50">Directory filters</DialogTitle>
          </DialogHeader>
          <div className="p-5">
            <AlumniFilters searchParams={searchParams} allowedPrograms={allowedPrograms} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
