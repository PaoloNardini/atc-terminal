// import { UseCases } from '..'
import D from 'debug'
import { SocketMsgType } from '../entities'
// import { SocketMsgType } from '../entities'
// import util from 'util'

const debug = D('app:core:usecases:Dispatch')

import { Deps } from '../gateways'

/*export interface Deps {} */

export const useCaseName = 'dispatch'

export type Input = {
  context: any,
  msgType: SocketMsgType
  payload: any
}

export type Output = {
  context: any
}

export const createUseCase = ({ transportGateway }: Deps) => async (
  input: Input
): Promise<Output> => {

    let context = input.context

    debug(`Dispatch`)

    transportGateway.sendMessage(input.msgType, input.payload )

    return { context }

}

export type Dispatch = ReturnType<typeof createUseCase>
