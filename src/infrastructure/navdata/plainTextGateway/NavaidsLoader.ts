import * as fs from 'fs'
import * as path from 'path'
import { Context, NavaidType, Waypoint } from '../../../core/entities'
import { NavaidsGateway } from '../../../core/gateways'
import D from 'debug'
import { Coordinate } from '../../../core/valueObjects'
// import * as geomath from '../helpers/geomath'
import util from 'util'
const debug = D('app:src:infrastructure:navaidsLoader')

export const makeNavaidsGateway = (context: Context): NavaidsGateway => {
  void context
  return {
    async loadNavaidsByCoordinates(minCoordinates, maxCoordinates) {
      const navaids = await loadNavaids(context, minCoordinates, maxCoordinates)
      debug(`Navaids loaded: ${util.inspect(navaids, false, 5)}`)
      return navaids
    },
    async loadWaypointsByCoordinates(minCoordinates, maxCoordinates) {
      const wp = await loadWaypoints(context, minCoordinates, maxCoordinates)
      debug(`Waypoints loaded: ${util.inspect(wp, false, 5)}`)
      return wp
    },
  }
}

const loadWaypoints = async (
  context: Context,
  minCoordinates: Coordinate,
  maxCoordinates: Coordinate
): Promise<Record<string, Waypoint>> => {
  debug(
    `Load Waypoints between ${minCoordinates.latitude}/${minCoordinates.longitude} and ${maxCoordinates.latitude}/${maxCoordinates.longitude}`
  )
  const waypoints: Record<string, Waypoint> = {}
  if (!!!minCoordinates || !!!maxCoordinates) {
    return waypoints
  }
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/1712/Waypoints.txt'),
    'utf8'
  )
  if (data) {
    var lines = data.split('\n')
    var words
    // var icao_prenavaid = icao.substring(0,2);
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      if (words[3] != undefined) {
        var waypoint_name = words[0].toUpperCase()
        var latitude = parseFloat(words[1])
        var longitude = parseFloat(words[2])
        const coordinate = new Coordinate(latitude, longitude)
        if (
          latitude >= minCoordinates.getLatitude() &&
          latitude <= maxCoordinates.getLatitude() &&
          longitude >= minCoordinates.getLongitude() &&
          longitude <= maxCoordinates.getLongitude()
        ) {
          // Waypoint is between scenery coordinates
          let w: Waypoint | undefined = findWaypoint(
            context,
            waypoint_name,
            coordinate
          )
          if (!w) {
            w = addWaypoint(context, waypoint_name, coordinate)
          }
          w.isWaypoint = false
          w.useCounter++
        }
      }
    }
  }
  return waypoints
}

export const findWaypoint = (
  context: Context,
  name: string,
  coordinates?: Coordinate
): Waypoint | undefined => {
  debug(`findWaypoint ${name}`)
  const w: Waypoint = context.waypoints[name]
  if (w) {
    if (coordinates) {
      if (
        Math.abs(w.latitude - coordinates.getLatitude()) < 0.05 &&
        Math.abs(w.longitude - coordinates.getLongitude()) < 0.05
      ) {
        // Waypoint has the same name and coordinates are within tollerance
        return w
      }
    } else {
      return w
    }
  }
  return undefined
}

export const addWaypoint = (
  context: Context,
  name: string,
  coordinate: Coordinate
): Waypoint => {
  debug(`addWaypoint ${name}`)
  const w = new Waypoint()
  w.name = name.toUpperCase()
  w.label = w.name
  w.latitude = coordinate.latitude || 0
  w.longitude = coordinate.longitude || 0
  context.waypoints[w.name] = w
  return w
}

const loadNavaids = async (
  context: Context,
  minCoordinates: Coordinate,
  maxCoordinates: Coordinate
): Promise<void> => {
  debug(`Load Navaidsscenario`)
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/1712/Navaids.txt'),
    'utf8'
  )
  if (!!!minCoordinates || !!!maxCoordinates) {
    return
  }
  if (data) {
    // let icao: any[] = []
    // let runways: any[] = []
    // debug(`data: ${data}`)
    var lines: string[] = data.split('\n')
    var words: string[]
    // var mode = '';
    // debug(`lines: ${lines.length}`)
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      if (words.length > 9) {
        const latitude = parseFloat(words[6])
        const longitude = parseFloat(words[7])
        if (
          latitude >= minCoordinates.getLatitude() &&
          latitude <= maxCoordinates.getLatitude() &&
          longitude >= minCoordinates.getLongitude() &&
          longitude <= maxCoordinates.getLongitude()
        ) {
          // Navaid is inside give coordinates
          // var found = false;
          var update = false
          var navaid_label = words[0].toUpperCase()
          var navaid_name = words[1].toUpperCase()
          var freq: number = parseFloat(words[2])
          let navaid: Waypoint | undefined = findWaypoint(
            context,
            navaid_label,
            new Coordinate(latitude, longitude)
          )
          if (!navaid) {
            navaid = addWaypoint(
              context,
              navaid_label,
              new Coordinate(latitude, longitude)
            )
            navaid.freq = freq
          } else if (navaid.isNavaid) {
            update = true
          }
          navaid.isNavaid = true
          navaid.useCounter++
          if (navaid_name.includes('ILS/CAT III')) {
            navaid.navaidType = NavaidType.NAVAID_TYPE_ILS_CAT_3
          } else if (navaid_name.includes('ILS/CAT II')) {
            navaid.navaidType = NavaidType.NAVAID_TYPE_ILS_CAT_2
          } else if (navaid_name.includes('ILS/CAT I')) {
            navaid.navaidType = NavaidType.NAVAID_TYPE_ILS_CAT_1
          } else if (navaid_name.includes('ILS/LLZ')) {
            navaid.navaidType = NavaidType.NAVAID_TYPE_ILS_CAT_1
          } else if (navaid_name.includes('LDA/FACILITY')) {
            navaid.navaidType = NavaidType.NAVAID_TYPE_ILS_CAT_1
          } else if (freq >= 108 && freq <= 116) {
            if (
              navaid.navaidType == NavaidType.NAVAID_TYPE_NDB &&
              update == true
            ) {
              navaid.navaidType = NavaidType.NAVAID_TYPE_VORDMENDB
            } else {
              navaid.navaidType = NavaidType.NAVAID_TYPE_VORDME
            }
          } else if (freq >= 200 && freq <= 500) {
            if (
              navaid.navaidType == NavaidType.NAVAID_TYPE_VORDME &&
              update == true
            ) {
              navaid.navaidType = NavaidType.NAVAID_TYPE_VORDMENDB
            } else {
              navaid.navaidType = NavaidType.NAVAID_TYPE_NDB
            }
          }
        }
      }
    }
  }
}
