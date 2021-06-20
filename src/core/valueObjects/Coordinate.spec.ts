import { Coordinate, createCoordinate, LatitudeLens, LongitudeLens } from './Coordinate'

describe('Test Coordinate Lenses', () => {

    const coord: Coordinate = createCoordinate(40.55840870, 23.12348578)

    it('should return the latitude', async () => {
        const lat = LatitudeLens.get(coord)
        expect(lat).toBe(40.55840870)
    })
    it('should set the latitude', async () => {
        const newCoord: Coordinate = LatitudeLens.set(coord)(41.25)
        expect (newCoord).toEqual({latitude: 41.25, longitude:23.12348578});
    })
    it('should return the longitude', async () => {
        const lon = LongitudeLens.get(coord)
        expect(lon).toBe(23.12348578)
    })
    it('should set the longitude', async () => {
        const newCoord: Coordinate = LongitudeLens.set(coord)(28.15)
        expect (newCoord).toEqual({latitude: 40.55840870, longitude:28.15});
    })

})

