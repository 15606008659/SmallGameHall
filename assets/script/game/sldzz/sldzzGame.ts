import sldzzTile from "./sldzzTile";
import sldzzListenMgr from "./sldzzListenMgr";
import { TILE_STATE, TILE_TYPE, GAME_STATE, sldzz} from "./sldzzGlobal";
import { playerDt, tileDt } from "./sldzzData";
import sldzzPlayer from "./sldzzPlayer";
import { elements } from "../../../../engine/cocos2d/videoplayer/video-player-impl";

const {ccclass, property} = cc._decorator;
@ccclass
export default class sldzzGame extends cc.Component {
    @property
    row: number = 8;   //行

    @property
    col: number = 8;   //列

    @property
    bombNum: number = 8; //炸弹数量

    @property(cc.Node)
    tileLayoutNode: cc.Node = null;

    @property(cc.Prefab)
    tilePfb: cc.Prefab = null;

    tileList: sldzzTile[] = [];

    playerList: sldzzPlayer[] = [];

    gameState: GAME_STATE = GAME_STATE.PREPARE;

    curPlayerNum: number = 0;

    onLoad(){
        this.tileLayoutNode.width = this.tilePfb.data.width * this.row;
        this.tileLayoutNode.height = this.tilePfb.data.height * this.col;

        for(let y = 0; y < this.row; y ++){
            for(let x = 0; x < this.col; x ++){
                let tileNode = cc.instantiate(this.tilePfb);
                let tile = tileNode.getComponent(sldzzTile);
                tile.sign = y * this.col + x;
                sldzz.listenMgr.addTileListen(tileNode);
                this.tileList.push(tile);
                this.tileLayoutNode.addChild(tileNode);
            }
        }

        let playerListNode = cc.find("Canvas/playerList");
        for(let i = 0; i < playerListNode.childrenCount; i ++){
            this.playerList.push(playerListNode.children[i].getComponent(sldzzPlayer));
        }

        // this.tileLayoutNode.getComponent(cc.Layout).enabled = false;
    }

    newGame(){
        //初始化场景
        for(let i = 0; i < this.tileList.length; i ++){
            this.tileList[i].type = TILE_TYPE.ZERO;
            this.tileList[i].state = TILE_STATE.NONE;
        }

        var tilesIndex = [];
        for(let i = 0; i < this.tileList.length; i ++){
            tilesIndex[i] = i;
        }

        for(let i = 0; i < this.bombNum; i ++){
            var n = Math.floor(Math.random() * tilesIndex.length);
            this.tileList[tilesIndex[n]].type = TILE_TYPE.BOMB;
            tilesIndex.splice(n, 1);//从第n个位置删除一个元素
        }

        for(let i = 0; i < this.tileList.length; i ++){
            var tempBomb = 0;
            if(this.tileList[i].type == TILE_TYPE.ZERO){
                var roundTileArr = this.tileRound(this.tileList[i]);
                for(let j = 0; j < roundTileArr.length; j ++){
                    if(roundTileArr[j].type == TILE_TYPE.BOMB){
                        tempBomb ++;
                    }
                }

                this.tileList[i].type = tempBomb;
            }
           
        }

        this.gameState = GAME_STATE.PLAY;
    }

    //返回指定tile的周围tile数组
    tileRound(value: sldzzTile){
        let sign = value["sign"];
        var roundTiles = [];
        if(sign % this.col > 0){//left
            roundTiles.push(this.tileList[sign - 1]);
        }
        if(sign % this.col > 0 && Math.floor(sign / this.col) > 0){//left bottom
            roundTiles.push(this.tileList[sign - this.col - 1]);   
        }
        if(sign % this.col > 0 && Math.floor(sign / this.col) < this.row - 1){//left top
            roundTiles.push(this.tileList[sign + this.col - 1]);
        }
        if(Math.floor(sign / this.col) > 0){//bottom
            roundTiles.push(this.tileList[sign - this.col]);
        }
        if(Math.floor(sign / this.col) < this.row - 1){//top
            roundTiles.push(this.tileList[sign + this.col]);
        }
        if(sign % this.col < this.col - 1){//right
            roundTiles.push(this.tileList[sign + 1]);
        }
        if(sign % this.col < this.col - 1 && Math.floor(sign / this.col) > 0){//rihgt bottom
            roundTiles.push(this.tileList[sign - this.col + 1]);
        }
        if(sign % this.col < this.col - 1 && Math.floor(sign / this.col) < this.row - 1){//right top
            roundTiles.push(this.tileList[sign + this.col + 1]);
        }
        return roundTiles;
    }

