"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Program } from "@/app/generated/prisma/client";

const schema = z.object({
  batchYear: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 10),
  program: z.enum([
    "BCT",
    "BEX",
    "BIT",
    "BCE",
    "BME",
    "BEE",
    "BAG",
    "BAM",
    "OTHER",
  ]),
  rollNumber: z.string().max(40).optional(),
});

export async function updateStudentProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "STUDENT") return { error: "Only students can update this profile." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const roll = parsed.data.rollNumber?.trim();
  await db.studentProfile.update({
    where: { userId: session.user.id },
    data: {
      batchYear: parsed.data.batchYear,
      program: parsed.data.program as Program,
      rollNumber: roll === "" ? null : roll,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/student/edit");
  return { success: true };
}
