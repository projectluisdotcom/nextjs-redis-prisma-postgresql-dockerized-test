import type { NextApiRequest, NextApiResponse } from "next"
import restricted from "../../../../core/backend/restrict"
import getStats from "../../../../useCase/people/stats/getStats"
import getStatsGroupByDepartment from "../../../../useCase/people/stats/getStatsGroupByDepartment"
import getStatsGroupBySubDepartment from "../../../../useCase/people/stats/getStatsGroupBySubDepartment"
import getStatsWhereIsOnContract from "../../../../useCase/people/stats/getStatsWhereIsOnContract"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET")
        res.status(405).send("Method Not Allowed")
        return
    }

    if (typeof req.query.groupbysubdepartment === "string") {
        const statsGroupBySubDepartment = await getStatsGroupBySubDepartment.execute()
        res.setHeader("Cache-Control", "max-age=86400")
        res.status(statsGroupBySubDepartment.code).json(statsGroupBySubDepartment.data)
        return
    }

    if (typeof req.query.groupbydepartment === "string") {
        const statsGrupuByDeparment = await getStatsGroupByDepartment.execute()
        res.setHeader("Cache-Control", "max-age=86400")
        res.status(statsGrupuByDeparment.code).json(statsGrupuByDeparment.data)
        return

    }
    if (typeof req.query.isoncontract === "string") {
        const statsWhereIsOnContract = await getStatsWhereIsOnContract.execute({ isOnContract: req.query.isoncontract === "true" })
        res.setHeader("Cache-Control", "max-age=86400")
        res.status(statsWhereIsOnContract.code).json(statsWhereIsOnContract.data)
        return
    }

    const stats = await getStats.execute()
    res.setHeader("Cache-Control", "max-age=86400")
    res.status(stats.code).json(stats.data)
}

export default restricted(handler)
