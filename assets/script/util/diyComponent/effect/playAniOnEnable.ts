// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import menu = cc._decorator.menu;

const {ccclass, property} = cc._decorator;

@ccclass
@menu("自定义/动作特效/显示的时候播放默认动画")
export default class PlayAniOnEnable extends cc.Component {

    _animation:cc.Animation = null;

    onLoad () {
        this._animation = this.node.getComponent(cc.Animation);
    }
    onEnable(){
        this._animation.play();
    }
}
