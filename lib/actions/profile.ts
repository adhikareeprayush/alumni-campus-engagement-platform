"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/brand";

async function getAlumniProfileId(userId: string) {
  const profile = await db.alumniProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw new Error("Alumni profile not found.");
  return profile.id;
}

// ---------------------------------------------------------------------------
// Basic info
// ---------------------------------------------------------------------------

const basicInfoSchema = z.object({
  currentJobTitle: z.string().max(120).optional(),
  currentCompany: z.string().max(120).optional(),
  currentLocation: z.string().max(120).optional(),
  district: z.string().max(80).optional(),
  province: z.string().max(80).optional(),
  country: z.string().max(80).default(BRAND.homeCountry),
  bio: z.string().max(1000).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  isEmployed: z.boolean().optional(),
});

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;

export async function updateBasicInfo(data: BasicInfoInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = basicInfoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profileId = await getAlumniProfileId(session.user.id);

  await db.alumniProfile.update({
    where: { id: profileId },
    data: {
      ...parsed.data,
      linkedinUrl: parsed.data.linkedinUrl || null,
      githubUrl: parsed.data.githubUrl || null,
      portfolioUrl: parsed.data.portfolioUrl || null,
      updatedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "AlumniProfile",
      entityId: profileId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Job history
// ---------------------------------------------------------------------------

const jobHistorySchema = z.object({
  company: z.string().min(1).max(120),
  jobTitle: z.string().min(1).max(120),
  location: z.string().max(120).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(2000).optional(),
});

export type JobHistoryInput = z.infer<typeof jobHistorySchema>;

export async function addJobHistory(data: JobHistoryInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = jobHistorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profileId = await getAlumniProfileId(session.user.id);
  const { startDate, endDate, isCurrent, ...rest } = parsed.data;

  // If new job is current, unset previous current jobs
  if (isCurrent) {
    await db.jobHistory.updateMany({
      where: { profileId, isCurrent: true },
      data: { isCurrent: false },
    });
  }

  await db.jobHistory.create({
    data: {
      ...rest,
      profileId,
      isCurrent,
      startDate: new Date(startDate),
      endDate: endDate && !isCurrent ? new Date(endDate) : null,
    },
  });

  // Keep currentCompany/title in sync with latest current job
  if (isCurrent) {
    await db.alumniProfile.update({
      where: { id: profileId },
      data: {
        currentCompany: rest.company,
        currentJobTitle: rest.jobTitle,
        isEmployed: true,
      },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateJobHistory(id: string, data: JobHistoryInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = jobHistorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profileId = await getAlumniProfileId(session.user.id);
  const job = await db.jobHistory.findFirst({ where: { id, profileId } });
  if (!job) return { error: "Job entry not found." };

  const { startDate, endDate, isCurrent, ...rest } = parsed.data;

  if (isCurrent) {
    await db.jobHistory.updateMany({
      where: { profileId, isCurrent: true, id: { not: id } },
      data: { isCurrent: false },
    });
  }

  await db.jobHistory.update({
    where: { id },
    data: {
      ...rest,
      isCurrent,
      startDate: new Date(startDate),
      endDate: endDate && !isCurrent ? new Date(endDate) : null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function deleteJobHistory(id: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const profileId = await getAlumniProfileId(session.user.id);
  await db.jobHistory.deleteMany({ where: { id, profileId } });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

const educationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(100),
  field: z.string().max(100).optional(),
  startYear: z.coerce.number().min(1970).max(new Date().getFullYear()),
  endYear: z.coerce.number().min(1970).max(new Date().getFullYear() + 6).optional(),
  isOngoing: z.boolean().default(false),
});

export type EducationInput = z.infer<typeof educationSchema>;

export async function addEducation(data: EducationInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = educationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profileId = await getAlumniProfileId(session.user.id);

  await db.education.create({
    data: { ...parsed.data, profileId, endYear: parsed.data.isOngoing ? null : parsed.data.endYear },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateEducation(id: string, data: EducationInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = educationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profileId = await getAlumniProfileId(session.user.id);
  const edu = await db.education.findFirst({ where: { id, profileId } });
  if (!edu) return { error: "Education entry not found." };

  await db.education.update({
    where: { id },
    data: { ...parsed.data, endYear: parsed.data.isOngoing ? null : parsed.data.endYear },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function deleteEducation(id: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const profileId = await getAlumniProfileId(session.user.id);
  await db.education.deleteMany({ where: { id, profileId } });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export async function addSkill(name: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) return { error: "Invalid skill name." };

  const profileId = await getAlumniProfileId(session.user.id);

  // upsert skill globally, then connect to profile
  const skill = await db.skill.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });

  // ignore if already connected
  await db.alumniSkill.upsert({
    where: { profileId_skillId: { profileId, skillId: skill.id } },
    update: {},
    create: { profileId, skillId: skill.id },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function removeSkill(skillId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const profileId = await getAlumniProfileId(session.user.id);
  await db.alumniSkill.deleteMany({ where: { profileId, skillId } });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function searchSkills(query: string) {
  if (!query || query.length < 1) return [];
  return db.skill.findMany({
    where: { name: { contains: query } },
    take: 10,
    select: { id: true, name: true },
  });
}
