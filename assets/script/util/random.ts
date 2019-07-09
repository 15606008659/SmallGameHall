class Random {
    seed:number = 0;
    /**
     *
     * @param min 最小值，有包括
     * @param max 最大值，不包括
     */
    getNum(min:number,max:number):number{
        return Math.random() * (max - min) + min;
    }
    /**
     *
     * @param min 最小值，有包括
     * @param max 最大值，不包括
     */
    getInt(min:number,max:number):number{
        return Math.floor(Math.random() * (max - min) + min);
    }
    randomNumberBySeed(min = 0,max = 1 ,seed = this.seed) :number{
        let newSeed = (seed * 9301 + 49297 ) % 233280;
        let value = newSeed / ( 233280.0 );
        this.seed = newSeed;
        return value * (max - min + 1);
    };
    randomIntBySeed(min = 0,max = 1 ,seed = this.seed) :number{
        let newSeed = (seed * 9301 + 49297 ) % 233280;
        let value = newSeed / ( 233280.0 );
        this.seed = newSeed;
        return Math.ceil(value * (max - min + 1)) - 1;
    };
}

export default new Random();