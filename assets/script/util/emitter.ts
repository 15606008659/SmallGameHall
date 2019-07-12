import isNumber = cc.js.isNumber;

export default class Emitter {
    _mapCallback:any = {};
    debug:boolean = false;  //开启日志
    _curRegisterId:number = 1;
    constructor(debug:boolean = false){
        this.debug = debug;
    }
    /*
        监听事件
     */
    on(event:string | number,callback:Function):number{
        if(this.debug){
            console.log('[emitter] on '+ event);
        }
        this._mapCallback[event] = this._mapCallback[event] || {};
        do{
            this._curRegisterId++;
            if(this._curRegisterId >1000000000){
                this._curRegisterId = 1;
            }
        }while(this._mapCallback[event][this._curRegisterId]);
        this._mapCallback[event][this._curRegisterId] = callback;
        return this._curRegisterId;
    }
    /*
        取消监听事件
     */
    off(event:string  | number,callbackOrId:Function | number){
        if(this.debug){
            console.log('[emitter] off '+ event);
        }
        let mapCallBackInEvent = this._mapCallback[event] || (this._mapCallback[event] = {});
        if(isNumber(callbackOrId)){
            // @ts-ignore
            delete mapCallBackInEvent[callbackOrId];
        }else{
            for(let key in mapCallBackInEvent){
                if(mapCallBackInEvent[key] === callbackOrId){
                    delete mapCallBackInEvent[key];
                    return;
                }
            }
        }
    }
    /*
        发送事件
     */
    emit(event:string  | number,...data){
        if(this.debug){
            console.log('[emitter] emit '+ event,'data = ');
            console.log(data)
        }
        let mapCallBackInEvent = this._mapCallback[event] || (this._mapCallback[event] = {});
        for(let key in mapCallBackInEvent){
            mapCallBackInEvent[key].apply(this,data);
        }
    }
    /*
        移除所有事件
     */
    removeAll(){
        if(this.debug){
            console.log('[emitter] removeAll event');
        }
        this._mapCallback = {};
    }
}