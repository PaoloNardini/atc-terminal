import { Bearing, Coordinate } from "../valueObjects"

export enum RouteType {
    ATS = 'ats'
}

export enum StepType {
    DF = 'DF'
}

export class AtsRoute {
    name: string = ''
    type?: RouteType 
    legs: Step[] = []

    constructor() {
    }

    addLeg(step: Step) {
        this.legs.push(step)
    }

    getLegs() {
        return this.legs
    }
}


export class Step {
    coordinate?: Coordinate
    type?: StepType
    identifier: string = ''
    heading?: Bearing
    distance?: number
}