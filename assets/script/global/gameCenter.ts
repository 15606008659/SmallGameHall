import DataCenter from "../data/dataCenter";
import UiCenter from "./uiCenter";
import AudioCenter from "./audioCenter";
import Emitter from "../util/emitter";
import TimerMgr from "../util/timerMgr";
import protoMap from "./net/protoMap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameCenter extends cc.Component {
    @property(DataCenter)
    dataCenter:DataCenter = null;

    @property(UiCenter)
    uiCenter:UiCenter = null;

    onLoad () {
        cc.game.addPersistRootNode(this.node);
        cc.dataCenter = this.dataCenter;
        cc.uiCenter = this.uiCenter;
        cc.audioCenter = new AudioCenter();
        cc.insideEmitter = new Emitter();
        cc.timerMgr = new TimerMgr(1/60);
        cc.updateMgr = new TimerMgr();
        cc.protoMap = protoMap;
    }

    start () {

    }

    update (dt) {
        cc.updateMgr.update(dt);
    }
}
