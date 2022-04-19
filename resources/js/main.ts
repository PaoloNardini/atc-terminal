import * as socket from './socket'
import { SocketMsgType } from '../../src/core/entities'


// This is main.ts
socket.sendMessage(SocketMsgType.MSG_GENERAL,"This is init")


var form = document.getElementById('form');
var input: any = document.getElementById('input');

if (form && input) {
    form.addEventListener('submit', function(e) {
    // console.log(`form send`)
    e.preventDefault();
    if (input.value) {
        // console.log(`socket emit`)
        socket.sendMessage(SocketMsgType.MSG_GENERAL, input.value)
        // socket.emit('chat message', input.value);
        input.value = '';
    }
    })
}
