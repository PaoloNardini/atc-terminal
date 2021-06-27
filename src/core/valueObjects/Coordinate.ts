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


    getLatitude = () => {
        return this.latitude
    }

    getLongitude = () => {
        return this.longitude
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
