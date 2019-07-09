//import roomConfig from "../../datas/roomConfig";
let roomConfig = {};
import random from "./random";

class Other {
    constructor() {

    }
    //time:时间 单位毫秒
    delayTime(component:cc.Component,time:number){
        return new Promise(resolve => {
            component.isValid && component.scheduleOnce(resolve,time/1000);
        })
    }
    getRoomConfigByRate(gameId:number,rate:number){
        let oneGameConfig = null;
        for(let key in roomConfig){
            if(roomConfig[key].ID === gameId){
                oneGameConfig = roomConfig[key];
                break;
            }
        }
        for(let j=0;j<oneGameConfig.ROOM.length;j++) {
            let oneConfig = oneGameConfig.ROOM[j];
            if(Math.round(oneConfig.INFO.BASE_SCORE * 100) === rate) {
                return oneConfig;
            }
        }
    }
    getGameSimpleNameByGameId(gameId:number){
        for(let key in roomConfig){
            if(roomConfig[key].ID === gameId){
                return key.toLocaleLowerCase();
            }
        }
        return '';
    }
    getRoomConfigByGameSimpleName(gameSimpleName:string){
        let bigGameSimpleName = gameSimpleName.toUpperCase();
        if(roomConfig.hasOwnProperty(bigGameSimpleName)){
            return roomConfig[bigGameSimpleName];
        }
        console.error('没有找到相应的配置 gameSimpleName = ' + gameSimpleName);
        return null;
    }
    getValueIndexInArr(arr:Array<any>,value:any,key?:string):number{
        if(key){
            for(let i =0;i<arr.length;i++){
                if(arr[i][key] === value){
                    return i;
                }
            }
        }else{
            for(let i =0;i<arr.length;i++){
                if(arr[i] === value){
                    return i;
                }
            }
        }
        return -1;
    }
    getRoomConfigByGameIdAndType(gameId:number,roomType:number):any{
        let oneGameConfig = null;
        for(let key in roomConfig){
            if(roomConfig[key].ID === gameId){
                oneGameConfig = roomConfig[key];
                break;
            }
        }
        for(let j=0;j<oneGameConfig.ROOM.length;j++) {
            let oneConfig = oneGameConfig.ROOM[j];
            if(Math.round(oneConfig.TYPE) === roomType) {
                return oneConfig;
            }
        }
        console.error('no find roomConfig gameId = '+gameId+' type = '+roomType);
    }
    getRoomConfigByGameId(gameId:number):any{
        let oneGameConfig = null;
        for(let key in roomConfig){
            if(roomConfig[key].ID === gameId){
                oneGameConfig = roomConfig[key];
                break;
            }
        }
        return oneGameConfig;
    }
    changeNodeActive(active:boolean,...arrNode:Array<cc.Node>){
        this.changeArrNodeActive(active,arrNode);
    }
    changeArrNodeActive(active:boolean,arrNode:Array<cc.Node>){
        for(let i =0;i<arrNode.length;i++){
            arrNode[i].active = active;
        }
    }
    getPosInWorld(node:cc.Node):cc.Vec2{
        return node.getParent().convertToWorldSpaceAR(node.position);
    }
    /*
        posNode:需要转换的节点
        goalNode:目标坐标系 的节点
     */
    getPosInNode(posNode:cc.Node,goalNode:cc.Node):cc.Vec2{
        try{
            return goalNode.convertToNodeSpaceAR(this.getPosInWorld(posNode));
        }catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param arr 目标数组
     * @param start 开始索引值 包括这个值
     * @param end 结束索引值 不包括这个值
     * @param sortFun 排序函数
     */
    sortInRange(arr:Array<any>,start:number,end:number = arr.length,sortFun:(a:any,b:any) => number){
        let sortArr = arr.slice(start,end);
        sortArr.sort(sortFun);
        for(let i =0;i<sortArr.length;i++){
            arr[i+start] = sortArr[i];
        }
    }

    /**
     * @param component 在这个组件有效的情况下才会调用 函数
     * @param minTime 单位秒  最小时间
     * @param maxTime 单位秒  最大时间
     * @param arrFunObj = [
     *              {
     *                  rate:0.1,
     *                  fun:function(){};  //调用的函数
     *              },
     *              {
     *                  rate:0.2,
     *                  fun:function(){};  //调用的函数
     *              },
     *         ]
     */
    randomRunFunInTime(component:cc.Component,minTime:number,maxTime:number,arrFunObj:Array<any>){
        let randomTime = 0;
        maxTime -= 0.1;
        if(minTime < maxTime){
            randomTime = random.getNum(minTime,maxTime);
        }
        let allRate = 0;
        for(let i =0 ; i<arrFunObj.length;i++){
            allRate+= arrFunObj[i].rate;
        }
        if(allRate > 1){
            console.error('总比率设置错误，大于1');
        }

        let randomRate = Math.random();
        let curRate = 0;
        let fun = null;
        for(let i=0;i<arrFunObj.length;i++){
            curRate += arrFunObj[i].rate;
            if(randomRate < curRate){
                fun = arrFunObj[i].fun;
                break;
            }
        }
        if(fun){
            cc.timerMgr.addOnceTimer(randomTime * 1000,function(){
                if(component.isValid){
                    fun();
                }
            });
        }
    }
    randomRunFunInTimeByWeight(component:cc.Component,minTime:number,maxTime:number,arrFunObj:Array<any>){
        let randomTime = 0;
        maxTime -= 0.1;
        if(minTime < maxTime){
            randomTime = random.getNum(minTime,maxTime);
        }
        let allRate = 0;
        for(let i =0 ; i<arrFunObj.length;i++){
            allRate+= arrFunObj[i].rate;
        }
        let randomRate = random.getNum(0,allRate);
        let curRate = 0;
        let fun = null;
        for(let i=0;i<arrFunObj.length;i++){
            curRate += arrFunObj[i].rate;
            if(randomRate < curRate){
                fun = arrFunObj[i].fun;
                break;
            }
        }
        if(fun){
            cc.timerMgr.addOnceTimer(randomTime * 1000,function(){
                if(component.isValid){
                    fun();
                }
            });
        }
    }
    deepClone(obj:object):object{
        let objClone = Array.isArray(obj)?[]:{};
        if(obj && typeof obj==="object"){
            for(let key in obj){
                if(obj.hasOwnProperty(key)){
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if(obj[key]&&typeof obj[key] ==="object"){
                        objClone[key] = this.deepClone(obj[key]);
                    }else{
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    }

    /**
     * 数组乱序 会更改原数组!!!!!!!!
     * @param originArr
     */
    arrOutOfOrder(originArr:Array<any>):Array<any>{
        let resultArr = [];
        while (originArr.length > 0) {
            let index = Math.floor(Math.random() * originArr.length);
            resultArr.push(originArr[index]);
            originArr.splice(index, 1);
        }
        return resultArr;
    }
    arrSum(arr1:Array<any>,arr2:Array<any>):Array<any>{
        let arrSum = [];
        if(arr1.length && (arr1[0] instanceof Array)){
            for(let i =0;i<arr1.length;i++){
                arrSum.push(this.arrSum(arr1[i],arr2[i]));
            }
        }else{
            for(let i =0;i<arr1.length;i++){
                arrSum.push(arr1[i] + arr2[i]);
            }
        }
        return arrSum;
    }
}


export default new Other();