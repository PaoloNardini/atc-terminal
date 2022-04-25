import { Scenario } from "../entities";

export interface ScenarioGateway {
    loadScenarioByName( name: string): Scenario
    loadScenarioByAirportCode( icao: string): Scenario
}