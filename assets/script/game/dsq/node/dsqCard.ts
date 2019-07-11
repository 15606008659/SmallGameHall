import {dsq, TIP_DIR} from "../dsqGlobel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    showNode:cc.Node = null;
    @property([cc.Node])
    arrTipNode:cc.Node[] = [];
    @property(cc.Label)
    playerLabel: cc.Label = null;
    @property(cc.Label)
    cardLabel: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:
    playerId: number = 0;
    cardId: number = 0;
    set showCard(isShow:boolean){
        if(!isShow){
            return;
        }
        this['_showCard'] = isShow;
        this.showNode.active = true;
    }
    get showCard():boolean{
        return this['_showCard'] || (this['_showCard'] = false);
    }
    set cardIndex(num:number){
        this['_cardIndex'] = num;
        this.initView(num);
    }
    get cardIndex():number{
        return this['_cardIndex'] || (this['_cardIndex'] = 0);
    }
    // onLoad () {}
    start () {

    }

    /**
     * 初始牌界面
     * @param cardIndex
     */
    initView(cardIndex){
        let playerId = Math.floor(cardIndex/10);
        let cardId = cardIndex%10;
        this.playerId = playerId;
        this.cardId = cardId;
        this.playerLabel.string = playerId + "";
        let cardName = "";
        if(cardId === 1){
            cardName = "鼠"
        }else if(cardId === 2){
            cardName = "猫"
        }else if(cardId === 3){
            cardName = "狗"
        }else if(cardId === 4){
            cardName = "狼"
        }else if(cardId === 5){
            cardName = "豹"
        }else if(cardId === 6){
            cardName = "虎"
        }else if(cardId === 7){
            cardName = "狮"
        }else if(cardId === 8){
            cardName = "象"
        }
        this.cardLabel.string = cardName;
    }
    showTip(arrDir:Array<TIP_DIR> = []){
        if(arrDir.length < 4){
            this.arrTipNode[0].parent.active = true;
        }
        for(let i = 0; i < this.arrTipNode.length; i++){
            this.arrTipNode[i].active = true;
        }
        for(let i = 0; i < arrDir.length; i++){
            this.arrTipNode[arrDir[i]].active = false;
        }
        dsq.data.selectCardTs.node.zIndex = 2;
    }
    hindTip(){
        dsq.data.selectCardTs.node.zIndex = 1;
        this.arrTipNode[0].parent.active = false;
        for(let i = 0; i < this.arrTipNode.length; i++){
            this.arrTipNode[i].active = false;
        }
    }
    // update (dt) {}
}
