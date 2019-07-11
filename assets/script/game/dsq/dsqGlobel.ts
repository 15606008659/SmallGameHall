import DsqCenter from "./dsq"
import DsqData from "./data/dsqData"
import DsqNet from "./node/dsqNet"
import DsqRoomInfo from "./node/dsqRoomInfo"

export {dsq};
class DsqExport{
    center: DsqCenter = null;
    data: DsqData = null;
    net:DsqNet = null;
    roomInfo:DsqRoomInfo = null;
}
let dsq = new DsqExport();

export {TIP_DIR};
let TIP_DIR = cc.Enum({
    NONE:-1,
    RIGHT:-1,
    TOP:-1,
    LEFT:-1,
    DOWN:-1
});

export {GAME_RUNNING_STATE};
let GAME_RUNNING_STATE = cc.Enum({
    NONE:-1,
});