
declare module cc {
    export var gameCenter: GameCenter;
    export var dataCenter: DataCenter;
    export var propertyCenter: PropertyCenter;
    export var insideEmitter: Emitter;
    export var socket: Socket;
    export var timerMgr: TimerMgr;
    export var updateMgr: TimerMgr;
    export var uiCenter: UiCenter;
    export var audioCenter: AudioCenter;
    export var protoMap: ProtoMap;
}
interface WebSocket extends EventTarget {
    clearSocketEnd:boolean;
}