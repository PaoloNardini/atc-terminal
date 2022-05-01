declare const io: any
import { Plane, Scenario, SocketMsgType } from '../../src/core/entities'
import util from 'util'
import { loadScenario } from './scenario'
import { loadWaypoints } from './waypoints'
import { Canvas } from './graphic/canvas'
import { addPlane } from './planes'

var socket = io()

export type SocketClientCallback = (msgType: SocketMsgType, payload: any, canvas: Canvas) => Promise<void>

export interface SocketFactoryInterface {
    sendMessage: (msgType: string, payload: any) => void
    handleMessages: (msgType: string, payload: any) => void
    attachHandler: (msgType: SocketMsgType, handler: SocketClientCallback) => void
}

export const SocketFactory = (canvas: Canvas): SocketFactoryInterface => {
    void canvas
    return {
        sendMessage: (msgType: string, payload: any) => {
            console.log(`Send message of type ${msgType} with payload ${util.inspect(payload)}`)
            socket.emit(msgType, payload)
        },
        handleMessages: (msgType: string, payload: any) => {
            console.log(`received message of type ${msgType} with payload ${util.inspect(payload)}`)
            // TODO dispatch message
            /*
            if (msgType == SocketMsgType.MSG_SCENARIO && payload.type == 'SCENARIO') {
                // 
                loadScenario(payload.scenario as Scenario)
            }
            */
        },
        attachHandler: (msgType: SocketMsgType, handler: SocketClientCallback) => {
            socket.on(msgType , (payload: any) => {
                handler(msgType, payload, canvas)
            })
        }
    }
}

export const handleGeneralMessage = async (msgType: string, payload: any, canvas: Canvas): Promise<void> => {
    void canvas
    console.log(`received message of type ${msgType} with payload ${util.inspect(payload)}`)
}

export const handleScenarioMessage = async (msgType: SocketMsgType, payload: any, canvas: Canvas): Promise<void> => {
    console.log(`received scenario message of type ${msgType} with payload ${util.inspect(payload)}`)
    if (msgType == SocketMsgType.MSG_SCENARIO && payload.type == 'SCENARIO') {
        // 
        loadScenario(payload.scenario as Scenario, canvas)
        loadWaypoints(payload.waypoints, canvas)
    }
}

export const handlePlanesMessage = async (msgType: SocketMsgType, payload: any, canvas: Canvas): Promise<void> => {
    console.log(`received planes message of type ${msgType} with payload ${util.inspect(payload)}`)
    if (msgType == SocketMsgType.MSG_PLANES && payload.type == 'ADD_PLANE') {
        // 
        addPlane(payload.plane as Plane, canvas)
    }
}
