export class Bearing {
    degrees?: number

    constructor(degrees: number) {
        if (degrees >= 0 && degrees <= 360) {
            this.degrees = degrees % 360
        }
        else {
            throw Error(`Invalid bearing value: ${degrees}`)
        }
    }

    getBearing(): number {
        if (this.degrees) {     
            return this.degrees 
        }
        throw Error(`Bearing not initialized`)
    }

    setBearing(degrees: number) {
        return new Bearing(degrees)
    }
}



