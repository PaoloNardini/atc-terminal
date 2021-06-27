import { Airline, Runway, Slot, Route } from ".";
import { Bearing, Coordinate, Speed, Level } from "../valueObjects";

export class Plane {

    // Identification
    label: string = ''

    // Flight info
    airline?: Airline
    callsign?: string
    completeCallsign?: string
    aircraft?: string
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

    coordinate?: Coordinate
    // latitude: number
    // longitude: number
    coarse?: Bearing
    distance?: number

    // Navigation data
    speed?: Speed
    speed_target?: Speed
    heading?: Bearing
    heading_target?: Bearing
    fl?: Level
    fl_final?: Level
    fl_initial?: Level
    fl_cleared?: Level
    climb?: number
    turn?: number

    // Route data
    // route = -1;
    route?: Route            // Route object
    // tracks = [];         // OLD Tracks
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
}
