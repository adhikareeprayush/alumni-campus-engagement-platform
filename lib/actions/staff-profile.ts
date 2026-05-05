"use server";

import { auth } from "@/lib/auth";
import { upsertStaffProfileByUserIdSafe } from "@/lib/staff-profile";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const staffSchema = z.object({
  title: z.string().max(120),
  department: z.string().max(120),
  phone: z.string().max(40),
  officeLocation: z.string().max(200),
  bio: z.string().max(4000),
  linkedinUrl: z
    .string()
    .max(500)
    .refine(
      (s) => s.trim() === "" || /^https?:\/\//i.test(s),
      "LinkedIn must be a valid http(s) URL."
    ),
});

function normalizeUrl(s: string | undefined | null) {
  const t = (s ?? "").trim();
  return t === "" ? null : t;
}

export async function upsertStaffProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
    return { error: "Only staff can update this profile." };
  }

  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { title, department, phone, officeLocation, bio, linkedinUrl } = parsed.data;

  const linkedin = normalizeUrl(linkedinUrl);

  const result = await upsertStaffProfileByUserIdSafe(session.user.id, {
    title: title?.trim() || null,
    department: department?.trim() || null,
    phone: phone?.trim() || null,
    officeLocation: officeLocation?.trim() || null,
    bio: bio?.trim() || null,
    linkedinUrl: linkedin,
  });

  if (!result.ok && result.missingTable) {
    return {
      error: "Staff profile table is not initialized. Run Prisma migrations and try again.",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/staff/edit");
  return { success: true };
}
