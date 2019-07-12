import sldzzGame from "./sldzzGame"
import sldzzData from "./sldzzData"
import {sldzz} from "./sldzzGlobal"
import sldzzListenMgr from "./sldzzListenMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SaoLieDaZuoZhan extends cc.Component {

    @property(sldzzGame)
    game: sldzzGame = null;

    @property(sldzzListenMgr)
    listenMgr: sldzzListenMgr = null;

    onLoad () {
        sldzz.center = this;
        sldzz.data = new sldzzData();
        sldzz.game = this.game;
        sldzz.listenMgr = this.listenMgr;
    }

    start () {
        sldzz.game.newGame();
    }

    // update (dt) {}
}
