"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdminOrFaculty() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized.");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
    throw new Error("Forbidden: admin or faculty only.");
  }
  return session;
}

const AnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(200),
  content: z.string().min(10, "Content must be at least 10 characters."),
  isPublished: z.boolean().default(false),
});

export async function createAnnouncement(formData: FormData) {
  const session = await requireAdminOrFaculty();

  const parsed = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? parsed.error.message };
  }

  await db.announcement.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true };
}

export async function toggleAnnouncementPublished(id: string) {
  await requireAdminOrFaculty();

  const announcement = await db.announcement.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!announcement) return { error: "Announcement not found." };

  await db.announcement.update({
    where: { id },
    data: { isPublished: !announcement.isPublished },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  await requireAdminOrFaculty();

  await db.announcement.delete({ where: { id } });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true };
}

export async function updateAnnouncement(id: string, formData: FormData) {
  await requireAdminOrFaculty();

  const parsed = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? parsed.error.message };
  }

  await db.announcement.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  return { success: true };
}
