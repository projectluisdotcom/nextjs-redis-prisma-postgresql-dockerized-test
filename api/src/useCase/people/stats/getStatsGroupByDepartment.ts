import { Stats } from "./types/Stats"
import { prisma } from "../../../db/client"
import { UseCaseResult, VoidUseCase } from "../../UseCase"
import { mapMean } from "./getStatsGroupBySubDepartment"

export type StatsGroupByDepartment = {
    department: string
    parent?: string | null
    stats: Stats
}

class GetStatsGroupByDepartmentUseCase extends VoidUseCase<StatsGroupByDepartment[]> {
    protected async executeVoidTemplate(): Promise<UseCaseResult<StatsGroupByDepartment[]>> {
        const [mean, minMax, departments] = await Promise.all([
            prisma.people.groupBy({
                by: ["departmentId", "salary"],
                _count: {
                    salary: true,
                },
                orderBy: {
                    _count: {
                        salary: "desc",
                    },
                },
            }),
            prisma.people.groupBy({
                by: ["departmentId"],
                _min: {
                    salary: true,
                },
                _max: {
                    salary: true,
                },
            }),
            prisma.department.findMany({
                orderBy: {
                    name: "asc",
                },
            })
        ])


        const departmentsMap = new Map(departments.map(x => [x.id, x.name]))

        const meanMap = mapMean(mean.map(x => ({ id: x.departmentId, salary: x.salary, count: x._count.salary })), departments.map(x => x.id))
        const minMaxMap = new Map(minMax.map(x => [x.departmentId, { min: x._min.salary || 0, max: x._max.salary || 0 }]))

        const result = departments.map(department => ({
            department: departmentsMap.get(department.id)!,
            parent: null,
            stats: {
                mean: meanMap.get(department.id)!,
                ...minMaxMap.get(department.id) || { min: 0, max: 0 },
            }
        }))

        return {
            code: 200,
            data: result,
        }
    }
}

export default new GetStatsGroupByDepartmentUseCase()
