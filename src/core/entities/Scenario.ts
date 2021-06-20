import { Route, Airport, Plane } from ".";

export interface Scenario {
    name: string
    airports?: Airport[]          
    procedures?: Route[]
    atsRoutes?: Route[]
    initialPlanes?: Plane[]      // Initial planes situation at scneario startup
}