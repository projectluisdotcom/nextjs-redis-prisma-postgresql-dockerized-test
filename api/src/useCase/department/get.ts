import { Department } from "@prisma/client"
import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    id: z.string().min(1).max(dbConsts.stringLength),
})
type Schema = z.infer<typeof schema>

class GetDepartmentUseCase extends UseCase<Schema, Department> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<Department>> {
        const department = await prisma.department.findUnique({
            where: {
                id: props.id
            }
        })

        if (!department) {
            const subDepartment = await prisma.subDepartment.findUnique({
                where: {
                    id: props.id
                }
            })

            if (!subDepartment) {
                return { code: 404 }
            }

            return { code: 200, data: subDepartment }
        }

        return { code: 200, data: department }
    }
}

export default new GetDepartmentUseCase(schema)
