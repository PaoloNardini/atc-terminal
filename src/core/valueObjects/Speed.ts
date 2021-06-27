// import { Lens } from './Lens'

export class Speed {
    speed_kts: number

    constructor(speed: number) {
        this.speed_kts = Math.floor(speed)
    }

    getSpeed = () => {
        return this.speed_kts
    }

    setSpeed = (speed: number) =>{
        return new Speed(speed)
    }
}
/*
const getSpeed = (whole: Speed): number => whole.speed_kts
const setSpeed = (whole: Speed) => (part: number): Speed => ({...whole, speed_kts: Math.floor(part)});
export const speedLens = Lens<Speed, number>(getSpeed, setSpeed);

export const createSpeed = (kts: number): Speed => {
    return {speed_kts: kts}
}
*/