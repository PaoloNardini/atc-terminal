import { Scenario } from "../core/entities"
import { ScenarioGateway } from "../core/gateways"

export const makeScenarioGateway = (): ScenarioGateway => {

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