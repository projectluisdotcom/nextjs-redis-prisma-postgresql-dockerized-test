import { createClient } from "redis"

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST!,
        port: +process.env.REDIS_PORT!,
    },
    password: process.env.REDIS_PASS!
})

redisClient.on("error", err => {
    console.error("Redis Error", err)
})

export default redisClient
