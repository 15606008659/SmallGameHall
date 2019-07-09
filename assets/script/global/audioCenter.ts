/*
 音乐管理
 */


export default class AudioCenter{
    bgmValue:number = 1;        //总背景音量.   实际的背景音量 = bgmValue * bgmValueInOne
    bgmValueInOne:number = 1;    //单个背景音乐的音量
    effectValue:number = 1;     //音效音量
    effectCache:object = {};     //正在播放的音效
    bgmPath:string = '';          //背景音乐路径
    bgmId:number = null;    //当前背景音乐id       初始不能设置为0
    bgmLoop:boolean = true; //背景音乐是否循环
    pauseBgmPath:string = '';
    isPause:boolean = false;
    lastBgmPath:string = '';
    set effectShow(effectShow:boolean){  //音效是否开启
        cc.sys.localStorage.setItem("effectShow",effectShow+'');
        this['_effectShow'] = effectShow;
    };
    get effectShow():boolean{
        if(typeof(this['_effectShow']) === "undefined"){
            if(cc.sys.localStorage.getItem("effectShow")){
                this['_effectShow'] = (cc.sys.localStorage.getItem("effectShow")==="true");
            }else{
                cc.sys.localStorage.setItem("effectShow",'true');
                this['_effectShow'] = true;
            }
        }
        return this['_effectShow'];
    }
    set bgmShow(bgmShow:boolean){      //bgm是否开启
        cc.sys.localStorage.setItem("bgmShow",bgmShow+'');
        this['_bgmShow'] = bgmShow;
        if(bgmShow){
            this.startBgm();
        }else{
            if(this.bgmId || this.bgmId === 0){
                this.pauseBgm();
            }else{
                this.stopBgm(true);
            }
        }
    };
    get bgmShow():boolean{
        if(typeof(this['_bgmShow']) === "undefined"){
            if(cc.sys.localStorage.getItem("bgmShow")){
                this['_bgmShow'] = (cc.sys.localStorage.getItem("bgmShow")==="true");
            }else{
                cc.sys.localStorage.setItem("bgmShow",'true');
                this['_bgmShow'] = true;
            }
        }
        return this['_bgmShow'];
    }
    constructor(){
        let self = this;
        cc.audioManager = this;
        let strBgmValue = cc.sys.localStorage.getItem("bgmValue");
        let strEffectValue = cc.sys.localStorage.getItem("effectValue");

        this.setBgmValue(strBgmValue?parseFloat(strBgmValue):1);
        this.setEffectValue(strEffectValue?parseFloat(strEffectValue):1);
        cc.game.on(cc.game.EVENT_SHOW,function () {
            if(self.bgmId || self.bgmId === 0){
                cc.audioEngine.setVolume(self.bgmId, self.bgmValueInOne * self.bgmValue);
            }
        });
    }
    //设置bgm 音量
    setBgmValue(bgmValue:number,bgmValueInOne:number = this.bgmValueInOne){
        let value = Math.floor(bgmValue * 100) / 100;
        cc.sys.localStorage.setItem("bgmValue", value+'');
        this.bgmValue = value;
        this.bgmValueInOne = bgmValueInOne;
        cc.audioEngine.setVolume(this.bgmId, this.bgmValue * this.bgmValueInOne);
    }
    //设置音效音量
    setEffectValue(effectValue:number){
        let value = Math.floor(effectValue * 100) / 100;
        cc.sys.localStorage.setItem("effectValue",value+'');
        this.effectValue = value;
    }
    //开启音效
    openEffect(){
        this.effectShow = true;
    }
    //关闭音效
    closeEffect(){
        this.effectShow = false;
        for(let key in this.effectCache){
            cc.audioEngine.stop(this.effectCache[key]);
        }
        this.effectCache = {};
    }
    //暂停bgm
    pauseBgm(){
        this.isPause = true;
        this.pauseBgmPath = this.bgmPath;
        if(this.bgmId || this.bgmId === 0){
            cc.audioEngine.pause(this.bgmId);
        }
    }
    //恢复bgm
    resumeBgm(){
        this.isPause = false;
        if(this.bgmPath !== this.pauseBgmPath){
            return;
        }
        if(this.bgmId || this.bgmId === 0){
            cc.audioEngine.resume(this.bgmId);
        }
    }
    startBgm(){
        if(this.isPause){
            this.resumeBgm();
        }
        else if(this.bgmPath){
            this.playBgmAudioByPath(this.bgmPath,this.bgmLoop,this.bgmValue);
        }else{
            console.log('btmPath is null string');
        }
    }
    //停止bgm
    stopBgm(savePath:boolean = false){
        if(this.bgmId || this.bgmId === 0){
            cc.audioEngine.stop(this.bgmId);
            this.bgmId = null;
            !savePath && (this.bgmPath = '');
            this.isPause = false;
        }
    }
    stopAll(){
        this.stopBgm();
        this.effectCache = {};
        cc.audioEngine.stopAll();
    }
    /*
        功能：播放音效
        参数:
            resourcePath 资源路径  试例 Audio/Hall/bg.mp3
            loop 是否循环播放，布尔值
            volumeInOne 音量 0 - 1 之间
        */
    playEffectAudioByPath(resourcePath:string,loop = false,valueInOne = 1,callback:Function = null):Promise<number>{
        let self = this;
        return new Promise((resolve,reject) => {
            if(cc.socket.inBackNet){
                console.log('暂停状态不播放音效 resourcePath = '+resourcePath);
                callback && callback();
                return resolve(0);
            }
            if(this.effectShow){
                cc.loader.loadRes(resourcePath,cc.AudioClip, function (err, audioClip) {
                    if (err) {
                        console.error(err || err.message);
                        callback && callback();
                        reject(err);
                        return;
                    }
                    if(!self.effectShow) {
                        callback && callback();
                        resolve(0);
                        return;
                    }
                    if(valueInOne === 0){
                        valueInOne = 0.00001;
                    }
                    let effectId = cc.audioEngine.play(audioClip, loop, valueInOne * self.effectValue);
                    self.effectCache[effectId] = effectId;
                    if(callback){
                        cc.audioEngine.setFinishCallback(effectId,function () {
                            self._removeInEffectCache(effectId);
                            callback();
                        });
                    }else{
                        cc.audioEngine.setFinishCallback(effectId, self._removeInEffectCache.bind(self, effectId));
                    }
                    return resolve(effectId);
                });
            }else{
                callback && callback();
                resolve(0);
            }
        });
    }
    stopEffect(effectId:number){
        cc.audioEngine.stopEffect(effectId);
        this._removeInEffectCache(effectId);
    }
    /*
        功能：播放音效，并暂停背景音乐一段时间
        参数:
            resourcePath 资源路径  试例 Audio/Hall/bg.mp3
            rePlayBgmTime 暂停背景音乐的 毫秒数
            loop 是否循环播放，布尔值
            volumeInOne 音量 0 - 1 之间
        */
    playEffectPauseBgm(resourcePath:string,rePlayBgmTime:number,loop = false,valueInOne = 1){
        if(cc.socket.inBackNet){
            console.log('暂停状态不播放音效 resourcePath = '+resourcePath);
            return;
        }
        let self = this;
        if(this.effectShow){
            let bgmPath = self.bgmPath;
            cc.loader.loadRes(resourcePath,cc.AudioClip, function (err, audioClip) {
                if (err) {
                    console.error(err || err.message);
                    return;
                }
                if(!self.effectShow){
                    return;
                }
                if(self.bgmPath === bgmPath && self.bgmShow && (self.bgmId || self.bgmId === 0)){
                    self.pauseBgm();
                    //保证背景音乐是暂停前的那个时 才会恢复
                    setTimeout(self.resumeBgm.bind(self),rePlayBgmTime);
                }
                let effectId = cc.audioEngine.play(audioClip, loop, valueInOne * self.effectValue);
                self.effectCache[effectId] = effectId;
                cc.audioEngine.setFinishCallback(effectId,self._removeInEffectCache.bind(self,effectId));
            });
        }
    }
    /*
        功能：播放背景音乐
        参数:
            resourcePath 资源路径  试例 Audio/Hall/bg.mp3
            loop 是否循环播放，布尔值
            volumeInOne 音量 0 - 1 之间
        */
    playBgmAudioByPath(resourcePath:string,loop = true,valueInOne = 1){
        let self = this;
        this.lastBgmPath = resourcePath;
        if(!this.bgmShow){
            self.stopBgm();
            self.bgmPath = resourcePath;
            self.bgmValueInOne = valueInOne;
            self.bgmLoop = loop;
            return;
        }
        this.stopAll();
        cc.loader.loadRes(resourcePath,cc.AudioClip,function (err, audioClip) {
            if (err) {
                console.error(err || err.message);
                return;
            }
            if(self.lastBgmPath !== resourcePath){
                return;
            }
            self.stopBgm();
            self.bgmPath = resourcePath;
            self.bgmValueInOne = valueInOne;
            self.bgmLoop = loop;
            if(self.bgmId && self.bgmId !==0){
                console.error('play new bgm,but cur bgmId !== 0.please check.resourcePath = '+resourcePath);
            }
            self.bgmId = cc.audioEngine.play(audioClip, loop, valueInOne * self.bgmValue);
            if(cc.game.isPaused()){
                cc.audioEngine.setVolume(self.bgmId, 0);
                console.log('因为游戏处于暂停状态，所以背景音乐的音量设置为0');
            }
            console.log('开始播放背景音乐 path = '+resourcePath);
        });
    }
    //从真在播放的音效set中移除
    _removeInEffectCache(effectId){
        delete this.effectCache[effectId];
    }
}
