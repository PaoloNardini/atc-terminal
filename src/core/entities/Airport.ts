import { Runway } from "./Runway";

export interface Airport {
    name: string        // Airport commercial name
    icao: string        // Airport ICAO code
    // Airport Center 
    latitude: number
    longitude: number
    // Runways data
    runways: Runway[]
}