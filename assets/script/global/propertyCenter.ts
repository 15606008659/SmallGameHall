
class LisItem{
    obj:object = null;
    arrSetValueKey:Array<string> = [];
    constructor(obj:object,arrSetValueKey:Array<string>){
        this.obj = obj;
        this.arrSetValueKey = arrSetValueKey;
    }
}

class LisObj {
    arrLisItem:Array<LisItem> = [];
}

class ModuleObj {
    name:string = '';
    lisObjMap:object = {};
    emitValueMap:object = {};
    constructor(name:string){
        this.name = name;
    }
}
export class PropertyCenter {
    moduleObjMap:object = {};
    arrNoBindLis:Array<LisItem> = [];
    constructor(){

    }
    /**
     * 广播属性
     * @param moduleName  模块名
     * @param saveKey   存储属性的key值
     * @param value    属性的的值
     *
     * demo: emitProperty('gameCenter','userName','自己的名字');
     */
    emitProperty(moduleName:string,saveKey:string | number,value) {
        let moduleObj:ModuleObj = this.moduleObjMap[moduleName];
        if (!moduleObj) {
            moduleObj = new ModuleObj(moduleName);
            this.moduleObjMap[moduleName] = moduleObj;
        }
        moduleObj.emitValueMap[saveKey] = value;
        let lisObj:LisObj = moduleObj.lisObjMap[saveKey];
        if(lisObj){
            for(let i =0;i<lisObj.arrLisItem.length;i++){
                this._changeValue(lisObj.arrLisItem[i],value);
            }
        }
    }
    /**
     * 监听属性广播
     * @param moduleName 模块名
     * @param saveKey   存储属性的key值
     * @param setValueObj 监听到广播时,需要更新值的 对象
     * @param arrSetValueKey 监听到广播时,需要更新值的 对象属性名
     *
     * demo: addLisProperty('gameCenter','userName',label,'string');  label为某个Label组件
     */
    addLisProperty(moduleName:string,saveKey:string | number,setValueObj:object,...arrSetValueKey:Array<string>){
        let moduleObj:ModuleObj = this.moduleObjMap[moduleName];
        if (!moduleObj) {
            moduleObj = new ModuleObj(moduleName);
            this.moduleObjMap[moduleName] = moduleObj;
        }
        let lisObj:LisObj = moduleObj.lisObjMap[saveKey];
        if(!lisObj){
            lisObj = new LisObj();
            moduleObj.lisObjMap[saveKey] = lisObj;
        }
        let lisItem = new LisItem(setValueObj,arrSetValueKey);
        let curValue = moduleObj.emitValueMap[saveKey];
        if(typeof curValue !== 'undefined'){
            this._changeValue(lisItem,curValue);
        }
        lisObj.arrLisItem.push(lisItem);
    }

    /**
     * 移除监听
     * @param moduleName 模块名
     * @param saveKey 存储属性的key值
     * @param setValueObj 监听到广播时,需要更新值的 对象
     */
    removeLis(moduleName:string,saveKey:string,setValueObj:object){
        let moduleObj:ModuleObj = this.moduleObjMap[moduleName];
        if (!moduleObj) {
            moduleObj = new ModuleObj(moduleName);
            this.moduleObjMap[moduleName] = moduleObj;
        }
        let lisObj:LisObj = moduleObj.lisObjMap[saveKey];
        if(lisObj){
            let arrListItem = lisObj.arrLisItem;
            for(let i =0;i<arrListItem.length;i++){
                if(arrListItem[i].obj === setValueObj){
                    arrListItem.splice(i,1);
                    return;
                }
            }
        }
    }

    /**
     * 清空所有监听和 存储的数据
     */
    clearAll(){
        this.moduleObjMap = {};
    }

    /**
     * 清空一个模块的 监听和 存储的数据
     * @param moduleName 模块名
     */
    clearModule(moduleName:string){
        delete this.moduleObjMap[moduleName];
    }

