import { UseCases } from '..'
import D from 'debug'
import { Context, SocketMsgType } from '../entities'
// import util from 'util'

const debug = D('app:core:usecases:LoadSCenario')

import { Deps } from '../gateways'

export const useCaseName = 'load-scenario'

export type Input = {
  context: Context
  useCases: UseCases
}

export type Output = {
  context: Context
}

export const createUseCase = ({
  scenarioGateway,
  navaidsGateway,
  atsRoutesGateway,
  proceduresGateway,
}: Deps) => async (input: Input): Promise<Output> => {
  let context: Context = input.context

  if (input.useCases) {
    debug(`loadScenario`)
  }

  context.scenario = await scenarioGateway.loadScenarioByName('ROME')
  await navaidsGateway.loadWaypointsByCoordinates(
    context.parameters.minCoordinates,
    context.parameters.maxCoordinates
  )
  await navaidsGateway.loadNavaidsByCoordinates(
    context.parameters.minCoordinates,
    context.parameters.maxCoordinates
  )
  await atsRoutesGateway.loadAtsRoutesByCoordinates(
    context.parameters.minCoordinates,
    context.parameters.maxCoordinates
  )
  for (const airport of context.scenario.airports) {
    if (airport.icao) {
      await proceduresGateway.loadProceduresByAirport(airport.icao)
    }
  }
  // debug(`Scenario loaded: ${util.inspect(context.scenario,false,3)}`)

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
    msgType: SocketMsgType.MSG_SCENARIO,
    payload: {
      type: 'SCENARIO',
      scenario: context.scenario,
      waypoints: context.waypoints,
    },
  })

  return { context }
}

export type LoadScenario = ReturnType<typeof createUseCase>
