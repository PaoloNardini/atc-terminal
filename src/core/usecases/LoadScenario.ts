import { UseCases } from '..'
import D from 'debug'
import { Context, SocketMsgType } from '../entities'
import util from 'util'

const debug = D('app:core:usecases:LoadSCenario')

import { Deps } from '../gateways'

export const useCaseName = 'load-scenario'

export type Input = {
  context: Context,
  useCases: UseCases,
}

export type Output = {
  context: Context
}

export const createUseCase = ({ scenarioGateway }: Deps) => async (
  input: Input
): Promise<Output> => {

    let context: Context = input.context

    if (input.useCases) {
        debug(`loadScenario`)
    }

    context.scenario = await scenarioGateway.loadScenarioByName('ROME')

    debug(`Scenario loaded: ${util.inspect(context.scenario,false,3)}`)

    /*
    const scenario: Scenario = {
      name: 'Scenario Test',
      airports: [],
      procedures: [],
      atsRoutes: [],
      initialPlanes: []
    } 
    */     

    input.useCases.dispatch({
      context,
      msgType: SocketMsgType.MSG_SCENARIO, payload: {
        type: 'SCENARIO',
        scenario: context.scenario
      }
    })

    return { context }

}

export type LoadScenario = ReturnType<typeof createUseCase>
