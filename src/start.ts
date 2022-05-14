// This is start.ts
import { initializeUseCases } from './core'
import { createNewHttpServer } from './gateways/http'
import * as config from './config'
import { Server } from 'http'
import D from 'debug'
import { createNewScreen, Screen } from './gateways/screen'
import { createNewSocket } from './infrastructure/socket'
import { SocketMsgType } from './core/entities'
import { makeScenarioGateway } from './infrastructure/Scenario'
import { makeNavaidsGateway } from './infrastructure/NavaidsLoader'
import { Context } from './core/entities/Context'
import { makeAtsRoutesGateway } from './infrastructure/AtsRoutesLoader'
const debug = D('app:start')

let isShuttingDown: boolean = false

const gracefulShutdown = (server: Server): void => {
  process.removeListener('SIGTERM', gracefulShutdown)
  process.removeListener('SIGINT', gracefulShutdown)

  isShuttingDown = true

  const timeout = config.IS_PRODUCTION ? 25 * 1000 : 1000

  debug('Received kill signal, shutting down gracefully.')

  setTimeout(() => {
    debug('Shutdown: httpServer shutdown start')
    server.close(() => {
      debug('Shutdown: httpServer shutdown complete')
      process.exit()
    })
  }, 5 * 1000)
  setTimeout(() => {
    debug(
      'httpServer could not terminate connections in time, forcefully shutting down'
    )
    process.exit()
  }, timeout)
}

const isServerShuttingDown = (): boolean => isShuttingDown

export const main = () => {
  console.log('This is Main')

  // The main global context object
  let context: Context = new Context()

  debug(`Create new Http Sever...`)
  const httpServer = createNewHttpServer({
    // useCases,
    // screen,
    isProduction: false,
    isServerShuttingDown,
  })
  debug(`Create new Http Sever: ok`)

  const { transportGateway } = createNewSocket({
    isProduction: false,
    // useCases,
    httpServer,
  })

  // Build gateways from factory
  const scenarioGateway = makeScenarioGateway(context)
  const navaidsGateway = makeNavaidsGateway(context)
  const atsRoutesGateway = makeAtsRoutesGateway(context)

  debug(`Initialize use-cases...`)
  const useCases = initializeUseCases({
    transportGateway,
    scenarioGateway,
    navaidsGateway,
    atsRoutesGateway,
  })
  debug(`Initialize use-cases: ok`)

  const screen: Screen = createNewScreen({
    isProduction: false,
    useCases,
  })
  void screen

  httpServer.listen(config.PARAMS.port, (error?: Error) => {
    if (error) {
      debug(error)
      process.exit(1)
    }

    // listen for TERM signal .e.g. kill
    process.on('SIGTERM', () => {
      gracefulShutdown(httpServer)
    })
    // listen for INT signal e.g. Ctrl-C
    process.on('SIGINT', () => {
      gracefulShutdown(httpServer)
    })

    debug(`Ready on port ${config.PARAMS.port}`)
  })

  // Attach usecase handleCommand as socket message handler
  transportGateway.attachHandler(
    SocketMsgType.MSG_TALK,
    async (msgType, payload) => {
      debug(`HANDLER: RECEIVED TALK MSG`)
      ;({ context } = await useCases.handleCommand({
        msgType,
        msgPayload: payload,
        context,
        useCases,
      }))
    }
  )
  transportGateway.attachHandler(
    SocketMsgType.MSG_GENERAL,
    async (msgType, payload) => {
      debug(`HANDLER: RECEIVED GENERAL MSG`)
      ;({ context } = await useCases.handleCommand({
        msgType,
        msgPayload: payload,
        context,
        useCases,
      }))
    }
  )
  transportGateway.attachHandler(
    SocketMsgType.MSG_MOUSE,
    async (msgType, payload) => {
      debug(`HANDLER: RECEIVED MOUSE MSG`)
      ;({ context } = await useCases.handleCommand({
        msgType,
        msgPayload: payload,
        context,
        useCases,
      }))
    }
  )

  setInterval(function() {
    useCases.timerTick({
      context,
      useCases,
    })
  }, 5000) // 1500
}

main()
