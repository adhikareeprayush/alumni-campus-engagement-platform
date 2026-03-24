"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { facultyCanAccessAlumniProfile } from "@/lib/faculty-scope";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized.");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
    throw new Error("Forbidden: admin or faculty only.");
  }
  return session;
}

export async function verifyAlumni(profileId: string) {
  const session = await requireAdmin();

  const existing = await db.alumniProfile.findUnique({
    where: { id: profileId },
    select: { program: true },
  });
  if (!existing) return { error: "Profile not found." };

  const allowed = await facultyCanAccessAlumniProfile(
    session.user.id,
    session.user.role,
    existing.program,
  );
  if (!allowed) return { error: "You can only verify alumni in your assigned programs." };

  await db.alumniProfile.update({
    where: { id: profileId },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "VERIFY",
      entity: "AlumniProfile",
      entityId: profileId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/alumni");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectAlumni(profileId: string) {
  const session = await requireAdmin();

  const profile = await db.alumniProfile.findUnique({
    where: { id: profileId },
    select: { userId: true, program: true },
  });
  if (!profile) return { error: "Profile not found." };

  const allowed = await facultyCanAccessAlumniProfile(
    session.user.id,
    session.user.role,
    profile.program,
  );
  if (!allowed) return { error: "You can only reject alumni in your assigned programs." };

  // Delete profile (cascades to skills, jobHistory, education via schema onDelete: Cascade)
  await db.alumniProfile.delete({ where: { id: profileId } });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE",
      entity: "AlumniProfile",
      entityId: profileId,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleEventPublished(eventId: string) {
  await requireAdmin();

  const event = await db.event.findUnique({ where: { id: eventId }, select: { isPublished: true } });
  if (!event) return { error: "Event not found." };

  await db.event.update({ where: { id: eventId }, data: { isPublished: !event.isPublished } });

  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true };
}
