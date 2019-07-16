import {fjdz} from "../fjdzGlobel"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FjdzProp extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    @property
    propTYpe:string = '';
    // onLoad () {}
    speedY:number = 100;
    start () {

    }
    onCollisionEnter(other, self) {
        if(this.propTYpe === "bullet"){
            fjdz.roomInfo.bulletMgrTs.changeBulletByDouble();
        }else if(this.propTYpe === "bomb"){
            fjdz.roomInfo.changeBombCount(1);
        }
        this.node.removeFromParent();
    }
    update (dt) {
        this.node.y -= this.speedY*dt;
        if(this.node.y < -cc.winSize.height/2 - this.node.height/2){
            this.node.removeFromParent();
        }
    }
}
