import { SocketMsgType } from "../entities"

export type SocketCallback = (msgType: SocketMsgType, payload: any) => void

export interface TransportGateway {
    sendMessage: (
        msgType: SocketMsgType,
        msgPayload: any
    ) => Promise <void>
    attachHandler: (
        msgType: SocketMsgType,
        handler: SocketCallback
    ) => void
}
