import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { z, ZodError, ZodObject } from "zod"
import { generateErrorMessage } from "zod-error"

export type UseCaseResult<T> = {
    code: number
    data?: T | undefined
    error?: string | undefined
}

export default abstract class UseCase<TRequest, TResult> {
    private readonly schema: ZodObject<any>

    constructor(schema: ZodObject<any>) {
        this.schema = schema
    }

    protected abstract executeTemplate(props: TRequest): Promise<UseCaseResult<TResult>>

    async execute(props: TRequest): Promise<UseCaseResult<TResult>> {
        try {
            this.schema.parse(props)
            return this.executeTemplate(props)
        } catch (error) {
            if (error instanceof ZodError) {
                console.error("Validation error ->", this, "<->", generateErrorMessage(error.issues))
                return { code: 400, error: generateErrorMessage(error.issues) }
            }

            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    return { code: 404 }
                }

                if (error.code === "P2002") {
                    return { code: 409 }
                }

                if (error.code === "P2021") {
                    return { code: 500 }
                }
            }

            return { code: 500 }
        }
    }
}

export abstract class VoidUseCase<TResult> extends UseCase<Object, TResult> {
    constructor() {
        const emptySchema = z.object({})
        super(emptySchema)
    }

    execute(): Promise<UseCaseResult<TResult>> {
        return super.execute({})
    }

    protected executeTemplate(props: Object): Promise<UseCaseResult<TResult>> {
        return this.executeVoidTemplate()
    }

    protected abstract executeVoidTemplate(): Promise<UseCaseResult<TResult>>
}
