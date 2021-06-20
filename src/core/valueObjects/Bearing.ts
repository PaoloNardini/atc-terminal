import { Lens } from './Lens'

export interface Bearing {
    degrees: number,
}

// const user: User = {name: "Oscar", company: "Apiumhub"};

export const getBearing = (whole: Bearing): number => whole.degrees;
export const setBearing = (whole: Bearing) => (part: number): Bearing => ({...whole, degrees: part});
export const bearingLens = Lens<Bearing, number>(getBearing, setBearing);

// expect(bearingLens.get(bearing)).toBe(150);
// expect(bearing.set(bearing)(175)).toEqual({degrees: 175});





