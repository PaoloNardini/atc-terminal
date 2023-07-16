import { Airport } from '../entities'

export interface AirportGateway {
  loadAirportByIcao(icao: string): Promise<Airport | undefined>
}
