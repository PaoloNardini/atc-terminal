// import { UseCases } from "../../core"
import D from 'debug'
// const trace = D('app:trace')
import http from 'http'
import { Server }  from 'socket.io'
import { SocketMsgType } from "../../core/entities"
import { Deps, SocketCallback } from "../../core/gateways"

const debug = D('app:gateways:socket')
// const trace = D('app:trace')

type Output = Pick<
  Deps,
  | 'transportGateway'
>

interface SocketConfig {
    isProduction: boolean
    // useCases: UseCases
    httpServer: http.Server
}

export interface Socket {
    send: (msgType: SocketMsgType, payload: any) => boolean
}

 export function createNewSocket(config: SocketConfig): Output {
    const {
        isProduction,
        // useCases,
        httpServer
    } = config

    void isProduction
    // void useCases
    if (httpServer) {
        const io = new Server(httpServer);
        if (io) {
          debug(`io init`)
        }

        /*
        io.on('connection', (socket) => {
            socket.on(SocketMsgType.MSG_GENERAL , (payload) => {
                debug('message: ' + payload);
                useCases.handleCommand({ 
                    msgType: SocketMsgType.MSG_GENERAL,
                    msgPayload: payload,
                    context: {}, 
                    useCases
                })
                //io.emit(SocketMsgType.MSG_GENERAL, payload);
            });
            socket.on(SocketMsgType.MSG_MOUSE , (payload) => {
                debug('message: ' + payload);
                useCases.handleCommand({ 
                    msgType: SocketMsgType.MSG_MOUSE,
                    msgPayload: payload,
                    context: {}, 
                    useCases
                })
            });
        });
        */
        debug(`socket initialized`)

        return {
            transportGateway: {
                sendMessage: async (msgType: SocketMsgType, payload: any) =>  {
                    io.emit(msgType, payload);
                    return
                },
                attachHandler: (msgType: SocketMsgType, handler: SocketCallback) => {
                    io.on('connection', (socket) => {
                        socket.on(msgType , (payload) => {
                            debug('message: ' + payload)
                            handler(msgType, payload)
                        })
                    })
                }
            }
        }
    }
    else {
        throw(`Error initializing socket: no http server`)
    }
} 
