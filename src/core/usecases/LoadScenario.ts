import { UseCases } from '..'
import D from 'debug'

const debug = D('app:core:usecases:LoadSCenario')

export interface Deps {
}

export const useCaseName = 'load-scenario'

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
        debug(`loadScenario`)
    }

    return { context: input.context }

}

export type LoadScenario = ReturnType<typeof createUseCase>
