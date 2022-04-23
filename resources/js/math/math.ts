/* Some mathematical formulas to compute everything needed */
import { Parameters } from '../../../src/core/entities';
import * as constants from '../../../src/core/constants';

import { LatLon } from './latlon'

export const radians = function(degrees) {
    return degrees * Math.PI / 180;
};

export const degrees = function(radians) {
    return radians * 180 / Math.PI;
};

export const round2 = function (value) {
    return Math.round(value*100)/100;
}

export const feetToMiles = function(feet) {
    return feet * 0.00016457883369330453;
}

export const milesToMeters = function(miles) {
    return miles * 1852;
}

export const metersToMiles = function(meters) {
    return meters / 1852;
}

export const feetToMeters = function (feet) {
    return feet * 0.3048;
}

export const inverseBearing = function (bearing) {
    return (180 + bearing) % 360;
}

export const latitudeFromAngleDistance = function ( lat, long, angle, distance, latitude_center ) {
    return Math.asin(Math.sin(latitude_center)*Math.cos(distance)+Math.cos(lat)*Math.sin(distance)*Math.cos(radians(angle)));
}

export const longitudeFromAngleDistance = function ( lat, long, angle, distance, latitude_center ) {
    var latitude = latitudeFromAngleDistance( lat, long, angle, distance, latitude_center );
    if (Math.cos(lat)==0) {
        return long;      // endpoint a pole
    } else {
        return (long-Math.asin(Math.sin(radians(angle))*Math.sin(distance)/Math.cos(lat))+Math.PI % (2 * Math.PI)) - Math.PI;
    }
}

export const distanceToCenter = function (lat1,lon1,lat2,lon2) {
    /* compute distance (spherical) */

    var distance = 0;

    lat1 = radians( lat1 );
    lon1 = radians( lon1 );
    lat2 = radians( lat2 );
    lon2 = radians( lon2 );

    if ((lat1+lat2==0.) && (Math.abs(lon1-lon2)==Math.PI) && (Math.abs(lat1) != (Math.PI/180)*90.)){
        return 0;
    }

    distance = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2))
    return distance * (180/Math.PI)*60;
}

export const coarseToCenter = function (lat1,lon1,lat2,lon2) {
    /* compute course (spherical) */

    var coarse = 0;

    lat1 = radians( lat1 );
    lon1 = radians( lon1 );
    lat2 = radians( lat2 );
    lon2 = radians( lon2 );

    if ((lat1+lat2==0.) && (Math.abs(lon1-lon2)==Math.PI) && (Math.abs(lat1) != (Math.PI/180)*90.)){
        return 0;
    }


    var d = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2))

    if ((d==0.) || (lat1==-(Math.PI/180)*90.)){
        coarse=2*Math.PI
    } else if (lat1==(Math.PI/180)*90.){
        coarse=Math.PI
    } else {
        var argacos=(Math.sin(lat2)-Math.sin(lat1)*Math.cos(d))/(Math.sin(d)*Math.cos(lat1))
        if (Math.sin(lon2-lon1) < 0){
            coarse=Math.acos(argacos)
        }
        else{
            coarse=2*Math.PI-Math.acos(argacos)
        }
    }
    if ((d==0.) || (lat2==-(Math.PI/180)*90.)){
        coarse=0.
    } else if (lat2==(Math.PI/180)*90.){
        coarse=Math.PI
    }else{
        argacos=(Math.sin(lat1)-Math.sin(lat2)*Math.cos(d))/(Math.sin(d)*Math.cos(lat2))
        if (Math.sin(lon1-lon2)<0){
            coarse=Math.acos(argacos)
        }
        else{
            coarse=2*Math.PI-Math.acos(argacos)
        }
    }
    return coarse *(180/Math.PI);
}

export const coordsFromCoarseDistance = function (lat1, lon1, coarse, distance) {

    var latlon = new LatLon(lat1,lon1);
    return latlon.destinationPoint(milesToMeters(distance), coarse);

    /*

    var EPS = 0.00000000005;
    var dlon,lat,lon
    lat1 = radians( lat1 );
    lon1 = radians( lon1 );
    console.log('coordsFromCoarsDistance: coarse=' + coarse);
    // coarse = (180 + coarse) % 360;
    coarse = radians(coarse);
    console.log('coarse=' + coarse);
    // coarse = radians(coarse);
    distance = distance / 60 / (180/Math.PI);

    if ((export const abs(Math.cos(lat1))<EPS) && !(export const abs(Math.sin(coarse))<EPS)){
        alert("Only N-S courses are meaningful, starting at a pole!")
    }
    lat=Math.asin(Math.sin(lat1)*Math.cos(distance)+Math.cos(lat1)*Math.sin(distance)*Math.cos(coarse))
    if (export const abs(Math.cos(lat))<EPS){
        lon=0.; //endpoint a pole
    }else{
        dlon=export const atan2(Math.sin(coarse)*Math.sin(distance)*Math.cos(lat1),Math.cos(distance)-Math.sin(lat1)*Math.sin(lat))
        lon= ( lon1-dlon+Math.PI % (2*Math.PI) )-Math.PI
    }
    out = [];
    out.lat = export const degrees(lat);
    out.lon = export const degrees(lon);
    return out
    */
}

export const coordsToScreen = function (lat, lon, parameters: Parameters) { //  latitude_center, longitude_center, screenCenterX, screenCenterY, milesFactor) {
    var x: number
    var y: number
    if (lat >= parameters.latitudeCenter) {
        y = parameters.screenCenterX - ((lat - parameters.latitudeCenter) * constants.MILESFACT);
    }
    else {
        y = parameters.screenCenterY + ((parameters.latitudeCenter - lat) * constants.MILESFACT );
    }
    if (lon >= parameters.longitudeCenter) {
        x = parameters.screenCenterX + ((lon - parameters.longitudeCenter) * constants.MILESFACT );
    }
    else {
        x = parameters.screenCenterX - ((parameters.longitudeCenter - lon) * constants.MILESFACT );
    }
    return {x, y}
}

export const middlePoint =  function (lat1, lon1, lat2, lon2) {

    var latlon1 = new LatLon(lat1, lon1);
    var latlon2 = new LatLon(lat2, lon2);

    return latlon1.midpointTo(latlon2);
}
