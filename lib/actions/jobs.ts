"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const jobSchema = z.object({
  title: z.string().min(2).max(150),
  company: z.string().min(1).max(120),
  location: z.string().max(120).optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"]),
  description: z.string().max(5000).optional(),
  applyLink: z.string().url().optional().or(z.literal("")),
  deadline: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof jobSchema>;

export async function createJobPosting(data: CreateJobInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const role = session.user.role;
  if (role !== "ALUMNI" && role !== "ADMIN" && role !== "FACULTY") {
    return { error: "Only alumni or faculty can post jobs." };
  }

  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { deadline, applyLink, ...rest } = parsed.data;

  await db.jobPosting.create({
    data: {
      ...rest,
      applyLink: applyLink || null,
      deadline: deadline ? new Date(deadline) : null,
      postedById: session.user.id,
    },
  });

  revalidatePath("/jobs");
  return { success: true };
}

export async function applyForJob(jobId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await db.jobApplication.findUnique({
    where: { jobId_userId: { jobId, userId: session.user.id } },
  });
  if (existing) return { error: "You have already applied for this job." };

  await db.jobApplication.create({
    data: { jobId, userId: session.user.id },
  });

  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}

export async function toggleJobActive(jobId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const job = await db.jobPosting.findUnique({ where: { id: jobId }, select: { postedById: true, isActive: true } });
  if (!job) return { error: "Job not found." };

  const role = session.user.role;
  if (job.postedById !== session.user.id && role !== "ADMIN" && role !== "FACULTY") {
    return { error: "Not authorized." };
  }

  await db.jobPosting.update({ where: { id: jobId }, data: { isActive: !job.isActive } });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}
