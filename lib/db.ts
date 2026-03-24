import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306", 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace("/", ""),
  };
}

function createPrismaClient() {
  const connectionConfig = parseDatabaseUrl(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    ...connectionConfig,
    allowPublicKeyRetrieval: true,
  });
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function hasFacultyDelegate(client: PrismaClient): boolean {
  return (
    typeof (client as unknown as { facultyManagedProgram?: { findMany: unknown } })
      .facultyManagedProgram?.findMany === "function"
  );
}

/**
 * Dev HMR can leave a global PrismaClient from before `prisma generate` — it won't
 * have `facultyManagedProgram`. Lazily swap in a fresh client once the generated
 * client includes that delegate (after generate). Access via Proxy so we re-check.
 */
function getPrisma(): PrismaClient {
  const isDev = process.env.NODE_ENV !== "production";
  let cur = globalForPrisma.prisma;

  if (isDev && cur && !hasFacultyDelegate(cur)) {
    const next = createPrismaClient();
    if (hasFacultyDelegate(next)) {
      globalForPrisma.prisma = next;
      cur = next;
    }
  }

  if (!cur) {
    globalForPrisma.prisma = createPrismaClient();
    cur = globalForPrisma.prisma;
  }

  return cur!;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
