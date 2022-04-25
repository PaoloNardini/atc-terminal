import * as socket from './socket'
import { SocketMsgType } from '../../src/core/entities'
import { Canvas } from './graphic/canvas'
// import { loadScenario } from './scenario'
// import util from 'util'

const canvas = new Canvas()

const socketInstance = socket.SocketFactory(canvas)

// This is main.ts
socketInstance.sendMessage(SocketMsgType.MSG_GENERAL,"INIT")

var form = document.getElementById('form');
var input: any = document.getElementById('input');

if (form && input) {
    form.addEventListener('submit', function(e) {
    // console.log(`form send`)
    e.preventDefault();
    if (input.value) {
        // console.log(`socket emit`)
        socketInstance.sendMessage(SocketMsgType.MSG_GENERAL, input.value)
        // socket.emit('chat message', input.value);
        input.value = '';
    }
    })
}

canvas.init(socketInstance)

socketInstance.attachHandler(SocketMsgType.MSG_GENERAL, socket.handleGeneralMessage)

socketInstance.attachHandler(SocketMsgType.MSG_SCENARIO, socket.handleScenarioMessage)






