import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFacultyManagedPrograms } from "@/lib/faculty-scope";
import { getAnalytics } from "@/lib/analytics";
import { serializeAnalyticsForClient } from "@/lib/analytics-serialize";
import { AnalyticsExperience } from "@/components/analytics/AnalyticsExperience";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") redirect("/dashboard");

  const managedPrograms = await getFacultyManagedPrograms(session.user.id, session.user.role);
  const raw = await getAnalytics(managedPrograms);
  const data = serializeAnalyticsForClient(raw);

  return (
    <AnalyticsExperience
      data={data}
      facultyPrograms={managedPrograms}
      role={session.user.role}
    />
  );
}
