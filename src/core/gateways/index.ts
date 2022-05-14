import { TransportGateway } from "./TransportGateway"
import { ScenarioGateway } from "./ScenarioGateway"
import { NavaidsGateway } from "./NavaidsGateway"
import { AtsRoutesGateway } from "./AtsRoutesGateway"
import { ProceduresGateway } from "./ProceduresGateway"

export * from './TransportGateway'
export * from './ScenarioGateway'
export * from './NavaidsGateway'
export * from './AtsRoutesGateway'
export * from './ProceduresGateway'

export interface Deps {
    transportGateway: TransportGateway
    scenarioGateway: ScenarioGateway
    navaidsGateway: NavaidsGateway
    atsRoutesGateway: AtsRoutesGateway
    proceduresGateway: ProceduresGateway
}