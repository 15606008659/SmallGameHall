
class Http{
    debug:boolean = true; //设置为true会打日志
    curUrlParam:object = null;
    isHttps:boolean = false;
    constructor() {
    }
    urlDecryptFun(originStr:string):string{
        return originStr;
        // if(originStr.search('=') === -1){
        //     try {
        //         let cryptoJS = window['CryptoJS'];  //window['CryptoJS']   window['byteToHexString']  window['stringToByte'] 的定义在 crypto-js_min 文件里
        //         let key = gameConfig.HTTP_DECRYPT_KEY;
        //         key = window['byteToHexString'](window['stringToByte'](key,16));
        //         key = cryptoJS.enc.Hex.parse(key);
        //         let dec = cryptoJS.AES.decrypt(cryptoJS.format.Hex.parse(originStr), key,{mode: cryptoJS.mode.ECB, padding: cryptoJS.pad.Pkcs7});
        //         return cryptoJS.enc.Utf8.stringify(dec);
        //     }catch (e) {
        //         return '';
        //     }
        // }else{
        //     return originStr;
        // }
    }
    sendPostAsync(url:string,dataObj:object,reConCount:number = 0,dataInUrl:boolean = false):any{
        let self = this;
        return new Promise((resolve,reject) => {
            try {
                self.sendPost(url,dataObj,reConCount,dataInUrl,resolve);
            }catch (e) {
                reject(e);
            }
        });
    }

    /**
     *
     * @param url 请求地址
     * @param dataObj 数据 是一个对象
     * @param reConCount 数据是否在url中
     * @param dataInUrl 失败后重新请求的次数
     * @param callback 回调
     */
    sendPost(url:string,dataObj:object,reConCount:number = 0,dataInUrl:boolean = false,callback:Function){
        let urlHead = '';
        if(this.isHttps){
            urlHead = 'https://';
        }else{
            urlHead =  'http://';
        }
        let requestURL = urlHead + (dataInUrl?this._buildRequestUrl(url,dataObj):url);
        if(this.debug){
            console.log("post url:" + requestURL);
        }
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        xhr.onerror = this._onerror.bind(this,url,dataObj,reConCount,callback);
        xhr.onreadystatechange = this._onreadystatechange.bind(this,xhr,"post",callback);
        xhr.open("POST",requestURL, true);
        dataInUrl?xhr.send():xhr.send(JSON.stringify(dataObj));
        return xhr;
    }
    sendGetAsync(url:string,dataObj:object,reConCount:number = 0){
        let self = this;
        return new Promise((resolve,reject) => {
            try {
                self.sendGet(url,dataObj,reConCount,resolve);
            }catch (e) {
                reject(e);
            }
        });
    }

    /**
     *
     * @param url 请求地址
     * @param dataObj 数据 是一个对象
     * @param reConCount 回调
     * @param callback 失败后重新请求的次数
     */
    sendGet(url:string,dataObj:object,reConCount:number = 0,callback:Function){
        let urlHead = '';
        if(this.isHttps){
            urlHead = 'https://';
        }else{
            urlHead =  'http://';
        }
        let requestURL = urlHead + this._buildRequestUrl(url,dataObj);
        if(this.debug){
            console.log("post url:" + requestURL);
        }
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        xhr.onerror = this._onerror.bind(this,url,dataObj,reConCount,callback);
        xhr.onreadystatechange = this._onreadystatechange.bind(this,xhr,"get",callback);
        xhr.open("GET",requestURL, true);
        xhr.send();
        return xhr;
    }
    /**
     * 当前网址获取url 中的参数
     * @param paramName 参数名
     */
    getCurUrlParam(paramName:string):string {
        if(!this.curUrlParam){
            this.curUrlParam = {};
            let url = location.href; //取得整个地址栏
            let indexQuestion = url.indexOf("?");
            let paramInUrl = '';
            if(this.urlDecryptFun){
                paramInUrl = this.urlDecryptFun(url.substr(indexQuestion+1)); //取得所有参数
            }else{
                paramInUrl = url.substr(indexQuestion+1); //取得所有参数
            }
            let arrParam = paramInUrl.split("&"); //各个参数放到数组里
            for(let i = 0;i < arrParam.length;i++){
                let indexEqual = arrParam[i].indexOf("=");
                if(indexEqual > 0){
                    let name = arrParam[i].substring(0,indexEqual);
                    let value = arrParam[i].substr(indexEqual+1);
                    this.curUrlParam[name] = value;
                }
            }
        }
        if(this.curUrlParam[paramName]){
            return this.curUrlParam[paramName];
        }else{
            console.log('没有在url中找到 参数'+paramName);
            return '';
        }
    }
    _buildRequestUrl(url:string,paramObj:object):string{
        if(!paramObj){
            return url;
        }
        let paramStr = "?";
        for(let key in paramObj){
            if(paramStr !== "?"){
                paramStr += "&";
            }
            paramStr += key + "=" + paramObj[key];
        }
        return (url + encodeURI(paramStr));
    }
    _onerror(url:string,dataObj:object,reConCount:number = 0,callback:Function){
        if(reConCount > 0){
            this.sendGet(url,dataObj,--reConCount,callback);
        }
    }
    _onreadystatechange(xhr:XMLHttpRequest,method:string,callback:Function){
        if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
            if(this.debug){
                console.log('==== '+method+' callback data ====\n'+ xhr.responseText);
            }
            try {
                if(callback){
                    callback(JSON.parse(xhr.responseText));
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export default new Http();