/* Some mathematical formulas to compute everything needed */

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

Math.round2 = function (value) {
    return Math.round(value*100)/100;
}

Math.feetToMiles = function(feet) {
    return feet * 0.00016457883369330453;
}

Math.milesToMeters = function(miles) {
    return miles * 1852;
}

Math.metersToMiles = function(meters) {
    return meters / 1852;
}

Math.feetToMeters = function (feet) {
    return feet * 0.3048;
}

Math.inverseBearing = function (bearing) {
    return (180 + bearing) % 360;
}

Math.latitudeFromAngleDistance = function ( lat, long, angle, distance ) {
    return Math.asin(Math.sin(LATITUDE_CENTER)*cos(distance)+cos(lat)*sin(distance)*cos(Math.radians(angle)));
}

Math.longitudeFromAngleDistance = function ( lat, long, angle, distance ) {
    var latitude = Math.latitudeFromAngleDistance( lat, long, angle, distance );
    if (Math.cos(lat)==0) {
        return long;      // endpoint a pole
    } else {
        return (long-Math.asin(sin(Math.radians(angle))*Math.sin(distance)/Math.cos(lat))+Math.PI % (2 * Math.PI)) - Math.PI;
    }
}

Math.distanceToCenter = function (lat1,lon1,lat2,lon2) {
    /* compute distance (spherical) */

    var distance = 0;

    lat1 = Math.radians( lat1 );
    lon1 = Math.radians( lon1 );
    lat2 = Math.radians( lat2 );
    lon2 = Math.radians( lon2 );

    if ((lat1+lat2==0.) && (Math.abs(lon1-lon2)==Math.PI) && (Math.abs(lat1) != (Math.PI/180)*90.)){
        return 0;
    }

    with (Math){
        distance = acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon1-lon2))
    }
    return distance * (180/Math.PI)*60;
}

Math.coarseToCenter = function (lat1,lon1,lat2,lon2) {
    /* compute course (spherical) */

    var coarse = 0;

    lat1 = Math.radians( lat1 );
    lon1 = Math.radians( lon1 );
    lat2 = Math.radians( lat2 );
    lon2 = Math.radians( lon2 );

    if ((lat1+lat2==0.) && (Math.abs(lon1-lon2)==Math.PI) && (Math.abs(lat1) != (Math.PI/180)*90.)){
        return 0;
    }

    with (Math){

        d = acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon1-lon2))

        if ((d==0.) || (lat1==-(PI/180)*90.)){
            coarse=2*PI
        } else if (lat1==(PI/180)*90.){
            coarse=PI
        } else {
            argacos=(sin(lat2)-sin(lat1)*cos(d))/(sin(d)*cos(lat1))
            if (sin(lon2-lon1) < 0){
                coarse=acos(argacos)
            }
            else{
                coarse=2*PI-acos(argacos)
            }
        }
        if ((d==0.) || (lat2==-(PI/180)*90.)){
            coarse=0.
        } else if (lat2==(PI/180)*90.){
            coarse=PI
        }else{
            argacos=(sin(lat1)-sin(lat2)*cos(d))/(sin(d)*cos(lat2))
            if (sin(lon1-lon2)<0){
                coarse=acos(argacos)
            }
            else{
                coarse=2*PI-acos(argacos)
            }
        }
    }
    return coarse *(180/Math.PI);
}

Math.coordsFromCoarseDistance = function (lat1, lon1, coarse, distance) {

    latlon = new LatLon(lat1,lon1);
    out = latlon.destinationPoint(Math.milesToMeters(distance), coarse);
    return out;

    /*

    var EPS = 0.00000000005;
    var dlon,lat,lon
    lat1 = Math.radians( lat1 );
    lon1 = Math.radians( lon1 );
    console.log('coordsFromCoarsDistance: coarse=' + coarse);
    // coarse = (180 + coarse) % 360;
    coarse = Math.radians(coarse);
    console.log('coarse=' + coarse);
    // coarse = Math.radians(coarse);
    distance = distance / 60 / (180/Math.PI);

    if ((Math.abs(Math.cos(lat1))<EPS) && !(Math.abs(Math.sin(coarse))<EPS)){
        alert("Only N-S courses are meaningful, starting at a pole!")
    }
    lat=Math.asin(Math.sin(lat1)*Math.cos(distance)+Math.cos(lat1)*Math.sin(distance)*Math.cos(coarse))
    if (Math.abs(Math.cos(lat))<EPS){
        lon=0.; //endpoint a pole
    }else{
        dlon=Math.atan2(Math.sin(coarse)*Math.sin(distance)*Math.cos(lat1),Math.cos(distance)-Math.sin(lat1)*Math.sin(lat))
        lon= ( lon1-dlon+Math.PI % (2*Math.PI) )-Math.PI
    }
    out = [];
    out.lat = Math.degrees(lat);
    out.lon = Math.degrees(lon);
    return out
    */
}

Math.coordsToScreen = function (lat, lon) {
    out = [];
    if (lat >= LATITUDE_CENTER) {
        out.y = SCREEN_CENTER_Y - ((lat - LATITUDE_CENTER) * MILESFACT );
    }
    else {
        out.y = SCREEN_CENTER_Y + ((LATITUDE_CENTER - lat) * MILESFACT );
    }
    if (lon >= LONGITUDE_CENTER) {
        out.x = SCREEN_CENTER_X + ((lon - LONGITUDE_CENTER) * MILESFACT );
    }
    else {
        out.x = SCREEN_CENTER_X - ((LONGITUDE_CENTER - lon) * MILESFACT );
    }
    return out;
}

Math.middlePoint =  function (lat1, lon1, lat2, lon2) {

    latlon1 = new LatLon(lat1, lon1);
    latlon2 = new LatLon(lat2, lon2);

    out = latlon1.midpointTo(latlon2);
    return out;
}
/*
LatLon.prototype.midpointTo = function(point) {
    */