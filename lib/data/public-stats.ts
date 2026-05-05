import { db } from "@/lib/db";

export async function getPublicHomeStats() {
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
}
