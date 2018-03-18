/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
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
function LatLon(lat, lon) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}   True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // ≡ export default LatLon




/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy representation conversion functions                        (c) Chris Veness 2002-2017  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-dms.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
/* eslint no-irregular-whitespace: [2, { skipComments: true }] */


/**
 * Latitude/longitude points may be represented as decimal degrees, or subdivided into sexagesimal
 * minutes and seconds.
 *
 * @module dms
 */


/**
 * Functions for parsing and representing degrees / minutes / seconds.
 * @class Dms
 */
var Dms = {};

// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 *
 * @example
 *     var lat = Dms.parseDMS('51° 28′ 40.12″ N');
 *     var lon = Dms.parseDMS('000° 00′ 05.31″ W');
 *     var p1 = new LatLon(lat, lon); // 51.4778°N, 000.0015°W
 */
Dms.parseDMS = function(dmsStr) {
    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
    if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

    if (dms == '') return NaN;

    // and convert to decimal degrees...
    var deg;
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
            break;
        case 2:  // interpret 2-part result as d/m
            deg = dms[0]/1 + dms[1]/60;
            break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};


/**
 * Separator character to be used to separate degrees, minutes, seconds, and cardinal directions.
 *
 * Set to '\u202f' (narrow no-break space) for improved formatting.
 *
 * @example
 *   var p = new LatLon(51.2, 0.33);  // 51°12′00.0″N, 000°19′48.0″E
 *   Dms.separator = '\u202f';        // narrow no-break space
 *   var pʹ = new LatLon(51.2, 0.33); // 51° 12′ 00.0″ N, 000° 19′ 48.0″ E
 */
