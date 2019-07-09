enum PACKET_TYPE {
    NONE,
    REQUEST,
    NOTICE,
}
export {PACKET_TYPE}

export class Proto{
    id:number = 0;
    packetType:PACKET_TYPE = PACKET_TYPE.NONE;
    request:string = '';
    response:string = '';
    name:string = '';
}

class ProtoMap{
    player = { //所有player协议放到city里面
        onPlayerInfo			: {id : 0x0201, packetType : PACKET_TYPE.NOTICE , response : "city.PlayerInfo"}, //玩家的信息更新
        getInfo					: {id : 0x0202, packetType :  PACKET_TYPE.REQUEST , request : null, response : "city.PlayerInfo"}, //玩家的信息
    };
}
export default new ProtoMap();
