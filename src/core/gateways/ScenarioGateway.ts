import { Scenario } from "../entities";

export interface ScenarioGateway {
    loadScenarioByName( name: string): Promise<Scenario>
    loadScenarioByAirportCode( icao: string): Promise<Scenario>
}