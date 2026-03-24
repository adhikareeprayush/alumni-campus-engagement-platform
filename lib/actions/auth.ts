"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ALUMNI", "STUDENT"]),
  batchYear: z.coerce.number().min(1990).max(new Date().getFullYear()),
  program: z.enum(["BCT", "BEX", "BIT", "BCE", "BME", "BEE", "BAG", "BAM", "OTHER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(formData: RegisterInput) {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password, role, batchYear, program } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      ...(role === "ALUMNI"
        ? {
            alumniProfile: {
              create: { batchYear, program },
            },
          }
        : {
            studentProfile: {
              create: { batchYear, program },
            },
          }),
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newValues: { email, role, batchYear, program },
    },
  });

  return { success: true };
}

export async function loginUser(formData: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}
