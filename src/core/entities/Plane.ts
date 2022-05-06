import { Airline, Runway, Slot, Route } from ".";
import { Bearing, Coordinate } from "../valueObjects";
import * as constants from '../constants'

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

    turnToHeading(newHeading: number, turnDirection: string | undefined) {
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


}
