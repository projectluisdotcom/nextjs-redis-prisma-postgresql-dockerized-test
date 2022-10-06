import { z } from "zod"

import { Stats } from "./types/Stats"
import { prisma } from "../../../db/client"
import UseCase, { UseCaseResult } from "../../UseCase"

const schema = z.object({
    isOnContract: z.boolean(),
})
type Schema = z.infer<typeof schema>

class GetStatsWhereIsOnContract extends UseCase<Schema, Stats> {
    protected async executeTemplate(props: { isOnContract: boolean }): Promise<UseCaseResult<Stats>> {
        const meanPromise = await prisma.people.groupBy({
            by: ["salary"],
            _count: {
                salary: true
            },
            orderBy: {
                _count: {
                    salary: "desc"
                }
            },
            where: {
                isOnContract: {
                    equals: props.isOnContract,
                },
            },
            take: 1,
        })

        const minMaxPromise = prisma.people.aggregate({
            _min: {
                salary: true,
            },
            _max: {
                salary: true,
            },
            where: {
                isOnContract: {
                    equals: props.isOnContract,
                },
            },
        })

        const [mean, minMax] = await Promise.all([meanPromise, minMaxPromise])

        return {
            code: 200,
            data: {
                mean: mean[0]?.salary || 0,
                max: minMax?._max.salary || 0,
                min: minMax?._min.salary || 0,
            }
        }
    }

}

export default new GetStatsWhereIsOnContract(schema)
