import sldzzGame from "./sldzzGame"
import sldzzData from "./sldzzData"
import {sldzz} from "./sldzzGlobal"

const {ccclass, property} = cc._decorator;

@ccclass
export default class SaoLieDaZuoZhan extends cc.Component {

    @property(sldzzGame)
    game: sldzzGame = null;

    onLoad () {
        sldzz.center = this;
        sldzz.data = new sldzzData();
        sldzz.game = this.game;
    }

    start () {
        sldzz.game.newGame();
    }

    // update (dt) {}
}
