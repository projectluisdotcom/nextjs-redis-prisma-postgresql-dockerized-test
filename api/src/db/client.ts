import { Prisma, PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const getLogLevel = (): Prisma.LogLevel[] => {
  if (process.env.HIDE_PRISMA_LOGS === "true") {
    return ["error"]
  }
  return process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: getLogLevel()
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
