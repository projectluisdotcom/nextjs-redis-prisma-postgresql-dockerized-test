import { People } from "@prisma/client"
import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    name: z.string().min(1).max(dbConsts.stringLength),
    salary: z.number().min(0).max(dbConsts.maxInt),
    currency: z.string().min(1).max(dbConsts.stringLength),
    departmentId: z.string().min(1).max(dbConsts.stringLength),
    subDepartmentId: z.string().min(1).max(dbConsts.stringLength).optional(),
    isOnContract: z.boolean(),
})
type Schema = z.infer<typeof schema>

class CreatePeopleUseCase extends UseCase<Schema, People> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<People>> {
        const people = await prisma.people.create({
            data: {
                name: props.name,
                currency: props.currency,
                isOnContract: props.isOnContract,
                salary: props.salary,
                departmentId: props.departmentId,
                subDepartmentId: props.subDepartmentId,
            },
        })

        return { code: 200, data: people }
    }

}

export default new CreatePeopleUseCase(schema)
