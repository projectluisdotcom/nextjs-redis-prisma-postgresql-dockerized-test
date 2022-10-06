import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    id: z.string().min(1).max(dbConsts.stringLength),
})
type Schema = z.infer<typeof schema>

class DeleteDepartmentUseCase extends UseCase<Schema, void> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<void>> {
        try {
            await prisma.department.delete({
                where: {
                    id: props.id,
                }
            })
            return { code: 200 }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    await prisma.subDepartment.delete({
                        where: {
                            id: props.id,
                        }
                    })

                    return { code: 200 }
                }
            }

            throw error
        }
    }
}

export default new DeleteDepartmentUseCase(schema)
