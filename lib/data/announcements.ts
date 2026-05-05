import { db } from "@/lib/db";

export async function getPublishedAnnouncements(limit?: number) {
  return db.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit ?? 100,
    include: { createdBy: { select: { name: true } } },
  });
}
