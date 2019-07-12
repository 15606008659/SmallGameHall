import sldzzTile from "./sldzzTile";
import sldzzListenMgr from "./sldzzListenMgr";
import { TILE_STATE, TILE_TYPE, GAME_STATE, sldzz} from "./sldzzGlobal";
import { playDt, tileDt } from "./sldzzData";

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

    onClickTile(targetTile: sldzzTile){
        console.log("onClick");

        if(targetTile.type == TILE_TYPE.BOMB){
            targetTile.state = TILE_STATE.CLIKED;
            this.gameOver();
            return;
        }
        var testTileArr = [];
        if(targetTile.state == TILE_STATE.NONE){
            testTileArr.push(targetTile);
            
            while(testTileArr.length){
                var testTile = testTileArr.pop();
                if(testTile.type == TILE_TYPE.ZERO){
                    testTile.state = TILE_STATE.CLIKED;
                    let roundTileArr = this.tileRound(testTile);
                    for(let i = 0; i < roundTileArr.length; i ++){
                        if(roundTileArr[i].state == TILE_STATE.NONE){
                            testTileArr.push(roundTileArr[i]);
                        }
                    }
                }else if(testTile.type > 0 && testTile.type < 9){
                    testTile.state = TILE_STATE.CLIKED;
                }
            }
            this.judgeWin();
        }
    }

    onFlagTile(targetTile: sldzzTile){
        console.log("onFlag");
        if(targetTile.state == TILE_STATE.NONE){
            targetTile.state = TILE_STATE.FLAG;
        }else if(targetTile.state == TILE_STATE.FLAG){
            targetTile.state = TILE_STATE.NONE;
        }
    }

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

    onChangePlayer(seatNum: number){
        this.curPlayerNum = seatNum;
        let playerDt: playDt = null;
        sldzz.data.playDataList.forEach(element => {
            if(element.seatNum == seatNum){
                playerDt = element;
            }
        });

        if(playerDt == null){
            return;
        }   

        if(playerDt.isSelected){
            for(let i = 0; i < this.tileList.length; i ++){
                let dt = sldzz.data.nowTileDtList[i];
                this.tileList[i].doubtDataList = dt.doubtDataList;
                this.tileList[i].type = dt.type;
                this.tileList[i].state = dt.state;
            }

            this.gameState = GAME_STATE.STOP;
        }else{
            for(let i = 0; i < this.tileList.length; i ++){
                let dt = sldzz.data.originalTileDtList[i];
                this.tileList[i].doubtDataList = [];
                this.tileList[i].type = dt.type;
                this.tileList[i].state = dt.state;
            }

            this.gameState = GAME_STATE.PLAY;
        }
    }
}