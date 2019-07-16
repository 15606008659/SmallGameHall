import {fjdz} from "./fjdzGlobel"
import FjdzData from "./data/fjdzData"
import FjdzNet from "./node/fjdzNet"
import FjdzRoomInfo from "./node/fjdzRoomInfo"
import fjdzConfig from "./fjdzConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Fjdz extends cc.Component {

    @property(cc.Node)
    fjdzDataNode: cc.Node = null;
    @property(cc.Node)
    fjdzNetNode: cc.Node = null;
    @property(cc.Node)
    fjdzRoomInfoNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        fjdz.center = this;
        fjdz.data = this.fjdzDataNode.getComponent(FjdzData);
        fjdz.net = this.fjdzNetNode.getComponent(FjdzNet);
        fjdz.roomInfo = this.fjdzRoomInfoNode.getComponent(FjdzRoomInfo);

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

    }
    start(){
        //cc.audioCenter.playBgmAudioByPath(fjdzConfig.AUDIO.PATH.BG_GAME);
    }
    //批量初始对象池
    batchInitObjPool (thisO, objArray) {

        for (var i = 0; i < objArray.length; i++) {
            var objinfo = objArray[i];
            this.initObjPool(thisO, objinfo);
        }
    }
    //初始对象池
    initObjPool (thisO, objInfo) {

        var name = objInfo.name;
        var poolName = name + 'Pool';
        thisO[poolName] = new cc.NodePool();
        let initPollCount = objInfo.initPollCount;

        for (let ii = 0; ii < initPollCount; ++ii) {
            let nodeO = cc.instantiate(objInfo.prefab);
            thisO[poolName].put(nodeO);
        }
    }
    //从对象池获取节点
    genNewNode (pool, prefab, nodeParent) {

        let newNode = null;
        if (pool.size() > 0) {
            newNode = pool.get();
        } else {
            newNode = cc.instantiate(prefab);
        }
        //nodeParent.addChild(newNode);
        newNode.parent = nodeParent;
        return newNode;
    }
    //放回对象池
    backObjPool (thisO, nodeinfo) {
        var poolName = nodeinfo.name + 'Pool';

        thisO[poolName].put(nodeinfo);
    }
    //清除对象池
    clearPool(thisO, name){
        thisO[name].clear();
    }
    getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    getRandom (min, max) {
        return Math.random() * (max - min) + min;
    }
    onDestroy() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;
    }

    // update (dt) {}
}
