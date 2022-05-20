import { Bearing } from './Bearing'

describe('Test Bearing', () => {

    const radial: Bearing = new Bearing(45)

    it('should return the bearing', async () => {
        const degrees: number = radial.getBearing()
        expect(degrees).toBe(45)
    })
    it('should set the bearing', async () => {
        const newRadial: Bearing = radial.setBearing(150)
        expect (newRadial).toEqual({degrees: 150});
    })
    it('should convert 360 to 0', async () => {
        const newRadial: Bearing = radial.setBearing(360)
        expect (newRadial).toEqual({degrees: 0});
    })
    it('should throw exception', async() => {
        expect(() => {
            radial.setBearing(361)
        }).toThrow('Invalid bearing value: 361')
        expect(() => {
            radial.setBearing(-1)
        }).toThrow('Invalid bearing value: -1')
    })
})

