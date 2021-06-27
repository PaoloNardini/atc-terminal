// import compression from 'compression'
import D from 'debug'
import express from 'express'
// import { NextFunction, Request, Response } from 'express'
import http from 'http'
// import fs from 'fs'
// import YAML from 'yaml'
// import { authenticateMiddleware } from './middlewares/authenticate'
// import basicAuth from 'express-basic-auth'
// import * as config from '../../config'

import { UseCases } from '../../core'
import { ApiV1 } from './routers/v1/endpoints'
import { Screen } from '../screen'
// import { ChecksRouter } from './routers/checks'

const debug = D('app:gateways:http')
const trace = D('app:trace')

interface HttpServerConfig {
  isProduction: boolean
  useCases: UseCases
  screen: Screen
  isServerShuttingDown: () => boolean
}

export const COOKIE_OPTIONS = { httpOnly: true, secure: false }

export function createNewHttpServer(httpConfig: HttpServerConfig): http.Server {
  const {
    isProduction,
    useCases,
    screen,
    isServerShuttingDown,
  } = httpConfig

  const app = express()

  app.use('/healthcheck', (_, res) => {
    if (isServerShuttingDown()) {
      debug('healtcheck response 500 because shutting down')
      res.sendStatus(500)
      return
    }
    res.send('OK')
  })

  // Api Endpoints
  app.use('/api/v1', ApiV1({ useCases}))

  app.use('/',  (req, res) => {
      if (req) {
          if (isProduction) {

          }
          const status = screen.status
          useCases.loadScenario({context: {}, useCases})
          res.send(`This is home: screen status = ${status}`)
      }
  })

  return http.createServer(app).setTimeout(1000 * 30, () => {
    trace('Closed connection longer than 30 sec')
  })
}
