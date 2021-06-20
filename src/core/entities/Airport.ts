import { Coordinate } from "../valueObjects";
import { Runway } from "./Runway";

export interface Airport {
    name: string        // Airport commercial name
    icao: string        // Airport ICAO code
    // Airport Center 
    coordinate: Coordinate
    // Runways data
    runways: Runway[]
}