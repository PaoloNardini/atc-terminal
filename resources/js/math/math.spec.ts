import { LatLon } from "./latlon";

describe('LatLon', () => {
    it('should return a valid object', async () => {
        const l: LatLon = new LatLon(10,10)
        expect(l.lat).toEqual(10)
        expect(l.lon).toEqual(10)
    })

    it('test2', async () => {
        const l: LatLon = new LatLon(10,10)
        expect(l.lat).toEqual(10)
    })
})
