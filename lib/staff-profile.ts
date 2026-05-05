import { db } from "@/lib/db";

function isStaffProfileTableMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeCode = (error as { code?: unknown }).code;
  const maybeMessage = (error as { message?: unknown }).message;
  return (
    maybeCode === "P2021" &&
    typeof maybeMessage === "string" &&
    maybeMessage.includes("StaffProfile")
  );
}

export async function findStaffProfileByUserIdSafe(userId: string) {
  try {
    return await db.staffProfile.findUnique({ where: { userId } });
  } catch (error) {
    if (isStaffProfileTableMissingError(error)) return null;
    throw error;
  }
}

export async function upsertStaffProfileByUserIdSafe(
  userId: string,
  payload: {
    title: string | null;
    department: string | null;
    phone: string | null;
    officeLocation: string | null;
    bio: string | null;
    linkedinUrl: string | null;
  }
) {
  try {
    await db.staffProfile.upsert({
      where: { userId },
      create: { userId, ...payload },
      update: payload,
    });
    return { ok: true as const };
  } catch (error) {
    if (isStaffProfileTableMissingError(error)) {
      return { ok: false as const, missingTable: true as const };
    }
    throw error;
  }
}
