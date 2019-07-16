import {fjdz} from "../fjdzGlobel"
import TimerMgr from "../../../util/timerMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FjdzEnemy extends cc.Component {

    @property(cc.Node)
    injuredNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:
    @property
    yMinSpeed:number = 0;
    @property
    yMaxSpeed:number = 0;
    @property
    initHP:number = 0;
    @property
    score:number = 0;

    speedY:number = 0;
    hp:number = 0;

    timer:number = 0;
    isPlayerEffect:boolean = false;
    timerMgr:TimerMgr = null
    // onLoad () {}
    start () {
        this.initData();
    }
    initData(){
        this.speedY = fjdz.center.getRandom(this.yMinSpeed,this.yMaxSpeed);
        this.hp = this.initHP;
        this.isPlayerEffect = false;
        this.timerMgr = new TimerMgr(1/60);
    }
    onCollisionEnter(other, self) {
        if (other.node.group === 'bullet') {
            if (this.hp <= 0) {
                return;
            } else if (this.hp > 1) {
                if(!this.isPlayerEffect){//受伤闪烁
                    this.injuredNode.active = true;
                    this.isPlayerEffect = true;
                    this.timerMgr.addOnceTimer(0.2,function () {
                        this.injuredNode.active = false;
                    }.bind(this))
                    this.timerMgr.addOnceTimer(0.4,function () {
                        this.isPlayerEffect = false;
                    }.bind(this))
                }
            }
            //移除子弹
            fjdz.center.backObjPool(fjdz.roomInfo.bulletMgrTs,other.node);
            //敌机扣血
            this.hp--;
            if(this.hp <= 0){
                //fjdz.center.backObjPool(fjdz.roomInfo.enemyMgrTs,self.node);
                fjdz.roomInfo.enemyMgrTs.playBoomEffect(self.node);
                fjdz.roomInfo.changeScore(this.score);
            }
        }else if(other.node.group === 'player'){
            console.log("撞击")
        }
    }
    update (dt) {
        this.node.y -= this.speedY*dt;
        if(this.node.y + this.node.height/2 < -cc.winSize.height/2){
            fjdz.center.backObjPool(fjdz.roomInfo.enemyMgrTs,this.node);
        }
    }

    onDestroy(){
        this.timerMgr = null;
    }
}
