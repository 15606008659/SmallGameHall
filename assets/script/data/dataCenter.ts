import UserData from "./userData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DataCenter extends cc.Component {
    userData:UserData = new UserData();
    onLoad () {
        cc.game.addPersistRootNode(this.node);
    }

    start () {
    }

    // update (dt) {}
}
