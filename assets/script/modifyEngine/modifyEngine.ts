

//修改引擎的代码

class ModifyEngine {
    modify(){
        this.aniAdapt();
        this.addCore();
    }
    addCore(){
        cc['RotateTo3D'] = cc.Class({
            name: 'cc.RotateTo3D',
            extends: cc.ActionInterval,
            ctor:function (duration, rotationX,rotationY) {
                this['_startRotationX'] = 0;
                this['_startRotationY'] = 0;
                this['_endRotationX'] = 0;
                this['_endRotationY'] = 0;
                rotationX !== undefined && rotationY !== undefined && this.initWithDuration(duration, rotationX,rotationY);
            },
            initWithDuration:function (duration, rotationX,rotationY) {
                if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
                    this['_endRotationX'] = rotationX;
                    this['_endRotationY'] = rotationY;
                    return true;
                }
                return false;
            },

            clone:function () {
                var action = new cc.RotateTo();
                this._cloneDecoration(action);
                action.initWithDuration(this._duration, this['_endRotationX'], this['_endRotationY']);
                return action;
            },

            startWithTarget:function (target) {
                cc.ActionInterval.prototype.startWithTarget.call(this, target);
                this['_startRotationX'] = target.eulerAngles.x;
                this['_startRotationY'] = target.eulerAngles.y;
            },
            reverse:function () {
                cc.logID(1016);
            },
            update:function (dt) {
                dt = this._computeEaseTime(dt);
                dt*=2;
                if(dt >1){
                    dt = 2 - dt;
                }
                if (this.target) {
                    this.target.eulerAngles = cc.v3(this['_startRotationX'] + this['_endRotationX'] * dt,this['_startRotationY'] + this['_endRotationY'] * dt,0)
                }
            }
        });
        cc.rotateTo3D = function (duration, rotationX,rotationY) {
            return new cc['RotateTo3D'](duration, rotationX,rotationY);
        };
    }
    /* 控制动画播放速率，以及进入后台时的动画控制
     */
    aniAdapt(){
        let oldRunAction = cc.Node.prototype.runAction;
        cc.Action.prototype.getRunSpeed = function(aniDurTime:number,startTime:number,endTime:number):number{
            return aniDurTime/(endTime - startTime);
        };
        cc.Node.prototype.runAction = function (action: cc.Action,aniDurTime:number,startTime:number,endTime:number,useOldRunInTimeEnough:boolean = true) :cc.Action{
            if(!aniDurTime || !startTime || !endTime){ //兼容老的代码
                return oldRunAction.call(this,action);
            }
            if(aniDurTime <0){
                console.error('aniDurTime < 0');
                console.error(action);
                aniDurTime = 0.000000001;
            }
            if(useOldRunInTimeEnough && endTime - startTime - aniDurTime > 0){
                return oldRunAction.call(this,action);
            }
            else if(endTime - startTime >0){
                if(action instanceof cc.ActionInterval){
                    return oldRunAction.call(this,cc.speed(action,aniDurTime/(endTime - startTime)));
                }else{
                    return oldRunAction.call(this,action);
                }
            }else{
                oldRunAction.call(this,action);
                action.step(1000000);
                cc.director.getActionManager().removeAction(action);
                return action;
            }
        };

        cc.ActionInterval.prototype.step = function (dt) {
            if (this._firstTick) {
                this._firstTick = false;
                this._elapsed = dt;
            } else{
                this._elapsed += dt;
            }
            let t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896);
            t = (1 > t ? t : 1);
            this.update(t > 0 ? t : 0);

            if(this._repeatMethod && this._timesForRepeat > 1 && this.isDone()){
                if(!this._repeatForever){
                    this._timesForRepeat--;
                }
                this.startWithTarget(this.target);
                this.step(this._elapsed - this._duration);
            }
        };

        cc.Director.prototype.calculateDeltaTime = function () {
            let now = performance.now();
            this._deltaTime = (now - this._lastUpdate) / 1000;
            this._lastUpdate = now;
        };

        cc.Animation.prototype.on = function (type, callback:Function, target, useCapture) {
            let newCallback = null;
            if(type === 'finished'){
                if(!this['fastRunFinished']){
                    this['fastRunFinished'] = [];
                }
                let runOneFunction = function () {
                    if(!runOneFunction.runFinish){
                        runOneFunction.runFinish = true;
                        if(target){
                            callback.call(target);
                        }else{
                            callback();
                        }
                    }
                };
                runOneFunction.callback = callback;
                this['fastRunFinished'].push(runOneFunction);
                newCallback = runOneFunction;
            }else{
                newCallback = callback;
            }
            this._init();
            let ret = this._EventTargetOn(type, newCallback, target, useCapture);
            if (type === 'lastframe') {
                let array = this._animator._anims.array;
                for (let i = 0; i < array.length; ++i) {
                    let state = array[i];
                    state._lastframeEventOn = true;
                }
            }
            return ret;
        };
        cc.Animation.prototype.off = function(type, callback, target, useCapture) {
            let curCallBack = null;
            if(type === 'finished'){
                let arrFinished:Array<Function> = this['fastRunFinished'];
                if(arrFinished){
                    for(let i =0;i<arrFinished.length;i++){
                        if(arrFinished[i].callback == callback){
                            curCallBack = arrFinished[i];
                            delete arrFinished.splice(i,1);
                            break;
                        }
                    }
                }
            }else{
                curCallBack = callback;
            }
            this._init();

            if (type === 'lastframe') {
                let nameToState = this._nameToState;
                for (let name in nameToState) {
                    let state = nameToState[name];
                    state._lastframeEventOn = false;
                }
            }

            this._EventTargetOff(type, curCallBack, target, useCapture);
        };
        let oldPlay = cc.Animation.prototype.play;
        cc.Animation.prototype.play = function (name?: string, startFrameTime?: number,startTime?:number,endTime?:number,useOldRunInTimeEnough:boolean = true) :cc.AnimationState{
            let aniDurTime = 0;
            let clip:cc.AnimationClip = null;
            if(name){
                let arrClip = this.getClips();
                for(let i =0;i<arrClip.length;i++){
                    if(arrClip[i].name === name){
                        aniDurTime = arrClip[i].duration;
                        clip = arrClip[i];
                        break;
                    }
                }
            }else if(this.defaultClip){
                aniDurTime = this.defaultClip.duration;
                clip = this.defaultClip;
            }else{
                console.log('Animation defaultClip is null ,can not play');
                return;
            }
            let arrFinished:Array<Function> = this['fastRunFinished'];
            if(arrFinished){
                for(let i =0;i<arrFinished.length;i++){
                    arrFinished[i].runFinish = false;
                }
            }
            if(!aniDurTime || !startTime || !endTime){ //兼容老的代码
                let aniState:cc.AnimationState = oldPlay.call(this,name,startFrameTime);
                aniState.speed = clip.speed;
                return aniState;
            }
            if(useOldRunInTimeEnough && endTime - startTime - aniDurTime > 0){
                let aniState:cc.AnimationState = oldPlay.call(this,name,startFrameTime);
                aniState.speed = clip.speed;
                return aniState;
            }
            else if(endTime - startTime >0){
                let aniState:cc.AnimationState = oldPlay.call(this,name,startFrameTime);
                aniState.speed = aniDurTime/ (endTime - startTime);
                return aniState;
            }else{
                let aniState:cc.AnimationState = oldPlay.call(this,name,startFrameTime);
                aniState._currentFramePlayed = true;
                aniState.update(10000);
                if(arrFinished){
                    for(let i =0;i<arrFinished.length;i++){
                        arrFinished[i]();
                    }
                }
                return aniState;
            }
        };
        cc.Animation.prototype.setSpeedByTime = function (name:string,startTime:number,endTime:number,useOldRunInTimeEnough:boolean = true) {
            if(!name && this.defaultClip){
                name = this.defaultClip.name;
            }
            if(!this['_mapSpeedCtrlObj']){
                this['_mapSpeedCtrlObj'] = {};
            }
            this['_mapSpeedCtrlObj'][name] = {
                name:name,
                startTime:startTime,
                endTime:endTime,
                useOldRunInTimeEnough:useOldRunInTimeEnough,
            }
        };
        cc.Animation.prototype.start = function ():void {
            if (!CC_EDITOR && this.playOnLoad && this._defaultClip) {
                let isPlaying = this._animator && this._animator.isPlaying;
                if (!isPlaying) {

                    let state = this.getAnimationState(this._defaultClip.name);

                    this['_oldSpeed'] = state.speed;
                    if(this['_mapSpeedCtrlObj'] && this['_mapSpeedCtrlObj'][this._defaultClip.name]){
                        let aniDurTime = this.defaultClip.duration;
                        let speedCtrlObj = this['_mapSpeedCtrlObj'][this._defaultClip.name];
                        let startTime = speedCtrlObj.startTime;
                        let endTime = speedCtrlObj.endTime;
                        let useOldRunInTimeEnough = speedCtrlObj.useOldRunInTimeEnough;
                        if(!aniDurTime || !startTime || !endTime){ //兼容老的代码
                            this._animator.playState(state);
                        }
                        if(useOldRunInTimeEnough && endTime - startTime - aniDurTime > 0){
                            this._animator.playState(state);
                        }
                        else if(endTime - startTime >0){
                            state.speed = aniDurTime/(endTime - startTime);
                            this._animator.playState(state);
                        }else{
                            this._animator.playState(state);
                            state._currentFramePlayed = true;
                            state.update(1000000);
                            let arrFinished:Array<Function> = this['fastRunFinished'];
                            if(arrFinished){
                                for(let i =0;i<arrFinished.length;i++){
                                    arrFinished[i]();
                                }
                            }
                        }
                    }else{
                        this._animator.playState(state);
                    }
                }
            }
        };
    }
}

export default new ModifyEngine();