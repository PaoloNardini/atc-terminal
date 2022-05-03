import { TransportGateway } from "./TransportGateway"
import { ScenarioGateway } from "./ScenarioGateway"
import { NavaidsGateway } from "./NavaidsGateway"
import { AtsRoutesGateway } from "./AtsRoutesGateway"

export * from './TransportGateway'
export * from './ScenarioGateway'
export * from './NavaidsGateway'
export * from './AtsRoutesGateway'


export interface Deps {
    transportGateway: TransportGateway
    scenarioGateway: ScenarioGateway
    navaidsGateway: NavaidsGateway
    atsRoutesGateway: AtsRoutesGateway
}