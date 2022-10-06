const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const { execSync } = require("child_process")

module.exports = {
    disconnect: () => prisma.$disconnect(),
    reset: () => {
        execSync("npm run db:reset")
    },
    createMockUser: (username) => {
        return prisma.user.create({
            data: {
                username,
                hash: "9a6a951dd95e9357bb03897445f390e372c607aaaa53e537183311f38d1abae2",
            }
        })
    }
}
