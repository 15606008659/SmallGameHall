//import HotUpdate from "../../hotUpdate/HotUpdate";
class HotUpdate{
    clear(){

    }
    retry(){

    }
    loadScene(sceneName:string,progressCallvack){
        
    }
}

class LoadUtil {
    debug:boolean = false;
    // @ts-ignore
    _loadingMap:Array<string> = {};//正在加载中的资源名 是一个map,为了代码提示 类型设置为[string]
    _mapLoadSceneProgressObj:object = {};
    _loadEndScene:object = {};
    _publicSceneMap:object = {};
    constructor(){


    }
    loadSceneEnd(sceneName:string):boolean{
        if(this._loadEndScene[sceneName]){
            return true;
        }
        return false;
    }
    async loadPrefab(path:string,reConn:number = 0,checkComponent:cc.Component = null,canRepeatLoad:boolean = true,progressCallback:Function = undefined){
        return await this.loadRes(path,reConn,checkComponent,cc.Prefab,canRepeatLoad,progressCallback);
    }
    loadResDir(path:string,reConn:number,checkComponent:cc.Component = null,resType,canRepeatLoad:boolean = true,progressCallback:Function = undefined):Promise<Array<any>>{
        let self = this;
        if(!canRepeatLoad && self._loadingMap[path]){
            this.debug && console.log('资源已在加载中 path = '+path);
            return;
        }
        if(!path){
            console.log(path);
        }
        return new Promise((resolve,reject)=> {
            self.debug && console.log('load '+path+' start');
            self._loadingMap[path] = true;
            let lastInProgressTime = Date.now();
            let isEnd = false;
            let isValidProgress = null;
            if(progressCallback){
                isValidProgress = function(completedCount,totalCount){
                    if(isEnd){
                        return;
                    }
                    lastInProgressTime = Date.now();
                    if(checkComponent && checkComponent.isValid){
                        progressCallback(completedCount,totalCount);
                    }
                };
            }
            let timerId = cc.timerMgr.addTimer(1,-1,function (dt) {
                if(cc.game.isPaused()){ //为了处理进入后台的情况，进入后台不计算超时时间
                    lastInProgressTime += dt;
                }
                if(Date.now() - lastInProgressTime > 6000){
                    endCallback(new Error('资源加载已超时'),null);
                }
            });
            let endCallback = function (err,res) {
                if(isEnd){ //如果已经处理过了就不用再处理了
                    return;
                }
                isEnd = true;
                cc.timerMgr.removeTimer(timerId);
                delete self._loadingMap[path];
                if (err) {
                    if(reConn){
                        checkComponent && checkComponent.isValid && (self.loadResDir(path,--reConn,checkComponent,resType,canRepeatLoad,progressCallback)).then(resolve).catch(reject);
                    }else{
                        reject({errorCode:0x5001,message:'资源加载失败'});
                    }
                    console.error(err || err.message);
                    console.error('path = '+path);
                    return;
                }
                self.debug && console.log('load '+path+' end');
                checkComponent && checkComponent.isValid && resolve(res);
            };
            let args3 = isValidProgress || endCallback;
            let args4 = isValidProgress?endCallback:undefined;
            cc.loader.loadResDir(path,resType,args3,args4);
        });
    }
    /**
     * 預加载场景
     * @param sceneName 场景名 
     * @param reConn 重加载次数
     * @param checkComponent 组件是否有效
     * @param canRepeatLoad 是否重复加载
     * @param progressCallback 进度条回调函数
     */
    async loadScene(sceneName:string,reConn:number = 0,checkComponent:cc.Component = null,canRepeatLoad:boolean = true,progressCallback:Function = undefined){
        if(!CC_JSB || this._loadEndScene[sceneName] || this._publicSceneMap[sceneName]){
            await this._inResLoadScene(sceneName,reConn,checkComponent,canRepeatLoad,progressCallback);
        }else{
            await this.hotUpdateScene(sceneName,reConn,checkComponent,progressCallback);
        }
    }
    _inResLoadScene(sceneName:string,reConn:number = 0,checkComponent:cc.Component = null,canRepeatLoad:boolean = true,progressCallback:Function = undefined){
        let self = this;
        if(!canRepeatLoad && self._loadingMap[sceneName]){
            this.debug && console.log('场景已在加载中 sceneName = '+sceneName);
            return;
        }
        let isEnd = false;
        return new Promise((resolve,reject) => {
            self.debug && console.log('load '+sceneName+' start');
            self._loadingMap[sceneName] = true;
            let lastInProgressTime = Date.now();
            let timerId = cc.timerMgr.addTimer(1,-1,function (dt) {
                if(cc.game.isPaused()){ //为了处理进入后台的情况,进入后台不计算超时时间
                    lastInProgressTime += dt;
                }
                if(Date.now() - lastInProgressTime > 15000){
                    console.log('old lastInProgressTime = '+lastInProgressTime);
                    lastInProgressTime = Date.now();
                    console.log(new Date()+' now = '+Date.now()+' lastInProgressTime = '+lastInProgressTime);
                    endCallback(new Error('资源加载已超时'));
                }
            });
            let endCallback = function (err) {
                if(isEnd){
                    return;
                }
                if (err){
                    reConn--;
                    console.error("加载场景失败 sceneName = "+sceneName);
                    if(reConn && checkComponent.isValid){
                        console.log('开始重新加载 '+new Date());
                        lastInProgressTime = Date.now();
                        cc.director.preloadScene(sceneName);
                    }else{
                        delete self._loadingMap[sceneName];
                        cc.timerMgr.removeTimer(timerId);
                        checkComponent.isValid && reject({errorCode:0x5001,message:'资源加载失败'});
                        isEnd = true;
                    }
                    console.error(err.message);
                    console.error(err);
                    return;
                }
                delete self._loadingMap[sceneName];
                self.debug && console.log('load '+sceneName+' end');
                cc.timerMgr.removeTimer(timerId);
                self._loadEndScene[sceneName] = true;
                isEnd = true;
                checkComponent.isValid && resolve();
            };
            self._mapLoadSceneProgressObj[sceneName] = {
                progressCallback:progressCallback,
                checkComponent:checkComponent,
            };
            let args3 =  function(completedCount,totalCount){
                lastInProgressTime = Date.now();
                let curProgress:Function = self._mapLoadSceneProgressObj[sceneName].progressCallback;
                let checkComponent:cc.Component = self._mapLoadSceneProgressObj[sceneName].checkComponent;
                if(curProgress && checkComponent.isValid){
                    curProgress(completedCount,totalCount);
                }
            };

            cc.director.preloadScene(sceneName,args3,endCallback);
        });
    }
    async hotUpdateScene(sceneName:string,reConn:number,checkComponent:cc.Component = null,progressCallback:Function = undefined,hotUpdateObj:HotUpdate = null):Promise<boolean>{
        let self = this;
        if(self._loadingMap[sceneName]){
            this.debug && console.log('资源已在加载中 path = '+sceneName);
            return;
        }
        if(!hotUpdateObj){
            hotUpdateObj = new HotUpdate();
        }
        return new Promise(async (resolve,reject)=> {
            self.debug && console.log('load '+sceneName+' start');
            self._loadingMap[sceneName] = true;
            let lastInProgressTime = Date.now();
            let isEnd = false;
            let isValidProgress = null;
            if(progressCallback){
                isValidProgress = function(completedCount,totalCount){
                    if(isEnd){
                        return;
                    }
                    lastInProgressTime = Date.now();
                    if(checkComponent && checkComponent.isValid){
                        progressCallback(completedCount,totalCount);
                    }
                };
            }
            let timerId = cc.timerMgr.addTimer(1,-1,function (dt) {
                if(cc.game.isPaused()){ //为了处理进入后台的情况，进入后台不计算超时时间
                    lastInProgressTime += dt;
                }
                if(Date.now() - lastInProgressTime > 6000){
                    endCallback(new Error('资源加载已超时'),null);
                }
            });
            let endCallback = function (err,needReStart) {
                if(isEnd){ //如果已经处理过了就不用再处理了
                    return;
                }
                isEnd = true;
                cc.timerMgr.removeTimer(timerId);
                delete self._loadingMap[sceneName];
                if (err){
                    reConn--;
                    console.error("加载场景失败 sceneName = "+sceneName);
                    if(reConn && checkComponent.isValid){
                        console.log('加载开始重试 '+new Date());
                        if(err.message == 'need retry'){
                            hotUpdateObj.retry();
                        }else{
                            self.hotUpdateScene(sceneName,--reConn,checkComponent,progressCallback,hotUpdateObj).then(resolve).catch(reject);
                        }
                    }else{
                        hotUpdateObj.clear();
                        checkComponent.isValid && reject({errorCode:0x5001,message:'资源加载失败'});
                    }
                    console.error(err.message);
                    console.error(err);
                    return;
                }
                self._loadEndScene[sceneName] = true;
                self.debug && console.log('load '+sceneName+' end');
                hotUpdateObj.clear();
                checkComponent.isValid && resolve(needReStart);
            };
            let args2 = isValidProgress || function () {};
            try {
                let needReStart = await hotUpdateObj.loadScene(sceneName,args2);
                endCallback(null,needReStart);
            }catch (e) {
                endCallback(e,null);
            }
        });
    }
    /*
        加载单个资源
        path:路径
        reConn:失败重连的次数
        checkNode:该节点 有效时 才能触发 进度回调函数 和 完成时的resolve
        canRepeatLoad 是否能同时加载2个相同的资源
        progressCallback 进度回调
     */
    async loadRes(path:string,reConn:number,checkComponent:cc.Component = null,resType:any,canRepeatLoad:boolean = true,progressCallback:Function = undefined){
        let self = this;
        if(!canRepeatLoad && self._loadingMap[path]){
            this.debug && console.log('资源已在加载中 path = '+path);
            return;
        }
        if(!path){
            console.log(path);
        }

        return new Promise((resolve,reject)=> {
            self.debug && console.log('load '+path+' start');
            self._loadingMap[path] = true;
            let lastInProgressTime = Date.now();
            let isEnd = false;
            let isValidProgress = null;
            if(progressCallback){
                isValidProgress = function(completedCount,totalCount){
                    if(isEnd){
                        return;
                    }
                    lastInProgressTime = Date.now();
                    if(checkComponent && checkComponent.isValid){
                        progressCallback(completedCount,totalCount);
                    }
                };
            }
            let timerId = cc.timerMgr.addTimer(1,-1,function (dt) {
                if(cc.game.isPaused()){ //为了处理进入后台的情况，进入后台不计算超时时间
                    lastInProgressTime += dt;
                }
                if(Date.now() - lastInProgressTime > 6000){
                    endCallback(new Error('资源加载已超时'),null);
                }
            });
            let endCallback = function (err,res) {
                if(isEnd){ //如果已经处理过了就不用再处理了
                    return;
                }
                isEnd = true;
                cc.timerMgr.removeTimer(timerId);
                delete self._loadingMap[path];
                if (err) {
                    if(reConn){
                        checkComponent.isValid && (self.loadRes(path,--reConn,checkComponent,resType,canRepeatLoad,progressCallback)).then(resolve).catch(reject);
                    }else{
                        reject({errorCode:0x5001,message:'资源加载失败'});
                    }
                    console.error(err || err.message);
                    console.error('path = '+path);
                    return;
                }
                self.debug && console.log('load '+path+' end');
                checkComponent.isValid && resolve(res);
            };
            let args3 = isValidProgress || endCallback;
            let args4 = isValidProgress?endCallback:undefined;
            cc.loader.loadRes(path,resType,args3,args4);
        });
    }
    
