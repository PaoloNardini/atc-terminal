import { Coordinate, Level, Speed } from "../valueObjects";

export enum WaypointType {
    WAYPOINT_TYPE_FIX = 1,
}

export enum NavaidType {
    NAVAID_TYPE_VORDME = 1,
    NAVAID_TYPE_VOR = 2,
    NAVAID_TYPE_NDB = 3,
    NAVAID_TYPE_VORDMENDB = 4,
    NAVAID_TYPE_TACAN = 5,
    NAVAID_TYPE_ILS_CAT_1 = 6,
    NAVAID_TYPE_ILS_CAT_2 = 7,
    NAVAID_TYPE_ILS_CAT_3 = 8,
    NAVAID_TYPE_ILS_OM = 9,
    NAVAID_TYPE_ILS_MM = 10,
    NAVAID_TYPE_ILS_IM = 11,
    NAVAID_TYPE_RWY = 12,
    NAVAID_TYPE_ROUTE_FIX = 13,
}

export class Waypoint {

    type: WaypointType = WaypointType.WAYPOINT_TYPE_FIX
    name: string = ''
    label: string  = ''
    latitude: number = 0
    longitude: number = 0 
    coordinate?: Coordinate
    useCounter: number = 0

    visible: boolean = false 
    labelVisible: boolean = false
    visibleTemp: boolean = false
    labelVisibleTemp: boolean = false
    isNavaid: boolean = false
    isFix: boolean = false
    isWaypoint: boolean = false
    isRunway: boolean = false
    isAts: boolean = false
    isNavaidVisible: boolean = false
    isFixVisible: boolean = false
    isWaypointVisible: boolean = false
    isRunwayVisible: boolean = false
    isAtsVisible: boolean = false

    freq: number | undefined

    // Navaid specific attributes
    navaidType: NavaidType | undefined
    mea?: Level           // Minimum enroute altitude (in feet)
    min_speed?: Speed     // Minimum speed
    max_speed?: Speed     // Maximum speed
    // release: boolean = false  // Is it a release point to/from other ATC?
    // visible: boolean = false    // Default visibility
    altitude: number | undefined
    isRouteFix: boolean = false

    //  x: number = 0
    // y: number = 0

    zoom_min: number  = 0   // Min. visible zoom
    zoom_max: number  = 0 // Max. visible zoom

}