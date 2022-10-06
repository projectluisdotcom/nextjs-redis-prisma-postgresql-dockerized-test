import type { NextApiRequest, NextApiResponse } from "next"
import getSession from "../../useCase/auth/getSession"

export default (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const authorization = req.headers["authorization"]
        if (!authorization) {
            res.status(401).send({ content: "No Auth" })
            return
        }

        const result = await getSession.execute({ token: authorization })

        if (!result.data) {
            res.status(401).send({ content: "No Auth" })
            return
        }

        return handler(req, res)
    }
}