import {sldzz, GAME_STATE, TILE_STATE} from "./sldzzGlobal"
import sldzzTile from "./sldzzTile";
import sldzzPlayer from "./sldzzPlayer";
import sldzzData from "./sldzzData";

const {ccclass, property} = cc._decorator;
@ccclass
export default class sldzzListenMgr extends cc.Component{
    curTouchTile: sldzzTile = null;

    holdClick: boolean = false;

    holdTimeEclipse: number = 0;


    addTileListen(tileNode: cc.Node){
        let tile = tileNode.getComponent(sldzzTile);
        tileNode.on(cc.Node.EventType.TOUCH_START, function(event){
            if(sldzz.game.gameState != GAME_STATE.PLAY){
                return;
            }
            this.holdClick = true;
            this.holdTimeEclipse = 0;   
            this.curTouchTile = tile;         
        },this)

        tileNode.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
            this.holdClick = false;
            this.holdTimeEclipse = 0;
            this.curTouchTile = tile;
        }, this)

        tileNode.on(cc.Node.EventType.TOUCH_END, function(event){
            if(sldzz.game.gameState == GAME_STATE.PLAY && this.holdClick && tile.state == TILE_STATE.NONE){
                this.holdClick = false;
                this.holdTimeEclipse = 0;
                this.curTouchTile = null;
                sldzz.game.onClickTile(tile);
            }
        }, this)
    }

    onClickPlayer(event){
        let seatNum = event.currentTarget.getComponent(sldzzPlayer).seatNum;
        sldzz.game.onChangePlayer(seatNum);
    }

    onBtnResult(event){
        sldzz.game.onResult();
    }

    onBtnNext(event){
        sldzz.game.onNext();
    }
    
    update(dt){
        if(sldzz.game.gameState != GAME_STATE.PLAY){
            return;
        }

        if(this.holdClick){
            this.holdTimeEclipse += dt;
            if(this.holdTimeEclipse > 1){
                sldzz.game.onClickTile(this.curTouchTile, true);
                this.holdClick = false;
                this.holdTimeEclipse = 0;
                this.curTouchTile = null;
            }
        }

    }
}