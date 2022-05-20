import { UseCases } from '..'
import D from 'debug'

const debug = D('app:core:usecases:LoadProcedures')

export interface Deps {
}

export const useCaseName = 'load-procedures'

export type Input = {
  context: any,
  useCases: UseCases,
}

export type Output = {
  context: any
}

export const createUseCase = ({ }: Deps) => async (
  input: Input
): Promise<Output> => {

    if (input.useCases) {
        debug(`loadProcedures`)
    }

    return { context: input.context }

}

export type LoadProcedures = ReturnType<typeof createUseCase>
