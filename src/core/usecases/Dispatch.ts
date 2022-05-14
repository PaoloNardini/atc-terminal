// import { UseCases } from '..'
// import D from 'debug'
import { Context, SocketMsgType } from '../entities'
// import { SocketMsgType } from '../entities'
// import util from 'util'

// const debug = D('app:core:usecases:Dispatch')

import { Deps } from '../gateways'

/*export interface Deps {} */

export const useCaseName = 'dispatch'

export type Input = {
  context: Context
  msgType: SocketMsgType
  payload: any
}

export type Output = {
  context: Context
}

export const createUseCase = ({ transportGateway }: Deps) => async (
  input: Input
): Promise<Output> => {
  let context: Context = input.context

  // debug(`Dispatch`)

  transportGateway.sendMessage(input.msgType, input.payload)

  return { context }
}

export type Dispatch = ReturnType<typeof createUseCase>
