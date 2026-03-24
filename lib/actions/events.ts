"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const eventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  eventType: z.enum(["GUEST_LECTURE", "REUNION", "WEBINAR", "WORKSHOP", "OTHER"]),
  venue: z.string().max(200).optional(),
  onlineLink: z.string().url().optional().or(z.literal("")),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof eventSchema>;

export async function createEvent(data: CreateEventInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "FACULTY") {
    return { error: "Only admin or faculty can create events." };
  }

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { startDate, endDate, onlineLink, ...rest } = parsed.data;

  const event = await db.event.create({
    data: {
      ...rest,
      onlineLink: onlineLink || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true, eventId: event.id };
}

export async function rsvpEvent(eventId: string, status: "ATTENDING" | "NOT_ATTENDING" | "MAYBE") {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    update: { status },
    create: { eventId, userId: session.user.id, status },
  });

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function cancelRsvp(eventId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  await db.eventRsvp.deleteMany({
    where: { eventId, userId: session.user.id },
  });

  revalidatePath("/events");
  return { success: true };
}
