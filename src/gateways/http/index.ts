// import compression from 'compression'
import D from 'debug'
import express from 'express'
// import { NextFunction, Request, Response } from 'express'
// import responseTime from 'response-time'
import http from 'http'
// import fs from 'fs'
// import YAML from 'yaml'
// import createMiddleware from '@apidevtools/swagger-express-middleware'
// import { authenticateMiddleware } from './middlewares/authenticate'
// import basicAuth from 'express-basic-auth'
// import * as config from '../../config'

import { UseCases } from '../../core'
import { ApiV1 } from './routers/v1/endpoints'
// import { ChecksRouter } from './routers/checks'

const debug = D('app:gateways:http')
const trace = D('app:trace')

interface HttpServerConfig {
  isProduction: boolean
  useCases: UseCases
  isServerShuttingDown: () => boolean
}

export const COOKIE_OPTIONS = { httpOnly: true, secure: false }

export function createNewHttpServer(httpConfig: HttpServerConfig): http.Server {
  const {
    isProduction,
    useCases,
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
          useCases.loadScenario({context: {}, useCases})
          res.send('This is home')
      }
  })
  // app.use('/checks', ChecksRouter())

  /*
  // Protect endpoint with http basic authentication
  const authUser: { [key: string]: string } = {}
  authUser[config.API_DOC_USER] = config.API_DOC_PASS // get user/pass from .env
  app.use(
    '/api-docs',
    basicAuth({ users: authUser, challenge: true }),
    swaggerUi.serve,
    swaggerUi.setup(jsonAPISchema, options)
  )
  */

  return http.createServer(app).setTimeout(1000 * 30, () => {
    trace('Closed connection longer than 30 sec')
  })
}
