import {TILE_STATE, TILE_TYPE} from "./sldzzGlobal"
import sldzzPlayer from "./sldzzplayer";

const {ccclass, property} = cc._decorator;
@ccclass
export default class sldzzTile extends cc.Component {
    @property(cc.SpriteFrame)
    picNone: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    picFlag: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    picBomb: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    picNumList: Array<cc.SpriteFrame> = [];

    @property(cc.Prefab)
    signIconPfb: cc.Prefab = null;

    doubtNode: cc.Node = null;

    doubtDataList: Array<any> = [];

    private _state: TILE_STATE = TILE_STATE.NONE;

    type: TILE_TYPE = TILE_TYPE.ZERO;

    sign: number = null; //标记

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.doubtNode = this.node.getChildByName("doubtNode");
    }

    start () {

    }

    get state(){
        return this._state;
    }

    set state(value){
        if (value !== this._state) {
            this._state = value;
            this.doubtNode.active = false;
            switch(this._state) {
                case TILE_STATE.NONE:
                    this.getComponent(cc.Sprite).spriteFrame = this.picNone;
                    break;
                case TILE_STATE.CLIKED:
                    this.showType();
                    break;
                case TILE_STATE.FLAG:
                    this.getComponent(cc.Sprite).spriteFrame = this.picFlag;
                    break;
                case TILE_STATE.DOUBT:
                    this.showDoubt();
                    break;
                default:break;
            }
        }
    }

    showType() {
        switch(this.type){
            case TILE_TYPE.ZERO:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[0];
                break;
            case TILE_TYPE.ONE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[1];
                break;
            case TILE_TYPE.TWO:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[2];
                break;
            case TILE_TYPE.THREE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[3];
                break;
            case TILE_TYPE.FOUR:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[4];
                break;
            case TILE_TYPE.FIVE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[5];
                break;
            case TILE_TYPE.SIX:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[6];
                break;
            case TILE_TYPE.SEVEN:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[7];
                break;
            case TILE_TYPE.EIGHT:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[8];
                break;
            case TILE_TYPE.BOMB:
                this.getComponent(cc.Sprite).spriteFrame = this.picBomb;
                break;
            default:break;
        }
    }

    showDoubt(){
        this.doubtNode.removeAllChildren();
        this.doubtNode.active = true;

        for(let i = 0; i < this.doubtDataList.length; i ++){
            let doubtData = this.doubtDataList[i];
            let signIcon = cc.instantiate(this.signIconPfb);
            signIcon.getComponent(cc.Sprite).spriteFrame = doubtData["pic"];
            signIcon.getChildByName("flag").active = doubtData["isFlag"];
            doubtData["signIcon"] = signIcon;
            this.doubtNode.addChild(signIcon);
        }

        switch(this.doubtDataList.length){
            case 0:
                this.doubtNode.active = false;
                break;
            case 1:
                break;
            case 2:
                this.doubtNode.children.forEach(element => {
                    element.setScale(0.5, 0.5);
                });
                this.doubtNode.children[0].setAnchorPoint(1, 0);
                this.doubtNode.children[1].setAnchorPoint(0, 1);
                break;
            case 3:
                this.doubtNode.children.forEach(element => {
                    element.setScale(0.5, 0.5);
                });
                this.doubtNode.children[0].setAnchorPoint(1, 0);
                this.doubtNode.children[1].setAnchorPoint(0, 0);
                this.doubtNode.children[2].setAnchorPoint(0.5, 1);
                break;
            case 4:
                this.doubtNode.children.forEach(element => {
                    element.setScale(0.5, 0.5);
                });
                this.doubtNode.children[0].setAnchorPoint(1, 0);
                this.doubtNode.children[1].setAnchorPoint(0, 0);
                this.doubtNode.children[2].setAnchorPoint(0, 1);
                this.doubtNode.children[3].setAnchorPoint(1, 1);
                break;
            case 5:
                this.doubtNode.children.forEach(element => {
                    element.setScale(0.3, 0.3);
                });
                this.doubtNode.children[0].setAnchorPoint(1, 0);
                this.doubtNode.children[1].setAnchorPoint(0, 0);
                this.doubtNode.children[2].setAnchorPoint(0, 1);
                this.doubtNode.children[3].setAnchorPoint(1, 1);
                break;
            default:
                this.doubtNode.active = false;
        }
    }

    // update (dt) {}
}
