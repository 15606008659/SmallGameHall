import { TILE_TYPE, TILE_STATE } from "./sldzzGlobal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class sldzzData extends cc.Component {
    playDataList: Array<playDt> = [];
    originalTileDtList: Array<tileDt> = [];
    nowTileDtList: Array<tileDt> = [];
    
    init(){
        this.playDataList = [];
        for(let i = 0; i < 6; i ++){
            let newDt = new playDt();
            newDt.seatNum = i + 1;
            this.playDataList.push(newDt);
        }
    }
}

export class playDt {
    seatNum: number = 0;
    isSelected: boolean = false;
    selectType: number = 0;
    selectSign: number = 0;
}

export class tileDt{
    state: TILE_STATE = TILE_STATE.NONE;
    type: TILE_TYPE = TILE_TYPE.ZERO;
    doubtDataList: Array<any> = [];
}
