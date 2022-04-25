import { TransportGateway } from "./TransportGateway"
import { ScenarioGateway } from "./ScenarioGateway"

export * from './TransportGateway'
export * from './ScenarioGateway'

export interface Deps {
    transportGateway: TransportGateway
    scenarioGateway: ScenarioGateway
}