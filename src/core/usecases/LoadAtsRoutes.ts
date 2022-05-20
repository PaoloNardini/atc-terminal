import { UseCases } from '..'
import D from 'debug'

const debug = D('app:core:usecases:LoadAtsRoutes')

export interface Deps {
}

export const useCaseName = 'load-ats-routes'

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
        debug(`loadAtsRoutes`)
    }

    return { context: input.context }

}

export type LoadAtsRoutes = ReturnType<typeof createUseCase>