    /*
        再节点上添加 用预制生成的节点
        parentNode:父亲节点
        path:路径
        reConn:加载失败重连的次数
        progressCallback:进度回调
     */
    async addChildByPrePath(parentNode:cc.Node|[cc.Node],path:string,reConn:number = 0,progressCallback:Function = undefined){
        let checkNode = null;
        if(parentNode instanceof cc.Node){
            checkNode = parentNode;
        }else{
            checkNode = parentNode[0];
        }
        let prefab = <cc.Prefab>await this.loadPrefab(path,reConn,checkNode,true,progressCallback);
        if(prefab){
            if(!(parentNode instanceof cc.Node)){
                for(let i =0;i<parentNode.length;i++){
                    if(parentNode[i].isValid){
                        let node:cc.Node = cc.instantiate(prefab);
                        node.parent = parentNode[i];
                    }
                }
                return null;
            }else if(parentNode.isValid){
                let node:cc.Node = cc.instantiate(prefab);
                node.parent = parentNode;
                return node;
            }
        }else{
            return null;
        }
    }
    async addAniHideNode(parentNode:cc.Node,needHideNode:cc.Node,path:string,reConn:number = 0,progressCallback:Function = undefined){
        let node:any = await this.addChildByPrePath(parentNode,path,reConn,progressCallback);
        if(node){
            let ani = node.getComponent(cc.Animation);
            ani.on('play',function () {
                needHideNode.removeFromParent();
            },needHideNode);
        }
    }
    async addAniRemoveSprite(parentNode:cc.Node,spriteNode:cc.Node,path:string,reConn:number = 0,progressCallback:Function = undefined){
        let node:any = await this.addChildByPrePath(parentNode,path,reConn,progressCallback);
        if(node){
            let ani = node.getComponent(cc.Animation);
            ani.on('play',function () {
                spriteNode.removeComponent(cc.Sprite);
            },spriteNode);
        }
    }
}
export default new LoadUtil();
