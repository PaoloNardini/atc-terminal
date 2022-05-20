// import * as fs from 'fs'
// import * as path from 'path'
// import { Airport, Context, Runway, Scenario } from '../../../core/entities'
import { Context } from '../../../core/entities'
import { ScenarioGateway } from '../../../core/gateways'
// import D from 'debug'
// import { Bearing, Coordinate } from '../../../core/valueObjects'
// import * as geomath from '../../../helpers/geomath'
// import util from 'util'
// const debug = D('app:src:infrastructure:scenarioGateway')

export const makeScenarioGateway = (context: Context): ScenarioGateway => {
  return {
    async loadScenarioByName(name: string) {
      void name
      // context = await loadScenario(context, name)
      // debug(`Scenario loaded: ${util.inspect(context.scenario, false, 5)}`)
      return context.scenario
    },
    async loadScenarioByAirportCode(icao: string) {
      void icao
      // TODO
      // context = await loadScenario(context, icao)
      return context.scenario
    },
  }
}
