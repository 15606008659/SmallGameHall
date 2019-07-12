
const {ccclass, property} = cc._decorator;

@ccclass
export default class sldzzPlayer extends cc.Component {
    @property(cc.Sprite)
    headSp: cc.Sprite = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(cc.Label)
    scoreLab: cc.Label = null;

    @property
    seatNum: number = 0;

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
