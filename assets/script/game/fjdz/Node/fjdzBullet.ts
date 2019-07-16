import {fjdz} from "../fjdzGlobel"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FjdzBullet extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    speedY:number = 1000;
    start () {

    }

    update (dt) {
        this.node.y += this.speedY*dt;
        if(this.node.y - this.node.height/2 > cc.winSize.height/2){
            fjdz.center.backObjPool(fjdz.roomInfo.bulletMgrTs,this.node);
        }
    }
}
