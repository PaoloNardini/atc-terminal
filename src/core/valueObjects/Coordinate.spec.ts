import { Coordinate } from './Coordinate'

describe('Test Coordinate Lenses', () => {

    const coord: Coordinate = new Coordinate(40.55840870, 23.12348578)

    it('should return the latitude', async () => {
        const lat = coord.getLatitude()
        expect(lat).toBe(40.55840870)
    })
    it('should set the latitude', async () => {
        const newCoord: Coordinate = coord.setLatitude(41.25)
        expect (newCoord.getLatitude()).toEqual(41.25)
        expect (newCoord.getLongitude()).toEqual(23.12348578);
    })
    it('should return the longitude', async () => {
        const lon = coord.getLongitude()
        expect(lon).toBe(23.12348578)
    })
    it('should set the longitude', async () => {
        const newCoord: Coordinate = coord.setLongitude(28.15)
        expect (newCoord.getLatitude()).toEqual(40.55840870)
        expect (newCoord.getLongitude()).toEqual(28.15);
    })
    it('should throw exception', async() => {
        expect(() => {
            coord.setLatitude(95)
        }).toThrow('Bad latitude: 95')
        expect(() => {
            coord.setLongitude(-181)
        }).toThrow('Bad longitude: -181')
    })

})

