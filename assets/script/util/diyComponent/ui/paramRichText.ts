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
@menu("自定义/UI组件/内容可带变量的RichText")
export default class ParamRichText extends cc.RichText {
    @property([cc.String])
    arrParam:[string] = [];

    baseString:string = '';

    onLoad(){
        this.baseString = this.string;
    }
    onEnable(){
        super.onEnable();
        if(!CC_EDITOR){
            let resultStr = this.baseString;
            for(let i =0;i<this.arrParam.length;i++){
                let param = this.arrParam[i];
                let arrName = param.split('.');
                let value = '';
                for(let j = 0;j<arrName.length;j++){
                    if(!value){
                        value = window[arrName[j]];
                    }else{
                        value = value[arrName[j]];
                    }
                }
                resultStr = resultStr.replace('['+i+']',value);
            }
            this.string = resultStr;
        }
    }
}
