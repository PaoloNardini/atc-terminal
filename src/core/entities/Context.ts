import { AtsRoute } from "./AtsRoute";
import { Parameters } from "./Parameters";
import { Plane } from "./Plane";
import { Scenario } from "./Scenario";
import { Waypoint } from "./Waypoint";

export class Context {
    scenario: Scenario = new Scenario()
    parameters: Parameters = new Parameters()
    planes: Plane[] = []
    waypoints: Record<string, Waypoint> = {}
    atsRoutes: AtsRoute[] = []
}