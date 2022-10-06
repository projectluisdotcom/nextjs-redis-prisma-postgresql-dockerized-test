import type { NextApiRequest, NextApiResponse } from "next"
import signIn from "../../../useCase/auth/signIn"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST")
        res.status(405).send("Method Not Allowed")
        return
    }

    const result = await signIn.execute(req.body)
    res.status(result.code).json(result.data)
}

export default handler
