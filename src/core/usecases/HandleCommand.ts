import { UseCases } from '..'
import D from 'debug'
import { SocketMsgType } from '../entities'
import util from 'util'

const debug = D('app:core:usecases:HandleCommand')

import { Deps } from '../gateways'
import { Dispatch } from './Dispatch'

// export interface Deps {}

export const useCaseName = 'handle-command'

export type Input = {
  msgType: SocketMsgType,
  msgPayload: any,  
  context: any,
  useCases: UseCases,
}

export type Output = {
  context: any
}

export const createUseCase = (dispatch: Dispatch, {}: Deps ) => async (
  input: Input
): Promise<Output> => {

    if (input.useCases) {
        debug(`HandleCommand: msg: ${util.inspect(input.msgPayload)}`)
    }

    dispatch({ 
        msgType: input.msgType, 
        payload: 'Message received', 
        context: input.context
    })

    return { context: input.context }

}

export type HandleCommand = ReturnType<typeof createUseCase>
