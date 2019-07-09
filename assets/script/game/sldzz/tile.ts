const enum STATE {
    NONE = -1,//未点击
    CLIKED = -1,//已点开
    FLAG =-1,//插旗
    DOUBT = -1,//疑问
 };

const enum TYPE {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    BOMB = 9
};

const {ccclass, property} = cc._decorator;
@ccclass
export default class tile extends cc.Component {
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

    private _state: STATE = STATE.NONE;

    type: TYPE = TYPE.ZERO;

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
                case STATE.NONE:
                    this.getComponent(cc.Sprite).spriteFrame = this.picNone;
                    break;
                case STATE.CLIKED:
                    this.showType();
                    break;
                case STATE.FLAG:
                    this.getComponent(cc.Sprite).spriteFrame = this.picFlag;
                    break;
                case STATE.DOUBT:
                    this.getComponent(cc.Sprite).spriteFrame = this.picDoubt;
                    break;
                default:break;
            }
        }
    }

    showType() {
        switch(this.type){
            case TYPE.ZERO:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[0];
                break;
            case TYPE.ONE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[1];
                break;
            case TYPE.TWO:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[2];
                break;
            case TYPE.THREE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[3];
                break;
            case TYPE.FOUR:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[4];
                break;
            case TYPE.FIVE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[5];
                break;
            case TYPE.SIX:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[6];
                break;
            case TYPE.SEVEN:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[7];
                break;
            case TYPE.EIGHT:
                this.getComponent(cc.Sprite).spriteFrame = this.picNumList[8];
                break;
            case TYPE.BOMB:
                this.getComponent(cc.Sprite).spriteFrame = this.picBomb;
                break;
            default:break;
        }
    }

    // update (dt) {}
}
