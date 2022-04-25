import { Parameters } from "./Parameters";
import { Scenario } from "./Scenario";

export class Context {
    scenario: Scenario = new Scenario()
    parameters: Parameters = new Parameters()
}