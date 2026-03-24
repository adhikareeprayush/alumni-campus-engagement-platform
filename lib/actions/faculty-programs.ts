"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Program } from "@/app/generated/prisma/client";

const ALL: Program[] = [
  "BCT",
  "BEX",
  "BIT",
  "BCE",
  "BME",
  "BEE",
  "BAG",
  "BAM",
  "OTHER",
];

async function requireCampusAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized.");
  if (session.user.role !== "ADMIN") throw new Error("Only campus admins can manage faculty program access.");
  return session;
}

export async function addFacultyProgram(formData: FormData): Promise<void> {
  try {
    await requireCampusAdmin();
  } catch {
    return;
  }
  const userId = formData.get("userId") as string;
  const program = formData.get("program") as string;
  if (!userId || !ALL.includes(program as Program)) return;

  const user = await db.user.findFirst({
    where: { id: userId, role: "FACULTY" },
    select: { id: true },
  });
  if (!user) return;

  await db.facultyManagedProgram.upsert({
    where: { userId_program: { userId, program: program as Program } },
    create: { userId, program: program as Program },
    update: {},
  });

  revalidatePath("/admin/faculty-programs");
  revalidatePath("/admin");
}

export async function removeFacultyProgram(formData: FormData): Promise<void> {
  try {
    await requireCampusAdmin();
  } catch {
    return;
  }
  const userId = formData.get("userId") as string;
  const program = formData.get("program") as string;
  if (!userId || !ALL.includes(program as Program)) return;

  await db.facultyManagedProgram.deleteMany({
    where: { userId, program: program as Program },
  });

  revalidatePath("/admin/faculty-programs");
  revalidatePath("/admin");
}
