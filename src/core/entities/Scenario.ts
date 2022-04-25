import { Route, Airport, Plane } from ".";
import { Runway } from "./Runway";

export class Scenario {
    name: string = ''
    airports: Airport[] = []
    runways: Runway[] = []   
    procedures: Route[] = []
    atsRoutes: Route[] = []
    initialPlanes: Plane[] = []     // Initial planes situation at scneario startup
    latitudeCenter: number = 0
    longitudeCenter: number = 0
}