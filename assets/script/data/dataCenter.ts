
const {ccclass, property} = cc._decorator;

@ccclass
export default class DataCenter extends cc.Component {

    onLoad () {
        cc.game.addPersistRootNode(this.node);
    }

    start () {
    }

    // update (dt) {}
}
