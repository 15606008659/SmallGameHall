import {dsq,TIP_DIR} from "../dsqGlobel"
import dsqCard from "./dsqCard";
const {ccclass, property} = cc._decorator;

@ccclass
export default class DsqRoomInfo extends cc.Component {

    @property(cc.Label)
    playerIdLabel: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let arrCards = this.node.getChildByName("cards");
        let arrCardIndex = this.foo([11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28]);
        for(let i = 0; i < arrCards.childrenCount; i++){
            let cardTs = arrCards.children[i].getComponent(dsqCard);
            cardTs.cardIndex = arrCardIndex[i];
        }
    }
    foo(arr):Array<number>{
        var cloneArr=arr.concat();//拷贝数组
        var len=cloneArr.length;
        for(var i=0;i<len;i++){
            var index=Math.floor(Math.random()*cloneArr.length);
            var temp=cloneArr[i];
            cloneArr[i]=cloneArr[index];
            cloneArr[index]=temp;
        }
        return cloneArr;
    }
    changePlayerControl(){
        dsq.data.playUid ++;
        if(dsq.data.playUid > 2){
            dsq.data.playUid = 1;
        }
        this.playerIdLabel.string = "玩家：" + dsq.data.playUid;
        if(dsq.data.selectCardTs){
            dsq.data.selectCardTs.hindTip();
        }
        dsq.data.selectCardTs = null;
    }
    onTouchCheck(tag){
        console.log("点击放格");
        let node = tag.target;
        if(!dsq.data.selectCardTs){//没有选中的牌
            return;
        }else {//已有选中的牌
            let selcetCard = dsq.data.selectCardTs;
            if (node.x === selcetCard.node.x && Math.abs(node.y - selcetCard.node.y) === node.height) {
                selcetCard.node.y = node.y;
            } else if (node.y === selcetCard.node.y && Math.abs(node.x - selcetCard.node.x) === node.width) {
                selcetCard.node.x = node.x;
            }
            dsq.data.selectCardTs.hindTip();
            dsq.data.selectCardTs = null;
        }
    }

    /**
     * 点击牌节点
     * @param tag
     */
    onTouchCard(tag){
        console.log("点击卡牌");
        let node = tag.target;
        let cardTs = node.getComponent(dsqCard);
        if(!dsq.data.selectCardTs){//没有选中的牌
            if(cardTs.showCard){//当前点的是已翻的牌
                if(cardTs.playerId !== dsq.data.playUid){//不是自己的牌
                    return;
                }
                dsq.data.selectCardTs = cardTs;
                this.moveInDirect();
            }else{//当前点的是盖住的牌
                cardTs.showCard = true;
            }
        }else{//已有选中的牌
            if(cardTs.showCard){
                if(cardTs.playerId === dsq.data.playUid) {//是自己的牌
                    dsq.data.selectCardTs.hindTip();
                    dsq.data.selectCardTs = null;
                    return;
                }else{
                    if(cardTs.node.x === dsq.data.selectCardTs.node.x && Math.abs(cardTs.node.y - dsq.data.selectCardTs.node.y) === cardTs.node.height){
                        if((cardTs.cardId === 1 && dsq.data.selectCardTs.cardId === 8)){
                            dsq.data.selectCardTs.node.removeFromParent();
                        }else if((cardTs.cardId === 8 && dsq.data.selectCardTs.cardId === 1)){
                            dsq.data.selectCardTs.node.y = cardTs.node.y;
                            cardTs.node.removeFromParent();
                        }else if(cardTs.cardId > dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.removeFromParent();
                        }else if(cardTs.cardId < dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.y = cardTs.node.y;
                            cardTs.node.removeFromParent();
                        }else if(cardTs.cardId === dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.removeFromParent();
                            cardTs.node.removeFromParent();
                        }
                    }else if(cardTs.node.y === dsq.data.selectCardTs.node.y && Math.abs(cardTs.node.x - dsq.data.selectCardTs.node.x) === cardTs.node.width){
                        if((cardTs.cardId === 1 && dsq.data.selectCardTs.cardId === 8)){
                            dsq.data.selectCardTs.node.removeFromParent();
                        }else if((cardTs.cardId === 8 && dsq.data.selectCardTs.cardId === 1)){
                            dsq.data.selectCardTs.node.x = cardTs.node.x;
                            cardTs.node.removeFromParent();
                        }else if(cardTs.cardId > dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.removeFromParent();
                        }else if(cardTs.cardId < dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.x = cardTs.node.x;
                            cardTs.node.removeFromParent();
                        }else if(cardTs.cardId === dsq.data.selectCardTs.cardId){
                            dsq.data.selectCardTs.node.removeFromParent();
                            cardTs.node.removeFromParent();
                        }
                    }
                    if(dsq.data.selectCardTs){
                        dsq.data.selectCardTs.hindTip();
                    }
                    dsq.data.selectCardTs = null;
                }
            }else{
                dsq.data.selectCardTs.hindTip();
                dsq.data.selectCardTs = null;
                return;
            }
        }
    }

    /**
     * 提示可移动的方向箭头
     */
    moveInDirect(){
        if(!dsq.data.selectCardTs){
            return;
        }
        let curSelectCardTs = dsq.data.selectCardTs;
        let arrCards = this.node.getChildByName("cards");
        let arrDir = [];
        for(let i = 0; i < arrCards.childrenCount; i++){
            let card = arrCards.children[i];
            if(card.x === curSelectCardTs.node.x && (card.y - curSelectCardTs.node.y === card.height)){
                let cardts = card.getComponent(dsqCard);
                if(cardts.playerId !== curSelectCardTs.playerId && cardts.showCard){
                    continue;
                }
                arrDir.push(TIP_DIR.TOP-1);
            }else if(card.x === curSelectCardTs.node.x && (card.y - curSelectCardTs.node.y === -card.height)){
                let cardts = card.getComponent(dsqCard);
                if(cardts.playerId !== curSelectCardTs.playerId && cardts.showCard){
                    continue;
                }
                arrDir.push(TIP_DIR.DOWN-1);
            }else if(card.y === curSelectCardTs.node.y && (card.x - curSelectCardTs.node.x === card.width)){
                let cardts = card.getComponent(dsqCard);
                if(cardts.playerId !== curSelectCardTs.playerId && cardts.showCard){
                    continue;
                }
                arrDir.push(TIP_DIR.RIGHT-1);
            }else if(card.y === curSelectCardTs.node.y && (card.x - curSelectCardTs.node.x === -card.width)){
                let cardts = card.getComponent(dsqCard);
                if(cardts.playerId !== curSelectCardTs.playerId && cardts.showCard){
                    continue;
                }
                arrDir.push(TIP_DIR.LEFT-1);
            }
        }
        if(curSelectCardTs.node.x - curSelectCardTs.node.width/2 <= -arrCards.width/2){
            arrDir.push(TIP_DIR.LEFT-1);
        }
        if(curSelectCardTs.node.x + curSelectCardTs.node.width/2 >= arrCards.width/2){
            arrDir.push(TIP_DIR.RIGHT-1);
        }
        if(curSelectCardTs.node.y - curSelectCardTs.node.height/2 <= -arrCards.height/2){
            arrDir.push(TIP_DIR.DOWN-1);
        }
        if(curSelectCardTs.node.y + curSelectCardTs.node.height/2 >= arrCards.height/2){
            arrDir.push(TIP_DIR.TOP-1);
        }
        curSelectCardTs.showTip(arrDir);
    }
    // update (dt) {}
}
