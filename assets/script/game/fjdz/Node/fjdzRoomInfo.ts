import fjdzEnemyMgr from "./fjdzEnemyMgr"
import fjdzBulletMgr from "./fjdzBulletMgr"
import fjdzPropMgr from "./fjdzPropMgr"
const {ccclass, property} = cc._decorator;

@ccclass
export default class FjdzRoomInfo extends cc.Component {

    @property([cc.Node])
    arrBg: cc.Node[] = [];
    @property(cc.Node)
    selfPlane:cc.Node = null;
    @property(cc.Node)
    enemyMgrNode:cc.Node = null;
    @property(cc.Node)
    bulletMgrNode:cc.Node = null;
    @property(cc.Node)
    propMgrNode:cc.Node = null;
    @property(cc.Button)
    boomButton:cc.Button = null;
    @property(cc.Label)
    bombCountLab:cc.Label = null;
    @property(cc.Label)
    selfScoreLabel:cc.Label = null;
    // LIFE-CYCLE CALLBACKS:
    enemyMgrTs:fjdzEnemyMgr = null;
    bulletMgrTs:fjdzBulletMgr = null;
    propMgrTs:fjdzPropMgr = null;
    bgSpeedY: number = 50;
    curSelfScore:number = 0;//得分
    bombCount:number = 0;//炸弹道具数
    onLoad () {
        this.enemyMgrTs = this.enemyMgrNode.getComponent(fjdzEnemyMgr);
        this.bulletMgrTs = this.bulletMgrNode.getComponent(fjdzBulletMgr);
        this.propMgrTs = this.propMgrNode.getComponent(fjdzPropMgr);
        this.node.on("touchmove",this.moveSelfPlane,this);
    }

    /**
     *玩家触摸移动
     * @param tag 触摸事件
     */
    moveSelfPlane(tag){
        let moveDis:cc.Vec2 = tag.touch._point.sub(tag.touch._prevPoint);
        this.selfPlane.x += moveDis.x;
        this.selfPlane.y += moveDis.y;
        if((this.selfPlane.x - this.selfPlane.width/4) < -cc.winSize.width/2 || (this.selfPlane.x + this.selfPlane.width/4) > cc.winSize.width/2) {
            this.selfPlane.x -= moveDis.x;
        }
        if((this.selfPlane.y - this.selfPlane.height/4) < -cc.winSize.height/2 || (this.selfPlane.y + this.selfPlane.height/4) > cc.winSize.height/2){
            this.selfPlane.y -= moveDis.y;
        }
    }

    /**
     * 加分数
     * @param addScore
     */
    changeScore(addScore:number = 0){
        this.curSelfScore += addScore;
        this.selfScoreLabel.string = this.curSelfScore+"";
    }
    /**
     * 改变炸弹个数
     * @param count 改变值
     */
    changeBombCount(count){
        this.bombCount += count;
        if(this.bombCount <= 0){
            this.boomButton.interactable = false;
            this.boomButton.node.runAction(cc.moveBy(0.5,-170,0));
        }else if(this.bombCount > 3){
            this.bombCount = 3;
        }
        if(this.bombCount === 1 && count > 0){
            this.boomButton.interactable = true;
            this.boomButton.node.runAction(cc.moveBy(0.5,170,0));
        }
        this.bombCountLab.string = this.bombCount>0 ? this.bombCount+'' : "";
    }
    onBtnBombButton(){
        this.changeBombCount(-1);
        this.enemyMgrTs.onAllEnemyBoomByBomb();
        this.bulletMgrTs.onRemoveAllBulletByBomb();
    }
    update (dt) {
        for(let i in this.arrBg){//背景移动
            this.arrBg[i].y -= this.bgSpeedY*dt;
            if(this.arrBg[i].y <= -2682){
                this.arrBg[i].y = this.arrBg[i].y+this.arrBg[i].height*this.arrBg.length;
            }
        }
    }
}
