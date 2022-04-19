// import compression from 'compression'
import D from 'debug'
// import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
// import YAML from 'yaml'
// import { authenticateMiddleware } from './middlewares/authenticate'
// import basicAuth from 'express-basic-auth'
// import * as config from '../../config'

import { UseCases } from '../../core'
import { ApiV1 } from './routers/v1/endpoints'
import { Screen } from '../screen'
import { SocketMsgType } from '../../core/entities'
// import { ChecksRouter } from './routers/checks'
import path from 'path'


import http from 'http'
import express from 'express'
import { Server }  from 'socket.io';
import expressServeStatic from 'serve-static'

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

  // Catch any static file in /public and resource/static folders adding cache-control header
  // (see http://expressjs.com/en/resources/middleware/serve-static.html)
  app.use(
    expressServeStatic('public', {
      cacheControl: false, // true TODO
      maxAge: 1000 * 60 * 5,  // more TODO
      etag: true,
      immutable: false, // resource could be re-validated before expiration
    })
  )

  app.use('/healthcheck', (_, res) => {
    if (isServerShuttingDown()) {
      debug('healtcheck response 500 because shutting down')
      res.sendStatus(500)
      return
    }
    res.send('OK')
  })

  app.use('/main.js', (_, res) => {
    const assetName = 'main.js'
    const publicPath = path.resolve(__dirname + '/../../../public')
    const manifestStr = fs.readFileSync( `${publicPath}/manifest.json`, {
      encoding: 'utf-8',
    })
    const manifest = JSON.parse(manifestStr)
    console.log(manifestStr)
    if (manifest[assetName]) {
      const hashedAssetName = `/${manifest[assetName]}`
      console.log(hashedAssetName)
      const assetContent = fs.readFileSync(`${publicPath}/${hashedAssetName}`, {
        encoding: 'utf-8',
      })
      res.send(assetContent)
      return
    }
    res.status(404)
    return
  })

  // Api Endpoints
  app.use('/api/v1', ApiV1({ useCases}))

  app.get('/', (_, res) => {
    res.sendFile(path.resolve(__dirname + '/../screen/index.html'));
  });


  app.use('/home',  (req, res) => {
      if (req) {
          if (isProduction) {

          }
          const status = screen.status
          useCases.loadScenario({context: {}, useCases})
          res.send(`This is home: screen status = ${status}`)
      }
  })

  const server = http.createServer(app).setTimeout(1000 * 60, () => {
    trace('Closed connection longer than 60 sec')
  })

  const io = new Server(server);
  if (io) {
    console.log(`io init`)
  }

  io.on('connection', (socket) => {
    socket.on(SocketMsgType.MSG_GENERAL , (msg) => {
      console.log('message: ' + msg);
      io.emit(SocketMsgType.MSG_GENERAL, msg);
    });
  });

  return server

}
