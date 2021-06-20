import { UseCases } from '..'
import D from 'debug'

const debug = D('app:core:usecases:LoadAirlines')

export interface Deps {
}

export const useCaseName = 'load-airlines'

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
        debug(`loadAirlines`)
    }

    return { context: input.context }

}

export type LoadAirlines = ReturnType<typeof createUseCase>