Dms.separator = '';


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toDMS = function(deg, format, dp) {
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

    // default values
    if (format === undefined) format = 'dms';
    if (dp === undefined) {
        switch (format) {
            case 'd':    case 'deg':         dp = 4; break;
            case 'dm':   case 'deg+min':     dp = 2; break;
            case 'dms':  case 'deg+min+sec': dp = 0; break;
            default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd': case 'deg':
        d = deg.toFixed(dp);                       // round/right-pad degrees
        if (d<100) d = '0' + d;                    // left-pad with leading zeros (note may include decimals)
        if (d<10) d = '0' + d;
        dms = d + '°';
        break;
        case 'dm': case 'deg+min':
        d = Math.floor(deg);                       // get component deg
        m = ((deg*60) % 60).toFixed(dp);           // get component min & round/right-pad
        if (m == 60) { m = 0; d++; }               // check for rounding up
        d = ('000'+d).slice(-3);                   // left-pad with leading zeros
        if (m<10) m = '0' + m;                     // left-pad with leading zeros (note may include decimals)
        dms = d + '°'+Dms.separator + m + '′';
        break;
        case 'dms': case 'deg+min+sec':
        d = Math.floor(deg);                       // get component deg
        m = Math.floor((deg*3600)/60) % 60;        // get component min
        s = (deg*3600 % 60).toFixed(dp);           // get component sec & round/right-pad
        if (s == 60) { s = (0).toFixed(dp); m++; } // check for rounding up
        if (m == 60) { m = 0; d++; }               // check for rounding up
        d = ('000'+d).slice(-3);                   // left-pad with leading zeros
        m = ('00'+m).slice(-2);                    // left-pad with leading zeros
        if (s<10) s = '0' + s;                     // left-pad with leading zeros (note may include decimals)
        dms = d + '°'+Dms.separator + m + '′'+Dms.separator + s + '″';
        break;
    }

    return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLat = function(deg, format, dp) {
    var lat = Dms.toDMS(deg, format, dp);
    return lat===null ? '–' : lat.slice(1)+Dms.separator + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLon = function(deg, format, dp) {
    var lon = Dms.toDMS(deg, format, dp);
    return lon===null ? '–' : lon+Dms.separator + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toBrng = function(deg, format, dp) {
    deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
    var brng =  Dms.toDMS(deg, format, dp);
    return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (1:cardinal / 2:intercardinal / 3:secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Dms.compassPoint(24);    // point = 'NNE'
 *   var point = Dms.compassPoint(24, 1); // point = 'N'
 */
Dms.compassPoint = function(bearing, precision) {
    if (precision === undefined) precision = 3;
    // note precision could be extended to 4 for quarter-winds (eg NbNW), but I think they are little used

    bearing = ((bearing%360)+360)%360; // normalise to range 0..360°

    var cardinals = [
        'N', 'NNE', 'NE', 'ENE',
        'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW',
        'W', 'WNW', 'NW', 'NNW' ];
    var n = 4 * Math.pow(2, precision-1); // no of compass points at req’d precision (1=>4, 2=>8, 3=>16)
    var cardinal = cardinals[Math.round(bearing*n/360)%n * 16/n];

    return cardinal;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Dms; // ≡ export default Dms

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2017  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-spherical.html                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Dms = require('./dms'); // ≡ import Dms from 'dms.js'


/**
 * Library of geodesy functions for operations on a spherical earth model.
 *
 * @module   latlon-spherical
 * @requires dms
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
LatLon.prototype.distanceTo = function(point, radius) {
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
LatLon.prototype.bearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // tantheta = sindeltaLambda⋅cosph2 / cosph1⋅sinph2 − sinph1⋅cosph2⋅cosdeltaLambda
    // see mathforum.org/library/drmath/view/55417.html for derivation

    var ph1 = this.lat.toRadians(), ph2 = point.lat.toRadians();
    var deltaLambda = (point.lon-this.lon).toRadians();
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
LatLon.prototype.finalBearingTo = function(point) {
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
LatLon.prototype.midpointTo = function(point) {
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
LatLon.prototype.intermediatePointTo = function(point, fraction) {
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
LatLon.prototype.destinationPoint = function(distance, bearing, radius) {
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
LatLon.prototype.intersection = function(p1, brng1, p2, brng2) {
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
LatLon.prototype.crossTrackDistanceTo = function(pathStart, pathEnd, radius) {
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
LatLon.prototype.alongTrackDistanceTo = function(pathStart, pathEnd, radius) {
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
LatLon.prototype.maxLatitude = function(bearing) {
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
LatLon.crossingParallels = function(point1, point2, latitude) {
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
LatLon.prototype.rhumbDistanceTo = function(point, radius) {
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
    var deltaψ = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));
    var q = Math.abs(deltaψ) > 10e-12 ? deltaph/deltaψ : Math.cos(ph1);

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
LatLon.prototype.rhumbBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var ph1 = this.lat.toRadians(), ph2 = point.lat.toRadians();
    var deltaLambda = (point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (deltaLambda >  Math.PI) deltaLambda -= 2*Math.PI;
    if (deltaLambda < -Math.PI) deltaLambda += 2*Math.PI;

    var deltaψ = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));

    var theta = Math.atan2(deltaLambda, deltaψ);

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
LatLon.prototype.rhumbDestinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var delta = Number(distance) / radius; // angular distance in radians
    var ph1 = this.lat.toRadians(), gamma1 = this.lon.toRadians();
    var theta = Number(bearing).toRadians();

    var deltaph = delta * Math.cos(theta);
    var ph2 = ph1 + deltaph;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(ph2) > Math.PI/2) ph2 = ph2>0 ? Math.PI-ph2 : -Math.PI-ph2;

    var deltaψ = Math.log(Math.tan(ph2/2+Math.PI/4)/Math.tan(ph1/2+Math.PI/4));
    var q = Math.abs(deltaψ) > 10e-12 ? deltaph / deltaψ : Math.cos(ph1); // E-W course becomes ill-conditioned with 0/0

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
LatLon.prototype.rhumbMidpointTo = function(point) {
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

    var p = LatLon(ph3.toDegrees(), (gamma3.toDegrees()+540)%360-180); // normalise to −180..+180°

    return p;
};


/* Area - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


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
LatLon.areaOf = function(polygon, radius) {
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

    if (isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2*Math.PI;

    var A = Math.abs(S * R*R); // area in units of R

    if (!closed) polygon.pop(); // restore polygon to pristine condition

    return A;

    // returns whether polygon encloses pole: sum of course deltas around pole is 0° rather than
    // normal ±360°: blog.element84.com/determining-if-a-spherical-polygon-contains-a-pole.html
    function isPoleEnclosedBy(polygon) {
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
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

