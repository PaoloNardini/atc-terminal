import { Airline, Runway, Slot, Route, Context } from '.'
import { Bearing, Coordinate } from '../valueObjects'
import * as constants from '../constants'
import * as geomath from '../../../src/helpers/geomath'
import { Waypoint } from './Waypoint'
import { LatLon } from '../../helpers/latlon'
import { AtsRoute, Step } from './AtsRoute'

export class Plane {
  // Identification
  label: string = ''

  // Flight info
  airline?: Airline
  callsign?: string
  completeCallsign: string = 'NONE'
  aircraft: string = 'B738'
  vfr: boolean = false
  airp_dep?: string
  airp_dest?: string
  squack?: string
  squack_assigned?: string
  arrival: boolean = false
  departure: boolean = false
  transit: boolean = false
  status: string = ''
  atc_phase?: string

  // coordinate?: Coordinate
  latitude: number = 0
  longitude: number = 0
  coarse?: Bearing
  distance?: number

  // Private Navigation data
  speed: number = 0
  speed_target: number = -1
  heading: number = 0
  heading_target: number = -1
  fl: number = 0
  fl_final: number = -1
  fl_initial: number = -1
  fl_cleared: number = -1
  climb: number = 0
  turn: number = 0

  // Route data
  // route = -1;
  route?: Route // Route object
  // tracks = [];          // OLD Tracks
  steps: Step[] = [] // NEW Legs Steps
  fix_next?: number // OLD
  fix_step?: number // OLD
  step_current: number = -1 // NEW
  runway?: Runway // Landing only
  next_fix_latitude?: number
  next_fix_longitude?: number

  // Radial intercept data
  intercepting: boolean = false // Intercepting a radial
  radial2intercept?: number // Radial to intercept
  navaid2intercept?: number // Navaid to intercept radial
  radialInbound?: number // true to follow radial inbound / false for outbound
  interceptPoint?: number // LatLon coordinates of radial intercept point
  interceptProcedure?: string // Type of intercept procedure: STRAIGHT / TURN

  // Holding Pattern data
  holding: boolean = false
  holding_identifier?: string // holding fix name
  holding_fix?: string // holding fix object;
  holding_radial?: number // inbound radial
  holding_leg_distance?: number // leg distance in miles
  holding_turn_direction?: number // turn direction 1 = left 2 = right
  holding_points?: string[] // 4 holding points
  holding_point_next?: string // next point in holding pattern
  // o_holding = undefined;                 // Holding graphical object

  // Slot data
  slot?: Slot

  // Internal
  // recurse: boolean

  constructor() {}

  setCoordinate(coordinate: Coordinate) {
    this.latitude = coordinate.getLatitude()
    this.longitude = coordinate.getLongitude()
  }

  /**
   * LOW LEVEL NAVIGATION MANAGEMENT
   */

  turnToHeading = (
    newHeading: number,
    turnDirection: string | undefined
  ): void => {
    // Set new heading to stop turn
    this.heading_target = newHeading
    // Calculate turn ratio and direction
    if (Math.abs(newHeading - this.heading) > 1) {
      if (
        turnDirection == 'R' ||
        (newHeading > this.heading && newHeading - this.heading < 180) ||
        (this.heading > newHeading && this.heading - newHeading > 180)
      ) {
        this.turn = constants.PLANE_TURN_RATIO
      } else {
        this.turn = -constants.PLANE_TURN_RATIO
      }
    }
  }

  setNewSpeed = (newSpeed: number): void => {
    this.speed_target = newSpeed
  }

  setNewFL = (newLevel: number): void => {
    if (newLevel < 500) {
      // Convert feet to FL
      newLevel = newLevel * 100
    }
    if (this.fl == newLevel) {
      // TODO
      return
    }
    if (newLevel > this.fl) {
      this.climb = constants.PLANE_CLIMB_RATIO
    } else {
      this.climb = -constants.PLANE_CLIMB_RATIO
    }
    this.fl_cleared = newLevel
  }

