import { Lens } from './Lens'

export interface Bearing {
    degrees: number,
}

const getBearing = (whole: Bearing): number => whole.degrees;
const setBearing = (whole: Bearing) => (part: number): Bearing => ({...whole, degrees: part});
export const bearingLens = Lens<Bearing, number>(getBearing, setBearing);





