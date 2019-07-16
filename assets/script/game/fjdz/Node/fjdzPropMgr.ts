import {fjdz} from "../fjdzGlobel";


const {ccclass, property} = cc._decorator;

@ccclass
export default class fjdzPropMgr extends cc.Component {

    @property(cc.Prefab)
    propBombPre:cc.Prefab = null;
    @property(cc.Prefab)
    propBulletPre:cc.Prefab = null;
    @property
    initTime:number = 0;
    @property
    freqTime:number = 0;
    @property
    minFreqTime:number = 0;
    @property
    posDes:number = 0;
    // LIFE-CYCLE CALLBACKS:
    createrTime:number = 0;
    minTime:number = 0;
    maxTime:number = 0;
    curTime:number = 0;
    onLoad () {
        this.createrTime = this.initTime;
        this.minTime = this.initTime;
        this.maxTime = this.initTime + this.freqTime;
    }

    start () {

    }

    update (dt) {
        this.curTime += dt;
        if(this.curTime > this.createrTime){
            let propNode:cc.Node = null;
            if(Math.random() > 0.5){
                propNode = cc.instantiate(this.propBombPre);
            }else{
                propNode = cc.instantiate(this.propBulletPre);
            }
            propNode.parent = this.node;
            let posX = fjdz.center.getRandom(-cc.winSize.width/2 + this.posDes, cc.winSize.width/2 - this.posDes);
            let poxY = cc.winSize.height/2 + propNode.height/2;
            propNode.position = cc.v2(posX,poxY);

            let minTime = this.minTime;
            if(this.minFreqTime + this.createrTime > this.minTime){
                minTime = this.minFreqTime + this.createrTime;
            }
            this.minTime = this.maxTime;
            this.createrTime = fjdz.center.getRandom(minTime,this.maxTime);
            this.maxTime = this.minTime + this.freqTime;
        }
    }
}
