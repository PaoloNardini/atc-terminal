declare const io: any
import { SocketMsgType } from '../../src/core/entities'

var socket = io()

export const sendMessage = (msgType: string, payload: any) => {
    console.log(`Send message of type ${msgType} with payload ${payload}`)
    socket.emit(msgType, payload)
}

export const handleMessages = (msgType: string, payload: any) => {
    console.log(`received message of type ${msgType} with payload ${payload}`)
}

socket.on(SocketMsgType.MSG_GENERAL, function(payload: any) { handleMessages(SocketMsgType.MSG_GENERAL, payload)})


