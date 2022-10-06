import { Stats } from "./types/Stats"
import { prisma } from "../../../db/client"
import { UseCaseResult, VoidUseCase } from "../../UseCase"

class GetStatsUseCase extends VoidUseCase<Stats> {
    protected async executeVoidTemplate(): Promise<UseCaseResult<Stats>> {
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
            take: 1,
        })

        const minMaxPromise = prisma.people.aggregate({
            _min: { salary: true, },
            _max: { salary: true, }
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

export default new GetStatsUseCase()
