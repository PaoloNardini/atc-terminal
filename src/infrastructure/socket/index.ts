import { UseCases } from "../../core"
import D from 'debug'
// const trace = D('app:trace')
import http from 'http'
import { Server }  from 'socket.io'
import { SocketMsgType } from "../../core/entities"

const debug = D('app:gateways:socket')
// const trace = D('app:trace')


interface SocketConfig {
    isProduction: boolean
    useCases: UseCases
    httpServer: http.Server
}
 
export function createNewSocket(config: SocketConfig) {
    const {
        isProduction,
        useCases,
        httpServer
    } = config

    if (isProduction) {}
    if (useCases) {}
    if (httpServer) {
        const io = new Server(httpServer);
        if (io) {
          debug(`io init`)
        }

        io.on('connection', (socket) => {
            socket.on(SocketMsgType.MSG_GENERAL , (payload) => {
                debug('message: ' + payload);
                //io.emit(SocketMsgType.MSG_GENERAL, payload);
            });
        });
        debug(`socket initialized`)
        return io
    }
    else {
        throw(`Error initializing socket: no http server`)
    }
} 
