import * as fs from 'fs'
import * as path from 'path'
import { AtsRoute, Context, RouteType, Step, StepType } from '../core/entities'
import { AtsRoutesGateway } from '../core/gateways'
import { Coordinate } from '../core/valueObjects'
import { addWaypoint, findWaypoint } from './NavaidsLoader'
// import * as geomath from '../helpers/geomath'
import util from 'util'
import D from 'debug'
const debug = D('app:src:infrastructure:atsRoutesLoader')

export const makeAtsRoutesGateway = (context: Context): AtsRoutesGateway => {
  void context
  return {
    async loadAtsRoutesByCoordinates(minCoordinates, maxCoordinates) {
      const atsRoutes = await loadAtsRoutes(
        context,
        minCoordinates,
        maxCoordinates
      )
      debug(`AtsRoutes loaded: ${util.inspect(atsRoutes, false, 5)}`)
      return atsRoutes
    },
  }
}

const loadAtsRoutes = async (
  context: Context,
  minCoordinates: Coordinate,
  maxCoordinates: Coordinate
): Promise<AtsRoute[]> => {
  debug(
    `Load Ats Routes between ${minCoordinates.latitude}/${minCoordinates.longitude} and ${maxCoordinates.latitude}/${maxCoordinates.longitude}`
  )
  context.atsRoutes = []
  if (!!!minCoordinates || !!!maxCoordinates) {
    return context.atsRoutes
  }
  const data = fs.readFileSync(
    path.join(__dirname, '../../data/1712/ATS.txt'),
    'utf8'
  )
  if (data) {
    var lines = data.split('\n')
    var words
    var mode = -1
    var valid = false
    // var points = 0
    var atsRoute = undefined
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      if (words.length < 3) {
        mode = 0
        if (atsRoute != undefined && valid == true) {
          // Save last current route before change
          context.atsRoutes.push(atsRoute)
          var steps = atsRoute.getLegs()
          for (var s = 0; s < steps.length; s++) {
            const step = steps[s]
            if (step.coordinate) {
              var fix = findWaypoint(context, step.identifier, step.coordinate)
              if (!fix) {
                fix = addWaypoint(context, step.identifier, step.coordinate)
              }
              fix.isAts = true
              fix.useCounter++
            }
          }
        }
        atsRoute = undefined
      }
      if (words.length == 3) {
        atsRoute = undefined
        valid = false
        mode = 1
        // points = parseInt(words[2]);
        atsRoute = new AtsRoute()
        atsRoute.type = RouteType.ATS
        atsRoute.name = words[1]
      }
      if (mode == 1 && words.length > 8) {
        const latitude = parseFloat(words[2])
        const longitude = parseFloat(words[3])
        if (
          latitude >= minCoordinates.getLatitude() &&
          latitude <= maxCoordinates.getLatitude() &&
          longitude >= minCoordinates.getLongitude() &&
          longitude <= maxCoordinates.getLongitude()
        ) {
          valid = true
        }
        const step = new Step()
        step.type = StepType.DF
        step.identifier = words[1]
        step.coordinate = new Coordinate(latitude, longitude)
        step.heading = parseInt(words[8])
        step.distance = parseFloat(words[9])
        if (atsRoute) {
          atsRoute.addLeg(step)
        }
      }
    }
  }
  return context.atsRoutes
}
