import {SEX} from "./commonEnum";

export default class UserData {
    set uid(uid:number){
        this['_uid'] = uid;
        console.log('设置玩家 uid = '+uid);
    }
    get uid():number{
        return this['_uid'];
    }
    set nickName(nickName:string){
        this['_nickName'] = nickName;
    }
    get nickName():string{
        if(typeof this['_nickName'] === 'undefined'){
            this['_nickName'] = '';
        }
        return this['_nickName'];
    }
    sex:SEX = SEX.UNKNOWN;
    headPicSpriteFrame:cc.SpriteFrame = null;
}
