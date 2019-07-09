import tileJs from "./tile";

const {ccclass, property} = cc._decorator;
@ccclass
export default class slddzGame extends cc.Component {
    @property
    row: number = 8;   //行

    @property
    col: number = 8;   //列

    @property(cc.Node)
    tileLayoutNode: cc.Node = null;

    @property(cc.Prefab)
    tilePfb: cc.Prefab = null;

    tileList: tileJs[] = [];

    holdClick: boolean = false;
    holdTimeEclipse: number = 0;

    onLoad(){
        this.tileLayoutNode.width = this.tilePfb.data.width * this.row;
        this.tileLayoutNode.height = this.tilePfb.data.height * this.col;

        let self = this;
        for(let i = 0; i < this.row; i ++){
            for(let j = 0; j < this.col; j ++){
                let tileNode = cc.instantiate(this.tilePfb);
                tileNode.on(cc.Node.EventType.TOUCH_START, function(event){
                    self.holdClick = true;
                    self.holdTimeEclipse = 0;            
                },this)

                tileNode.on(cc.Node.EventType.MOUSE_LEAVE, function)


                this.tileLayoutNode.addChild(tileNode);
            }
        }

        this.tileLayoutNode.getComponent(cc.Layout).enabled = false;
    }

    //返回指定tile的周围tile数组
    tileRound(value: tileJs){
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

    update(dt){
        if(this.holdClick){
            this.holdTimeEclipse += dt;
            if(this.holdTimeEclipse > 1){

            }
        }

    }
}