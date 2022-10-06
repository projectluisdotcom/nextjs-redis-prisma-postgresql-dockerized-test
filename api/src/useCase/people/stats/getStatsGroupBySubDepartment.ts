import { prisma } from "../../../db/client"
import { UseCaseResult, VoidUseCase } from "../../UseCase"
import { StatsGroupByDepartment } from "./getStatsGroupByDepartment";

export function mapMean(mean: { id: string; salary: number; count: number }[], departments: string[]) {
    const tmp = new Map<string, { salary: number, count: number }[]>(departments.map(x => [x, []]))
    mean.forEach(x => tmp.get(x.id)!.push({ salary: x.salary, count: x.count }))
    return new Map<string, number>(departments.map(x => [x, tmp.get(x)![0]?.salary || 0]))
}

class GetStatsGroupBySubDepartment extends VoidUseCase<StatsGroupByDepartment[]> {
    protected async executeVoidTemplate(): Promise<UseCaseResult<StatsGroupByDepartment[]>> {
        const [departmentMean, subDepartmentMean, minMax, departments, subDepartments] = await Promise.all([
            prisma.people.groupBy({
                by: ["salary", "departmentId"],
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
                by: ["salary", "subDepartmentId"],
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
                by: ["departmentId", "subDepartmentId"],
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
            }),
            prisma.subDepartment.findMany({
                orderBy: {
                    name: "asc",
                },
            })
        ])

        const allMean = departmentMean
            .map(x => ({ id: x.departmentId, count: x._count.salary, salary: x.salary }))
            .concat(subDepartmentMean.filter(x => x.subDepartmentId != null).map(x => ({ id: x.subDepartmentId!, count: x._count.salary, salary: x.salary })))

        const departmentsMap = new Map(departments.map(x => [x.id, x.name]))
        const subDepartmentsMap = new Map(subDepartments.map(x => [x.id, x.name]))

        const allDepartments = departments.concat(subDepartments)

        const meanMap = mapMean(allMean, allDepartments.map(x => x.id))
        const minMaxMap = new Map(minMax.map(x => [x.subDepartmentId ?? x.departmentId, { min: x._min.salary || 0, max: x._max.salary || 0 }]))

        const departmentsResult: StatsGroupByDepartment[] = departments.map(department => ({
            department: departmentsMap.get(department.id)!,
            parent: null,
            stats: {
                mean: meanMap.get(department.id)!,
                ...minMaxMap.get(department.id) || { min: 0, max: 0 },
            }
        }))

        const subDepartmentsResult: StatsGroupByDepartment[] = subDepartments.map(subDepartment => ({
            department: subDepartmentsMap.get(subDepartment.id)!,
            parent: departmentsMap.get(subDepartment.parentId)!,
            stats: {
                mean: meanMap.get(subDepartment.id)!,
                ...minMaxMap.get(subDepartment.id) || { min: 0, max: 0 },
            }
        }))

        const result = departmentsResult.concat(subDepartmentsResult)

        return {
            code: 200,
            data: result,
        }
    }
}

export default new GetStatsGroupBySubDepartment()
