import type { NextApiRequest, NextApiResponse } from "next"
import get from "../../../useCase/department/get"
import del from "../../../useCase/department/del"
import restricted from "../../../core/backend/restrict"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const readResult = await get.execute({ id: req.query.id as string })
            res.setHeader("Cache-Control", "max-age=86400")
            res.status(readResult.code).json(readResult.data)
            break
        case "DELETE":
            const deleteResult = await del.execute({ id: req.query.id as string })
            res.status(deleteResult.code).json(deleteResult.data)
            break
        default:
            res.setHeader("Allow", "GET, DELETE")
            res.status(405).send("Method Not Allowed")
    }
}

export default restricted(handler)
