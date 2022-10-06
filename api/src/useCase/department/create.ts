import { Department } from "@prisma/client"
import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    name: z.string().min(1).max(dbConsts.stringLength),
    parentId: z.string().min(1).max(dbConsts.stringLength).optional(),
})
type Schema = z.infer<typeof schema>

class CreateDepartmentUseCase extends UseCase<Schema, Department> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<Department>> {
        if (!props.parentId) {
            const department = await prisma.department.create({
                data: props
            })
            return { code: 200, data: department }
        }

        const department = await prisma.department.findUnique({
            where: {
                id: props.parentId
            }
        })

        if (!department) {
            return { code: 404 }
        }

        const subDepartment = await prisma.subDepartment.create({
            data: {
                parentId: department.id,
                name: props.name,
            }
        })
        return { code: 200, data: subDepartment }
    }
}

export default new CreateDepartmentUseCase(schema)
