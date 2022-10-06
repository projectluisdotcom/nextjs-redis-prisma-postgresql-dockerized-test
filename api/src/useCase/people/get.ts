import { People } from "@prisma/client"
import { z } from "zod"

import { prisma } from "../../db/client"
import dbConsts from "../../db/dbConsts"
import UseCase, { UseCaseResult } from "../UseCase"

const schema = z.object({
    id: z.string().min(1).max(dbConsts.stringLength),
})
type Schema = z.infer<typeof schema>

class GetPeopleUseCase extends UseCase<Schema, People> {
    protected async executeTemplate(props: Schema): Promise<UseCaseResult<People>> {
        const people = await prisma.people.findUnique({
            where: {
                id: props.id
            }
        })

        if (!people) {
            return { code: 404 }
        }

        return { code: 200, data: people }
    }

}

export default new GetPeopleUseCase(schema)
