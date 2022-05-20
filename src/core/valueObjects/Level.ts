export class Level {
    flight_level: number = 0
    altitude: number = 0

    constructor(fl: number) {
        this.flight_level = Math.floor(fl)
        this.altitude =  Math.floor(fl * 100)
    }

    getFlightLevel = () => {
        return this.flight_level || 0
    }

    getAltitude = () => {
        return this.altitude
    }

    setFlightLevel = (fl: number) => {
        return new Level(fl)
    }

    setAltitude = (feet: number) => {
        const newLevel = new Level(Math.floor(feet / 100))
        newLevel.altitude = feet
        return newLevel
    }
}

export class Altitude extends Level {
    constructor(feet: number) {
        super(Math.floor(feet / 100))
    }
}
