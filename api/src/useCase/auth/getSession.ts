import { z } from "zod"
import jwt from "jsonwebtoken"

import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    token: z.string().optional(),
})
type Schema = z.infer<typeof schema>

class SignInUseCase extends UseCase<Schema, boolean> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<boolean>> {
        if (!props.token) {
            return { code: 401 }
        }

        const isValidToken = await verifyToken(props.token)

        if (isValidToken) {
            return { code: 200, data: true }
        }
        return { code: 401 }
    }
}

export default new SignInUseCase(schema)

async function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET!)
        return true
    } catch (err) {
        return false
    }
}
