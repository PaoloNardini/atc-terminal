// This is start.ts

import { initializeUseCases } from "./core"
import { createNewHttpServer } from "./gateways/http"
import * as config from './config'
import { Server } from 'http'
import D from 'debug'
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

    debug(`Initialize use-cases...`)
    const useCases = initializeUseCases({
    })
    debug(`Initialize use-cases: ok`)
  
    debug(`Create new Http Sever...`)
    const httpServer = createNewHttpServer({
      useCases,
      isProduction: false,
      isServerShuttingDown,
    })
    debug(`Create new Http Sever: ok`)

    
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
}

main()