export class Coordinate {
    latitude?: number
    longitude?: number    

    constructor(lat: number, lon: number) {
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            this.latitude = lat
            this.longitude = lon
        }
        else {
            throw Error(`Bad coordinates: ${lat}/${lon}`)
        }
    }


    getLatitude = (): number => {
        return this.latitude || 0
    }

    getLongitude = (): number => {
        return this.longitude || 0
    }

    setLatitude = (lat: number): Coordinate => {
        if (lat >= -90 && lat <= 90) {
            return new Coordinate(lat, this.longitude || 0)
        }
        else {
            throw Error(`Bad latitude: ${lat}`)
        }
    }

    setLongitude = (lon: number): Coordinate => {
        if (lon >= -180 && lon <= 180) {
            return new Coordinate(this.latitude || 0, lon)
        }
        else {
            throw Error(`Bad longitude: ${lon}`)
        }
    }
}
