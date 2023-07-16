import { createMachine } from 'xstate'
import { Plane } from '../../entities'
// import { Plane, PlaneState, PlaneEventType } from '../../entities'

export function createPlaneFsm(plane: Plane) {
  return createMachine<Plane>(
    {
      id: 'plane',
      type: 'parallel',
      predictableActionArguments: true,
      context: plane,
      initial: plane.state,
      states: {
        turn: {
          initial: 'idle',
          states: {
            idle: {
              always: [
                { target: 'left', cond: 'mustTurnLeft' },
                { target: 'right', cond: 'mustTurnRight' },
              ],
              on: {
                TURN_LEFT: { target: 'left' },
                TURN_RIGHT: { target: 'right' },
              },
            },
            left: {
              on: {
                TURN_STOP: { target: 'idle' },
              },
            },
            right: {
              on: {
                TURN_STOP: { target: 'idle' },
              },
            },
          },
        },
        climb: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                CLIMB: { target: 'climb' },
                DESCENT: { target: 'descent' },
              },
            },
            climb: {
              on: {
                CLIMB_STOP: { target: 'idle' },
              },
            },
            descent: {
              on: {
                CLIMB_STOP: { target: 'idle' },
              },
            },
          },
        },

        /*  
          [PlaneState.STATE_TURN]: {
            initial: 'OFF',
            on: {
              [PlaneEventType.EVENT_TURN_LEFT]: { actions: ['turn','left'] },
              [PlaneEventType.EVENT_TURN_RIGHT]: { actions: ['turn','right'] },
              [PlaneEventType.EVENT_TURN_STOP]: { actions: ['turn', 'off'] },
            },
          },
          [PlaneState.STATE_CLIMB]: {
                initial: 'OFF',
                on: {
                    [PlaneEventType.EVENT_CLIMB]: { actions: ['climb'] },
                    [PlaneEventType.EVENT_DESCENT]: { actions: ['descent'] },
                  },
                },
          */
      },
    },
    {
      guards: {
        mustTurnRight: (plane /*, event */) => {
          console.log(`mustTurnRight`)
          if (Math.abs(plane.heading_target - plane.heading) > 1) {
            if (
              (plane.heading_target > plane.heading &&
                plane.heading_target - plane.heading < 180) ||
              (plane.heading > plane.heading_target &&
                plane.heading - plane.heading_target > 180)
            ) {
              return true
            }
          }
          return false
        },
        mustTurnLeft: (plane /*, event */) => {
          console.log(`mustTurnLeft`)
          if (Math.abs(plane.heading_target - plane.heading) > 1) {
            if (
              (plane.heading_target > plane.heading &&
                plane.heading_target - plane.heading < 180) ||
              (plane.heading > plane.heading_target &&
                plane.heading - plane.heading_target > 180)
            ) {
              return false
            } else {
              return true
            }
          }
          return false
        },
      },
      /*
        actions: {
          turn: () => {},
          climb: () => {},
          descent: () => {},
        },
        */
    }
  )
}
