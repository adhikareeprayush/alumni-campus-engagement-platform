import { db } from "@/lib/db";

export type PublicHomeStats = {
  verifiedAlumni: number;
  activeJobs: number;
  publishedEvents: number;
  students: number;
};

/** Safe fallback when DB is down or migrations are missing (avoids blank 500 pages). */
export const EMPTY_PUBLIC_STATS: PublicHomeStats = {
  verifiedAlumni: 0,
  activeJobs: 0,
  publishedEvents: 0,
  students: 0,
};

export async function getPublicHomeStats(): Promise<PublicHomeStats> {
  try {
    const [verifiedAlumni, activeJobs, publishedEvents, students] = await Promise.all([
      db.alumniProfile.count({ where: { isVerified: true } }),
      db.jobPosting.count({ where: { isActive: true } }),
      db.event.count({ where: { isPublished: true } }),
      db.studentProfile.count(),
    ]);

    return {
      verifiedAlumni,
      activeJobs,
      publishedEvents,
      students,
    };
  } catch (err) {
    console.error("[getPublicHomeStats]", err);
    return EMPTY_PUBLIC_STATS;
  }
}