  addStatus = (status: string) => {
    var that = this
    if (this.status.indexOf(status) == -1) {
      this.status += status
    }
    switch (status) {
      case constants.STATUS_CLEARED_TAKEOFF:
        setTimeout(function() {
          that.removeStatus(constants.STATUS_CLEARED_TAKEOFF)
          that.addStatus(constants.STATUS_TAKEOFF)
        }, 10000 + Math.random() * 15000)
        break
      case constants.STATUS_TAKEOFF:
        this.climb = 0
        // this.setLevelCleared(this.fl_initial)
        this.step_current = -1
        /*
        if (speedX2 == 1) {
          this.lastcompute = (new Date().getTime() - 5000) / 500
        } else {
          this.lastcompute = (new Date().getTime() - 5000) / 1000
        }
        */
        // this.advance2NextStep()
        setTimeout(function() {
          that.removeStatus(constants.STATUS_RADIO_CONTACT_TWR)
          that.addStatus(constants.STATUS_RADIO_CONTACT_YOU)
          // that.setAtcPhase(PLANE_ATC_ACTIVE)
        }, 20000 + Math.random() * 20000)
        break
      case constants.STATUS_RADIO_CONTACT_YOU:
        this.removeStatus(constants.STATUS_RADIO_CONTACT_ATC)
        this.removeStatus(constants.STATUS_RADIO_CONTACT_TWR)
        /*
        var greeting = getGreeting()
        msg = this.completeCallsign + ' with you, ' + greeting
        speak = this.completeCallsign + ' WITH YOU, ' + greeting
        msgbar.showMessage(msg, MSG_FROM_PLANE)
        */
        break
      case constants.STATUS_RADIO_CONTACT_ATC:
        this.removeStatus(constants.STATUS_RADIO_CONTACT_YOU)
        this.removeStatus(constants.STATUS_RADIO_CONTACT_TWR)
        break
      case constants.STATUS_RADIO_CONTACT_TWR:
        this.removeStatus(constants.STATUS_RADIO_CONTACT_ATC)
        this.removeStatus(constants.STATUS_RADIO_CONTACT_YOU)
        break
      case constants.STATUS_APPROACH:
        this.removeStatus(constants.STATUS_LANDING)
        this.removeStatus(constants.STATUS_FINAL)
        this.removeStatus(constants.STATUS_FINAL_APPROACH)
        this.removeStatus(constants.STATUS_MISSED_APPROACH)
        break
      case constants.STATUS_FINAL:
        this.removeStatus(constants.STATUS_APPROACH)
        this.removeStatus(constants.STATUS_FINAL_APPROACH)
        break
      case constants.STATUS_LANDING:
        this.removeStatus(constants.STATUS_FINAL)
        this.removeStatus(constants.STATUS_APPROACH)
        this.removeStatus(constants.STATUS_FINAL_APPROACH)
        break
      case constants.STATUS_LANDED:
        this.removeStatus(constants.STATUS_LANDING)
        this.removeStatus(constants.STATUS_FINAL)
        this.removeStatus(constants.STATUS_APPROACH)
        this.removeStatus(constants.STATUS_FINAL_APPROACH)
        break
      case constants.STATUS_MISSED_APPROACH:
        this.removeStatus(constants.STATUS_LANDING)
        this.removeStatus(constants.STATUS_FINAL)
        this.removeStatus(constants.STATUS_APPROACH)
        this.removeStatus(constants.STATUS_FINAL_APPROACH)
        break
    }
    /*
    this.updateStripMode();
    this.setAutoRatio();
    this.setAutoSpeed();
    */
  }

  removeStatus = (status: string) => {
    var pos = this.status.indexOf(status)
    if (pos != -1) {
      this.status =
        this.status.substr(0, pos) + this.status.substr(pos + status.length)
    }
  }

  hasStatus = (status: string): boolean => {
    return this.status.indexOf(status) != -1
  }

  goToFix = (waypoint: Waypoint) => {
    this.next_fix_latitude = waypoint.latitude
    this.next_fix_longitude = waypoint.longitude
    this.adjustHeadingToNextFix()
  }

