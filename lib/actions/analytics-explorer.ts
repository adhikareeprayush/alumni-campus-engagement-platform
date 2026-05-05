"use server";

import { auth } from "@/lib/auth";
import { getFacultyManagedPrograms } from "@/lib/faculty-scope";
import { searchAlumniForAnalytics } from "@/lib/analytics";

export async function analyticsExplorerSearch(params: {
  q: string;
  programFilter: string;
  page: number;
  pageSize: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
    return { error: "Forbidden" as const };
  }

  const managedPrograms = await getFacultyManagedPrograms(session.user.id, session.user.role);
  const take = Math.min(50, Math.max(5, params.pageSize));
  const skip = Math.max(0, params.page - 1) * take;

  const { rows, total } = await searchAlumniForAnalytics(managedPrograms, {
    q: params.q,
    programFilter: params.programFilter,
    skip,
    take,
  });

  return {
    rows,
    total,
    page: params.page,
    pageSize: take,
  };
}
