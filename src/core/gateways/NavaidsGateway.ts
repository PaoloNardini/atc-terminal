import { Waypoint } from "../entities";
import { Coordinate } from "../valueObjects";

export interface NavaidsGateway {
    loadNavaidsByCoordinates( minCoordinates: Coordinate, maxCoordinates: Coordinate): Promise<void>
    loadWaypointsByCoordinates( minCoordinates: Coordinate, maxCoordinates: Coordinate): Promise<Record<string, Waypoint>>
}