    /**
     * 清空一个模块特定saveKey 的 监听和 存储的数据
     * @param moduleName 模块名
     * @param saveKey 存储属性的key值
     */
    clearSaveKey(moduleName:string,saveKey:string){
        let moduleObj:ModuleObj = this.moduleObjMap[moduleName];
        if (moduleObj) {
            delete moduleObj.emitValueMap[saveKey];
            delete moduleObj.lisObjMap[saveKey];
        }
    }
    _changeValue(lisItem:LisItem,value:any){
        let obj = lisItem.obj;
        let arrSetValueKey = lisItem.arrSetValueKey;
        let curObj = obj;
        for(let j =0;j<arrSetValueKey.length;j++){
            if(j !== arrSetValueKey.length-1){
                curObj = curObj[arrSetValueKey[j]];
            }else{
                curObj[arrSetValueKey[j]] = value;
            }
        }
    }
}

let propertyCenter = new PropertyCenter();

/** 类装饰器
 * 如果要使用 下方的lis装饰器，则这个装饰器必须要使用
 * @param constructor
 *  demo:
 *      @inPropertyCenter
 */
export function inPropertyCenter<T extends {new(...args:any[]):{}}>(constructor:T) {
    if(constructor.onLoad){
        return class inPropertyCenter extends constructor {
            onLoad(){
                for(let i =0;i<propertyCenter.arrNoBindLis.length;i++){
                    propertyCenter.arrNoBindLis[i].obj = this;
                }
                super.onLoad();
            }
        }
    }else{
        return class inPropertyCenter extends constructor {
            constructor(t1?,t2?,t3?,t4?,t5?,t6?,t7?){
                super(t1,t2,t3,t4,t5,t6,t7);
                for(let i =0;i<propertyCenter.arrNoBindLis.length;i++){
                    propertyCenter.arrNoBindLis[i].obj = this;
                }
            }
        }
    }
}

/** 属性装饰器
 * 使用装饰器 广播属性 属性必须写成get,set的形式
 * @param moduleName  模块名
 * @param saveKey   存储属性的key值
 * @param useObj  是否使用this对象获取 key值
 *
 * demo:
 *      @emit('gameCenter','userName')
 */
export function emit(moduleName:string,saveKey:string | number,useObj:boolean = false) {
    return (target,targetName,dec)=>{
        if(dec){
            let oldSet = dec.set;
            dec.set = function (value) {
                let key = useObj?this[saveKey]:saveKey;
                let moduleObj:ModuleObj = propertyCenter.moduleObjMap[moduleName];
                if (!moduleObj) {
                    moduleObj = new ModuleObj(moduleName);
                    propertyCenter.moduleObjMap[moduleName] = moduleObj;
                }
                moduleObj.emitValueMap[key] = value;
                let lisObj:LisObj = moduleObj.lisObjMap[key];
                if(lisObj){
                    for(let i =0;i<lisObj.arrLisItem.length;i++){
                        propertyCenter._changeValue(lisObj.arrLisItem[i],value);
                    }
                }
                oldSet.call(this,value);
            };
        }
    }
}

/** 属性装饰器
 * 使用装饰器 监听属性广播，需要配合 inPropertyCenter 使用
 * @param moduleName 模块名
 * @param saveKey   存储属性的key值
 * @param arrSetValueKey 监听到广播时,需要更新值的 对象属性名
 *
 * demo:
 *   @property(cc.Label)
 *   @lis('gameCenter','userName','string')
 *   testLabel:cc.Label = null;
 */
export function lis(moduleName:string,saveKey:string | number,...arrSetValueKey:Array<string>){
    return (target,targetName)=>{
        let moduleObj:ModuleObj = propertyCenter.moduleObjMap[moduleName];
        if (!moduleObj) {
            moduleObj = new ModuleObj(moduleName);
            propertyCenter.moduleObjMap[moduleName] = moduleObj;
        }
        let lisObj:LisObj = moduleObj.lisObjMap[saveKey];
        if(!lisObj){
            lisObj = new LisObj();
            moduleObj.lisObjMap[saveKey] = lisObj;
        }
        arrSetValueKey.unshift(targetName);
        let lisItem = new LisItem(null,arrSetValueKey);
        let curValue = moduleObj.emitValueMap[saveKey];
        if(typeof curValue !== 'undefined'){
            propertyCenter._changeValue(lisItem,curValue);
        }
        lisObj.arrLisItem.push(lisItem);
        propertyCenter.arrNoBindLis.push(lisItem);
    };
}

export default propertyCenter;

