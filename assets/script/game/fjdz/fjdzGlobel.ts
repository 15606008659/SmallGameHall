import FjdzCenter from "./fjdz"
import FjdzData from "./data/fjdzData"
import FjdzNet from "./node/fjdzNet"
import FjdzRoomInfo from "./node/fjdzRoomInfo"

export {fjdz};
class FjdzExport{
    center: FjdzCenter = null;
    data: FjdzData = null;
    net:FjdzNet = null;
    roomInfo:FjdzRoomInfo = null;
}
let fjdz = new FjdzExport();

export {BULLET_TYPE};
let BULLET_TYPE = cc.Enum({
    NONE:-1,
    ONE_BULLET:-1,
    TWO_BULLET:-1,
});

