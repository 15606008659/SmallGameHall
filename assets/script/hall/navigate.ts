// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import EventTouch = cc.Event.EventTouch;

const {ccclass, property} = cc._decorator;

@ccclass('NavigateItem')
class NavigateItem {
    @property(cc.Node)
    iconNode:cc.Node = null;
    @property(cc.Node)
    contentNode:cc.Node = null;
}

@ccclass
export default class Navigate extends cc.Component {

    @property([NavigateItem])
    arrNavigateItem:Array<NavigateItem> = [];

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START,this.onTouchNavigate.bind(this));
        this.onItemTouch(this.arrNavigateItem[0]);
    }
    onItemTouch(touchItem:NavigateItem){
        for(let i =0;i<this.arrNavigateItem.length;i++){
            let item = this.arrNavigateItem[i];
            item.contentNode.active = false;
        }
        touchItem.contentNode.active = true;
    }
    onTouchNavigate(event:EventTouch){
        let touchInNodePos = this.node.convertToNodeSpaceAR(event.getLocation());
        for(let i =0;i<this.arrNavigateItem.length;i++){
            let item = this.arrNavigateItem[i];
            if(item.iconNode.getBoundingBox().contains(touchInNodePos)){
                this.onItemTouch(item);
                break;
            }
        }
    }
    start () {

    }
}
