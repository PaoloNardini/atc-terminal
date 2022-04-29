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
        debug(`testPlanes`)
    }

    const plane = new Plane()
    plane.coordinate = new Coordinate(context.parameters.latitudeCenter + (Math.random()*10), context.parameters.longitudeCenter + (Math.random()*10))
    context.planes.push(plane)

    input.useCases.dispatch({
      context,
      msgType: SocketMsgType.MSG_PLANES, payload: {
        type: 'PLANES',
        planes: context.planes
      }
    })

    return { context }

}

export type LoadScenario = ReturnType<typeof createUseCase>
