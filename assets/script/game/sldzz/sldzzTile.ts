import {TILE_STATE, TILE_TYPE} from "./sldzzGlobal"

const {ccclass, property} = cc._decorator;
@ccclass
export default class sldzzTile extends cc.Component {
    @property(cc.SpriteFrame)
    picNone: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    picFlag: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    picDoubt: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    picNumList: Array<cc.SpriteFrame> = [];

    @property(cc.SpriteFrame)
    picBomb: cc.SpriteFrame = null;

    private _state: TILE_STATE = TILE_STATE.NONE;

    type: TILE_TYPE = TILE_TYPE.ZERO;

    sign: number = null; //标记

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    get state(){
        return this._state;
    }

    set state(value){
        if (value !== this._state) {
            this._state = value;
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
                    this.getComponent(cc.Sprite).spriteFrame = this.picDoubt;
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

    // update (dt) {}
}
