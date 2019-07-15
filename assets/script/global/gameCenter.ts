import DataCenter from "../data/dataCenter";
import UiCenter from "./uiCenter";
import AudioCenter from "./audioCenter";
import Emitter from "../util/emitter";
import TimerMgr from "../util/timerMgr";
import protoMap from "./net/protoMap";
import Socket from "./net/socket";
import {INSIDE_EVENT} from "../data/commonEnum";
import gameConfig from "../data/gameConfig";
import loadUtil from "../util/loadUtil";
import http from "./net/http";
import propertyCenter from "./propertyCenter";
import modifyEngine from "../modifyEngine/modifyEngine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameCenter extends cc.Component {

    @property(DataCenter)
    dataCenter:DataCenter = null;

    @property(UiCenter)
    uiCenter:UiCenter = null;

    onLoad () {
        modifyEngine.modify();
        cc.game.addPersistRootNode(this.node);
        cc.gameCenter = this;
        cc.dataCenter = this.dataCenter;
        cc.uiCenter = this.uiCenter;
        cc.audioCenter = new AudioCenter();
        cc.propertyCenter = propertyCenter;
        cc.socket = new Socket();
        cc.insideEmitter = new Emitter();
        cc.timerMgr = new TimerMgr(1/60);
        cc.updateMgr = new TimerMgr(); //在gameCenter的update中调用
        cc.protoMap = protoMap;
        this.addGlobalLis();
    }
    async start () {
        this.setConfig();
        await cc.socket.init();
        await cc.socket.connectionAsync(gameConfig.GAME_SERVER.IP,gameConfig.GAME_SERVER.PORT);
    }
    async login(){
        let data = await cc.socket.requestAsync(cc.protoMap.player.login,{userName:'123',token:'123456'},this,false);
        console.log('登录成功');
        cc.dataCenter.userData.uid = data.uid;
    }
    async logout(){
        await cc.socket.requestAsync(cc.protoMap.player.logout,cc.dataCenter.userData.uid,this,false);
        console.log('登出成功');
    }
    closeHeart(){
        cc.updateMgr.removeTimer(cc.socket._heartbeatTimerId);
    }
    setConfig(){
        cc.socket.isHttps = gameConfig.IS_HTTPS;
        http.isHttps = gameConfig.IS_HTTPS;

        cc.socket._version = gameConfig.VERSION;

        cc.socket.debug = gameConfig.LOG.SOCKET;
        cc.insideEmitter.debug = gameConfig.LOG.EMITTER;
        loadUtil.debug = gameConfig.LOG.LOAD_UTIL;

    }
    addGlobalLis(){
        cc.game.on(cc.game.EVENT_HIDE,cc.insideEmitter.emit.bind(cc.insideEmitter,INSIDE_EVENT.GAME_HIDE));
        cc.game.on(cc.game.EVENT_SHOW,cc.insideEmitter.emit.bind(cc.insideEmitter,INSIDE_EVENT.GAME_SHOW));
    }
    update (dt) {
        cc.socket.update();
        cc.updateMgr.update(dt);
    }
    onDestroy(){
        cc.insideEmitter.removeAll();
    }
}
