import { Airport, Plane } from '.'
import { AtsRoute } from './AtsRoute'
import { Runway } from './Runway'

export class Scenario {
  name: string = ''
  airports: Airport[] = []
  runways: Runway[] = []
  procedures: AtsRoute[] = []
  atsRoutes: AtsRoute[] = []
  initialPlanes: Plane[] = [] // Initial planes situation at scenario startup
  latitudeCenter: number = 0
  longitudeCenter: number = 0
}
