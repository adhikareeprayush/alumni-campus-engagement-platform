import type { Program, Role } from "@/app/generated/prisma/client";
import type { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";

const PROGRAM_VALUES = new Set<string>([
  "BCT",
  "BEX",
  "BIT",
  "BCE",
  "BME",
  "BEE",
  "BAG",
  "BAM",
  "OTHER",
]);

/** `null` = unrestricted (campus admin). Array (possibly empty) = faculty scope. */
export async function getFacultyManagedPrograms(
  userId: string,
  role: Role,
): Promise<Program[] | null> {
  if (role === "ADMIN") return null;
  if (role !== "FACULTY") return null;

  const rows = await db.facultyManagedProgram.findMany({
    where: { userId },
    select: { program: true },
  });
  return rows.map((r) => r.program);
}

export function alumniProgramWhere(managed: Program[] | null): Prisma.AlumniProfileWhereInput {
  if (managed === null) return {};
  if (managed.length === 0) return { program: { in: [] } };
  return { program: { in: managed } };
}

/** Directory list: intersect URL `program` filter with faculty-managed programs. */
export function directoryAlumniProgramFilter(
  managed: Program[] | null,
  paramProgram?: string,
): Prisma.AlumniProfileWhereInput {
  if (managed === null) {
    return paramProgram && PROGRAM_VALUES.has(paramProgram)
      ? { program: paramProgram as Program }
      : {};
  }
  if (managed.length === 0) return { program: { in: [] } };
  if (
    paramProgram &&
    PROGRAM_VALUES.has(paramProgram) &&
    managed.includes(paramProgram as Program)
  ) {
    return { program: paramProgram as Program };
  }
  return { program: { in: managed } };
}

export function studentProgramWhere(managed: Program[] | null): Prisma.StudentProfileWhereInput {
  if (managed === null) return {};
  if (managed.length === 0) return { program: { in: [] } };
  return { program: { in: managed } };
}

/** Safe SQL fragment: ` AND program IN (...)` or ` AND alias.program IN (...)`. Empty managed = no filter. */
export function sqlProgramInClause(managed: Program[] | null, columnRef: string): string {
  if (managed === null) return "";
  const safe = managed.filter((p) => PROGRAM_VALUES.has(p));
  if (safe.length === 0) return " AND 1=0";
  const list = safe.map((p) => `'${p}'`).join(",");
  return ` AND ${columnRef} IN (${list})`;
}

/** Whether faculty may act on this alumni profile (verify/reject). */
export async function facultyCanAccessAlumniProfile(
  facultyUserId: string,
  role: Role,
  profileProgram: Program,
): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (role !== "FACULTY") return false;
  const managed = await db.facultyManagedProgram.findMany({
    where: { userId: facultyUserId },
    select: { program: true },
  });
  if (managed.length === 0) return false;
  return managed.some((m) => m.program === profileProgram);
}
