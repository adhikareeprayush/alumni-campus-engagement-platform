import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildUrl: (page: number) => string;
  className?: string;
}

const btnOutline =
  "border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800 hover:text-white";

const btnActive = "border-teal-600 bg-teal-600 text-white hover:bg-teal-500 hover:text-white";

export function Pagination({ page, totalPages, buildUrl, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageArray(page, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <Button variant="outline" size="sm" asChild disabled={page <= 1} className={btnOutline}>
        <Link href={buildUrl(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-zinc-500">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant="outline"
            size="sm"
            asChild
            className={p === page ? btnActive : btnOutline}
          >
            <Link href={buildUrl(p as number)}>{p}</Link>
          </Button>
        ),
      )}

      <Button variant="outline" size="sm" asChild disabled={page >= totalPages} className={btnOutline}>
        <Link href={buildUrl(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}

function buildPageArray(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
