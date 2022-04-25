// This is start.ts
import { initializeUseCases } from "./core"
import { createNewHttpServer } from "./gateways/http"
import * as config from './config'
import { Server } from 'http'
import D from 'debug'
import { createNewScreen, Screen } from "./gateways/screen"
import { createNewSocket } from "./infrastructure/socket"
import { SocketMsgType } from "./core/entities"
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

    // let socket: any = undefined

    debug(`Create new Http Sever...`)
    const httpServer = createNewHttpServer({
      // useCases,
      // screen,
      isProduction: false,
      isServerShuttingDown,
    })
    debug(`Create new Http Sever: ok`)

    const { transportGateway} = createNewSocket({
      isProduction: false,
      // useCases,
      httpServer
    })

    // void (socket) // dummy

    debug(`Initialize use-cases...`)
    const useCases = initializeUseCases({
      transportGateway
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
    transportGateway.attachHandler(SocketMsgType.MSG_GENERAL, (msgType, payload) => {
      debug(`HANDLER: RECEIVED MSG`)
      useCases.handleCommand({ 
        msgType, 
        msgPayload: payload,
        context: {},
        useCases
      })
    })
    transportGateway.attachHandler(SocketMsgType.MSG_MOUSE, (msgType, payload) => {
      debug(`HANDLER: RECEIVED MOUSE MSG`)
      useCases.handleCommand({ 
        msgType, 
        msgPayload: payload,
        context: {},
        useCases
      })
    })
}

main()