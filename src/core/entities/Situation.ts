import { Plane } from ".";

export interface Situation {
    timestamp: string           // The situation timestamp

    planes: Plane[]             // The planes now active in the scenario

}