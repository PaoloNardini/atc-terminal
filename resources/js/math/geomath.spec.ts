import { Parameters } from "../../../src/core/entities"
import { LatLon } from "./latlon"
import * as geomath from './geomath'
import * as constants from "../../../src/core/constants"


describe('LatLon and coordinates system tests', () => {
    
    it('should handle basic lat/lon object', async () => {
        const l: LatLon = new LatLon(10,10)
        expect(l.lat).toEqual(10)
        expect(l.lon).toEqual(10)
    })

    it('should round to 2 decimals', async () => {
        expect(geomath.round2(4.75000001)).toEqual(4.75)
        expect(geomath.round2(4.760000)).toEqual(4.76)
        expect(geomath.round2(4.749999)).toEqual(4.75)
    })

    it('coordsToScreen', async () => {
        const l: LatLon = new LatLon(42,11)
        const parameters: Parameters = new Parameters()
        parameters.latitudeCenter = 42
        parameters.longitudeCenter = 11
        parameters.screenCenterX = 0
        parameters.screenCenterY = 0
        const coords = geomath.coordsToScreen(l.lat, l.lon, parameters)
        expect(coords.x).toEqual(parameters.screenCenterX)
        expect(coords.y).toEqual(parameters.screenCenterY)

        const l2: LatLon = new LatLon(43,12)
        const coords2 = geomath.coordsToScreen(l2.lat, l2.lon, parameters)
        expect(coords2.x).toEqual(constants.MILESFACT)
        expect(coords2.y).toEqual(-constants.MILESFACT)

    })

    it('feetToMiles', async () => {
        const m = geomath.feetToMiles(10000)
        expect(m).toEqual(1.6457883369330453)
    })

    it('feetToMeters', async () => {
        const m = geomath.feetToMeters(1000)
        expect(m).toEqual(304.8)
    })

    it('metersToMiles', async () => {
        const m = geomath.metersToMiles(1000)
        expect(m).toEqual(0.5399568034557235)
    })

    it('milesToMeters', async () => {
        const m = geomath.milesToMeters(10)
        expect(m).toEqual(18520)
    })

    it('inverseBearing', async () => {
        expect(geomath.inverseBearing(0)).toEqual(180)
        expect(geomath.inverseBearing(90)).toEqual(270)
        expect(geomath.inverseBearing(180)).toEqual(0)
        expect(geomath.inverseBearing(270)).toEqual(90)
        expect(geomath.inverseBearing(360)).toEqual(180)
        expect(geomath.inverseBearing(359)).toEqual(179)
        expect(geomath.inverseBearing(45)).toEqual(225)
        expect(geomath.inverseBearing(75)).toEqual(255)
        expect(geomath.inverseBearing(215)).toEqual(35)
        expect(geomath.inverseBearing(295)).toEqual(115)
        expect(geomath.inverseBearing(135.5)).toEqual(315.5)
        expect(geomath.inverseBearing(135.52)).toEqual(315.52)
    })

    it('radians/degrees conversion', async () => {
        expect(geomath.radians(0)).toEqual(0)
        expect(geomath.radians(90)).toEqual(Math.PI/2)
        expect(geomath.radians(180)).toEqual(Math.PI)
        expect(geomath.radians(270)).toEqual(Math.PI*1.5)
        expect(geomath.degrees(Math.PI)).toEqual(180)
        expect(geomath.degrees(Math.PI/2)).toEqual(90)
        expect(geomath.degrees(Math.PI*1.5)).toEqual(270)
    })

    it('distanceToCenter', async () => {
        const d = geomath.distanceToCenter(10, 10, 5, 5)
        expect(geomath.round2(d)).toEqual(422.38)
    })

    it('coarseToCenter', async () => {
        expect(geomath.round2(geomath.coarseToCenter(10, 10, 5, 5))).toEqual(315.55)
        expect(geomath.round2(geomath.coarseToCenter(10, 10, 15, 15))).toEqual(135.12)
        expect(geomath.round2(geomath.coarseToCenter(10, 10, 11, 11))).toEqual(135.39)
        expect(geomath.round2(geomath.coarseToCenter(11, 11, 10, 10))).toEqual(315.57)
    })

    it('coordsFromCoarseDistance', async () => {
        var l = geomath.coordsFromCoarseDistance(5, 5, 0, 100)
        expect(geomath.round2(l.lat)).toEqual(6.67)
        expect(geomath.round2(l.lon)).toEqual(5)

        l = geomath.coordsFromCoarseDistance(5, 5, 90, 100)
        expect(geomath.round2(l.lat)).toEqual(5)
        expect(geomath.round2(l.lon)).toEqual(6.67)

        l = geomath.coordsFromCoarseDistance(5, 5, 180, 100)
        expect(geomath.round2(l.lat)).toEqual(3.33)
        expect(geomath.round2(l.lon)).toEqual(5)

        l = geomath.coordsFromCoarseDistance(5, 5, 270, 100)
        expect(geomath.round2(l.lat)).toEqual(5)
        expect(geomath.round2(l.lon)).toEqual(3.33)
    })
})
