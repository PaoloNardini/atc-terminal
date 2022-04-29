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
            switch (input.msgPayload) {
              case 'LOADSCENARIO':
                const output = await input.useCases.loadScenario({
                    context, 
                    useCases: input.useCases
                })
                context = output.context
                break;
              case 'TESTPLANES':
                const output2 = await input.useCases.testPlanes({
                  context,
                  useCases: input.useCases
                })
                context = output2.context
                break;

              default:
                // TODO
                break;
            }
            break;
        default:
            // TODO
            break;
              
    }

    return { context }

}

export type HandleCommand = ReturnType<typeof createUseCase>