    onClickTile(targetTile: sldzzTile, isFlag = false){
        console.log("onClick");

        if(targetTile.state != TILE_STATE.NONE){
            return;
        }

        let curPlayer: sldzzPlayer = this.getPlayerBySeatNum(this.curPlayerNum);
        if(curPlayer == null){
            return;
        }

        let playerDt: playerDt = sldzz.data.getPlayerDtBySeatNum(this.curPlayerNum);
        if(playerDt == null){
            return;
        } 

        let sign = targetTile.sign;
        
        playerDt.isSelected = true;
        playerDt.selectSign = sign;
        if(isFlag){
            playerDt.selectType = 2;
        }else{
            playerDt.selectType = 1;
        }

        let doubtData = new Object();
        doubtData["pic"] = curPlayer.headSp.spriteFrame;
        doubtData["isFlag"] = isFlag;
        doubtData["seatNum"] = curPlayer.seatNum;
        sldzz.data.nowTileDtList[sign].doubtDataList.push(doubtData);
        sldzz.data.nowTileDtList[sign].state = TILE_STATE.DOUBT;

        for(let i = 0; i < this.tileList.length; i ++){
            let dt = sldzz.data.nowTileDtList[i];
            this.tileList[i].doubtDataList = dt.doubtDataList;
            this.tileList[i].state = dt.state;
        }

        this.gameState = GAME_STATE.STOP;
    }

    // onFlagTile(targetTile: sldzzTile){
    //     console.log("onFlag");
    //     if(targetTile.state == TILE_STATE.NONE){
    //         targetTile.state = TILE_STATE.FLAG;
    //     }else if(targetTile.state == TILE_STATE.FLAG){
    //         targetTile.state = TILE_STATE.NONE;
    //     }
    // }

    gameOver(){
        this.gameState = GAME_STATE.OVER;
    }

    judgeWin(){
        var confNum = 0;
        //判断是否胜利
        for(let i = 0; i < this.tileList.length; i ++){
            if(this.tileList[i].state === TILE_STATE.CLIKED){
                confNum ++;
            }
        }
        if(confNum == this.tileList.length - this.bombNum){
            this.gameState = GAME_STATE.OVER;
        }
    }

    getPlayerBySeatNum(seatNum){
        let player: sldzzPlayer = null;
        for (const iterator of this.playerList) {
            if(iterator.seatNum == seatNum){
                player = iterator;
            }
        }

        return player;
    }

    onChangePlayer(seatNum: number){
        this.curPlayerNum = seatNum;
        let playerDt: playerDt = sldzz.data.getPlayerDtBySeatNum(seatNum);
        if(playerDt == null){
            return;
        }   

        if(playerDt.isSelected){
            for(let i = 0; i < this.tileList.length; i ++){
                let dt = sldzz.data.nowTileDtList[i];
                this.tileList[i].doubtDataList = dt.doubtDataList;
                this.tileList[i].state = dt.state;
            }

            this.gameState = GAME_STATE.STOP;
        }else{
            for(let i = 0; i < this.tileList.length; i ++){
                let dt = sldzz.data.originalTileDtList[i];
                this.tileList[i].doubtDataList = [];
                this.tileList[i].state = dt.state;
            }

            this.gameState = GAME_STATE.PLAY;
        }
    }

    onResult() {
        //暂时先这样,到时候遍历data
        for(let tile of this.tileList){
            if(tile.state == TILE_STATE.DOUBT){
                tile.doubtDataList.forEach(doubtData => {
                    let scoreLab = doubtData["signIcon"].getChildByName("score").getComponent(cc.Label);
                    scoreLab.node.active = true;
                    if((tile.type == TILE_TYPE.BOMB && doubtData["isFlag"] == false) || (tile.type != TILE_TYPE.BOMB && doubtData["isFlag"] == true)){
                        scoreLab.node.color = cc.Color.GREEN;
                        scoreLab.string = "-6";
                    }else{
                        scoreLab.node.color = cc.Color.RED;
                        scoreLab.string = "+6";
                    }

                    let playerDt = sldzz.data.getPlayerDtBySeatNum(doubtData["seatNum"]);
                    let player = sldzz.game.getPlayerBySeatNum(doubtData["seatNum"]);

                    playerDt.score += parseInt(scoreLab.string);
                    player.scoreLab.string = playerDt.score.toString();
                })
            }
        }
    }

    onNext(){
        for(let i = 0; i < sldzz.data.nowTileDtList.length; i ++){
            let tileDt = sldzz.data.nowTileDtList[i];
            let tile = this.tileList[i];
            if(tileDt.state == TILE_STATE.DOUBT && tile.state == TILE_STATE.DOUBT){
                if(tile.type == TILE_TYPE.BOMB){
                    let isFlag: boolean = false;
                    tile.doubtDataList.forEach(doubtData => {
                        if(doubtData["isFlag"]){
                            isFlag = true;
                        }
                    });
                   
                    tile.state = isFlag? TILE_STATE.FLAG : TILE_STATE.CLIKED;
                    continue;
                }

                let testTileArr = [];
                testTileArr.push(tile);
            
                while(testTileArr.length){
                    var testTile = testTileArr.pop();
                    if(testTile.type == TILE_TYPE.ZERO){
                        testTile.state = TILE_STATE.CLIKED;
                        let roundTileArr = this.tileRound(testTile);
                        for(let j = 0; j < roundTileArr.length; j ++){
                            if(roundTileArr[j].state == TILE_STATE.NONE){
                                testTileArr.push(roundTileArr[j]);
                            }
                        }
                    }else if(testTile.type > 0 && testTile.type < 9){
                        testTile.state = TILE_STATE.CLIKED;
                    }
                }
            }
        }

        sldzz.data.reSetData();
        this.curPlayerNum = 0;
    }
}