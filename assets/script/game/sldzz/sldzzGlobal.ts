export const enum GAME_STATE {
    PREPARE = 1,
    PLAY = 2,
    DEAD = 3,
    WIN = 4
};

export const enum TOUCH_STATE {
    BLANK = 1,
    FLAG = 2,
};

export const enum TILE_STATE {
    NONE = 1,//未点击
    CLIKED = 2,//已点开
    FLAG = 3,//插旗
    DOUBT = 4,//疑问
 };

 export const enum TILE_TYPE {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    BOMB = 9
};