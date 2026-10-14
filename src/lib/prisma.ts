import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Next.js dev mode hot-reloads modules on every save, which would otherwise
// spin up a brand-new PrismaClient (and a new DB connection pool) on every
// single save. Stashing the instance on `globalThis` in development lets it
// survive reloads instead of leaking connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