  adjustHeadingToNextFix = () => {
    if (this.next_fix_latitude && this.next_fix_longitude) {
      var origin = new LatLon(this.latitude, this.longitude)
      var dest = new LatLon(this.next_fix_latitude, this.next_fix_longitude)
      this.turnToHeading(origin.finalBearingTo(dest), undefined)
    }
  }

  followProcedure = (atsRoute: AtsRoute) => {
    // TODO
    void atsRoute
    /*
        if (o_route.type == 'SID') {
            this.arrival = false;
            this.departure = true;
            this.transit = false;
            // this.fl = 0;
            // this.climb = 3000;
            // this.fl_cleared = 5000;
        }
        else if (o_route.type == 'STAR') {
            this.arrival = true;
            this.departure = false;
            this.transit = false;
            if (runway != undefined) {
                // Route runway could be ALL ... store assigned runway
                this.runway = runway;
            }
        }
        else if (o_route.type == 'FINAL') {
            this.arrival = true;
            this.departure = false;
            this.transit = false;
            // this.fl = 6000;
            // this.climb = -300;
            this.setLevelCleared(0);
        }
        var way = o_route.tracks;
        var a_steps = o_route.getLegs();
        // OLD this.assignRouteByWaypoints(way);
        this.assignRouteBySteps(a_steps);
    */
    const steps = atsRoute.getLegs()
    this.assignRouteBySteps(steps)
  }

  assignRouteBySteps = (steps: Step[]) => {
    for (const step of steps) {
      this.appendStep(step)
    }
    this.step_current = -1
    /*
    if (this.steps && this.steps.length > 0) {
      if (this.fl > 0 && this.speed > 0) {
        this.advance2NextStep()
      }
    }
    */
  }

  appendStep = (step: Step) => {
    if (!this.steps) {
      this.steps = []
    }
    this.steps.push(step)
  }
}

/**
 * BASIC PLANE MOVEMENTS
 */

