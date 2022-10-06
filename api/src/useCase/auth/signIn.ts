import { z } from "zod"
import jwt from "jsonwebtoken"
import { NextApiResponse } from "next"
import { scryptSync, randomBytes } from "crypto"
import { User } from "@prisma/client"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"
import redisClient from "../../redis/redisClient"

const schema = z.object({
    username: z.string().min(1).max(dbConsts.stringLength),
    password: z.string().min(1).max(dbConsts.stringLength),
})
type Schema = z.infer<typeof schema>

type Response = {
    content: { username: string },
    JWT: string,
    refresh: string,
}

const hashPass = (password: string) => {
    return scryptSync(password, process.env.AUTH_SECRET!, 32).toString("hex")
}

const matchPassword = (pass: string, hash: string): Boolean => {
    const originalPassHash = hash.slice(0, 64)
    const currentPassHash = scryptSync(pass, process.env.AUTH_SECRET!, 32).toString("hex")
    return originalPassHash === currentPassHash
}

class SignInUseCase extends UseCase<Schema, Response> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<Response>> {
        try {
            const user = await prisma.user.findUnique({ where: { username: props.username } })

            if (!user) {
                return { code: 401 }
            }

            const validPassword = matchPassword(props.password, user.hash)
            if (!validPassword) {
                return { code: 401 }
            }

            const token = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)
            const refresh = await saveRefreshToken(user, refreshToken)

            return {
                code: 200,
                data: {
                    content: { username: props.username },
                    JWT: token,
                    refresh: refreshToken,
                }
            }
        } catch (error) {
            return { code: 401 }
        }
    }
}

export default new SignInUseCase(schema)

function generateAccessToken(user: User) {
    return jwt.sign(
        user,
        process.env.AUTH_SECRET!,
        {
            expiresIn: "1h",
        }
    )
}

function generateRefreshToken(user: User) {
    return jwt.sign(
        user,
        process.env.AUTH_SECRET!,
        {
            expiresIn: "30d",
        }
    )
}

async function saveRefreshToken(user: User, refresher: string) {
    try {
        await redisClient.connect()
        await redisClient.set(`refresh:${user.id}`, JSON.stringify({ refresh: refresher }))
        await redisClient.disconnect()
    } catch (error) {
        console.log(error)
    }
}

async function tokenRefresh(refreshToken: string, res: NextApiResponse) {
    try {
        const decoded: jwt.JwtPayload = jwt.verify(refreshToken, process.env.AUTH_SECRET!) as jwt.JwtPayload
        if (!decoded) {
            return res.status(401).send("Can't refresh. Invalid Token")
        }

        await redisClient.connect()
        const oldRefreshToken = await redisClient.get(`refresh:${decoded.user.id}`)
        if (oldRefreshToken !== refreshToken) {
            await redisClient.disconnect()
            return res.status(401).send("Can't refresh. Invalid Token")
        } else {
            await redisClient.connect()
            const rawUser = await redisClient.get(`user:${decoded.user.id}`)
            if (!rawUser) {
                await redisClient.disconnect()
                return res.status(401).send("Can't refresh. Invalid Token")
            }
            const user = JSON.parse(rawUser)
            const token = generateAccessToken(user)
            const nextRefreshToken = generateRefreshToken(user)

            const refresh = await saveRefreshToken(user, nextRefreshToken)
            await redisClient.disconnect()

            return {
                message: "Token Refreshed",
                JWT: token,
                refresh: refreshToken,
            }
        }
    } catch (error) {
        await redisClient.disconnect()
        return res.status(401).send("Can't refresh. Invalid Token")
    }
}
