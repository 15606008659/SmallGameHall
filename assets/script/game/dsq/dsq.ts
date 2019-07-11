import {dsq} from "./dsqGlobel"
import DsqData from "./data/dsqData"
import DsqNet from "./node/dsqNet"
import DsqRoomInfo from "./node/dsqRoomInfo"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dsq extends cc.Component {

    @property(cc.Node)
    dsqDataNode: cc.Node = null;
    @property(cc.Node)
    dsqNetNode: cc.Node = null;
    @property(cc.Node)
    dsqRoomInfoNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        dsq.center = this;
        dsq.data = this.dsqDataNode.getComponent(DsqData);
        dsq.net = this.dsqNetNode.getComponent(DsqNet);
        dsq.roomInfo = this.dsqRoomInfoNode.getComponent(DsqRoomInfo);
    }

    // update (dt) {}
}
