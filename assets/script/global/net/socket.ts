import {ByteBuffer, protobuf} from "../lib/libToTs";
import protoMap, {PACKET_TYPE, Proto} from "./protoMap";
import loadUtil from "../../util/loadUtil";
import {BroadcastNetData, DealEndSocketData, SocketRequest} from "./socketDealObj";
import {INSIDE_EVENT} from "../../data/commonEnum";

const protoBuilder = protobuf.newBuilder();

export enum SOCKET_STATE{
    NONE,
    BUILD_CONN,
    CONN_RUNNING,
    CONN_CLOSE,
}
export enum DEAL_ERR_IN_FUN{
    NONE,
    THROW_ERR,
    NO_THROW_OPEN_ERR_TIP,
    NO_THROW_NO_DEAL,
}

export default class Socket{
    webSocket:WebSocket = null;
    debug:boolean = false;
    inBackNet:boolean = false;
    isHttps:boolean = false;
    state:SOCKET_STATE = SOCKET_STATE.NONE;
    arrNetData:Array<any> = [];
    protoAnalyzeMap:Array<Proto> = {};
    _sendingProtoMap:Array<boolean> = {};
    _requestMap:Array<SocketRequest> = {};
    _lisMapByProtoId:Array<Array<Function>> = {};
    _throwProtoIdMap:Array<boolean> = {};
    _curSocketId:number = 0;
    _requestId:number = 0;
    _curLisId:number = 0;
    _dealInCurFrame:boolean = false;
    _commonPbMap:object = {};
    _version:string = '';
    _noHeartTime:number = 0;
    _heartbeatTimerId:number = 0;
    constructor() {
    }
    async init(){
        await this.loadProto();
        this.buildCommonPb();
        this._heartbeatTimerId = cc.updateMgr.addTimer(10,-1,this.heartbeat.bind(this));
        cc.insideEmitter.on(INSIDE_EVENT.GAME_HIDE,function () {
            cc.socket._dealInCurFrame = false;
        })
    }
    async loadProto() {
        let arrProtoFile = await loadUtil.loadResDir('./proto',3,cc.dataCenter,cc.Asset,false);
        for (let i = 0; i < arrProtoFile.length; i++) {
            protobuf.protoFromString(arrProtoFile[i].text, protoBuilder);
        }
        for (let protoModelKey in protoMap) {
            let protoModel = protoMap[protoModelKey];
            for (let protoName in protoModel) {
                let item = protoModel[protoName];
                if (typeof item !== "string") {
                    if(!item.name){
                        item.name = protoName;
                        item.module = protoModel.module;
                    }
                    this.protoAnalyzeMap[item.id] = item;
                }
            }
        }
        console.log('协议加载完成');
    }
    buildCommonPb(){
        this._commonPbMap['head'] = protoBuilder.build('protocol.Msg');
        this._commonPbMap['int32'] = protoBuilder.build('protocol.Int32');
        this._commonPbMap['int64'] = protoBuilder.build('protocol.Int64');
        this._commonPbMap['string'] = protoBuilder.build('protocol.String');
    }
    async heartbeat(){
        if(this.state === SOCKET_STATE.CONN_RUNNING) {
            try {
                await this.requestAsync(cc.protoMap.system.heartbeat, null, cc.gameCenter, false,DEAL_ERR_IN_FUN.THROW_ERR,6);
                this._noHeartTime = 0;
            } catch (e) {
                this._noHeartTime++;
                if(this._noHeartTime > 3){
                    this.closeSocket();
                }
            }
        }
    }
    connectionAsync(host:string,port:string){
        let self = this;
        let inStartConn = true;
        return new Promise((resolve, reject) => {
            this._curSocketId++;
            let ws = null;
            if(this.isHttps){
                ws = new WebSocket("wss://"+host+':'+port+"/sws");
            }else{
                ws = new WebSocket("ws://"+host+':'+port+"/ws");
            }
            console.log('socket 正在建立连接 url = '+host+':'+port);
            this.webSocket = ws;
            ws.clearSocketEnd = false;
            this.state = SOCKET_STATE.BUILD_CONN;
            ws.onopen = function () {
                console.log('socket 连接成功');
                inStartConn = false;
                self.state = SOCKET_STATE.CONN_RUNNING;
                self._noHeartTime = 0;
                ws.binaryType = 'arraybuffer';
                resolve();
            };
            ws.onerror = function (err) {
                console.error('socket 错误');
                console.error(err);
                if(ws.clearSocketEnd){
                    return;
                }
                self._clearSocket();
                if(inStartConn){
                    reject();
                }
            };
            ws.onclose =  function () {
                console.log('socket 关闭');
                if(ws.clearSocketEnd){
                    return;
                }
                self._clearSocket();
                if(inStartConn){
                    reject();
                }
            };
            let saveSocketId = this._curSocketId;
            ws.onmessage = function (event:MessageEvent) {
                if(saveSocketId !== self._curSocketId || self.state !== SOCKET_STATE.CONN_RUNNING){
                    console.log('收到了上一个 socket 的 消息 ws.maskId = '+saveSocketId);
                    return;
                }
                let netData = self.analysedNetData(event.data);
                if(netData){
                    self.arrNetData.push(netData);
                    if(self.arrNetData.length >= 300){
                        self.webSocket.close();
                    }
                }
            };
        });
    }
    _clearSocket() {
        if(this.webSocket.clearSocketEnd){
            return;
        }
        this.webSocket.clearSocketEnd = true;
        this.state = SOCKET_STATE.CONN_CLOSE;
        for (let key in this._requestMap) {
            let request = this._requestMap[key];
            if (request) {
                cc.timerMgr.removeTimer(request.timerId);
            }
        }
        this._requestMap = {};
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
        let msg = this._commonPbMap['head'].decode(buffer.toBuffer());
        let protoId = msg.protoId;
        let proto = this.protoAnalyzeMap[protoId];
        if (!proto){
            console.log("接收到未实现协议，协议 id = " + protoId.toString(16)+" time = "+new Date());
            return;
        }
        this.debug && console.log("接收、解析协议：协议 id = "+protoId.toString(16) +' name = '+proto.name+" time = "+new Date());
        if(this._throwProtoIdMap[protoId]){
            this.debug && console.log("丢弃协议：协议 id = "+protoId.toString(16) +' name = '+proto.name +" time = "+new Date());
            return;
        }
        let requestId = msg.clientRequestId;
        let errorCode = msg.errorId;
        let resultData = null;
        if(!errorCode && proto.response){
            let resultBuffer = new ByteBuffer();
            resultBuffer.append(msg.protoMsg);
            resultBuffer.flip();
            switch (proto.response) {
                case 'int32':
                    resultData = this._commonPbMap['int32'].decode(resultBuffer.toBuffer()).value;
                    break;
                case 'int64':
                    resultData = this._commonPbMap['int64'].decode(resultBuffer.toBuffer()).value;
                    break;
                case 'string':
                    resultData = this._commonPbMap['string'].decode(resultBuffer.toBuffer()).value;
                    break;
                default:
                    resultData = protoBuilder.build(proto.response).decode(resultBuffer.toBuffer());
                    break;
            }
        }
        if (proto.protoType === PACKET_TYPE.REQUEST){
            let request = this._requestMap[requestId];
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
        if (proto.protoType === PACKET_TYPE.NOTICE){ //这里是服务端主动下发的
            let curEventMap = this._lisMapByProtoId[proto.id];
            if(curEventMap){
                for(let key in curEventMap){
                    curEventMap[key](resultData);
                }
            }
        }else{
            let request = this._requestMap[requestId];
            delete this._requestMap[requestId];
            if (request){
                request.callback(new BroadcastNetData(resultData,errorCode));
            }
        }
    }

    /**
     *
     * @param proto
     * @param listener
     * @param arrConditionObj 条件对象数组，或者只是一个对象
     * @param arrConditionKey 条件对象键名数组，或者只是一个key
     */
    addEventListener(proto:Proto, listener:any,arrConditionObj?:Array<object>|object,arrConditionKey?:Array<string>|string) {
        if (proto.protoType !== PACKET_TYPE.REQUEST){
            console.error("不是服务端主动下发协议 protoType = "+proto.protoType);
            return;
        }
        let curEventMap = this._lisMapByProtoId[proto.id];
        if(!curEventMap){
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
    saveRequestInMap(proto:Proto, callback:Function, maxTime:number):number{
        let self = this;
        if (this._requestId >= 10000000){
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
            console.log('超时 socketId = '+self._curSocketId);
            console.log(self._requestMap[curRequestId]);
            delete self._sendingProtoMap[proto.id];
            if(self._curSocketId === self._requestMap[curRequestId].socketId){
                callback(failResult);
            }
            delete self._requestMap[curRequestId];
        });
        this._requestMap[curRequestId] = new SocketRequest(curRequestId,proto.id,this._curSocketId,timerId,callback);
        return curRequestId;
    }
    //maxTime:超时时间
    request(proto:Proto, data:any, cb:Function,maxTime:number = 10){
        if(this.debug && this.state !== SOCKET_STATE.CONN_RUNNING) {
            console.log("socket 没有连接，跳过发送协议：协议 id = "+proto.id.toString(16) + " name = " + proto.name +' time = '+new Date());
            return;
        }
        if(this.debug){
            console.log("发送协议：协议 id = "+proto.id.toString(16) + " name = " + proto.name +' time = '+new Date());
        }

        if(!proto){
            console.error("协议错误 proto 为空");
            return;
        }
        if(!proto.id){
            console.error("协议错误 proto.id 为空 id = "+proto.id  + " name = " + proto.name);
            return;
        }
        let requestId = this.saveRequestInMap(proto,cb,maxTime);

        let dataPbObj = null;
        switch (proto.request) {
            case null:
                break;
            case 'int32':
                dataPbObj = new (this._commonPbMap['int32'])();
                dataPbObj.value = data;
                break;
            case 'int64':
                dataPbObj = new (this._commonPbMap['int64'])();
                dataPbObj.value = data;
                break;
            case 'string':
                dataPbObj = new (this._commonPbMap['string'])();
                dataPbObj.value = data;
                break;
            default:
                dataPbObj = new (protoBuilder.build(proto.request))();
                for(let key in data){
                    dataPbObj[key] = data[key]
                }
                break;
        }

        let msgPbObj = new this._commonPbMap['head']();
        msgPbObj.version = this._version;
        msgPbObj.clientRequestId = requestId;
        msgPbObj.moduleName = proto.module;
        msgPbObj.protoId = proto.id;
        if(dataPbObj){
            let dataBuffer = new ByteBuffer();
            dataBuffer.append(dataPbObj.encode());
            dataBuffer.flip();
            msgPbObj.protoMsg = dataBuffer.toBuffer();
        }else{
            msgPbObj.protoMsg = null;
        }

        let requestBuffer = new ByteBuffer();
        requestBuffer.append( msgPbObj.encode());
        requestBuffer.flip();
        this.webSocket.send(requestBuffer.toBuffer());
    }
    requestAsync(proto, data:any,component:cc.Component,noSendBeforeEnd:boolean,dealErrInFun:number = DEAL_ERR_IN_FUN.THROW_ERR,maxTime:number = 10):Promise<any> {  //此处可能有内存泄露。没有调用resolve和reject，时可能泄露
        let self = this;
        return new Promise((resolve,reject)=> {
            if(noSendBeforeEnd && this._sendingProtoMap[proto.id]){
                console.log("不发送协议,因为前面有同类协议没有收到回调：协议 id = "+proto.id.toString(16) + " name = " + proto.name+' time = '+new Date());
                self.dealErrorByConfig(proto,new BroadcastNetData(null,1),dealErrInFun,reject);
                return;
            }
            this._sendingProtoMap[proto.id] = true;
            this.request(proto, data,function (result:BroadcastNetData) {
                if(!result.errorCode){
                    self.debug && console.log(result);
                    if((!component || component.isValid)){
                        resolve(result.msg);
                    }
                }else{
                    console.error("协议异常：协议 id = "+proto.id.toString(16) + " name = " + proto.name+" 连接失败 errorCode = "+result.errorCode.toString(16)+' time = '+new Date());
                    self.dealErrorByConfig(proto,result,dealErrInFun,reject);
                }
            },maxTime);
        });
    }
    dealErrorByConfig(proto:Proto,result:BroadcastNetData,dealErrInFun:DEAL_ERR_IN_FUN,reject:Function){
        switch (dealErrInFun) {
            case DEAL_ERR_IN_FUN.NO_THROW_OPEN_ERR_TIP:
                break;
            case DEAL_ERR_IN_FUN.NO_THROW_NO_DEAL:
                break;
            case DEAL_ERR_IN_FUN.THROW_ERR:
                reject(result.errorCode);
                break;
        }
    }
    update(){
        if(this.arrNetData.length){
            if(this._dealInCurFrame){
                this._dealInCurFrame = false;
                this.broadcastData(this.arrNetData.shift());
            }else{
                this._dealInCurFrame = true;
            }
        }else {
            if(this.inBackNet){
                this.inBackNet = false;
                cc.insideEmitter.emit(INSIDE_EVENT.DEAL_BACK_NET_DATA_FINISH);
            }
        }
    }
}
