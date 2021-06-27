import { Speed } from './Speed'

describe('Test Speed Lenses', () => {

    const speed: Speed = new Speed(475)

    it('should return the speed', async () => {
        const kts = speed.getSpeed()
        expect(kts).toBe(475)
    })
    it('should set the speed', async () => {
        const newSpeed: Speed = speed.setSpeed(498)
        expect (newSpeed.getSpeed()).toEqual(498);
    })
    it('should round the speed', async () => {
        const newSpeed: Speed = new Speed(375.73)
        expect (newSpeed.getSpeed()).toEqual(375);
    })
})

