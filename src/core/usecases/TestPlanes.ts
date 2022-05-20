import { UseCases } from '..'
import D from 'debug'
import { Context, Plane, SocketMsgType } from '../entities'
// import util from 'util'

const debug = D('app:core:usecases:TestPlanes')

import { Deps } from '../gateways'
import { Coordinate } from '../valueObjects'

export const useCaseName = 'test-planes'

export type Input = {
  context: Context,
  useCases: UseCases,
}

export type Output = {
  context: Context
}

export const createUseCase = ({ }: Deps) => async (
  input: Input
): Promise<Output> => {

    let context: Context = input.context

    if (input.useCases) {
        debug(`AddPlane`)
    }

    /*
    const plane = new Plane()
    plane.setCoordinate(new Coordinate(context.parameters.latitudeCenter + (Math.random()-0.2), context.parameters.longitudeCenter + (Math.random()-0.2)))
    plane.callsign = `PLANE${context.planes.length}`
    plane.completeCallsign = plane.callsign
    plane.heading = 45
    plane.speed = 200
    plane.fl = 180
    plane.climb = 0
    plane.turn = 0
    */

    const plane = new Plane()
    plane.setCoordinate(new Coordinate(context.parameters.latitudeCenter + (Math.random()-0.5), context.parameters.longitudeCenter + (Math.random()-0.5)))
    plane.callsign = `PLANE${context.planes.length}`
    plane.completeCallsign = plane.callsign
    plane.heading = (Math.random() * 360)
    plane.speed = (Math.random()*300 + 150)
    plane.fl = (Math.random()*42000+1000)
    plane.climb = (Math.random()*2000 - 100)
    if (Math.random() > 0.7) {
      plane.turn = (Math.random()*2-1)
    }

    context.planes.push(plane)

    input.useCases.dispatch({
      context,
      msgType: SocketMsgType.MSG_PLANES, payload: {
        type: 'ADD_PLANE',
        plane: plane
      }
    })

    return { context }

}

export type LoadScenario = ReturnType<typeof createUseCase>
