import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, "").split("/")[0] || "";

  const params = parsed.searchParams;
  const sslMode = (params.get("ssl-mode") || params.get("sslmode") || "").toUpperCase();
  const sslParam = params.get("ssl")?.toLowerCase();

  /** Managed MySQL hosts typically require TLS (plain handshake fails or closes). */
  let ssl: boolean | { rejectUnauthorized?: boolean } | undefined;

  const tlsInsecure =
    process.env.DATABASE_SSL_INSECURE === "true" ||
    process.env.DATABASE_SSL_INSECURE === "1" ||
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false";

  const envSsl = process.env.DATABASE_SSL?.toLowerCase();
  if (envSsl === "false" || envSsl === "0") {
    ssl = undefined;
  } else if (envSsl === "true" || envSsl === "1") {
    ssl = { rejectUnauthorized: !tlsInsecure };
  } else {
    const explicitOff =
      sslMode === "DISABLED" ||
      sslMode === "DISABLE" ||
      sslParam === "false" ||
      sslParam === "0";
    const explicitOn =
      sslMode === "REQUIRED" ||
      sslMode === "REQUIRE" ||
      sslMode === "VERIFY_CA" ||
      sslMode === "VERIFY_IDENTITY" ||
      sslParam === "true" ||
      sslParam === "1";

    const managedTlsHost =
      parsed.hostname.endsWith(".aivencloud.com") ||
      /\.aiven\.io$/i.test(parsed.hostname);

    if (!explicitOff && (explicitOn || managedTlsHost)) {
      ssl = { rejectUnauthorized: !tlsInsecure };
    }
  }

  const connectTimeoutMs = Number.parseInt(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? "30000", 10);

  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port || "3306", 10),
    user: parsed.username,
    password: parsed.password,
    database,
    connectTimeout: Number.isFinite(connectTimeoutMs) ? connectTimeoutMs : 30000,
    ...(ssl ? { ssl } : {}),
  };
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl?.trim()) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionConfig = parseDatabaseUrl(rawUrl);
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
