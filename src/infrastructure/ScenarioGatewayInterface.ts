import { Scenario } from "../core/entities";

export interface ScenarioGatewayInterface {
    loadScenarioByName( name: string): Scenario
    loadScenarioByAirportCode( icao: string): Scenario
}