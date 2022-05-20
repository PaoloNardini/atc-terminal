import { AtsRoute } from '../entities'
// import { Coordinate } from "../valueObjects";

export interface ProceduresGateway {
  loadProceduresByAirport(icao: string): Promise<AtsRoute[]>
}
