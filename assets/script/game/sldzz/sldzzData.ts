import { TILE_TYPE, TILE_STATE, sldzz } from "./sldzzGlobal";
import random from "../../util/random";

const {ccclass, property} = cc._decorator;

@ccclass
export default class sldzzData extends cc.Component {
    playDataList: Array<playerDt> = [];
    originalTileDtList: Array<tileDt> = [];
    nowTileDtList: Array<tileDt> = [];
    leftBombNum: number = 0;
    bombNum: number = 8; //炸弹数量
    
    init(){
        this.playDataList = [];
        for(let i = 0; i < 6; i ++){
            let newDt = new playerDt();
            newDt.seatNum = i + 1;
            this.playDataList.push(newDt);
        }

        for(let i = 0; i < 64; i ++){
            let newDt = new tileDt();
            this.originalTileDtList.push(newDt);
            let newDt2 = new tileDt();
            this.nowTileDtList.push(newDt2);
        }

        this.bombNum = random.getInt(15, 30);
        this.leftBombNum = this.bombNum;
    }

    reSetData(){
        this.leftBombNum = 0;

        for(let i = 0; i < sldzz.game.tileList.length; i ++){
            let tile = sldzz.game.tileList[i];
            tile.doubtDataList = [];
            this.originalTileDtList[i].state = tile.state;
            this.nowTileDtList[i].state = tile.state;
            this.nowTileDtList[i].doubtDataList = [];

            if(tile.state == TILE_STATE.NONE && tile.type == TILE_TYPE.BOMB){
                this.leftBombNum ++;
            }
        }

        for(let playerDt of this.playDataList){
            playerDt.isSelected = false;
        }
    }

    getPlayerDtBySeatNum(seatNum: number){
        let playerDt: playerDt = null;
        this.playDataList.forEach(element => {
            if(element.seatNum == seatNum){
                playerDt = element;
            }
        });

        return playerDt;
    }
}

export class playerDt {
    seatNum: number = 0;
    isSelected: boolean = false;
    selectType: number = 0;
    selectSign: number = 0;
    score: number = 0;
}

export class tileDt{
    state: TILE_STATE = TILE_STATE.NONE;
    doubtDataList: Array<any> = [];
}
