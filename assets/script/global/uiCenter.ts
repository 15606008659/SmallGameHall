

const {ccclass, property} = cc._decorator;

@ccclass
export default class UiCenter extends cc.Component {

    curDesignSize:cc.Size = null;
    onLoad () {
        cc.game.addPersistRootNode(this.node);
        window.onresize = this.adapt.bind(this);
        this.adapt();
    }
    changeScene(sceneName){
        return new Promise((resolve, reject) => {
            cc.director.loadScene(sceneName,()=>{
                this.adapt();
                resolve();
            });
        });
    }
    adapt(){
        let canvas = cc.find('Canvas').getComponent(cc.Canvas);
        //保存原始设计分辨率，供屏幕大小变化时使用
        if(!this.curDesignSize){
            this.curDesignSize = canvas.designResolution;
        }
        let designSize = this.curDesignSize;
        let frameSize = cc.view.getFrameSize();
        let frameWidth = frameSize.width;
        let frameHeight = frameSize.height;
        let finalWidth = frameWidth;
        let finalHeight = frameHeight;

        if((frameWidth/frameHeight) > (designSize.width / designSize.height)){
            //!#zh: 是否优先将设计分辨率高度撑满视图高度。 */
            //cvs.fitHeight = true;
            //如果更长，则用定高
            finalHeight = designSize.height;
            finalWidth = finalHeight * frameWidth/frameHeight;
        }
        else{
            /*!#zh: 是否优先将设计分辨率宽度撑满视图宽度。 */
            //cvs.fitWidth = true;
            //如果更短，则用定宽
            finalWidth = designSize.width;
            finalHeight = frameHeight/frameWidth * finalWidth;
        }
        canvas.designResolution = cc.size(finalWidth, finalHeight);
        canvas.node.width = finalWidth;
        canvas.node.height = finalHeight;
        canvas.node.emit('resize');
    }
    // update (dt) {}
}
