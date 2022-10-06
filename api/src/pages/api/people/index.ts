import type { NextApiRequest, NextApiResponse } from "next"
import restricted from "../../../core/backend/restrict"
import create from "../../../useCase/people/create"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST")
        res.status(405).send("Method Not Allowed")
        return
    }

    const createResult = await create.execute(req.body)
    res.status(createResult.code).json(createResult.data)
}

export default restricted(handler)
