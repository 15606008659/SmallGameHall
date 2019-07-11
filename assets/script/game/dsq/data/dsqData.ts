import dsqCard from "../node/dsqCard"
const {ccclass, property} = cc._decorator;

@ccclass
export default class DsqData extends cc.Component {

    playUid:number = 1;//操作玩家
    selectCardTs:dsqCard = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
