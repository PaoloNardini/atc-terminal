import { UseCases } from '..'
import D from 'debug'
import { SocketMsgType } from '../entities'
import util from 'util'

const debug = D('app:core:usecases:HandleCommand')

import { Deps } from '../gateways'
// import { Dispatch } from './Dispatch'

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

export const createUseCase = ({}: Deps ) => async (
  input: Input
): Promise<Output> => {

    let context = input.context

    debug(`HandleCommand: msg: ${util.inspect(input.msgPayload)}`)

    input.useCases.dispatch({ 
        msgType: input.msgType, 
        payload: 'Message received', 
        context
    })

    switch (input.msgType) {
        case SocketMsgType.MSG_GENERAL:
            if (input.msgPayload === 'LOADSCENARIO') {
                context = input.useCases.loadScenario({
                    context, 
                    useCases: input.useCases
                })
            }
            break;
    }

    return { context }

}

export type HandleCommand = ReturnType<typeof createUseCase>
