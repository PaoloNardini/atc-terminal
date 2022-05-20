// import * as Dms from './dms'

// See: https://stackoverflow.com/questions/39877156/how-to-extend-string-prototype-and-use-it-next-in-typescript
declare global {
    interface Number {
        toRadians(): number;
        toDegrees(): number;
    }
}

  /** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this as number * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this as number * 180 / Math.PI; };
}


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
export class LatLon {

    lat: number
    lon: number

    constructor(lat: number, lon: number) {
        this.lat = Number(lat);
        this.lon = Number(lon);
    }

    equals (point: LatLon) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    
        if (this.lat != point.lat) return false;
        if (this.lon != point.lon) return false;
    
        return true;
    }

    /*
    toString = function(format, dp) {
        return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
    };
    */
    
    /**
     * Returns the distance from ‘this’ point to destination point (using haversine formula).
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance between this point and destination point, in same units as radius.
     *
     * @example
     *     var p1 = new LatLon(52.205, 0.119);
     *     var p2 = new LatLon(48.857, 2.351);
     *     var d = p1.distanceTo(p2); // 404.3 km
     */
    distanceTo (point: LatLon, radius: number = 6371e3) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
        radius = (radius === undefined) ? 6371e3 : Number(radius);

        // a = sin²(deltaph/2) + cos(ph1)⋅cos(ph2)⋅sin²(deltaLambda/2)
        // tandelta = √(a) / √(1−a)
        // see mathforum.org/library/drmath/view/51879.html for derivation

        var R = radius;
        var ph1 = this.lat.toRadians(),  gamma1 = this.lon.toRadians();
        var ph2 = point.lat.toRadians(), gamma2 = point.lon.toRadians();
        var deltaph = ph2 - ph1;
        var deltaLambda = gamma2 - gamma1;

        var a = Math.sin(deltaph/2) * Math.sin(deltaph/2)
            + Math.cos(ph1) * Math.cos(ph2)
            * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        return d;
    };


    /**
     * Returns the (initial) bearing from ‘this’ point to destination point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Initial bearing in degrees from north.
     *
     * @example
     *     var p1 = new LatLon(52.205, 0.119);
     *     var p2 = new LatLon(48.857, 2.351);
     *     var b1 = p1.bearingTo(p2); // 156.2°
     */
    bearingTo (point: LatLon) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        // tantheta = sindeltaLambda⋅cosph2 / cosph1⋅sinph2 − sinph1⋅cosph2⋅cosdeltaLambda
        // see mathforum.org/library/drmath/view/55417.html for derivation

        var ph1 = this.lat.toRadians(), ph2 = point.lat.toRadians();
        var deltaLambda = (point.lon - this.lon).toRadians();
        var y = Math.sin(deltaLambda) * Math.cos(ph2);
        var x = Math.cos(ph1)*Math.sin(ph2) -
            Math.sin(ph1)*Math.cos(ph2)*Math.cos(deltaLambda);
        var theta = Math.atan2(y, x);

        return (theta.toDegrees()+360) % 360;
    };


    /**
     * Returns final bearing arriving at destination destination point from ‘this’ point; the final bearing
     * will differ from the initial bearing by varying degrees according to distance and latitude.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Final bearing in degrees from north.
     *
     * @example
     *     var p1 = new LatLon(52.205, 0.119);
     *     var p2 = new LatLon(48.857, 2.351);
     *     var b2 = p1.finalBearingTo(p2); // 157.9°
     */
    finalBearingTo (point: LatLon) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        // get initial bearing from destination point to this point & reverse it by adding 180°
        return ( point.bearingTo(this)+180 ) % 360;
    };


    /**
     * Returns the midpoint between ‘this’ point and the supplied point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {LatLon} Midpoint between this point and the supplied point.
     *
     * @example
     *     var p1 = new LatLon(52.205, 0.119);
     *     var p2 = new LatLon(48.857, 2.351);
     *     var pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
     */
    midpointTo (point: LatLon) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        // phm = atan2( sinph1 + sinph2, √( (cosph1 + cosph2⋅cosdeltaLambda) ⋅ (cosph1 + cosph2⋅cosdeltaLambda) ) + cos²ph2⋅sin²deltaLambda )
        // gammam = gamma1 + atan2(cosph2⋅sindeltaLambda, cosph1 + cosph2⋅cosdeltaLambda)
        // see mathforum.org/library/drmath/view/51822.html for derivation

        var ph1 = this.lat.toRadians(), gamma1 = this.lon.toRadians();
        var ph2 = point.lat.toRadians();
        var deltaLambda = (point.lon-this.lon).toRadians();

        var Bx = Math.cos(ph2) * Math.cos(deltaLambda);
        var By = Math.cos(ph2) * Math.sin(deltaLambda);

        var x = Math.sqrt((Math.cos(ph1) + Bx) * (Math.cos(ph1) + Bx) + By * By);
        var y = Math.sin(ph1) + Math.sin(ph2);
        var ph3 = Math.atan2(y, x);

        var gamma3 = gamma1 + Math.atan2(By, Math.cos(ph1) + Bx);

        return new LatLon(ph3.toDegrees(), (gamma3.toDegrees()+540)%360-180); // normalise to −180..+180°
    };


    /**
     * Returns the point at given fraction between ‘this’ point and specified point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
     * @returns {LatLon} Intermediate point between this point and destination point.
     *
     * @example
     *   let p1 = new LatLon(52.205, 0.119);
     *   let p2 = new LatLon(48.857, 2.351);
     *   let pMid = p1.intermediatePointTo(p2, 0.25); // 51.3721°N, 000.7073°E
     */
    intermediatePointTo (point: LatLon, fraction: number) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        var ph1 = this.lat.toRadians(), gamma1 = this.lon.toRadians();
        var ph2 = point.lat.toRadians(), gamma2 = point.lon.toRadians();
        var sinph1 = Math.sin(ph1), cosph1 = Math.cos(ph1), singamma1 = Math.sin(gamma1), cosgamma1 = Math.cos(gamma1);
        var sinph2 = Math.sin(ph2), cosph2 = Math.cos(ph2), singamma2 = Math.sin(gamma2), cosgamma2 = Math.cos(gamma2);

        // distance between points
        var deltaph = ph2 - ph1;
        var deltaLambda = gamma2 - gamma1;
        var a = Math.sin(deltaph/2) * Math.sin(deltaph/2)
            + Math.cos(ph1) * Math.cos(ph2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        var delta = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var A = Math.sin((1-fraction)*delta) / Math.sin(delta);
        var B = Math.sin(fraction*delta) / Math.sin(delta);

        var x = A * cosph1 * cosgamma1 + B * cosph2 * cosgamma2;
        var y = A * cosph1 * singamma1 + B * cosph2 * singamma2;
        var z = A * sinph1 + B * sinph2;

        var ph3 = Math.atan2(z, Math.sqrt(x*x + y*y));
        var gamma3 = Math.atan2(y, x);

        return new LatLon(ph3.toDegrees(), (gamma3.toDegrees()+540)%360-180); // normalise lon to −180..+180°
    };


    /**
     * Returns the destination point from ‘this’ point having travelled the given distance on the
     * given initial bearing (bearing normally varies around path followed).
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Initial bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Destination point.
     *
     * @example
     *     var p1 = new LatLon(51.4778, -0.0015);
     *     var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
     */
    destinationPoint (distance: number, bearing: number, radius: number = 6371e3) {
        radius = (radius === undefined) ? 6371e3 : Number(radius);

        // sinph2 = sinph1⋅cosdelta + cosph1⋅sindelta⋅costheta
        // tandeltaLambda = sintheta⋅sindelta⋅cosph1 / cosdelta−sinph1⋅sinph2
        // see mathforum.org/library/drmath/view/52049.html for derivation

        var delta = Number(distance) / radius; // angular distance in radians
        var theta = Number(bearing).toRadians();

        var ph1 = this.lat.toRadians();
        var gamma1 = this.lon.toRadians();

        var sinph1 = Math.sin(ph1), cosph1 = Math.cos(ph1);
        var sindelta = Math.sin(delta), cosdelta = Math.cos(delta);
        var sintheta = Math.sin(theta), costheta = Math.cos(theta);

        var sinph2 = sinph1*cosdelta + cosph1*sindelta*costheta;
        var ph2 = Math.asin(sinph2);
        var y = sintheta * sindelta * cosph1;
        var x = cosdelta - sinph1 * sinph2;
        var gamma2 = gamma1 + Math.atan2(y, x);

        return new LatLon(ph2.toDegrees(), (gamma2.toDegrees()+540)%360-180); // normalise to −180..+180°
    };


    /**
     * Returns the point of intersection of two paths defined by point and bearing.
     *
     * @param   {LatLon} p1 - First point.
     * @param   {number} brng1 - Initial bearing from first point.
     * @param   {LatLon} p2 - Second point.
     * @param   {number} brng2 - Initial bearing from second point.
     * @returns {LatLon|null} Destination point (null if no unique intersection defined).
     *
     * @example
     *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
     *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
     *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9078°N, 004.5084°E
     */
    intersection (p1: LatLon, brng1: number, p2: LatLon, brng2: number): LatLon | null {
        if (!(p1 instanceof LatLon)) throw new TypeError('p1 is not LatLon object');
        if (!(p2 instanceof LatLon)) throw new TypeError('p2 is not LatLon object');

        // see www.edwilliams.org/avform.htm#Intersection

        var ph1 = p1.lat.toRadians(), gamma1 = p1.lon.toRadians();
        var ph2 = p2.lat.toRadians(), gamma2 = p2.lon.toRadians();
        var theta13 = Number(brng1).toRadians(), theta23 = Number(brng2).toRadians();
        var deltaph = ph2-ph1, deltaLambda = gamma2-gamma1;

        // angular distance p1-p2
        var delta12 = 2*Math.asin( Math.sqrt( Math.sin(deltaph/2)*Math.sin(deltaph/2)
                + Math.cos(ph1)*Math.cos(ph2)*Math.sin(deltaLambda/2)*Math.sin(deltaLambda/2) ) );
        if (delta12 == 0) return null;

        // initial/final bearings between points
        var thetaa = Math.acos( ( Math.sin(ph2) - Math.sin(ph1)*Math.cos(delta12) ) / ( Math.sin(delta12)*Math.cos(ph1) ) );
        if (isNaN(thetaa)) thetaa = 0; // protect against rounding
        var thetab = Math.acos( ( Math.sin(ph1) - Math.sin(ph2)*Math.cos(delta12) ) / ( Math.sin(delta12)*Math.cos(ph2) ) );

        var theta12 = Math.sin(gamma2-gamma1)>0 ? thetaa : 2*Math.PI-thetaa;
        var theta21 = Math.sin(gamma2-gamma1)>0 ? 2*Math.PI-thetab : thetab;

        var alfa1 = theta13 - theta12; // angle 2-1-3
        var alfa2 = theta21 - theta23; // angle 1-2-3

        if (Math.sin(alfa1)==0 && Math.sin(alfa2)==0) return null; // infinite intersections
        if (Math.sin(alfa1)*Math.sin(alfa2) < 0) return null;      // ambiguous intersection

        var alfa3 = Math.acos( -Math.cos(alfa1)*Math.cos(alfa2) + Math.sin(alfa1)*Math.sin(alfa2)*Math.cos(delta12) );
        var delta13 = Math.atan2( Math.sin(delta12)*Math.sin(alfa1)*Math.sin(alfa2), Math.cos(alfa2)+Math.cos(alfa1)*Math.cos(alfa3) );
        var ph3 = Math.asin( Math.sin(ph1)*Math.cos(delta13) + Math.cos(ph1)*Math.sin(delta13)*Math.cos(theta13) );
        var deltaLambda13 = Math.atan2( Math.sin(theta13)*Math.sin(delta13)*Math.cos(ph1), Math.cos(delta13)-Math.sin(ph1)*Math.sin(ph3) );
        var gamma3 = gamma1 + deltaLambda13;

        return new LatLon(ph3.toDegrees(), (gamma3.toDegrees()+540)%360-180); // normalise to −180..+180°
    };


    /**
     * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point.
     *
     * @param   {LatLon} pathStart - Start point of great circle path.
     * @param   {LatLon} pathEnd - End point of great circle path.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance to great circle (-ve if to left, +ve if to right of path).
     *
     * @example
     *   var pCurrent = new LatLon(53.2611, -0.7972);
     *   var p1 = new LatLon(53.3206, -1.7297);
     *   var p2 = new LatLon(53.1887,  0.1334);
     *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
     */
    crossTrackDistanceTo (pathStart: LatLon, pathEnd: LatLon, radius: number = 6371e3) {
        if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
        if (!(pathEnd instanceof LatLon)) throw new TypeError('pathEnd is not LatLon object');
        var R = (radius === undefined) ? 6371e3 : Number(radius);

        var delta13 = pathStart.distanceTo(this, R) / R;
        var theta13 = pathStart.bearingTo(this).toRadians();
        var theta12 = pathStart.bearingTo(pathEnd).toRadians();

        var deltaxt = Math.asin(Math.sin(delta13) * Math.sin(theta13-theta12));

        return deltaxt * R;
    };


    /**
     * Returns how far ‘this’ point is along a path from from start-point, heading towards end-point.
     * That is, if a perpendicular is drawn from ‘this’ point to the (great circle) path, the along-track
     * distance is the distance from the start point to where the perpendicular crosses the path.
     *
     * @param   {LatLon} pathStart - Start point of great circle path.
     * @param   {LatLon} pathEnd - End point of great circle path.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance along great circle to point nearest ‘this’ point.
     *
     * @example
     *   var pCurrent = new LatLon(53.2611, -0.7972);
     *   var p1 = new LatLon(53.3206, -1.7297);
     *   var p2 = new LatLon(53.1887,  0.1334);
     *   var d = pCurrent.alongTrackDistanceTo(p1, p2);  // 62.331 km
     */
    alongTrackDistanceTo (pathStart: LatLon, pathEnd: LatLon, radius: number = 6371e3) {
        if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
        if (!(pathEnd instanceof LatLon)) throw new TypeError('pathEnd is not LatLon object');
        var R = (radius === undefined) ? 6371e3 : Number(radius);

        var delta13 = pathStart.distanceTo(this, R) / R;
        var theta13 = pathStart.bearingTo(this).toRadians();
        var theta12 = pathStart.bearingTo(pathEnd).toRadians();

        var deltaxt = Math.asin(Math.sin(delta13) * Math.sin(theta13-theta12));

        var deltaat = Math.acos(Math.cos(delta13) / Math.abs(Math.cos(deltaxt)));

        return deltaat*Math.sign(Math.cos(theta12-theta13)) * R;
    };


    /**
     * Returns maximum latitude reached when travelling on a great circle on given bearing from this
     * point ('Clairaut's formula'). Negate the result for the minimum latitude (in the Southern
     * hemisphere).
     *
     * The maximum latitude is independent of longitude; it will be the same for all points on a given
     * latitude.
     *
     * @param {number} bearing - Initial bearing.
     * @param {number} latitude - Starting latitude.
     */
    maxLatitude (bearing: number) {
        var theta = Number(bearing).toRadians();

        var ph = this.lat.toRadians();

        var phMax = Math.acos(Math.abs(Math.sin(theta)*Math.cos(ph)));

        return phMax.toDegrees();
    };


    /**
     * Returns the pair of meridians at which a great circle defined by two points crosses the given
     * latitude. If the great circle doesn't reach the given latitude, null is returned.
     *
     * @param {LatLon} point1 - First point defining great circle.
     * @param {LatLon} point2 - Second point defining great circle.
     * @param {number} latitude - Latitude crossings are to be determined for.
     * @returns {Object|null} Object containing { lon1, lon2 } or null if given latitude not reached.
     */
    crossingParallels (point1: LatLon, point2: LatLon, latitude: number) {
        var ph = Number(latitude).toRadians();

        var ph1 = point1.lat.toRadians();
        var gamma1 = point1.lon.toRadians();
        var ph2 = point2.lat.toRadians();
        var gamma2 = point2.lon.toRadians();

        var deltaLambda = gamma2 - gamma1;

        var x = Math.sin(ph1) * Math.cos(ph2) * Math.cos(ph) * Math.sin(deltaLambda);
        var y = Math.sin(ph1) * Math.cos(ph2) * Math.cos(ph) * Math.cos(deltaLambda) - Math.cos(ph1) * Math.sin(ph2) * Math.cos(ph);
        var z = Math.cos(ph1) * Math.cos(ph2) * Math.sin(ph) * Math.sin(deltaLambda);

        if (z*z > x*x + y*y) return null; // great circle doesn't reach latitude

        var gammam = Math.atan2(-y, x);                  // longitude at max latitude
        var deltaLambdai = Math.acos(z / Math.sqrt(x*x+y*y)); // deltaLambda from gammam to intersection points

        var gammai1 = gamma1 + gammam - deltaLambdai;
        var gammai2 = gamma1 + gammam + deltaLambdai;

        return { lon1: (gammai1.toDegrees()+540)%360-180, lon2: (gammai2.toDegrees()+540)%360-180 }; // normalise to −180..+180°
    };


    /* Rhumb - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    /**
     * Returns the distance travelling from ‘this’ point to destination point along a rhumb line.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance in km between this point and destination point (same units as radius).
     *
     * @example
     *     var p1 = new LatLon(51.127, 1.338);
     *     var p2 = new LatLon(50.964, 1.853);
     *     var d = p1.distanceTo(p2); // 40.31 km
     */
    rhumbDistanceTo (point: LatLon, radius: number = 6371e3) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
        radius = (radius === undefined) ? 6371e3 : Number(radius);

        // see www.edwilliams.org/avform.htm#Rhumb

        var R = radius;
        var ph1 = this.lat.toRadians(), ph2 = point.lat.toRadians();
        var deltaph = ph2 - ph1;
        var deltaLambda = Math.abs(point.lon-this.lon).toRadians();
        // if dLon over 180° take shorter rhumb line across the anti-meridian:
        if (deltaLambda > Math.PI) deltaLambda -= 2*Math.PI;

        // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
        // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
        var delta = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));
        var q = Math.abs(delta) > 10e-12 ? deltaph/delta : Math.cos(ph1);

        // distance is pythagoras on 'stretched' Mercator projection
        var delta = Math.sqrt(deltaph*deltaph + q*q*deltaLambda*deltaLambda); // angular distance in radians
        var dist = delta * R;

        return dist;
    };


    /**
     * Returns the bearing from ‘this’ point to destination point along a rhumb line.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Bearing in degrees from north.
     *
     * @example
     *     var p1 = new LatLon(51.127, 1.338);
     *     var p2 = new LatLon(50.964, 1.853);
     *     var d = p1.rhumbBearingTo(p2); // 116.7 m
     */
    rhumbBearingTo(point: LatLon) {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        var ph1 = this.lat.toRadians(), ph2 = point.lat.toRadians();
        var deltaLambda = (point.lon-this.lon).toRadians();
        // if dLon over 180° take shorter rhumb line across the anti-meridian:
        if (deltaLambda >  Math.PI) deltaLambda -= 2*Math.PI;
        if (deltaLambda < -Math.PI) deltaLambda += 2*Math.PI;

        var delta = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));

        var theta = Math.atan2(deltaLambda, delta);

        return (theta.toDegrees()+360) % 360;
    };


    /**
     * Returns the destination point having travelled along a rhumb line from ‘this’ point the given
     * distance on the  given bearing.
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Destination point.
     *
     * @example
     *     var p1 = new LatLon(51.127, 1.338);
     *     var p2 = p1.rhumbDestinationPoint(40300, 116.7); // 50.9642°N, 001.8530°E
     */
    rhumbDestinationPoint (distance: number , bearing: number , radius: number = 6371e3) {
        radius = (radius === undefined) ? 6371e3 : Number(radius);

        var delta = Number(distance) / radius; // angular distance in radians
        var ph1 = this.lat.toRadians(), gamma1 = this.lon.toRadians();
        var theta = Number(bearing).toRadians();

        var deltaph = delta * Math.cos(theta);
        var ph2 = ph1 + deltaph;

        // check for some daft bugger going past the pole, normalise latitude if so
        if (Math.abs(ph2) > Math.PI/2) ph2 = ph2>0 ? Math.PI-ph2 : -Math.PI-ph2;

        var delta = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));
        var q = Math.abs(delta) > 10e-12 ? deltaph / delta : Math.cos(ph1); // E-W course becomes ill-conditioned with 0/0

        var deltaLambda = delta*Math.sin(theta)/q;
        var gamma2 = gamma1 + deltaLambda;

        return new LatLon(ph2.toDegrees(), (gamma2.toDegrees()+540) % 360 - 180); // normalise to −180..+180°
    };


    /**
     * Returns the loxodromic midpoint (along a rhumb line) between ‘this’ point and second point.
     *
     * @param   {LatLon} point - Latitude/longitude of second point.
     * @returns {LatLon} Midpoint between this point and second point.
     *
     * @example
     *     var p1 = new LatLon(51.127, 1.338);
     *     var p2 = new LatLon(50.964, 1.853);
     *     var pMid = p1.rhumbMidpointTo(p2); // 51.0455°N, 001.5957°E
     */
    rhumbMidpointTo (point: LatLon): LatLon {
        if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

        // see mathforum.org/kb/message.jspa?messageID=148837

        var ph1 = this.lat.toRadians(), gamma1 = this.lon.toRadians();
        var ph2 = point.lat.toRadians(), gamma2 = point.lon.toRadians();

        if (Math.abs(gamma2-gamma1) > Math.PI) gamma1 += 2*Math.PI; // crossing anti-meridian

        var ph3 = (ph1+ph2)/2;
        var f1 = Math.tan(Math.PI/4 + ph1/2);
        var f2 = Math.tan(Math.PI/4 + ph2/2);
        var f3 = Math.tan(Math.PI/4 + ph3/2);
        var gamma3 = ( (gamma2-gamma1)*Math.log(f3) + gamma1*Math.log(f2) - gamma2*Math.log(f1) ) / Math.log(f2/f1);

        if (!isFinite(gamma3)) gamma3 = (gamma1+gamma2)/2; // parallel of latitude

        var p = new LatLon(ph3.toDegrees(), (gamma3.toDegrees()+540)%360-180); // normalise to −180..+180°

        return p;
    };


    /* Area - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    // returns whether polygon encloses pole: sum of course deltas around pole is 0° rather than
    // normal ±360°: blog.element84.com/determining-if-a-spherical-polygon-contains-a-pole.html
    isPoleEnclosedBy(polygon: LatLon[]) {
        // TODO: any better test than this?
        var SumDelta = 0;
        var prevBrng = polygon[0].bearingTo(polygon[1]);
        for (var v=0; v<polygon.length-1; v++) {
            var initBrng = polygon[v].bearingTo(polygon[v+1]);
            var finalBrng = polygon[v].finalBearingTo(polygon[v+1]);
            SumDelta += (initBrng - prevBrng + 540) % 360 - 180;
            SumDelta += (finalBrng - initBrng + 540) % 360 - 180;
            prevBrng = finalBrng;
        }
        var initBrng = polygon[0].bearingTo(polygon[1]);
        SumDelta += (initBrng - prevBrng + 540) % 360 - 180;
        // TODO: fix (intermittant) edge crossing pole - eg (85,90), (85,0), (85,-90)
        var enclosed = Math.abs(SumDelta) < 90; // 0°-ish
        return enclosed;
    }


    /**
     * Calculates the area of a spherical polygon where the sides of the polygon are great circle
     * arcs joining the vertices.
     *
     * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} The area of the polygon, in the same units as radius.
     *
     * @example
     *   var polygon = [new LatLon(0,0), new LatLon(1,0), new LatLon(0,1)];
     *   var area = LatLon.areaOf(polygon); // 6.18e9 m²
     */
    areaOf (polygon: LatLon[], radius: number = 6371e3) {
        // uses method due to Karney: osgeo-org.1560.x6.nabble.com/Area-of-a-spherical-polygon-td3841625.html;
        // for each edge of the polygon, tan(E/2) = tan(deltaLambda/2)·(tan(ph1/2) + tan(ph2/2)) / (1 + tan(ph1/2)·tan(ph2/2))
        // where E is the spherical excess of the trapezium obtained by extending the edge to the equator

        var R = (radius === undefined) ? 6371e3 : Number(radius);

        // close polygon so that last point equals first point
        var closed = polygon[0].equals(polygon[polygon.length-1]);
        if (!closed) polygon.push(polygon[0]);

        var nVertices = polygon.length - 1;

        var S = 0; // spherical excess in steradians
        for (var v=0; v<nVertices; v++) {
            var ph1 = polygon[v].lat.toRadians();
            var ph2 = polygon[v+1].lat.toRadians();
            var deltaLambda = (polygon[v+1].lon - polygon[v].lon).toRadians();
            var E = 2 * Math.atan2(Math.tan(deltaLambda/2) * (Math.tan(ph1/2)+Math.tan(ph2/2)), 1 + Math.tan(ph1/2)*Math.tan(ph2/2));
            S += E;
        }

        if (this.isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2*Math.PI;

        var A = Math.abs(S * R*R); // area in units of R

        if (!closed) polygon.pop(); // restore polygon to pristine condition

        return A;
    }

}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export {}