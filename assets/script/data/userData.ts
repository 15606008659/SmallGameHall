import {SEX} from "./commonEnum";

export default class UserData {
    set uid(uid:number){
        this['_uid'] = uid;
        console.log('设置玩家 uid = '+uid);
    }
    get uid():number{
        return this['_uid'];
    }
    nickName:string = '';
    sex:SEX = SEX.UNKNOWN;
    headPic:cc.SpriteFrame = null;
}
