import { Lens } from './Lens'

export interface Coordinate {
    latitude: number
    longitude: number    
}

const getLatitude = (whole: Coordinate): number => whole.latitude;
const setLatitude = (whole: Coordinate) => (part: number): Coordinate => ({...whole, latitude: part })
export const LatitudeLens = Lens<Coordinate, number>(getLatitude, setLatitude)

const getLongitude = (whole: Coordinate): number => whole.longitude;
const setLongitude = (whole: Coordinate) => (part: number): Coordinate => ({...whole, longitude: part})
export const LongitudeLens = Lens<Coordinate, number>(getLongitude, setLongitude)

export const createCoordinate = (lat: number, lon: number): Coordinate => {
    return {latitude: lat, longitude: lon}
}