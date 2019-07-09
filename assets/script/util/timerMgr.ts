/**
 * 定时器
 */
export default class TimerMgr {
    _bindMap:object = {};
    _id:number = 1;
    _lastGetTime:number = 0;
    _interval:number = 0;
    _intervalId:number = -1;
    constructor(interval?:number){
        this._interval = interval;
        if(interval > 0){
            this._intervalId = setInterval(this.update.bind(this),interval);
        }else{
            console.log('timerMgr interval = '+ interval+' 所以没有开启原生 定时器');
        }
    }
    /*
        time:单位秒
     */
    addOnceTimer(time:number,callback:Function):number{
        return this.addTimer(time,1,callback);
    }

    /**
     *
     * @param component
     * @param startTime 单位秒
     * @param endTime 单位秒
     */
    delayTime(component:cc.Component,startTime:number,endTime:number){
        return new Promise(resolve => {
            this.addOnceTimer(endTime - startTime,function () {
                if(component.isValid){
                    resolve();
                }
            })
        });

    }
    /*
        interval:调用间隔(秒）
        runCount:运行回调函数的次数 -1表示 不限次数
        callback;回调函数
     */
    addTimer(interval:number,runCount:number,callback:Function):number{
        if(interval <= 0 && runCount === 1){
            callback();
            return 0;
        }
        while(this._bindMap[this._id]){
            this._id++;
            if(this._id > 100000000){
                this._id = 1;
            }
        }
        this._bindMap[this._id] = {
            interval:interval,
            runCount:runCount,
            callback:callback,
            saveTime:0,
        };
        return this._id;
    }
    removeTimer(id:number){
        delete this._bindMap[id];
    }
    removeAll(){
        this._bindMap = {};
    }
    clear(){
        if(this._intervalId !== -1){
            clearInterval(this._intervalId);
        }
        this.removeAll();
    }
    /*
        在其他节点脚本的开启一个setInterval调用 timer的update
     */
    update(dt){
        if(typeof dt === 'undefined'){
            let nowTime = Date.now();
            dt = (nowTime - this._lastGetTime)/1000;
            this._lastGetTime = nowTime;
        }

        for(let key in this._bindMap){
            try{
                let timer = this._bindMap[key];
                if(timer.runCount === 0 ){
                    delete this._bindMap[key];
                    continue;
                }
                timer.saveTime += dt;
                if(timer.saveTime > timer.interval){
                    timer.saveTime = 0;
                    timer.callback(dt);
                    timer.runCount--;
                }
            }catch (e) {
                console.error(e);
                delete this._bindMap[key];
            }
        }

    }
}