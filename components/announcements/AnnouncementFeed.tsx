import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { appGhostBtn, appIconTile, appPanel } from "@/lib/app-ui";

export type AnnouncementFeedItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { name: string };
};

function excerpt(text: string, max = 200) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type Props = {
  items: AnnouncementFeedItem[];
  compact?: boolean;
  viewAllHref?: string;
};

export function AnnouncementFeed({ items, compact = false, viewAllHref = "/announcements" }: Props) {
  if (items.length === 0) {
    return null;
  }

  const shown = compact ? items.slice(0, 5) : items;

  return (
    <Card className={appPanel}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={appIconTile} aria-hidden>
            <Megaphone className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold text-zinc-50">Announcements</CardTitle>
        </div>
        {compact && items.length > 0 && (
          <Button variant="ghost" size="sm" asChild className={appGhostBtn}>
            <Link href={viewAllHref}>
              View all <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        {shown.map((a) => (
          <article
            key={a.id}
            className={cn(
              "rounded-xl border border-zinc-700/40 bg-zinc-800/25 px-4 py-3",
              "transition-colors hover:border-zinc-600/50 hover:bg-zinc-800/40",
            )}
          >
            <h3 className="font-medium text-zinc-100">{a.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {formatDate(a.createdAt)} · {a.createdBy.name}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
              {compact ? excerpt(a.content) : a.content}
            </p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
