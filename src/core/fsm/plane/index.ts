import { setup, assign } from 'xstate'

export interface AirplaneContext {
  FL: number // 0...420
  HDG: number // 0...359
  ROC: number // feet/minute
  ROT: number // degrees/minute
  KTS: number // 0...999
  GROUND: boolean
  PHASE:
    | 'Rest'
    | 'Taxi'
    | 'Hold'
    | 'Take-Off-Run'
    | 'Take-Off'
    | 'SID'
    | 'Cruise'
    | 'STAR'
    | 'App'
    | 'Final'
    | 'Landing'
    | 'Landed'
  V2: number
  MAS: number
  isDeparting: boolean
  latitude: number
  longitude: number
  TARGET_ROC: number
  TARGET_HDG: number
  TARGET_FL: number
  TARGET_KTS: number
}

export type AirplaneEvents =
  | { type: 'Climb'; ROC: number; TARGET_FL: number }
  | { type: 'Descent'; ROC: number; TARGET_FL: number }
  | { type: 'Turn Right'; ROT: number; TARGET_HDG: number }
  | { type: 'Turn Left'; ROT: number; TARGET_HDG: number }
  | { type: 'Level' }
  | { type: 'Stop Turn'; HDG: number }
  | { type: 'Increase Speed'; TARGET_KTS: number }
  | { type: 'Decrease Speed'; TARGET_KTS: number }
  | { type: 'Reached target FL' }
  | { type: 'Reached target HDG' }
  | { type: 'Reached target KTS' }
  | { type: 'Clear to Taxi' }
  | { type: 'Hold position' }
  | { type: 'Clear to Take-Off'; TARGET_KTS: number }
  | { type: 'Taking-Off'; TARGET_FL: number }
  | { type: 'Follow SID' }
  | { type: 'Enroute' }
  | { type: 'Start descent' }
  | { type: 'Start approach' }
  | { type: 'Estabilish on Final' }
  | { type: 'Landing' }
  | { type: 'Landed' }
  | { type: 'Taxi to Park' }
  | { type: 'Park' }
  | { type: 'Update Position'; latitude: number; longitude: number }
  | { type: 'Update Heading'; HDG: number }
  | { type: 'Update Speed'; KTS: number }

