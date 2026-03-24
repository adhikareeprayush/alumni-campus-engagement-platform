"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function updateName(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const name = z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80)
    .safeParse(formData.get("name"));

  if (!name.success) return { error: name.error.issues?.[0]?.message ?? name.error.message };

  await db.user.update({
    where: { id: session.user.id },
    data: { name: name.data },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const Schema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required."),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters.")
        .regex(/[A-Z]/, "Must contain an uppercase letter.")
        .regex(/[0-9]/, "Must contain a number."),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

  const parsed = Schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { error: parsed.error.issues?.[0]?.message ?? parsed.error.message };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { error: "No password set for this account." };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };
  // Prevent deleting admin/faculty accounts via self-service
  if (session.user.role === "ADMIN" || session.user.role === "FACULTY") {
    return { error: "Admin and faculty accounts cannot be self-deleted." };
  }

  await db.user.delete({ where: { id: session.user.id } });
  return { success: true };
}
