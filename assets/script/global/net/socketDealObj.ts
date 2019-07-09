import {Proto} from "./protoMap";

export class SocketRequest {
    id:number = 0;
    protoId:number = 0;
    socketId:number = 0;
    timerId:number = 0;
    callback:Function = null;
    constructor(id:number,protoId:number,socketId:number,timerId:number,callback:Function) {
        this.id = id;
        this.protoId = protoId;
        this.socketId = socketId;
        this.timerId = timerId;
        this.callback = callback;
    }
}

export class DealEndSocketData {
    proto:Proto = null;
    resultData:any = null;
    errorCode:number = 0;
    requestId:number = 0;
    constructor(proto:Proto,resultData:any,errorCode:number,requestId:number) {
        this.proto = proto;
        this.resultData = resultData;
        this.errorCode = errorCode;
        this.requestId = requestId;
    }
}

export class BroadcastNetData{
    msg:any = null;
    errorCode:number = 0;
    constructor(msg:any,errorCode:number) {
        this.msg = msg;
        this.errorCode = errorCode;
    }
}