export const planeMove = (plane: Plane, elapsedSeconds: number): void => {
  // Calculate plane 3 axis movements
  if (plane.fl == 0 && plane.speed == 0) {
    // Plane on the ground ... nothing to do
    return
  }
  // ADJUST HEADING TO NEXT FIX (if any)
  plane.adjustHeadingToNextFix()

  // TURN
  if (plane.turn != 0) {
    // Compute new heading
    if (
      Math.abs(plane.heading - plane.heading_target) <
      Math.abs(plane.turn * elapsedSeconds)
    ) {
      // Reached assigned heading
      plane.turn = 0
      plane.heading = plane.heading_target
      planeEventTurnStopped(plane)
    }
    var tmp = plane.heading
    if (plane.turn != 0) {
      tmp = tmp + plane.turn * elapsedSeconds
    }
    if (tmp < 0) {
      tmp = 360 + tmp
    } else if (tmp >= 360) {
      tmp = tmp - 360
    }
    plane.heading = tmp
  }

  // SPEED
  if (plane.speed_target > 0) {
    if (plane.speed_target > plane.speed) {
      // Increase speed
      if (false /* plane.hasStatus(constants.STATUS_TAKEOFF) */) {
        plane.speed = Math.floor(plane.speed + elapsedSeconds * 5)
      } else {
        plane.speed = Math.floor(plane.speed + elapsedSeconds * 1.5)
      }
      if (
        plane.speed < 140 /* && !plane.hasStatus(constants.STATUS_LANDED) */
      ) {
        plane.speed = 140
        plane.speed_target = 140
      }
    }
    if (plane.speed_target < plane.speed) {
      // Decrease speed
      if (false /* plane.hasStatus(constants.STATUS_LANDED) */) {
        //Brakes!!
        plane.speed = Math.floor(plane.speed - elapsedSeconds * 10)
      } else {
        plane.speed = Math.floor(plane.speed - elapsedSeconds * 2)
      }
    }
    if (Math.abs(plane.speed_target - plane.speed) < 5) {
      plane.speed = plane.speed_target
      planeEventSpeedReached(plane)
    }
  }

  // ALTITUDE
  var ratio = (plane.climb * elapsedSeconds) / 60
  if (ratio != 0) {
    if (Math.abs(plane.fl - plane.fl_cleared) < Math.abs(ratio)) {
      console.log(
        'Plane ' +
          plane.completeCallsign +
          ' Level ' +
          plane.fl +
          ' > ' +
          plane.fl_cleared +
          ' ratio = ' +
          ratio
      )
      // Reached assigned altitude
      plane.climb = 0
      plane.fl = plane.fl_cleared
      console.log(
        '(move 11) Plane ' +
          plane.completeCallsign +
          ' reached assigned altitude ' +
          plane.fl_cleared +
          ' : new ratio = 0'
      )
      planeEventLevelReached(plane)
    } else {
      plane.fl = plane.fl + ratio
      // TODO
      /*
           if (plane.fl < plane.fl_cleared && ratio <= 0) {
               plane.setLevel(plane.plane.fl_cleared);
           }
           else if (plane.plane.fl > plane.plane.fl_cleared && ratio >= 0) {
               plane.setLevel(plane.plane.fl_cleared);
           }
           else {
               plane.fl = plane.fl + ratio;
           }
           */
    }
  }
  // TODO move to AI
  /*
   if (true) { // plane.hasStatus(constants.STATUS_CRUISE)
       if (plane.climb >= 0 && plane.fl > plane.fl_cleared) {
           plane.climb = constants.PLANE_DESCENT_RATIO
       }
       else if (plane.climb <= 0 && plane.fl < plane.fl_cleared) {
           plane.climb = constants.PLANE_CLIMB_RATIO;
       }
   }
   else {
       if (plane.l < plane.fl_cleared && plane.climb > 0) {
           // Continue climbing / descending accordingly to phase flight
       }
       if (plane.fl < plane.fl_cleared && plane.climb <= 0) {
           plane.climb = constants.PLANE_CLIMB_RATIO;
       }
   }
   */

  // COORDINATES

  var latlon = geomath.coordsFromCoarseDistance(
    plane.latitude,
    plane.longitude,
    plane.heading,
    (plane.speed / 3600) * elapsedSeconds
  )
  plane.latitude = latlon.lat
  plane.longitude = latlon.lon
}

/**
 * AI & DECISION (PILOT SIMULATOR)
 */

export const planeEventTurnStopped = (plane: Plane) => {
  // TODO
  void plane
}

export const planeEventSpeedReached = (plane: Plane) => {
  // TODO
  void plane
}

export const planeEventLevelReached = (plane: Plane) => {
  // TODO
  void plane
}

