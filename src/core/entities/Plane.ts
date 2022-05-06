import { Airline, Runway, Slot, Route } from ".";
import { Bearing, Coordinate } from "../valueObjects";
import * as constants from '../constants'
import * as geomath from '../../../src/helpers/geomath'

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
    status?: string
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
    route?: Route            // Route object
    // tracks = [];          // OLD Tracks
    steps?: [];              // NEW Legs Steps
    fix_next?: number        // OLD
    fix_step?: number        // OLD
    step_current?: number    // NEW
    runway?: Runway;         // Landing only

    // Radial intercept data
    intercepting: boolean = false          // Intercepting a radial
    radial2intercept?: number  // Radial to intercept
    navaid2intercept?: number  // Navaid to intercept radial
    radialInbound?: number     // true to follow radial inbound / false for outbound
    interceptPoint?: number    // LatLon coordinates of radial intercept point
    interceptProcedure?: string // Type of intercept procedure: STRAIGHT / TURN

    // Holding Pattern data
    holding: boolean = false
    holding_identifier?: string        // holding fix name
    holding_fix?: string             // holding fix object;
    holding_radial?: number            // inbound radial
    holding_leg_distance?: number      // leg distance in miles
    holding_turn_direction?: number    // turn direction 1 = left 2 = right
    holding_points?: string[];                   // 4 holding points
    holding_point_next?: string        // next point in holding pattern
    // o_holding = undefined;                 // Holding graphical object

    // Slot data
    slot?: Slot

    // Internal
    // recurse: boolean

    constructor() {
    }

    setCoordinate(coordinate: Coordinate) {
        this.latitude = coordinate.getLatitude()
        this.longitude = coordinate.getLongitude()
    }



    /**
     * COMMANDS MANAGEMENT
     */

    turnToHeading = (newHeading: number, turnDirection: string | undefined): void => {
        // Set new heading to stop turn
        this.heading_target = newHeading
        // Calculate turn ratio and direction
        if (Math.abs(newHeading - this.heading) > 1) {
            if (turnDirection == 'R' || (newHeading > this.heading && (newHeading - this.heading) < 180) || (this.heading > newHeading && (this.heading - newHeading) > 180)) {
                this.turn = constants.PLANE_TURN_RATIO
            }
            else {
                this.turn = -constants.PLANE_TURN_RATIO
            }
        }
    }

    setNewSpeed = (newSpeed: number):void => {
        this.speed_target = newSpeed
    }

    setNewFL = (newLevel: number):void => {
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
        }
        else {
            this.climb = -constants.PLANE_CLIMB_RATIO
        }
        this.fl_cleared = newLevel
    }
}

/**
 * BASIC PLANE MOVEMENTS
 */

export const planeMove = (plane: Plane, elapsedSeconds: number):void => {
   // Calculate plane 3 axis movements
   if (plane.fl == 0 && plane.speed == 0) {
       // Plane on the ground ... nothing to do
       return
   }
   // TURN
   if (plane.turn != 0) {
       // Compute new heading
       if (Math.abs(plane.heading - plane.heading_target) < Math.abs(plane.turn * elapsedSeconds)) {
           // Reached assigned heading
           plane.turn = 0;
           plane.heading = plane.heading_target;
           planeEventTurnStopped(plane)
       }
       var tmp = plane.heading;
       if (plane.turn != 0) {
           tmp = tmp + plane.turn * elapsedSeconds;
       }
       if (tmp < 0) {
           tmp = 360 + tmp;
       } else if (tmp >= 360) {
           tmp = tmp - 360;
       }
       plane.heading = tmp;
   }

   // SPEED
   if (plane.speed_target > 0) {
       if (plane.speed_target > plane.speed) {
           // Increase speed
           if (false /* plane.hasStatus(STATUS_TAKEOFF) */) {
               plane.speed = Math.floor(plane.speed + (elapsedSeconds * 5));
           }
           else {
               plane.speed = Math.floor(plane.speed + (elapsedSeconds * 1.5));
           }
           if (plane.speed < 140 /* && !plane.hasStatus(STATUS_LANDED) */) {
               plane.speed = 140;
               plane.speed_target = 140;
           }
       }
       if (plane.speed_target < plane.speed) {
           // Decrease speed
           if (false /* plane.hasStatus(STATUS_LANDED) */) {
               //Brakes!!
               plane.speed = Math.floor(plane.speed - (elapsedSeconds * 10));
           }
           else {
               plane.speed = Math.floor(plane.speed - (elapsedSeconds * 2));
           }
       }
       if (Math.abs(plane.speed_target - plane.speed) < 5) {
           plane.speed = plane.speed_target;
           planeEventSpeedReached(plane)
       }
   }

   // ALTITUDE 
   var ratio = (plane.climb * elapsedSeconds / 60 );
   if (ratio != 0) {
       if (Math.abs(plane.fl - plane.fl_cleared) < Math.abs(ratio)) {
           console.log('Plane ' + plane.completeCallsign + ' Level ' + plane.fl + ' > ' + plane.fl_cleared + ' ratio = ' + ratio);
           // Reached assigned altitude
           plane.climb = 0;
           plane.fl = plane.fl_cleared;
           console.log('(move 11) Plane ' + plane.completeCallsign + ' reached assigned altitude ' + plane.fl_cleared + ' : new ratio = 0');
           planeEventLevelReached(plane)

       }
       else {
           plane.fl = plane.fl + ratio;
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
   if (true) { // plane.hasStatus(STATUS_CRUISE)
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

   var latlon = geomath.coordsFromCoarseDistance(plane.latitude, plane.longitude, plane.heading, (plane.speed / 3600) * elapsedSeconds);
   plane.latitude = latlon.lat;
   plane.longitude = latlon.lon;

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
