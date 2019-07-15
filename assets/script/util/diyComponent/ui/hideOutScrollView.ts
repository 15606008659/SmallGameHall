// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const ItemType = cc.Enum({
    HEIGHT_SAME:-1,
    HEIGHT_DIFFERENCE:-1,
    WIDTH_SAME:-1,
    WIDTH_DIFFERENCE:-1,
});
export {ItemType};

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu("自定义/UI组件/隐藏显示区域外节点的ScrollView")
export default class HideOutScrollView extends cc.ScrollView {

    @property({type:ItemType})
    itemType = ItemType.HEIGHT_SAME;

    @property
    cache:number = 0;

    onLoad(){
        switch (this.itemType) {
            case ItemType.HEIGHT_SAME:
                this.node.anchorY = 1;
                this.changeListActiveHeightSame();
                this.node.on('scrolling', this.changeListActiveHeightSame.bind(this), this);
                break;
            case ItemType.HEIGHT_DIFFERENCE:
                this.node.anchorY = 1;
                this.changeListActiveHeightDifference();
                this.node.on('scrolling', this.changeListActiveHeightDifference.bind(this), this);
                break;
            case ItemType.WIDTH_SAME:
                this.node.anchorX = 1;
                this.changeListActiveHeightSame();
                this.node.on('scrolling', this.changeListActiveHeightSame.bind(this), this);
                break;
            case ItemType.WIDTH_DIFFERENCE:
                this.node.anchorX = 1;
                this.changeListActiveHeightSame();
                this.node.on('scrolling', this.changeListActiveHeightSame.bind(this), this);
                break;
        }
    }
    changeListActiveHeightSame(){
        let offset = this.getScrollOffset();
        let childrenHeight = this.content.children[0].height;
        let maxY = -offset.y + childrenHeight/2 + this.cache;
        let minY = -offset.y - this.node.height - childrenHeight/2 - this.cache;
        for(let i =0;i<this.content.childrenCount;i++){
            let childrenNode = this.content.children[i];
            let nodeY = childrenNode.y;
            if(nodeY < maxY && nodeY > minY){
                childrenNode.active = true;
            }else{
                childrenNode.active = false;
            }
        }
    }
    changeListActiveHeightDifference(){
        let offset = this.getScrollOffset();
        let topY = -offset.y;
        let bottomY = -offset.y - this.node.height;
        for(let i =0;i<this.content.childrenCount;i++){
            let childrenNode = this.content.children[i];
            let nodeY = this.content.children[i].y;
            let maxY = topY + childrenNode.height/2 + this.cache;
            let minY = bottomY - childrenNode.height/2 - this.cache;
            if(nodeY < maxY && nodeY > minY){
                childrenNode.active = true;
            }else{
                childrenNode.active = false;
            }
        }
    }
    changeListActiveWidthSame(){
        let offset = this.getScrollOffset();
        let childrenWidth = this.content.children[0].width;
        let maxX = offset.x + this.node.width + childrenWidth/2 + this.cache;
        let minX = offset.x - childrenWidth/2 - this.cache;
        for(let i =0;i<this.content.childrenCount;i++){
            let childrenNode = this.content.children[i];
            let nodeX = childrenNode.x;
            if(nodeX < maxX && nodeX > minX){
                childrenNode.active = true;
            }else{
                childrenNode.active = false;
            }
        }
    }
    changeListActiveWidthDifference() {
        let offset = this.getScrollOffset();
        let leftX = offset.x;
        let rightX = offset.x + this.node.width;
        for (let i = 0; i < this.content.childrenCount; i++) {
            let childrenNode = this.content.children[i];
            let nodeX = childrenNode.x;
            let maxX = leftX + childrenNode.width / 2 + this.cache;
            let minX = rightX - childrenNode.width / 2 - this.cache;
            if (nodeX < maxX && nodeX > minX) {
                childrenNode.active = true;
            }else{
                childrenNode.active = false;
            }
        }
    }
}
