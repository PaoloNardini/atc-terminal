import { Parameters } from "../core/entities"
import { LatLon } from "./latlon"
import * as geomath from './geomath'
import * as constants from "../core/constants"


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

        const l3: LatLon = new LatLon(41,10)
        const coords3 = geomath.coordsToScreen(l3.lat, l3.lon, parameters)
        expect(coords3.x).toEqual(-constants.MILESFACT)
        expect(coords3.y).toEqual(constants.MILESFACT)


        // 41.676062743586954 lon: 12.563651919546146 x: 1057.47787931922 y: 419.90588461957367        
        // 41.7 / 12.2 Screen: 512 / 384
        parameters.latitudeCenter = 41.7
        parameters.screenCenterY = 384
        parameters.longitudeCenter = 12.2
        parameters.screenCenterX = 512
        const l4: LatLon = new LatLon(41.676062743586954, 12.563651919546146)
        const coords4 = geomath.coordsToScreen(l4.lat, l4.lon, parameters)
        expect(coords4.y).toEqual(419.90588461957367)
        expect(coords4.x).toEqual(1057.47787931922)
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

        // TEST PLANE MOVE
        /*

        const parameters: Parameters = new Parameters()
        parameters.latitudeCenter = 41.7
        parameters.longitudeCenter = 12.2
        parameters.screenCenterX = 0
        parameters.screenCenterY = 0

        const lat1 = 41.440528035629285
        const lon1 = 12.057501801645

        const coords1 = geomath.coordsToScreen(lat1, lon1, parameters)
        expect(coords1.x).toEqual(-213.74729753249966)
        expect(coords1.y).toEqual(389.20794655607693)

        l = geomath.coordsFromCoarseDistance(lat1, lon1, 45, 100)
        expect(l.lat).toEqual(41.49938714431227)
        expect(l.lon).toEqual(12.136125007345868)

        const coords2 = geomath.coordsToScreen(l.lat, l.lon, parameters)
        expect(coords2.x).toEqual(-95.81248898119732)
        expect(coords2.y).toEqual(300.91928353159506)
        */

        /*
PLANE0 new position - 41.67540845958821 - 12.562775934442584
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.67540845958821 lon: 12.562775934442584 x: 1056.163901663877 y: 420.88731061768635
main.js:1 [setPosition] lat: 41.67540845958821 lon: 12.562775934442584 x: 1056.163901663877 y: 420.88731061768635
main.js:1 PLANE0 new position - 41.676062743586954 - 12.563651919546146
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.676062743586954 lon: 12.563651919546146 x: 1057.47787931922 y: 419.90588461957367
main.js:1 [setPosition] lat: 41.676062743586954 lon: 12.563651919546146 x: 1057.47787931922 y: 419.90588461957367
main.js:1 PLANE0 new position - 41.67671702758563 - 12.564527913555025
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.67671702758563 lon: 12.564527913555025 x: 1058.791870332539 y: 418.92445862155694
main.js:1 [setPosition] lat: 41.67671702758563 lon: 12.564527913555025 x: 1058.791870332539 y: 418.92445862155694
main.js:1 PLANE0 new position - 41.677383088717626 - 12.565419684795302
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.677383088717626 lon: 12.565419684795302 x: 1060.1295271929534 y: 417.9253669235653
main.js:1 [setPosition] lat: 41.677383088717626 lon: 12.565419684795302 x: 1060.1295271929534 y: 417.9253669235653
main.js:1 PLANE0 new position - 41.67869165006272 - 12.567171726568176
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.67869165006272 lon: 12.567171726568176 x: 1062.7575898522655 y: 415.96252490592855
main.js:1 [setPosition] lat: 41.67869165006272 lon: 12.567171726568176 x: 1062.7575898522655 y: 415.96252490592855
main.js:1 PLANE0 new position - 41.68000021140719 - 12.568923803966982
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.68000021140719 lon: 12.568923803966982 x: 1065.3857059504735 y: 413.99968288921906
main.js:1 [setPosition] lat: 41.68000021140719 lon: 12.568923803966982 x: 1065.3857059504735 y: 413.99968288921906
main.js:1 PLANE0 new position - 41.68130877275105 - 12.570675916994219
main.js:1 [coordsToScreen] center: 41.7 / 12.2 Screen: 512 / 384
main.js:1 [coordsToScreen] lat: 41.68130877275105 lon: 12.570675916994219 x: 1068.0138754913291 y: 412.0368408734262
main.js:1 [setPosition] lat: 41.68130877275105 lon: 12.570675916994219 x: 1068.0138754913291 y: 412.0368408734262
        */
    })
})
