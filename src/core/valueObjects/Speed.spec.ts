import { createSpeed, Speed, speedLens } from './Speed'

describe('Test Speed Lenses', () => {

    const speed: Speed = createSpeed(475)

    it('should return the speed', async () => {
        const kts = speedLens.get(speed)
        expect(kts).toBe(475)
    })
    it('should set the speed', async () => {
        const newSpeed: Speed = speedLens.set(speed)(498)
        expect (newSpeed).toEqual({speed_kts: 498});
    })
    it('should round the speed', async () => {
        const newSpeed: Speed = speedLens.set(speed)(375.73)
        expect (newSpeed).toEqual({speed_kts: 375});
    })
})

