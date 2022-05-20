import { AtsRoute } from "../entities";
import { Coordinate } from "../valueObjects";

export interface AtsRoutesGateway {
    loadAtsRoutesByCoordinates( minCoordinates: Coordinate, maxCoordinates: Coordinate): Promise<AtsRoute[]>
}