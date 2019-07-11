import sldzzTile from "./sldzzTile";
import { TILE_STATE, TILE_TYPE, GAME_STATE} from "./sldzzGlobal";

const {ccclass, property} = cc._decorator;
@ccclass
export default class slddzGame extends cc.Component {
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

    touchTile: sldzzTile = null;

    tileList: sldzzTile[] = [];

    holdClick: boolean = false;

    holdTimeEclipse: number = 0;

    gameState: GAME_STATE = GAME_STATE.PREPARE;

    onLoad(){
        this.tileLayoutNode.width = this.tilePfb.data.width * this.row;
        this.tileLayoutNode.height = this.tilePfb.data.height * this.col;

        let self = this;
        for(let y = 0; y < this.row; y ++){
            for(let x = 0; x < this.col; x ++){
                let tileNode = cc.instantiate(this.tilePfb);
                let tile = tileNode.getComponent(sldzzTile);
                tile.sign = y * this.col + x;

                tileNode.on(cc.Node.EventType.TOUCH_START, function(event){
                    if(self.gameState != GAME_STATE.PLAY){
                        return;
                    }
                    self.holdClick = true;
                    self.holdTimeEclipse = 0;   
                    self.touchTile = tile;         
                },this)

                tileNode.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
                    self.holdClick = false;
                    self.holdTimeEclipse = 0;
                    self.touchTile = null;
                }, this)

                tileNode.on(cc.Node.EventType.TOUCH_END, function(event){
                    if(self.gameState == GAME_STATE.PLAY && self.holdClick && tile.state == TILE_STATE.NONE){
                        self.holdClick = false;
                        self.holdTimeEclipse = 0;
                        self.touchTile = null;
                        self.onClickTile(tile);
                    }
                }, this)

                this.tileList.push(tile);
                this.tileLayoutNode.addChild(tileNode);
            }
        }

        // this.tileLayoutNode.getComponent(cc.Layout).enabled = false;
        this.newGame();
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

    onFlagTile(targetTile){
        console.log("onFlag");
        if(targetTile.state == TILE_STATE.NONE){
            targetTile.state = TILE_STATE.FLAG;
        }else if(targetTile.state == TILE_STATE.FLAG){
            targetTile.state = TILE_STATE.NONE;
        }
    }

    gameOver(){
        this.gameState = GAME_STATE.DEAD;
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
            this.gameState = GAME_STATE.WIN;
        }
    }

    update(dt){
        if(this.gameState != GAME_STATE.PLAY){
            return;
        }

        if(this.holdClick){
            this.holdTimeEclipse += dt;
            if(this.holdTimeEclipse > 1){
                this.onFlagTile(this.touchTile);
                this.holdClick = false;
                this.holdTimeEclipse = 0;
                this.touchTile = null;
            }
        }

    }
}