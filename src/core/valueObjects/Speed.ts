import { Lens } from './Lens'

export interface Speed {
    speed_kts: number
}

const getSpeed = (whole: Speed): number => whole.speed_kts
const setSpeed = (whole: Speed) => (part: number): Speed => ({...whole, speed_kts: Math.floor(part)});
export const speedLens = Lens<Speed, number>(getSpeed, setSpeed);

export const createSpeed = (kts: number): Speed => {
    return {speed_kts: kts}
}
