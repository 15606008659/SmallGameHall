// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property,menu} = cc._decorator;

@ccclass
@menu("自定义/动作特效/一定时间后隐藏节点")
export default class HideNodeInTime extends cc.Component {

    @property
    hideTime:number = 5;
    @property
    maxOpacity:number = 255;
    @property
    minOpacity:number = 0;

    _rateOpacity:number = 0;
    _timer:number = 0;
    onLoad(){
        this._rateOpacity = this.maxOpacity - this.minOpacity;
    }
    onEnable(){
        this._timer = 0;
        this.node.opacity = this.maxOpacity;
    }
    show(){
        this._timer = 0;
        this.node.opacity = this.maxOpacity;
    }
    update (dt) {
        this._timer += dt;
        if(this._timer > this.hideTime){
            this.node.opacity = this.maxOpacity;
            this.node.active = false;
        }else{
            this.node.opacity = this._rateOpacity * ((this.hideTime-this._timer)/this.hideTime) + this.minOpacity;
        }
    }
}
