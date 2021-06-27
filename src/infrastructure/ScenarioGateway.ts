import { Scenario } from "../core/entities";
import { ScenarioGatewayInterface } from "./ScenarioGatewayInterface";

export const makeScenarioGateway = (): ScenarioGatewayInterface => {

    return {
        loadScenarioByName( name: string) {
            // Test
            const scenario: Scenario = {
                name: name,
            }
            return scenario
        },
        loadScenarioByAirportCode( icao: string) {
            // Test
            const scenario: Scenario = {
                name: icao,
            }
            return scenario
        }
    }
}