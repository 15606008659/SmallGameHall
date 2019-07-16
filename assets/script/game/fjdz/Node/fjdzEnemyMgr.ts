import {fjdz} from "../fjdzGlobel";
import fjdzEnemy from "./fjdzEnemy";
import fjdzRoomInfo from "./fjdzRoomInfo";
import TimerMgr from "../../../util/timerMgr";

const {ccclass, property} = cc._decorator;

@ccclass('EnemyG')
class EnemyG {
    @property
    name:string = ''
    @property
    initTime:number = 0
    @property
    freqTime:number = 0
    @property
    minFreqTime:number = 0
    @property
    posDes:number = 0
    @property
    initPollCount:number = 0
    @property(cc.Prefab)
    prefab:cc.Prefab = null;
}

@ccclass
export default class FjdzEnemyMgr extends cc.Component {
    @property(cc.Node)
    enemyLayerNode: cc.Node = null;
    @property(cc.Node)
    effectLayerNode: cc.Node = null;
    @property(cc.Prefab)
    boomEffectPre:cc.Prefab = null;
    @property([EnemyG])
    arrEnemy:Array<EnemyG> = [];
    // LIFE-CYCLE CALLBACKS:
    arrMinTime:Array<number> = [];
    arrMaxTime:Array<number> = [];
    arrCreatTime:Array<number> = [];

    curTime:number = 0;
    timerMgr:TimerMgr = null
    onLoad () {
        //初始对象池
        fjdz.center.batchInitObjPool(this,this.arrEnemy);
        //初始粒子爆炸对象池
        let boomEfectObj = {
            name:"boomEfect",
            initPollCount: 20,
            prefab: this.boomEffectPre
        }
        fjdz.center.initObjPool(this,boomEfectObj);

        this.timerMgr = new TimerMgr(1/60);
    }

    start () {
        for(let i = 0; i < this.arrEnemy.length; i++){
            this.arrMinTime.push(this.arrEnemy[i].initTime);
            this.arrMaxTime.push(this.arrEnemy[i].initTime + this.arrEnemy[i].freqTime);
            this.arrCreatTime.push(this.arrEnemy[i].initTime);
        }
    }
    onAllEnemyBoomByBomb(){
        let allScore = 0;
        for(let i = 0; i < this.enemyLayerNode.childrenCount;){
            let enemy = this.enemyLayerNode.children[0];
            let enemyTs = enemy.getComponent(fjdzEnemy);
            allScore += enemyTs.score;
            //fjdz.center.backObjPool(fjdz.roomInfo.enemyMgrTs,enemy);
            this.playBoomEffect(enemy)
        }
        fjdz.roomInfo.changeScore(allScore);
    }

    /**
     * 播放爆炸特效
     * @param playNode
     */
    playBoomEffect(playNode){
        let boomNode = fjdz.center.genNewNode(this["boomEfectPool"],this.boomEffectPre,this.effectLayerNode);
        boomNode.zIndex = 2;
        let boomEffect = boomNode.getChildByName("bom");
        let particle = boomEffect.getComponent(cc.ParticleSystem);
        if(playNode.name === "enemy1"){
            boomEffect.scaleX = 0.15;
            boomEffect.scaleY = 0.15;
            particle.duration = 0.3;
        }else if(playNode.name === "enemy2"){
            boomEffect.scaleX = 0.2;
            boomEffect.scaleY = 0.2;
            particle.duration = 0.4;
        }else if(playNode.name === "enemy3"){
            boomEffect.scaleX = 0.3;
            boomEffect.scaleY = 0.3;
            particle.duration = 0.5;
            particle.posVar.x = 180;
        }else if(playNode.name === "enemy4"){
            boomEffect.scaleX = 0.5;
            boomEffect.scaleY = 0.5;
            particle.duration = 0.9;
            particle.posVar.x = 180;
        }else if(playNode.name === "enemy5"){
            boomEffect.scaleX = 0.7;
            boomEffect.scaleY = 0.7;
            particle.duration = 1.5;
            particle.posVar.x = 180;
        }
        playNode.parent = boomNode.parent;
        boomNode.position = playNode.position;
        particle.resetSystem();
        //let moveBy = cc.repeatForever(cc.moveBy(1,cc.p(0,-10)));
        //boomNode.runAction(moveBy);
        this.timerMgr.addOnceTimer(particle.duration+1,function(){
            fjdz.center.backObjPool(this,boomNode);
        }.bind(this));
        this.timerMgr.addOnceTimer(0.2,function(){
            fjdz.center.backObjPool(this,playNode);
        }.bind(this));
    }

    update (dt) {
        this.curTime +=dt;
        for(let i = 0; i < this.arrEnemy.length; i++){
            if(this.curTime < this.arrCreatTime[i]){
                continue;
            }
            let enemyObj = this.arrEnemy[i];
            let enemyNode:cc.Node = fjdz.center.genNewNode(this[enemyObj.name+"Pool"],enemyObj.prefab,this.enemyLayerNode);
            let enemyTs = enemyNode.getComponent(fjdzEnemy);
            enemyTs.initData();
            let posX = fjdz.center.getRandom(-cc.winSize.width/2 + enemyObj.posDes, cc.winSize.width/2 - enemyObj.posDes);
            let posY = cc.winSize.height/2 + enemyNode.height/2;
            enemyNode.position = cc.v2(posX,posY);

            let minTime = this.arrMinTime[i];
            if(enemyObj.minFreqTime + this.arrCreatTime[i] > this.arrMinTime[i]){
                minTime = enemyObj.minFreqTime + this.arrCreatTime[i];
            }
            this.arrMinTime[i] = this.arrMaxTime[i];
            this.arrCreatTime[i] = fjdz.center.getRandom(minTime,this.arrMaxTime[i]);
            this.arrMaxTime[i] = this.arrMinTime[i] + enemyObj.freqTime;
        }
    }
}
