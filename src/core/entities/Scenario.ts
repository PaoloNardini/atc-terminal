import { Airport, Plane } from '.'
import { AtsRoute } from './AtsRoute'
import { Runway } from './Runway'
import { Waypoint } from './Waypoint'

export class Scenario {
  name: string = ''
  airports: Airport[] = []
  runways: Runway[] = []
  procedures: AtsRoute[] = []
  atsRoutes: AtsRoute[] = []
  waypoints: Record<string, Waypoint> = {}
  initialPlanes: Plane[] = [] // Initial planes situation at scenario startup
  latitudeCenter: number = 0
  longitudeCenter: number = 0
}