export const machine = setup({
  types: {
    context: {} as AirplaneContext,
    events: {} as AirplaneEvents,
  },
  actions: {
    startClimb: assign({
      ROC: ({ event }) => {
        if (event.type === 'Climb') return event.ROC
        return 0
      },
      TARGET_ROC: ({ event }) => {
        if (event.type === 'Climb') return event.ROC
        return 0
      },
      TARGET_FL: ({ event }) => {
        if (event.type === 'Climb') return event.TARGET_FL
        return 0
      },
    }),
    startDescent: assign({
      ROC: ({ event }) => {
        if (event.type === 'Descent') return event.ROC
        return 0
      },
      TARGET_ROC: ({ event }) => {
        if (event.type === 'Descent') return event.ROC
        return 0
      },
      TARGET_FL: ({ event }) => {
        if (event.type === 'Descent') return event.TARGET_FL
        return 0
      },
    }),
    levelOff: assign({
      ROC: 0,
      TARGET_ROC: 0,
    }),
    startTurnRight: assign({
      ROT: ({ event }) => {
        if (event.type === 'Turn Right') return event.ROT
        return 0
      },
      TARGET_HDG: ({ event }) => {
        if (event.type === 'Turn Right') return event.TARGET_HDG
        return 0
      },
    }),
    startTurnLeft: assign({
      ROT: ({ event }) => {
        if (event.type === 'Turn Left') return event.ROT
        return 0
      },
      TARGET_HDG: ({ event }) => {
        if (event.type === 'Turn Left') return event.TARGET_HDG
        return 0
      },
    }),
    stopTurn: assign({
      ROT: 0,
      HDG: ({ context, event }) => {
        if (event.type === 'Stop Turn') {
          return event.HDG
        }
        if (event.type === 'Reached target HDG') {
          return context.TARGET_HDG
        }
        return context.HDG
      },
    }),
    setSpeedTarget: assign({
      TARGET_KTS: ({ event }) => {
        if (
          event.type === 'Increase Speed' ||
          event.type === 'Decrease Speed'
        ) {
          return event.TARGET_KTS
        }
        return 0
      },
    }),
    setPhaseRest: assign({ PHASE: 'Rest' }),
    setPhaseTaxi: assign({ PHASE: 'Taxi' }),
    setPhaseHold: assign({ PHASE: 'Hold' }),
    setPhaseTakeOffRun: assign({ PHASE: 'Take-Off-Run' }),
    setPhaseTakeOff: assign({ PHASE: 'Take-Off' }),
    setPhaseSID: assign({ PHASE: 'SID' }),
    setPhaseCruise: assign({ PHASE: 'Cruise' }),
    setPhaseSTAR: assign({ PHASE: 'STAR' }),
    setPhaseApp: assign({ PHASE: 'App' }),
    setPhaseFinal: assign({ PHASE: 'Final' }),
    setPhaseLanding: assign({ PHASE: 'Landing' }),
    setPhaseLanded: assign({ PHASE: 'Landed' }),
    setDeparting: assign({ isDeparting: true }),
    setInbound: assign({ isDeparting: false }),
    updatePosition: assign({
      latitude: ({ event }) =>
        event.type === 'Update Position' ? event.latitude : 0,
      longitude: ({ event }) =>
        event.type === 'Update Position' ? event.longitude : 0,
    }),
    updateHeading: assign({
      HDG: ({ event }) => (event.type === 'Update Heading' ? event.HDG : 0),
    }),
    updateSpeed: assign({
      KTS: ({ event }) => (event.type === 'Update Speed' ? event.KTS : 0),
    }),
  },
  guards: {
    isValidClimb: ({ context, event }) => {
      if (event.type !== 'Climb') return false
      return event.ROC > 0 && event.TARGET_FL > context.FL
    },
    isValidDescent: ({ context, event }) => {
      if (event.type !== 'Descent') return false
      return event.ROC < 0 && event.TARGET_FL < context.FL
    },
    isValidTurnRight: ({ event }) => {
      if (event.type !== 'Turn Right') return false
      return event.ROT > 0
    },
    isValidTurnLeft: ({ event }) => {
      if (event.type !== 'Turn Left') return false
      return event.ROT < 0
    },
    isValidIncreaseSpeed: ({ context, event }) => {
      if (event.type !== 'Increase Speed') return false
      return event.TARGET_KTS > context.KTS
    },
    isValidDecreaseSpeed: ({ context, event }) => {
      if (event.type !== 'Decrease Speed') return false
      return event.TARGET_KTS < context.KTS
    },
    canTaxi: ({ context }) =>
      context.GROUND &&
      context.FL === 0 &&
      context.ROC === 0 &&
      context.KTS < 20,
    canHold: ({ context }) =>
      context.GROUND &&
      context.FL === 0 &&
      context.ROC === 0 &&
      context.KTS === 0,
    canTakeOffRun: ({ context, event }) => {
      if (event.type !== 'Clear to Take-Off') return false
      return (
        context.GROUND && context.FL === 0 && event.TARGET_KTS === context.V2
      )
    },
    canTakeOff: ({ context, event }) => {
      if (event.type !== 'Taking-Off') return false
      return (
        !context.GROUND &&
        context.ROC > 0 &&
        context.KTS === context.V2 &&
        event.TARGET_FL > 10
      )
    },
    canFollowSID: ({ context }) =>
      !context.GROUND && context.FL > 0 && context.KTS > context.V2,
    canEnroute: ({ context }) =>
      !context.GROUND && context.FL > 0 && context.KTS > context.V2,
    canStartDescent: ({ context }) =>
      !context.GROUND &&
      context.FL > 0 &&
      context.KTS > 0 &&
      context.KTS > context.MAS,
    canStartApp: ({ context }) =>
      !context.GROUND && context.FL > 0 && context.KTS > context.MAS,
    canFinal: ({ context }) =>
      !context.GROUND && context.FL > 0 && context.KTS > context.MAS,
    canLanding: ({ context }) =>
      !context.GROUND && context.FL > 0 && context.KTS > context.MAS,
    canLanded: ({ context }) =>
      context.GROUND && context.FL === 0 && context.KTS < 20,
    canTaxiToPark: ({ context }) =>
      context.GROUND && context.FL === 0 && context.KTS < 20,
    canPark: ({ context }) =>
      context.GROUND && context.FL === 0 && context.KTS === 0,
    isDeparting: ({ context }) => context.isDeparting,
    isInbound: ({ context }) => !context.isDeparting,
  },
}).createMachine({
  id: 'Airplane',
  type: 'parallel',
  context: {
    FL: 0,
    HDG: 0,
    ROC: 0,
    ROT: 0,
    KTS: 0,
    GROUND: true,
    PHASE: 'Rest',
    V2: 150,
    MAS: 120,
    isDeparting: true,
    latitude: 0,
    longitude: 0,
    TARGET_ROC: 0,
    TARGET_HDG: 0,
    TARGET_FL: 0,
    TARGET_KTS: 0,
  },
  on: {
    'Update Position': {
      actions: 'updatePosition',
    },
    'Update Heading': {
      actions: 'updateHeading',
    },
    'Update Speed': {
      actions: 'updateSpeed',
    },
  },
  states: {
    Vertical: {
      initial: 'Rest',
      states: {
        Rest: {
          on: {
            Climb: {
              target: 'Climbing',
              guard: 'isValidClimb',
              actions: 'startClimb',
            },
            Descent: {
              target: 'Descending',
              guard: 'isValidDescent',
              actions: 'startDescent',
            },
          },
        },
        Climbing: {
          on: {
            Level: {
              target: 'Rest',
              actions: 'levelOff',
            },
            'Reached target FL': {
              target: 'Rest',
              actions: 'levelOff',
            },
          },
        },
        Descending: {
          on: {
            Level: {
              target: 'Rest',
              actions: 'levelOff',
            },
            'Reached target FL': {
              target: 'Rest',
              actions: 'levelOff',
            },
          },
        },
      },
    },
    Horizontal: {
      initial: 'Rest',
      states: {
        Rest: {
          on: {
            'Turn Right': {
              target: 'Turning Right',
              guard: 'isValidTurnRight',
              actions: 'startTurnRight',
            },
            'Turn Left': {
              target: 'Turning Left',
              guard: 'isValidTurnLeft',
              actions: 'startTurnLeft',
            },
          },
        },
        'Turning Right': {
          on: {
            'Stop Turn': {
              target: 'Rest',
              actions: 'stopTurn',
            },
            'Reached target HDG': {
              target: 'Rest',
              actions: 'stopTurn',
            },
          },
        },
        'Turning Left': {
          on: {
            'Stop Turn': {
              target: 'Rest',
              actions: 'stopTurn',
            },
            'Reached target HDG': {
              target: 'Rest',
              actions: 'stopTurn',
            },
          },
        },
      },
    },
    Speed: {
      initial: 'Rest',
      states: {
        Rest: {
          on: {
            'Increase Speed': {
              target: 'Accelerating',
              guard: 'isValidIncreaseSpeed',
              actions: 'setSpeedTarget',
            },
            'Decrease Speed': {
              target: 'Decelerating',
              guard: 'isValidDecreaseSpeed',
              actions: 'setSpeedTarget',
            },
          },
        },
        Accelerating: {
          on: {
            'Reached target KTS': {
              target: 'Rest',
            },
          },
        },
        Decelerating: {
          on: {
            'Reached target KTS': {
              target: 'Rest',
            },
          },
        },
      },
    },
    FlightPhase: {
      initial: 'Rest',
      states: {
        Rest: {
          entry: 'setPhaseRest',
          on: {
            'Clear to Taxi': {
              target: 'Taxi',
              guard: 'canTaxi',
              actions: 'setDeparting',
            },
          },
        },
        Taxi: {
          entry: 'setPhaseTaxi',
          on: {
            'Hold position': {
              target: 'Hold',
              guard: 'canHold',
            },
            Park: {
              target: 'Rest',
              guard: 'canPark',
            },
          },
          after: {
            180000: [
              { target: 'Hold', guard: 'isDeparting' },
              { target: 'Rest', guard: 'isInbound' },
            ],
          },
        },
        Hold: {
          entry: 'setPhaseHold',
          on: {
            'Clear to Take-Off': {
              target: 'Take-Off-Run',
              guard: 'canTakeOffRun',
            },
          },
          after: {
            60000: { target: 'Take-Off-Run' },
          },
        },
        'Take-Off-Run': {
          entry: 'setPhaseTakeOffRun',
          on: {
            'Taking-Off': {
              target: 'Take-Off',
              guard: 'canTakeOff',
            },
          },
          after: {
            30000: { target: 'Take-Off' },
          },
        },
        'Take-Off': {
          entry: 'setPhaseTakeOff',
          on: {
            'Follow SID': {
              target: 'SID',
              guard: 'canFollowSID',
            },
          },
        },
        SID: {
          entry: 'setPhaseSID',
          on: {
            Enroute: {
              target: 'Cruise',
              guard: 'canEnroute',
            },
          },
        },
        Cruise: {
          entry: 'setPhaseCruise',
          on: {
            'Start descent': {
              target: 'STAR',
              guard: 'canStartDescent',
            },
          },
        },
        STAR: {
          entry: 'setPhaseSTAR',
          on: {
            'Start approach': {
              target: 'App',
              guard: 'canStartApp',
            },
          },
        },
        App: {
          entry: 'setPhaseApp',
          on: {
            'Estabilish on Final': {
              target: 'Final',
              guard: 'canFinal',
            },
          },
        },
        Final: {
          entry: 'setPhaseFinal',
          on: {
            Landing: {
              target: 'Landing',
              guard: 'canLanding',
            },
          },
        },
        Landing: {
          entry: 'setPhaseLanding',
          on: {
            Landed: {
              target: 'Landed',
              guard: 'canLanded',
            },
          },
        },
        Landed: {
          entry: 'setPhaseLanded',
          on: {
            'Taxi to Park': {
              target: 'Taxi',
              guard: 'canTaxiToPark',
              actions: 'setInbound',
            },
          },
          after: {
            60000: { target: 'Taxi', actions: 'setInbound' },
          },
        },
      },
    },
  },
})
