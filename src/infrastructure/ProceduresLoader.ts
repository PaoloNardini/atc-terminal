import * as fs from 'fs'
import * as path from 'path'
import { AtsRoute, Context, RouteType, Step, StepType } from '../core/entities'
import { ProceduresGateway } from '../core/gateways'
import { Coordinate } from '../core/valueObjects'
import { addWaypoint, findWaypoint } from './NavaidsLoader'
import * as constants from '../core/constants'
// import * as geomath from '../helpers/geomath'
import util from 'util'
import D from 'debug'
// import { LatLon } from '../helpers/latlon'

const debug = D('app:src:infrastructure:proceduresLoader')

export const makeProceduresGateway = (context: Context): ProceduresGateway => {
  void context
  return {
    async loadProceduresByAirport(icao: string) {
      const procedures = await loadAirportProcedures(context, icao)
      debug(`Procedures loaded: ${util.inspect(procedures, false, 5)}`)
      context.scenario.atsRoutes = context.scenario.atsRoutes.concat(procedures)
      return procedures
    },
  }
}

const loadAirportProcedures = async (
  context: Context,
  icao: string
): Promise<AtsRoute[]> => {
  debug(`Load Procedures for airport ${icao}`)
  const procedures: AtsRoute[] = []
  const data = fs.readFileSync(
    path.join(__dirname, `../../data/1712/PROC/${icao}.txt`),
    'utf8'
  )
  if (data) {
    const lines: string[] = data.split('\n')
    let words: string[]
    let mode: string = ''
    // let valid: boolean = false
    // var points = 0
    var atsRoute = undefined
    var mapFixPos = -1
    var fixCounter = -1
    var step_type = ''
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      /*
        FIX TYPE
        CA - Course to an Altitude
        CF - Course to a Fix
        DF - Direct to a Fix
        FA - Fix to an Altitude
        FM - Fix to a Manual Termination
        HA - Racetrack Course Reversal (Alt Term)
        HF - Racetrack (Single Circuit -Fix Term)
        HM - Racetrack (Manual Termination)
        IF - Initial Fix
        TF - Track to a Fix TF
        RF - Constant Radius Arc
        VA - Heading to an Altitude
        VI - Heading to an Intercept
        V  - Heading to a Manual Termination


        PROC format
        TF,QN878,-45.302217,168.731147,0, ,0.0,0.0,160.0,9.1,0,0,0,0,0,0,0,0,0.1

        WAYPOINT TYPE TF (Waypoint to a Fix)
        TF = Record identifier string  always TF
        QN878 = Waypoint identifier
        -45.302217 = Track latitude degrees
        168.731147 = Track longitude  degrees
        0 = Turn direction int, 0=shorters, 1=left, 2=right
        " " = Navaid identifier
        0.0 = Track bearing   degrees
        0.0 = Track distance nautical miles
        160.0 = Magnetic course   degrees
        9.1= distance  nautical miles
        0 = Altitude constraint int 0=no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
        0 = First altitude int feet
        0 = Second altitude int feet
        0 = Speed constraint int see Speed Constraints below
        0 = First speed int knots
        0 = Second speed int knots
        0 = Special Track int see Special Tracks below
        0 = Overfly Track bool see Overfly Tracks below
        0.1 = Req. Nav. Perf.


        And a RF Leg something like this:

        RF = Record identifier
        REDGO = Start fix
        50.10916669 = Track latitude   degrees
        8.85638906 = Track longitude   degrees
        0 = Turn direction
        TAU = Arc Center
        249 = Sweep angle  degrees
        4.3 = Radius nautical miles
        1 = Altitude constraint
        4000 = First altitude   feet
        0 = Second altitude   feet
        1 = Speed constraint
        160 = First speed  knots
        0 = Second speed   knots
        0 = Special Track
        0 = Overfly Track
        0.1 = Req. Nav. Perf.
      */

      if (words.length < 2) {
        mode = ''
      }

      if (words.length > 4 && words[0].length == 2) {
        // FIX
        step_type = words[0]
        var fix_label = words[1]
        var latitude = parseFloat(words[2])
        var longitude = parseFloat(words[3])
        if (
          mode == 'SID' ||
          mode == 'STAR' ||
          mode == 'APPTR' ||
          mode == 'FINAL'
        ) {
          if (
            (step_type == 'IF' ||
              step_type == 'TF' ||
              step_type == 'CF' ||
              step_type == 'DF') &&
            latitude != 0 &&
            longitude != 0
          ) {
            // var found = false
            const coords = new Coordinate(latitude, longitude)

            var fix = findWaypoint(context, fix_label, coords)
            if (!fix) {
              fix = addWaypoint(context, fix_label, coords)
            }
            fix.isWaypoint = true
            if (words.length > 10) {
              fix.altitude = parseFloat(words[11])
            }
            fix.isRouteFix = true
            fix.useCounter++
            if (step_type == 'IF') {
              fix.isFix = true
              fix.isWaypoint = false
            }
            if (mode == 'FINAL' && ++fixCounter == mapFixPos) {
              if (atsRoute) {
                atsRoute.mapFixName = fix_label
              }
              mapFixPos = -1
              fixCounter = -1
            }
          }
        }
      }

      if (words[0] == 'SID') {
        mode = 'SID'
        atsRoute = new AtsRoute()
        atsRoute.icao = icao
        atsRoute.name = words[1]
        atsRoute.name2 = words[2]
        atsRoute.type_number = words[3]
        atsRoute.type = RouteType.SID
        const runway = context.findRunwayByName(icao, words[2])
        if (runway) {
          atsRoute.runwayName = runway.label1
        }
        procedures.push(atsRoute)
      } else if (words[0] == 'STAR') {
        mode = 'STAR'
        atsRoute = new AtsRoute()
        atsRoute.icao = icao
        atsRoute.name = words[1]
        atsRoute.name2 = words[2]
        atsRoute.type_number = words[3]
        atsRoute.type = RouteType.STAR
        if (words[2] == 'ALL') {
          atsRoute.runwayName = words[2]
        } else {
          const runway = context.findRunwayByName(icao, words[2])
          if (runway) {
            atsRoute.runwayName = runway.label1
          }
        }
        procedures.push(atsRoute)
      } else if (words[0] == 'APPTR') {
        mode = 'APPTR'
        atsRoute = new AtsRoute()
        atsRoute.icao = icao
        atsRoute.name = words[1]
        atsRoute.type = RouteType.APPTR
        procedures.push(atsRoute)
      } else if (words[0] == 'FINAL') {
        mode = 'FINAL'
        atsRoute = new AtsRoute()
        atsRoute.icao = icao
        atsRoute.name = words[1]
        atsRoute.type = RouteType.FINAL
        const runway = context.findRunwayByName(icao, words[2])
        if (runway) {
          atsRoute.runwayName = runway.label1
        }
        atsRoute.finalFixName = words[2]
        atsRoute.mapFixName = ''
        atsRoute.mapFixPos = parseInt(words[4])
        fixCounter = 0
        procedures.push(atsRoute)
      } else if (words.length > 1 && words[0] != '\r') {
        // Add Leg to Route
        var step = new Step()
        switch (step_type) {
          case 'IF':
            // IF - Initial Fix
            step.type = StepType.IF
            step.identifier = words[1]
            step.coordinate = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            step.navaid_id = words[4]
            step.track_bearing = parseInt(words[5])
            step.track_distance = parseFloat(words[6])
            step.altitude_constraint = parseInt(words[7])
            step.altitude_1 = parseInt(words[8])
            step.altitude_2 = parseInt(words[9])
            step.speed_constraint = parseInt(words[10])
            step.speed_1 = parseInt(words[11])
            step.speed_2 = parseInt(words[12])
            break
          case 'TF':
            // TF - Track to a Fix TF
            step.type = StepType.TF
            step.identifier = words[1]
            step.coordinate = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            step.turn_direction = parseInt(words[4])
            step.navaid_id = words[5]
            step.track_bearing = parseInt(words[6])
            step.track_distance = parseFloat(words[7])
            step.heading = parseInt(words[8])
            step.distance = parseFloat(words[9])
            step.altitude_constraint = parseInt(words[10])
            step.altitude_1 = parseInt(words[11])
            step.altitude_2 = parseInt(words[12])
            step.speed_constraint = parseInt(words[13])
            step.speed_1 = parseInt(words[14])
            step.speed_2 = parseInt(words[15])
            break
          case 'CA':
          // CA - Course to an Altitude
          // CA,0,330.0,2,830,0,0,0,0,0,0
          case 'VA':
            // VA - Heading to an Altitude
            // VA,0,308.0,2,600,0,0,0,0,0,0
            step.turn_direction = parseInt(words[1])
            step.heading = parseInt(words[2])
            step.altitude_constraint = parseInt(words[3])
            step.altitude_1 = parseInt(words[4])
            step.altitude_2 = parseInt(words[5])
            break
          case 'CF':
            // CF - Course to a Fix
            // CF,XENOL,41.788333,11.552222,0,ROM,267.1,46.5,274.0,12.0,2,4000,0,0,0,0,0,0
            step.identifier = words[1]
            step.coordinate = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            step.turn_direction = parseInt(words[4])
            step.navaid_id = words[5]
            step.track_bearing = parseInt(words[6])
            step.track_distance = parseFloat(words[7])
            step.heading = parseInt(words[8])
            step.distance = parseFloat(words[9])
            step.speed_constraint = parseInt(words[10])
            step.speed_1 = parseInt(words[11])
            step.speed_2 = parseInt(words[12])
            step.overfly = parseInt(words[16])
            break
          case 'DF':
            // DF - Direct to a Fix
            step.identifier = words[1]
            step.coordinate = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            step.turn_direction = parseInt(words[4])
            step.navaid_id = words[5]
            step.track_bearing = parseInt(words[6])
            step.track_distance = parseFloat(words[7])
            step.altitude_constraint = parseInt(words[8])
            step.altitude_1 = parseInt(words[9])
            step.altitude_2 = parseInt(words[10])
            step.speed_constraint = parseInt(words[11])
            step.speed_1 = parseInt(words[12])
            step.speed_2 = parseInt(words[13])
            break
          case 'CD':
            // CD - Coarse Direction
            // CD, ,0,0,0,OST,0,0.0,161.0,2.0,2,620,0,0,0,0,0,0
            // CD, ,0,0,0,OST,0,0.0,68.0,5.0,2,1000,0,0,0,0,0,0
            step.navaid_id = words[5]
            step.heading = parseInt(words[8])
            step.track_distance = parseFloat(words[9])
            step.altitude_constraint = parseInt(words[10])
            step.altitude_1 = parseInt(words[11])
            step.altitude_2 = parseInt(words[12])
            break
          case 'CI':
            // CI - Coarse to Intercept
            // CI,2, ,0.0,300.0,0,0,0,1,220,0,0,0
            step.heading = parseInt(words[4])
            step.speed_constraint = parseInt(words[13])
            step.speed_1 = parseInt(words[14])
            step.speed_2 = parseInt(words[15])
            break
          case 'FD':
            // FD - Fix to a direction
            // FD,OST,41.803778,12.237528,0,OST,0.0,20.0,262.0,20.0,0,0,0,0,0,0,0,0
            // FD,OST,41.803778,12.237528,0,OST,0.0,9.0,193.0,9.0,1,2000,0,0,0,0,0,0
            // FD,TAQ,42.215056,11.732611,0,TAQ,0.0,16.0,119.0,16.0,0,0,0,0,0,0,1,0
            step.navaid_id = words[5]
            step.track_bearing = parseInt(words[6])
            step.track_distance = parseFloat(words[7])
            step.heading = parseInt(words[8])
            step.altitude_constraint = parseInt(words[10])
            step.altitude_1 = parseInt(words[11])
            step.altitude_2 = parseInt(words[12])
            step.speed_constraint = parseInt(words[13])
            step.speed_1 = parseInt(words[14])
            step.speed_2 = parseInt(words[15])
            step.overfly = parseInt(words[16])
            break
          case 'FA':
            // FA - Fix to an Altitude
            // FA,RW16L,41.845969,12.261494,0,CMP,0.0,0.0,161.0,2,450,0,0,0,0,0,0
            step.heading = parseInt(words[8])
            step.altitude_constraint = parseInt(words[9])
            step.altitude_1 = parseInt(words[10])
            step.altitude_2 = parseInt(words[11])
            break
          case 'HA':
          // HA - Racetrack Course Reversal (Alt Term)
          case 'HF':
          // HF - Racetrack (Single Circuit -Fix Term)
          // HF,UNPIV,43.544722,10.251111,1, ,0.0,0.0,36.0,05,2,3000,0,0,0,0,0,0,0
          case 'HM':
            // HM - Racetrack (Manual Termination)
            // HM,D193S,41.497331,12.130561,2, ,0.0,0.0,13.0,05,0,0,0,0,0,0,0,0,0
            // HM,D291S,41.925397,11.846133,2, ,0.0,0.0,111.0,05,2,3000,0,0,0,0,0,0,0
            // HM,D160S,41.502928,12.369833,1, ,0.0,0.0,340.0,05,0,0,0,1,185,0,0,0,0
            step.identifier = words[1]
            step.coordinate = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            step.turn_direction = parseInt(words[4])
            step.heading = parseInt(words[8])
            step.leg_distance = parseFloat(words[9])
            step.altitude_constraint = parseInt(words[10])
            step.altitude_1 = parseInt(words[11])
            step.altitude_2 = parseInt(words[12])
            step.speed_constraint = parseInt(words[13])
            step.speed_1 = parseInt(words[14])
            step.speed_2 = parseInt(words[15])
            break
          case 'VI':
            // VI - Heading to an Intercept
            // VI,2, ,0.0,238.0,0,0,0,1,200,0,0,0
            step.turn_direction = parseInt(words[1])
            step.heading = parseInt(words[4])
            step.altitude_constraint = parseInt(words[8])
            step.altitude_1 = parseInt(words[9])
            step.altitude_2 = parseInt(words[10])
            break
          case 'VM':
            // V / VM - Heading to a Manual Termination
            step.heading = parseInt(words[4])
            break
          case 'RF':
          // RF - Constant Radius Arc
          case 'V':
          case 'FM':
            // FM - Fix to a Manual Termination
            console.log('Leg type ' + step.type + ' unsupported')
            break
        }
        if (mode == 'FINAL') {
          step.change_flight_status = constants.STATUS_FINAL
        }
        if (atsRoute) {
          atsRoute.addLeg(step)
        }
      }

      if (words.length < 3) {
        mode = ''
        if (atsRoute != undefined /* && valid == true */) {
          // Save last current route before change
          procedures.push(atsRoute)
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
        // valid = false
        mode = '1'
        // points = parseInt(words[2]);
        atsRoute = new AtsRoute()
        atsRoute.type = RouteType.ATS
        atsRoute.name = words[1]
      }
      if (mode == '1' && words.length > 8) {
        const latitude = parseFloat(words[2])
        const longitude = parseFloat(words[3])
        /*
        if (
          latitude >=  minCoordinates.getLatitude() &&
          latitude <= maxCoordinates.getLatitude() &&
          longitude >= minCoordinates.getLongitude() &&
          longitude <= maxCoordinates.getLongitude()
        ) {
          valid = true
        }
        */
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
  return procedures
}
