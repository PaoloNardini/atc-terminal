import { Coordinate, Level, Speed } from "../valueObjects";

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
export interface Navaid {
    // General fix data
    name: string         // Fix name
    label: string        // Label on the screen
    type: NavaidType          // See const FIX_TYPE...
    release: boolean   // Is it a release point to/from other ATC?
    altitude?: Level      // Cross altitude
    mea?: Level           // Minimum enroute altitude (in feet)
    min_speed?: Speed     // Minimum speed
    max_speed?: Speed     // Maximum speed
    freq: string// Navaid frequency
    visible: boolean    // Default visibility
    labelVisible: boolean
    visibleTemp: boolean
    labelVisibleTemp: boolean

    // Navaid position
    coordinate: Coordinate
    x: number
    y: number

    zoom_min: number  // Min. visible zoom
    zoom_max: number   // Max. visible zoom
}