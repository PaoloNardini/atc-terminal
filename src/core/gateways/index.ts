import { TransportGateway } from "./TransportGateway"
import { ScenarioGateway } from "./ScenarioGateway"
import { NavaidsGateway } from "./NavaidsGateway"

export * from './TransportGateway'
export * from './ScenarioGateway'
export * from './NavaidsGateway'


export interface Deps {
    transportGateway: TransportGateway
    scenarioGateway: ScenarioGateway
    navaidsGateway: NavaidsGateway
}