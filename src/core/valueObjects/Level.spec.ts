import { Level, LevelLens, AltitudeLens, createFlightLevel, createAltitude } from './Level'

describe('Test Level Lenses', () => {


    const level: Level = createFlightLevel(110)

    it('should return the current flight level', async () => {
        const fl = LevelLens.get(level)
        expect(fl).toBe(110)
    })
    it('should return the current altitude', async () => {
        const alt = AltitudeLens.get(level)
        expect(alt).toBe(11000)
    })
    it('should set the flight level', async () => {
        const newLevel: Level = LevelLens.set(level)(160)
        expect (newLevel).toEqual({ flight_level: 160, altitude:16000});
    })
    it('should round the flight level', async () => {
        const newLevel: Level = LevelLens.set(level)(164.5)
        expect (newLevel).toEqual({ flight_level: 164, altitude:16450});
    })

    const altitude: Level = createAltitude(11500)

    it('should return the current altitude', async () => {
        const alt = AltitudeLens.get(altitude)
        expect(alt).toBe(11500)
    })
    it('should return the current flight level', async () => {
        const fl = LevelLens.get(altitude)
        expect(fl).toBe(115)
    })
    it('should set the altitude', async () => {
        const newLevel: Level = AltitudeLens.set(altitude)(17500)
        expect (newLevel).toEqual({ flight_level: 175, altitude:17500});
    })
    it('should round the flight level', async () => {
        const newLevel: Level = AltitudeLens.set(altitude)(18423)
        expect (newLevel).toEqual({ flight_level: 184, altitude:18423});
    })
})

