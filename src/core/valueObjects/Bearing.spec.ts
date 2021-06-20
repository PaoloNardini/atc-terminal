import { Bearing, bearingLens } from './Bearing'

describe('Test Bearing Lenses', () => {

    const radial: Bearing = { degrees: 45}

    it('should return the bearing', async () => {
        const degrees = bearingLens.get(radial)
        expect(degrees).toBe(45)
    })
    it('should set the bearing', async () => {
        const newRadial: Bearing = bearingLens.set(radial)(150)
        expect (newRadial).toEqual({degrees: 150});
    })
})

