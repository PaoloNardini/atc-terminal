import { Level, Altitude } from './Level'

describe('Test Level Lenses', () => {


    const level: Level = new Level(110)

    it('should return the current flight level', async () => {
        const fl = level.getFlightLevel()
        expect(fl).toBe(110)
    })
    it('should return the current altitude', async () => {
        const alt = level.getAltitude()
        expect(alt).toBe(11000)
    })
    it('should set the flight level', async () => {
        const newLevel: Level = level.setFlightLevel(160)
        expect (newLevel.getFlightLevel()).toEqual(160)
        expect (newLevel.getAltitude()).toEqual(16000)
    })
    it('should round the flight level', async () => {
        const newLevel: Level = new Level(164.5)
        expect (newLevel.getFlightLevel()).toEqual(164)
        expect (newLevel.getAltitude()).toEqual(16450)
    })

    const altitude: Altitude = new Altitude(11500)

    it('should return the current altitude', async () => {
        const alt = altitude.getAltitude()
        expect(alt).toBe(11500)
    })
    it('should return the current flight level', async () => {
        const fl = altitude.getFlightLevel()
        expect(fl).toBe(115)
    })
    it('should set the altitude', async () => {
        const newLevel: Altitude = altitude.setAltitude(17500)
        expect (newLevel.getFlightLevel()).toEqual(175)
        expect (newLevel.getAltitude()).toEqual(17500)
    })
    it('should round the flight level', async () => {
        const newLevel: Altitude = altitude.setAltitude(18423)
        expect (newLevel.getFlightLevel()).toEqual(184)
        expect (newLevel.getAltitude()).toEqual(18423)
    })
})

