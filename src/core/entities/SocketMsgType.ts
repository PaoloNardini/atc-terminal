export enum SocketMsgType {
    MSG_GENERAL = 'GEN',
    MSG_MOUSE = 'MOUSE',
    MSG_SCENARIO = 'SCENARIO',
    MSG_PLANES = 'PLANES',
    MSG_TALK = 'TALK'
}

export enum MouseMsg {
    CLICK = 'click',
    MOUSEUP = 'up',
    MOUSEDOWN = 'down',
    PRESSMOVE = 'drag',
    PRESSUP = 'drop',
    MOUSEWHEEL = 'wheel'
}
export interface SocketMsgMouse {
    e: MouseMsg,
    x?: number,
    y?: number,
    delta?: number
}