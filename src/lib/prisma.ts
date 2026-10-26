import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient {
  const log =
    process.env.NODE_ENV === "development"
      ? (["error"] as const)
      : ([] as const);

  // Production (Vercel) / Turso: use the libSQL driver adapter when a
  // Turso URL is configured. Local dev falls back to the SQLite file.
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    const libsql = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter, log: [...log] });
  }

  return new PrismaClient({ log: [...log] });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
