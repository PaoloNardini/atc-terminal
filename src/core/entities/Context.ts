import { Parameters } from "./Parameters";
import { Plane } from "./Plane";
import { Scenario } from "./Scenario";

export class Context {
    scenario: Scenario = new Scenario()
    parameters: Parameters = new Parameters()
    planes: Plane[] = []
}