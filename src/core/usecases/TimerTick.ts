// import { UseCases } from '..'
import D from 'debug'
import { Context, planeMove, SocketMsgType } from '../entities'
import { UseCases } from '..'
// import util from 'util'

const debug = D('app:core:usecases:TimerTick')

import { Deps } from '../gateways'

export const useCaseName = 'timerTick'

export type Input = {
  context: Context,
  useCases: UseCases,
}

export type Output = {
  context: Context
}

export const createUseCase = ({ transportGateway }: Deps) => async (
  input: Input
): Promise<Output> => {

  void transportGateway

    let context: Context = input.context
    let parameters = context.parameters
    if (parameters.speedX2) {
      parameters.mainTimer = new Date().getTime() / 500;
    }
    else {
        parameters.mainTimer = new Date().getTime() / 1000;
    }
    if (parameters.lastTimer == 0) {
      parameters.lastTimer = parameters.mainTimer
    }
    const elapsed = parameters.mainTimer - parameters.lastTimer
    parameters.lastTimer = parameters.mainTimer

    debug(`TimerTick - elapsed: ${elapsed}`)

    for (const plane of context.planes) {
      // Update all planes position and refresh on screen
       planeMove(plane, elapsed)
       input.useCases.dispatch({
        context: input.context,
        msgType: SocketMsgType.MSG_PLANES, payload: {
          type: 'UPDATE_PLANE',
          plane: plane
        }
      })
    }


    return { context }

}

export type TimerTick = ReturnType<typeof createUseCase>
