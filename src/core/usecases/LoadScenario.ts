import { UseCases } from '..'
import D from 'debug'
import { Scenario, SocketMsgType } from '../entities'

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

     let context = input.context

    if (input.useCases) {
        debug(`loadScenario`)
    }

    const scenario: Scenario = {
      name: 'Scenario Test',
      airports: [],
      procedures: [],
      atsRoutes: [],
      initialPlanes: []
    }      

    input.useCases.dispatch({
      context,
      msgType: SocketMsgType.MSG_SCENARIO, payload: {
        type: 'SCENARIO',
        scenario
      }
    })

    return { context }

}

export type LoadScenario = ReturnType<typeof createUseCase>
