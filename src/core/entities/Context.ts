import { AtsRoute } from './AtsRoute'
import { Parameters } from './Parameters'
import { Plane } from './Plane'
import { Runway } from './Runway'
import { Scenario } from './Scenario'
import { Waypoint } from './Waypoint'

export class Context {
  mainTimer: number = 0
  lastTimer: number = 0
  scenario: Scenario = new Scenario()
  parameters: Parameters = new Parameters()
  planes: Plane[] = []
  // waypoints: Record<string, Waypoint> = {}
  // atsRoutes: AtsRoute[] = []

  findPlaneByCallsign(callsign: string): Plane | undefined {
    return this.planes.find(plane => {
      return plane.callsign?.substring(0, callsign.length) == callsign
    })
  }

  findWaypointByName(wpName: string): Waypoint | undefined {
    if (this.scenario.waypoints[wpName]) {
      return this.scenario.waypoints[wpName]
    }
    return undefined
  }

  findRunwayByName(icao: string, name: string): Runway | undefined {
    return this.scenario.runways.find(rwy => {
      return rwy.icao == icao && rwy.label1 == name
    })
  }

  findAtsRoute(name: string, name2?: string): AtsRoute | undefined {
    return this.scenario.atsRoutes.find(route => {
      return name == route.name && (!name2 || name2 == route.name2)
    })
  }
}
