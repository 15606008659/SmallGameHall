import {fjdz,BULLET_TYPE} from "../fjdzGlobel"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FjdzBulletMgr extends cc.Component {

    @property(cc.Prefab)
    bulletPre: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:
    timer:number = 0;
    bulletType:BULLET_TYPE = BULLET_TYPE.NONE;
    doubleTime:number = 0;//双发子弹剩余时间
    onLoad () {
        this.bulletType = BULLET_TYPE.ONE_BULLET;
        let bulletObj = {
            name:"bullet",
            initPollCount: 15,
            prefab: this.bulletPre
        }
        fjdz.center.initObjPool(this,bulletObj);
    }
    changeBulletByDouble(){
        this.doubleTime = 15;
        this.bulletType = BULLET_TYPE.TWO_BULLET;
    }
    onRemoveAllBulletByBomb(){
        for(let i = 0; i < this.node.childrenCount;) {
            let enemy = this.node.children[0];
            fjdz.center.backObjPool(fjdz.roomInfo.bulletMgrTs,enemy);
        }
    }
    update (dt) {
        this.timer += dt;
        if(this.doubleTime > 0){
            this.doubleTime -= dt;
            if(this.doubleTime < 0){
                this.bulletType = BULLET_TYPE.ONE_BULLET;
            }
        }
        if(this.timer < 0.2 && this.node.childrenCount > 0){
            return;
        }
        let selfPlane = fjdz.roomInfo.selfPlane;
        if(this.bulletType === BULLET_TYPE.ONE_BULLET){
            let bulletNode = fjdz.center.genNewNode(this["bulletPool"],this.bulletPre,this.node);
            bulletNode.position = selfPlane.position.add(cc.v2(0,bulletNode.height/2));
            bulletNode.parent = this.node
            cc.audioCenter.playEffectPauseBgm()
        }else if(this.bulletType === BULLET_TYPE.TWO_BULLET){
            let bulletNode = fjdz.center.genNewNode(this["bulletPool"],this.bulletPre,this.node);
            bulletNode.position = selfPlane.position.sub(cc.v2(selfPlane.width/4,-bulletNode.height/2));
            bulletNode.parent = this.node
            let bulletNode2 = fjdz.center.genNewNode(this["bulletPool"],this.bulletPre,this.node);
            bulletNode2.position = selfPlane.position.sub(cc.v2(-selfPlane.width/4,-bulletNode.height/2));
            bulletNode2.parent = this.node
        }
        this.timer = 0;
    }
}
