
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

export default class PropertyCenter {
    moduleObjMap:object = {};
    constructor(){

    }
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
    clearAll(){
        this.moduleObjMap = {};
    }
    clearModule(moduleName:string){
        delete this.moduleObjMap[moduleName];
    }
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
