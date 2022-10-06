import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    id: z.string().min(1).max(dbConsts.stringLength),
})
type Schema = z.infer<typeof schema>

class DeletePeopleUseCase extends UseCase<Schema, void> {
    protected async executeTemplate(props: { id: string }): Promise<UseCaseResult<void>> {
        await prisma.people.delete({
            where: {
                id: props.id,
            }
        })

        return { code: 200 }
    }
}

export default new DeletePeopleUseCase(schema)
