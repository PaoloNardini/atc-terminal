import { Bearing, Coordinate } from "../valueObjects";

export interface Runway {
    // General runway data
    icao: string
    name: string         // Runway name
    label1: string      // Runway indicator on the screen (main direction)
    label2: string       // Runway indicator on the screen (opposite direction)
    type: number          // See const RWY_TYPE...
    heading: Bearing       // Runway main orientation
    category: number      // See const RWY_CAT...
    strip_length: number        // Length in feet
    strip_width: number         // Width in feet
    runway_visible: boolean
    centerline_visible: boolean

    // Runway Ends
    coordinate1: Coordinate
    coordinate2: Coordinate

    zoom_min: number  // Min. visible zoom
    zoom_max: number   // Max. visible zoom

    // Runway status
    active: boolean
    takeoff: boolean
    landing: boolean

    // Flight Director Data
    last_takeoff_time: number
    last_landing_time: number
    last_arrival_time: number
}