export enum PACKET_TYPE {
    NONE,
    REQUEST,
    NOTICE,
}

export class Proto{
    id:number = 0;
    protoType:PACKET_TYPE = PACKET_TYPE.NONE;
    request:string = '';
    response:string = '';
    name:string = '';
    module:string = '';
}

class ProtoMap{
    system = {
        module:'system',
        heartbeat :{id:0x00000001,protoType:PACKET_TYPE.REQUEST , request : null, response :null},
    };
    player = {
        module    :"player",
        login     :{id : 0x00010001, protoType : 1, request : "player.LoginR", response : "player.LoginA"},
        logout    :{id : 0x00010002, protoType : 1, request : "int64", response : null},
    };
}
export default new ProtoMap();
