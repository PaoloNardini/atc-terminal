import { UseCases } from '..'
import { SocketMsgType, Context } from '../entities'
import { Deps } from '../gateways'
import util from 'util'
import D from 'debug'

const debug = D('app:core:usecases:HandleCommand')

export const useCaseName = 'handle-command'

export type Input = {
  msgType: SocketMsgType,
  msgPayload: any,  
  context: Context,
  useCases: UseCases,
}

export type Output = {
  context: Context
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
                const output = await input.useCases.loadScenario({
                    context, 
                    useCases: input.useCases
                })
                context = output.context
            }
            break;
    }

    return { context }

}

export type HandleCommand = ReturnType<typeof createUseCase>