export const planeAdvance2NextStep = (plane: Plane, context: Context) => {
  void plane, context
  /*    
    var step
    if (this.step_current != -1) {
      step = this.steps[this.step_current]
      if (step.change_flight_status != '') {
        if (this.hasStatus(constants.STATUS_MISSED_APPROACH)) {
          // Ignore any status change
        } else {
          this.addStatus(step.change_flight_status)
        }
      }
    }
    if (this.steps.length > this.step_current + 1) {
      this.step_current++
  
      //if (this.holding == true) {
      //  this.holding = false
      //  this.holding_points = []
      //  if (this.o_holding != undefined) {
      //    mainContainer.removeChild(this.o_holding)
      //  }
      //}
      step = this.steps[this.step_current]
      var wp_id
      var o_wp
      var latitude
      var longitude
      var estimate
      var altitude_constraint = step.altitude_constraint
      // Execute Next Step
      console.log(
        'Plane ' +
          this.completeCallsign +
          ' next step ' +
          step.type +
          ' (' +
          step.identifier +
          ')'
      )
      if (
        !this.hasStatus(constants.STATUS_MISSED_APPROACH) &&
        step.identifier != '' &&
        step.identifier == this.o_route.mapFix
      ) {
        // Next step is MAP fix ...
        // Replace with runway threshold
        var o_runway = findRunway(this.airp_dest, this.o_route.runway)
        if (o_runway instanceof Runway) {
          step = new Step()
          step.type = 'LAND' //Special type
          step.identifier = o_runway.label1
          step.coordinate = new Coordinate(
            o_runway.latitude,
            o_runway.longitude
          )
          step.altitude_constraint = 1
          step.altitude_1 = 0
          step.track_bearing = this.steps[this.step_current - 1].heading
          this.steps.splice(this.step_current, 0, step)
          // this.step_current++;
          this.removeStatus(constants.STATUS_CRUISE)
          this.removeStatus(constants.STATUS_APPROACH)
          this.removeStatus(constants.STATUS_FINAL_APPROACH)
          this.addStatus(constants.STATUS_FINAL)
        }
      }
      switch (step.type) {
        case 'IF':
        case 'TF':
          wp_id = step.identifier
          latitude = step.coordinate?.getLatitude()
          longitude = step.coordinate?.getLongitude()
          this.intercepting = false // Clear any previous radial interception
          o_wp = findWaypoint(wp_id, latitude, longitude)
          estimate = this.goToFix(o_wp)
          // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
          this.checkAltitudeConstraint()
          break
        case 'CF':
        case 'LAND':
          // CF - Course to a Fix
          wp_id = step.identifier
          latitude = step.latitude
          longitude = step.longitude
          this.intercepting = false // Clear any previous radial interception
          if (this.hasStatus(constants.STATUS_FINAL)) {
            var o_runway = findRunway(this.airp_dest, this.o_route.runway)
            if (o_runway != undefined && o_runway.heading == step.heading) {
              // Intercept final path
              this.interceptRadial(
                this.o_route.runway,
                Math.inverseBearing(o_runway.heading),
                true
              )
              break
            }
          }
//                if (step.navaid_id != undefined && step.track_bearing != undefined) {
//                    // Intercept a radial
//                }
          estimate = this.goToCoords(
            step.latitude,
            step.longitude,
            step.turn_direction,
            step.heading
          )
          // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
          this.checkAltitudeConstraint()
          break
        case 'DF':
          // Direct to a fix
          wp_id = step.identifier
          latitude = step.latitude
          longitude = step.longitude
          this.intercepting = false // Clear any previous radial interception
          o_wp = findWaypoint(wp_id, latitude, longitude)
          if (o_wp != undefined) {
            estimate = this.goToWaypoint(o_wp)
          } else {
            // TODO
          }
          // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
          this.checkAltitudeConstraint()
          break
        case 'CD':
          // Coarse Direction
          o_wp = findWaypoint(step.navaid_id)
          if (o_wp != undefined) {
            this.intercepting = false // Clear any previous radial interception
            var fix_coords = Math.coordsFromCoarseDistance(
              o_wp.latitude,
              o_wp.longitude,
              step.heading,
              step.track_distance
            )
            this.steps[this.step_current].latitude = fix_coords.lat
            this.steps[this.step_current].longitude = fix_coords.lon
            estimate = this.goToCoords(fix_coords.lat, fix_coords.lon)
            // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
            this.checkAltitudeConstraint()
          }
          break
        case 'CA':
        case 'VA':
          // Coarse/Heading to Altitude
          var estimate = 0
          if (step.turn_direction != undefined && step.heading != undefined) {
            this.intercepting = false // Clear any previous radial interception
            this.setHeading(step.heading, step.turn_direction)
          } else if (step.heading != undefined) {
            this.intercepting = false // Clear any previous radial interception
            this.setHeading(step.heading, 0)
          }
          if (step.altitude_constraint != undefined) {
            // 0= no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
            var alt = this.fl
            if (this.climb == 0 && !this.hasStatus(constants.STATUS_TAKEOFF)) {
              if (step.altitude_constraint == 1 && alt < step.altitude_1) {
                this.climb = 500
              }
              if (step.altitude_constraint == 2 && alt < step.altitude_1) {
                this.climb = 500
              }
              if (step.altitude_constraint == 3 && alt > step.altitude_1) {
                this.climb = -500
              }
              console.log(
                'Plane.advance2NextStep: ' +
                  this.completeCallsign +
                  ' - new climb = ' +
                  this.climb
              )
            }
            if (
              step.altitude_constraint == 1 &&
              ((alt <= step.altitude_1 && this.climb > 0) ||
                (alt >= step.altitude_1 && this.climb < 0))
            ) {
              estimate = this.estimateToAltitude(step.altitude_1)
            }
            if (
              step.altitude_constraint == 2 &&
              alt <= step.altitude_1 &&
              this.climb > 0
            ) {
              estimate = this.estimateToAltitude(step.altitude_1)
            }
            if (
              step.altitude_constraint == 3 &&
              alt >= step.altitude_1 &&
              this.climb < 0
            ) {
              estimate = this.estimateToAltitude(step.altitude_1)
            }
            // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
            this.checkAltitudeConstraint()
          }
          break
        case 'VI':
          // Vector to an intercept
          if (step.heading != undefined) {
            this.intercepting = false // Clear any previous radial interception
            this.setHeading(step.heading, 0)
            this.checkAltitudeConstraint()
          } else {
            console.log('Step VI without heading')
            this.advance2NextStep()
          }
          break
        case 'VM':
          // Vector to a manual termination
          if (step.heading != undefined) {
            this.intercepting = false // Clear any previous radial interception
            this.setHeading(step.heading, 0)
            this.checkAltitudeConstraint()
            // TODO - Set a timer to call for further instructions
          } else {
            console.log('Step VM without heading')
          }
          break
        case 'FD':
          // Follow a radial
          o_wp = findWaypoint(step.identifier)
          if (o_wp != undefined) {
            this.steps[this.step_current].latitude = o_wp.latitude
            this.steps[this.step_current].longitude = o_wp.longitude
            this.intercepting = false // Clear any previous radial interception
            this.interceptRadial(
              step.identifier,
              step.track_bearing,
              step.inbound
            )
          } else {
            this.setHeading(step.heading, 0)
          }
          break
        case 'HM':
          // Holding pattern
          this.holdingPattern(
            step.identifier,
            step.heading,
            step.leg_distance,
            step.turn_direction
          )
          break
        default:
          console.log('Step ' + step.type + ' not handled')
          this.advance2NextStep()
      }
    } else {
      // No further instruction - Maintain holding to last fix
      var o_route = new Route()
      var last_step = undefined
      for (var s = this.step_current; s >= 0; s--) {
        last_step = this.steps[s]
        if (last_step.type == 'FD' && last_step.inbound == false) {
          // Is following a radial outbound ... continue!
          console.log(
            'Plane.advance2NextStep: ' +
              this.completeCallsign +
              ' - Continue following outbound route'
          )
        } else {
          // TODO - if phase = DEPARTURE DON'T HOLD
          if (
            this.hasStatus(constants.STATUS_ARRIVAL) &&
            last_step.identifier != undefined &&
            last_step.identifier != ''
          ) {
            console.log(
              'Plane.advance2NextStep: ' +
                this.completeCallsign +
                ' - NO FURTHER INSTRUCTIONS - MAINTAIN HOLDING ON ' +
                last_step.identifier
            )
            o_step = new Step()
            o_step.type = 'HM'
            o_step.identifier = last_step.identifier
            o_step.latitude = last_step.latitude
            o_step.longitude = last_step.longitude
            o_step.heading = this.heading
            o_step.leg_distance = 5
            o_step.turn_direction = 1
            o_step.speed_constraint = 1
            o_step.speed_1 = 250
            o_route.addLeg(o_step)
            this.assignRoute(o_route)
            this.setSpeed(250)
            return
          }
        }
      }
      // TODO RADIO - NEXT FIX?
      // continue present heading
      console.log(
        'Plane.advance2NextStep: ' + this.completeCallsign + ' - END OF ROUTE'
      )
    }
    */
}
