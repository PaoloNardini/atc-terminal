declare const io: any
import { Scenario, SocketMsgType } from '../../src/core/entities'
import util from 'util'
import { loadScenario } from './scenario'

var socket = io()

export const sendMessage = (msgType: string, payload: any) => {
    console.log(`Send message of type ${msgType} with payload ${util.inspect(payload)}`)
    socket.emit(msgType, payload)
}

export const handleMessages = (msgType: string, payload: any) => {
    console.log(`received message of type ${msgType} with payload ${util.inspect(payload)}`)
    // TODO dispatch message
    if (msgType == SocketMsgType.MSG_SCENARIO && payload.type == 'SCENARIO') {
         // 
         loadScenario(payload.scenario as Scenario)
    }
}

socket.on(SocketMsgType.MSG_GENERAL, function(payload: any) { handleMessages(SocketMsgType.MSG_GENERAL, payload)})

socket.on(SocketMsgType.MSG_SCENARIO, function(payload: any) { handleMessages(SocketMsgType.MSG_SCENARIO, payload)})

