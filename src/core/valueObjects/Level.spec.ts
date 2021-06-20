import { Level, LevelLens, AltitudeLens } from './Level'

describe('Test Level Lenses', () => {

    const level: Level = { flight_level: 110, altitude: 11000}

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
    it('should set the altitude', async () => {
        const newLevel: Level = AltitudeLens.set(level)(17500)
        expect (newLevel).toEqual({ flight_level: 175, altitude:17500});
    })
    it('should round the flight level', async () => {
        const newLevel: Level = AltitudeLens.set(level)(18423)
        expect (newLevel).toEqual({ flight_level: 184, altitude:18423});
    })
})

