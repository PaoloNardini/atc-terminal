import { Coordinate } from '../valueObjects'

export enum RouteType {
  ATS = 'ATS',
  SID = 'SID',
  STAR = 'STAR',
  APPTR = 'APPTR',
  FINAL = 'FINAL',
}

export enum StepType {
  DF = 'DF',
  IF = 'IF',
  TF = 'TF',
  CA = 'CA',
  VA = 'VA',
  CF = 'CF',
  CD = 'CD',
  CI = 'CI',
  FD = 'FD',
  FA = 'FA',
  HA = 'HA',
  HF = 'HF',
  HM = 'HM',
  VI = 'VI',
  VM = 'VM',
  RF = 'RF',
  V = 'V',
  FM = 'FM',
}

export class AtsRoute {
  name: string = ''
  name2: string = ''
  type?: RouteType
  legs: Step[] = []
  icao?: string
  type_number?: string
  runwayName?: string

  finalFixName?: string
  mapFixName?: string
  mapFixPos?: number

  constructor() {}

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
  heading?: number
  distance?: number
  navaid_id?: string
  turn_direction?: number
  track_bearing?: number
  track_distance?: number
  altitude_constraint?: number
  altitude_1?: number
  altitude_2?: number
  speed_constraint?: number
  speed_1?: number
  speed_2?: number
  overfly?: number
  leg_distance?: number
  change_flight_status?: string
}
