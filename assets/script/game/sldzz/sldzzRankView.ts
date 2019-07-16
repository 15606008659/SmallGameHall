import sldzzData from "./sldzzData";
import { sldzz } from "./sldzzGlobal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class sldzzRankView extends cc.Component {

    @property(cc.Prefab)
    linePfb: cc.Prefab = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    showRank(){
        this.node.active = true;
        sldzz.data.playDataList.sort((a, b) => {
            return b.score - a.score;
        });

        let rankNum = 0;
        for(let i = 0; i < sldzz.data.playDataList.length; i ++){
            let playerDt = sldzz.data.playDataList[i];
            let player = sldzz.game.getPlayerBySeatNum(playerDt.seatNum);

            let rankLine = cc.instantiate(this.linePfb);
            rankLine.getChildByName("name").getComponent(cc.Label).string = player.nameLab.string;
            rankLine.getChildByName("head").getComponent(cc.Sprite).spriteFrame = player.headSp.spriteFrame;
            rankLine.getChildByName("score").getComponent(cc.Label).string = playerDt.score.toString();
            
            if(i == 0 || playerDt.score != sldzz.data.playDataList[i - 1].score){
                rankNum ++; 
            }

            rankLine.getChildByName("No").getComponent(cc.Label).string = rankNum.toString();
            this.contentNode.addChild(rankLine);
        }
    }

    // update (dt) {}
}
