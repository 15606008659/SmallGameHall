import {ByteBuffer, protobuf} from "../lib/libToTs";
import protoMap, {PACKET_TYPE, Proto} from "./protoMap";
import loadUtil from "../../util/loadUtil";
import {BroadcastNetData, DealEndSocketData, SocketRequest} from "./socketDealObj";
import gameConfig from "../../data/gameConfig";

let protoBuilder = protobuf.newBuilder();

enum SOCKET_STATE{
    NONE,
    BUILD_CONN,
    CONN_RUNING,
    CONN_CLOSE,
}
enum DEAL_ERR_IN_FUN{
    NONE,
    THROW_ERR,
    NO_THROW_OPEN_ERR_TIP,
    NO_THROW_NO_DEAL,
}
export {SOCKET_STATE,DEAL_ERR_IN_FUN};

export default class Socket{
    webSocket:WebSocket = null;
    debug:boolean = false;
    inBackNet:boolean = false;
    isHttps:boolean = false;
    state:SOCKET_STATE = SOCKET_STATE.NONE;
    protoAnalyzeMap:Array<Proto> = {};
    arrNetData:Array<any> = [];
    _sendingProtoMap:Array<boolean> = {};
    _requsetMap:Array<SocketRequest> = {};
    _lisMapByProtoId:Array<Array<Function>> = {};
    _throwProtoIdMap:Array<boolean> = {};
    _curSocketId:number = 0;
    _requestId:number = 0;
    _curLisId:number = 0;
    constructor() {
        this.init();
    }
    async init(){
        this.isHttps = gameConfig.IS_HTTPS;
        await this.loadProto();
    }
    async loadProto() {
        let arrProtoFile = await loadUtil.loadResDir('./proto',3,cc.dataCenter,cc.Asset,false);
        for (let i = 0; i < arrProtoFile.length; i++) {
            protobuf.protoFromString(arrProtoFile[i].text, protoBuilder);
        }
        for (let protoModelName in protoMap) {
            let protoModel = protoMap[protoModelName];
            for (let protoName in protoModel) {
                let item = protoModel[protoName];
                if (typeof item !== "string") {
                    if(!item.name){
                        item.name = protoName;
                    }
                    this.protoAnalyzeMap[item.id] = item;
                }
            }
        }
        console.log('协议加载完成');
    }
    connectionAsync(ip:string,port:string){
        let self = this;
        let inStartConn = true;
        return new Promise((resolve, reject) => {
            let ws = null;
            if(this.isHttps){
                ws = new WebSocket("wss://"+ip+':'+port+"/sws");
            }else{
                ws = new WebSocket("ws://"+ip+':'+port+"/ws");
            }
            this.webSocket = ws;
            ws['clearSocketEnd'] = false;
            this.state = SOCKET_STATE.BUILD_CONN;
            ws.onopen = function () {
                inStartConn = false;
                self._curSocketId++;
                self.state = SOCKET_STATE.CONN_RUNING;
                resolve();
            };
            ws.onerror = function (err) {
                console.error('socket error');
                console.error(err);
                if(ws['clearSocketEnd']){
                    return;
                }
                self._clearSocket();
                if(inStartConn){
                    reject();
                }
            };
            ws.onclose =  function () {
                console.log('socket close');
                if(ws['clearSocketEnd']){
                    return;
                }
                self._clearSocket();
                if(inStartConn){
                    reject();
                }
            };
            let saveSocketId = this._curSocketId;
            ws.onmessage = function (event:MessageEvent) {
                if(saveSocketId !== self._curSocketId || self.state !== SOCKET_STATE.CONN_RUNING){
                    console.log('收到了上一个 socket 的 消息 ws.maskId = '+saveSocketId);
                    return;
                }
                let netData = self.analysedNetData(event.data);
                if(netData){
                    if(netData.proto.id === 0x102){ //心跳包 不进入队列
                        self.broadcastData(netData);
                    }else{
                        self.arrNetData.push(netData);
                    }
                }
                if(self.arrNetData.length >= 300){
                    self.webSocket.close();
                }
            };
        });
    }
    _clearSocket() {
        if(this.webSocket['clearSocketEnd']){
            return;
        }
        this.webSocket['clearSocketEnd'] = true;
        this.state = SOCKET_STATE.CONN_CLOSE;
        for (let key in this._requsetMap) {
            let request = this._requsetMap[key];
            if (request) {
                cc.timerMgr.removeTimer(request.timerId);
            }
        }
        // @ts-ignore
        this._requsetMap = {};
    }
    closeSocket(){
        if(this.webSocket){
            this._clearSocket();
            this.webSocket.close();
        }
    }
    analysedNetData(data:any):DealEndSocketData{
        let buffer = new ByteBuffer();
        buffer.append(data);
        buffer.flip();
        let baseDataPb = protoBuilder.build('protocol.Data');
        let msg = baseDataPb.decode(buffer.toBuffer());
        let protoId = msg.protoId;
        let proto = this.protoAnalyzeMap[protoId];
        this.debug && console.log("接收、解析协议：协议 id = "+protoId.toString(16) +' name = '+proto.name+" time = "+new Date());
        if (!proto){
            console.log("客户端未实现，检查协议 id = " + protoId.toString(16) +' name = '+proto.name);
            return;
        }
        if(this._throwProtoIdMap[protoId]){
            this.debug && console.log("丢弃协议：协议 id = "+protoId.toString(16) +' name = '+proto.name +" time = "+new Date());
            return;
        }
        let requestId = msg.clientRequestId;
        let errorCode = msg.errorId;
        let resultData = null;
        if(errorCode === 0){
            if (proto.response === "int32"){
                resultData = buffer.readInt32();
            }else if(proto.response === "int64"){
                resultData = buffer.readInt64();
            }else{
                let resultBuffer = new ByteBuffer();
                resultBuffer.append(data);
                resultBuffer.flip();
                let resultPb = protoBuilder.build(proto.response);
                resultData = resultPb.decode(resultBuffer.toBuffer());
            }
        }
        if (proto.packetType === PACKET_TYPE.REQUEST){ //这里是服务端主动下发的
            let request = this._requsetMap[requestId];
            if (request){
                cc.timerMgr.removeTimer(request.timerId);
            }
        }
        return new DealEndSocketData(proto,resultData,errorCode,requestId);
    }
    broadcastData(dealEndNetData:DealEndSocketData){
        let proto = dealEndNetData.proto;
        let resultData = dealEndNetData.resultData;
        let requestId = dealEndNetData.requestId;
        let errorCode = dealEndNetData.errorCode;
        this.debug && console.log("执行协议回调：协议 id = "+proto.id.toString(16) +' name = '+proto.name+" time = "+new Date());
        delete this._sendingProtoMap[proto.id];
        if (proto.packetType === PACKET_TYPE.NOTICE){ //这里是服务端主动下发的
            let curEventMap = this._lisMapByProtoId[proto.id];
            if(curEventMap){
                for(let key in curEventMap){
                    curEventMap[key](resultData);
                }
            }
        }else{
            let request = this._requsetMap[requestId];
            delete this._requsetMap[requestId];
            if (request){
                request.callback(new BroadcastNetData(resultData,errorCode));
            }
        }
    }
    //  arrConditionObj:条件对象数组，或者只是一个对象
    //  arrConditionKey:条件对象键名数组，或者只是一个key
    addEventListener(proto:Proto, listener:any,arrConditionObj?:Array<object>|object,arrConditionKey?:Array<string>|string) {
        if (proto.packetType !== PACKET_TYPE.REQUEST){
            console.error("不是服务端主动下发协议 packetType = "+proto.packetType);
            return;
        }
        let curEventMap = this._lisMapByProtoId[proto.id];
        if(!curEventMap){
            // @ts-ignore
            curEventMap = {};
            this._lisMapByProtoId[proto.id] = curEventMap;
        }
        if(arrConditionObj && (arrConditionObj instanceof Array) && arrConditionObj.length){
            for(let i =0;i<arrConditionObj.length;i++){
                listener = this._buildConditionFun(listener,proto,arrConditionObj[i],arrConditionKey[i]);
            }
        }else if(arrConditionObj && arrConditionKey){ //只有一个值，不是数组
            listener = this._buildConditionFun(listener,proto,arrConditionObj,arrConditionKey);
        }
        this._curLisId++;
        curEventMap[this._curLisId] = listener;
        return this._curLisId;
    }
    _buildConditionFun(fun,proto:Proto,conditionObj,conditionKey):Function{
        let conditionFun = function() {
            if(conditionObj[conditionKey]){
                fun.apply(null,arguments);
            }else if(cc.socket.debug){
                console.log("不满足条件：协议 id = "+proto.id.toString(16) + " name = " + proto.name+' time = '+new Date()+' key = '+conditionKey +' 参数 = ');
                console.log(arguments);
            }
        };
        return conditionFun;
    }
    saveRequestInMap(proto:Proto, callback:Function, maxTime:number){
        let self = this;
        if (this._requestId >= 32767){
            this._requestId = 1;
        }else{
            this._requestId = this._requestId + 1;
        }
        if (!callback) {
            return;
        }
        let curRequestId = this._requestId;
        let timerId = cc.timerMgr.addTimer(maxTime,1,function () {
            let failResult = new BroadcastNetData(null,0x0003);
            console.log('超时maskId = '+self._curSocketId);
            console.log(self._requsetMap[curRequestId]);
            delete self._sendingProtoMap[proto.id];
            if(self._curSocketId === self._requsetMap[curRequestId].socketId){
                callback(failResult);
            }
            delete self._requsetMap[curRequestId];
        });
        this._requsetMap[curRequestId] = new SocketRequest(curRequestId,proto.id,this._curSocketId,timerId,callback);
    }
    //maxTime:超时时间
    request(proto:Proto, data:any, cb:Function,maxTime:number = 10000){
        if(this.debug && this.state !== SOCKET_STATE.CONN_RUNING) {
            console.log("socket 没有连接，跳过发送协议：协议 id = "+proto.id.toString(16) + " name = " + proto.name +' time = '+new Date());
            return;
        }
        if(this.debug){
            console.log("发送协议：协议 id = "+proto.id.toString(16) + " name = " + proto.name +' time = '+new Date());
        }

        if(!proto){
            console.error("协议错误 proto 为 空");
            return;
        }
        if(!proto.id){
            console.error("协议错误 proto.id 为空 id = "+proto.id  + " name = " + proto.name);
            return;
        }
        this.saveRequestInMap(proto,cb,maxTime);

        let ret = new ByteBuffer();
        ret.writeInt16( proto.id );
        ret.writeInt16( this._requestId );

        if (proto.request === 'int8'){
            ret.writeInt8(data)
        }else if (proto.request === 'int16'){
            ret.writeInt16(data)
        }else if (proto.request === 'int32'){
            ret.writeInt32(data)
        }else if(proto.request != null ){
            let PB = protoBuilder.build(proto.request);
            let msg = new PB();
            for(let key in data){
                msg[key] = data[key]
            }
            ret.append( msg.encode());
        }
        ret.flip();
        this.webSocket.send(ret.toBuffer());
    }
    requestAsync(proto:Proto, data:any,component:cc.Component = null,dealErrInFun:number = DEAL_ERR_IN_FUN.THROW_ERR,noSendBeforeEnd:boolean = false,maxTime:number = 10000):Promise<any> {  //此处可能有内存泄露。没有调用resolve和reject，时可能泄露
        let self = this;
        if(noSendBeforeEnd && this._sendingProtoMap[proto.id]){
            console.log("不发送协议,因为前面有同类协议没有收到回调：协议 id = "+proto.id.toString(16) + " name = " + proto.name+' time = '+new Date());
            return;
        }
        return new Promise((resolve,reject)=> {
            this._sendingProtoMap[proto.id] = true;
            this.request(proto, data,function (result:BroadcastNetData) {
                if(result.errorCode === 0){
                    self.debug && console.log(result);
                    if((component && component.isValid || !component)){
                        resolve(result.msg);
                    }
                }else{
                    console.error("协议异常：协议 id = "+proto.id.toString(16) + " name = " + proto.name+" 连接失败 错误码 0x"+result.errorCode.toString(16)+' time = '+new Date());
                    self.dealErrorByConfig(proto,result,dealErrInFun,reject);
                }
            },maxTime);
        });
    }
    dealErrorByConfig(proto:Proto,result:any,dealErrInFun:DEAL_ERR_IN_FUN,reject:Function){
        switch (dealErrInFun) {
            case DEAL_ERR_IN_FUN.NO_THROW_OPEN_ERR_TIP:
                break;
            case DEAL_ERR_IN_FUN.NO_THROW_NO_DEAL:
                break;
            case DEAL_ERR_IN_FUN.THROW_ERR:
                reject(result);
                break;
        }
    }
}
