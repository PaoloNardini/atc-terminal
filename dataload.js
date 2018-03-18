function runwayStatus() {
    this.icao = undefined;
    this.runway = undefined;
    this.status = undefined;
}

function loadScenery( name ) {
    var promiseLoad = new Promise(function(resolve, reject)
    {
        var icao = [];
        var promiseScenery = new Promise(function (resolve, reject) {
            $.get("data/scenery.txt", function (data) {
                var lines = data.split('\n');
                var words;
                var mode = '';
                for (var i = 0; i < lines.length; i++) {
                    words = lines[i].split(',');
                    if (words[0] == 'SCENERY') {
                        if (mode == '') {
                            if (words[1].toUpperCase() == name.toUpperCase()) {
                                mode = 'scenery';
                                MIN_LATITUDE = parseFloat(words[2]);
                                MIN_LONGITUDE = parseFloat(words[3]);
                                MAX_LATITUDE = parseFloat(words[4]);
                                MAX_LONGITUDE = parseFloat(words[5]);

                                LATITUDE_CENTER = (MIN_LATITUDE + MAX_LATITUDE) / 2;
                                LONGITUDE_CENTER = (MIN_LONGITUDE + MAX_LONGITUDE) / 2;
                            }
                        }
                        else if (mode == 'scenery') {
                            // End of scenery
                            resolve(true);
                            break;
                        }
                    }
                    if (mode == 'scenery') {
                        if (words[0] == 'AIRP') {
                            icao[icao.length] = words[1];
                            // loadAirports(icao);
                        }
                        if (words[0] == 'RWY' && words.length > 3) {
                            // Runway open/close status
                            var r = runway_status.length;
                            runway_status[r] = new runwayStatus();
                            var rws = runway_status[r];
                            rws.icao = words[1];
                            rws.runway = words[2];
                            rws.status = words[3];
                        }
                    }
                }
                if (mode == '') {
                    // No scenery found with that name ... try to load as airport
                    words = name.split(',');
                    for (var w=0; w<words.length; w++) {
                        icao[icao.length] = words[w].toUpperCase();
                    }
                    loadAirport(icao[0]).then(function () {
                        if (airports.length > 0) {
                            if (LATITUDE_CENTER == 0 && LONGITUDE_CENTER == 0) {
                                LATITUDE_CENTER = airports[0].latitude;
                                LONGITUDE_CENTER = airports[0].longitude;
                                MIN_LATITUDE = LATITUDE_CENTER - 2;
                                MAX_LATITUDE = LATITUDE_CENTER + 2;
                                MIN_LONGITUDE = LONGITUDE_CENTER - 2;
                                MAX_LONGITUDE = LONGITUDE_CENTER + 2;
                            }
                            resolve(true);
                        }
                        else {
                            reject(true);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            });
        });
        promiseScenery.then(function () {
            if (icao.length > 0) {
                // Load Navaids & Waypoints between coordinates
                loadNavaids().then(function () {
                    loadWaypoints().then(function () {
                        loadATS().then(function () {
                            // Load a maximum of 3 airports
                            // CASCADE PROMISES: UGLY BUT WORKS!!
                            var a = 0;
                            if (a < icao.length) {
                                loadAirport(icao[a]).then(function () {
                                    if (LATITUDE_CENTER == 0 && LONGITUDE_CENTER == 0) {
                                        LATITUDE_CENTER = airports[0].latitude;
                                        LONGITUDE_CENTER = airports[0].longitude;
                                        MIN_LATITUDE = LATITUDE_CENTER - 5;
                                        MAX_LATITUDE = LATITUDE_CENTER + 5;
                                        MIN_LONGITUDE = LONGITUDE_CENTER - 5;
                                        MAX_LONGITUDE = LONGITUDE_CENTER + 5;
                                    }
                                    loadProcedures(icao[a]).then(function () {
                                        a++;
                                        if (a < icao.length) {
                                            loadAirport(icao[a]).then(function () {
                                                loadProcedures(icao[a]).then(function () {
                                                    a++;
                                                    if (a < icao.length) {
                                                        loadAirport(icao[a]).then(function () {
                                                            loadProcedures(icao[a]).then(function () {
                                                                resolve(true);
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        resolve(true);
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            resolve(true);
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
        }, function() {
            console.log('Failed to load Scenery / Airport');
        });
    });
    return promiseLoad;
}

function loadNavaids() {
    console.log('=== LOAD NAVAIDS ===');
    var promiseNavaids =  new Promise(function (resolve, reject) {
        $.get("data/1712/navaids.txt", function (data) {
            var found = false;
            var lines = data.split('\n');
            var words;
            var mode = '';
            var route = -1;
            var latitude = 0;
            var longitude = 0;
            // var icao_prenavaid = icao.substring(0,2);
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words.length > 9) {
                    latitude = parseFloat(words[6]);
                    longitude = parseFloat(words[7]);
                    if (latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE && longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE) {
                        // Navaid is between scenery coordinates
                        var found = false;
                        var update = false;
                        var freq;
                        var navaid_label = words[0];
                        var navaid_name = words[1];
                        for (f = 0; f < navaids.length; f++) {
                            if (navaids[f].label == navaid_label) {
                                if (navaids[f].latitude == latitude && navaids[f].longitude == longitude) {
                                    found = true;
                                    break;
                                }
                                else if (Math.abs(navaids[f].latitude - latitude) < 0.1  && Math.abs(navaids[f].longitude - longitude) < 0.1) {
                                    found = true;
                                    update = true;
                                    break;
                                }
                            }
                        }
                        freq = parseFloat(words[2]);
                        if (!found) {
                            var f = navaids.length;
                            navaids[f] = new Navaid();
                            navaids[f].name = navaid_name;
                            navaids[f].label = navaid_label;
                            navaids[f].latitude = latitude;
                            navaids[f].longitude = longitude;
                            navaids[f].freq = parseFloat(words[2]);
                            navaids[f].gLabel.text = navaids[f].label;
                            // navaids[f].visible = false;
                        }
                        if (navaid_name.includes('ILS/CAT III')) {
                            navaids[f].type = FIX_TYPE_ILS_CAT_3;
                        }
                        else if (navaid_name.includes('ILS/CAT II')) {
                            navaids[f].type = FIX_TYPE_ILS_CAT_2;
                        }
                        else if (navaid_name.includes('ILS/CAT I')) {
                            navaids[f].type = FIX_TYPE_ILS_CAT_1;
                        }
                        else if (navaid_name.includes('ILS/LLZ')) {
                            navaids[f].type = FIX_TYPE_ILS_CAT_1;
                        }
                        else if (navaid_name.includes('LDA/FACILITY')) {
                            navaids[f].type = FIX_TYPE_ILS_CAT_1;
                        }
                        else if (freq >= 108 && freq <= 116) {
                            if (navaids[f].type == FIX_TYPE_NDB && update == true) {
                                navaids[f].type = FIX_TYPE_VORDMENDB;
                            }
                            else {
                                navaids[f].type = FIX_TYPE_VORDME;
                            }
                        }
                        else if (freq >= 200 && freq <= 500) {
                            if (navaids[f].type == FIX_TYPE_VORDME && update == true) {
                                navaids[f].type = FIX_TYPE_VORDMENDB;
                            }
                            else {
                                navaids[f].type = FIX_TYPE_NDB
                            }
                        }
                        if (navaids[f].type == FIX_TYPE_VORDME || navaids[f].type == FIX_TYPE_VORDMENDB || navaids[f].type == FIX_TYPE_NDB) {
                            navaids[f].show(true,false);
                            navaids[f].showLabel(true,false);
                        }
                        else {
                            navaids[f].show(false,false);
                            navaids[f].showLabel(false,false);
                        }
                    }
                }
            }
            for (f = 0; f < navaids.length; f++) {
                if (navaids[f].visible == true) {
                    navaids[f].setScreenPosition();
                    mainContainer.addChild(navaids[f]);
                }
            }
            resolve(true);
        });
    });
    return promiseNavaids;
}

function loadWaypoints() {
    console.log('=== LOAD WAYPOINTS ===');
    var promiseWaypoints =  new Promise(function (resolve, reject) {
        $.get("data/1712/waypoints.txt", function (data) {
            var lines = data.split('\n');
            var words;
            // var icao_prenavaid = icao.substring(0,2);
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words[3] != undefined) { //&& words[3].includes(icao_prenavaid))
                    latitude = parseFloat(words[1]);
                    longitude = parseFloat(words[2]);
                    if (latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE && longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE) {
                        // Waypoint is between scenery coordinates
                        o_wp = addWaypoint(words[0], '', latitude, longitude);
                        mainContainer.addChild(o_wp);
                    }
                }
            }
            resolve(true);
        });
    });
    return promiseWaypoints;
}

function loadAirport( icao ) {
    console.log('=== LOAD AIRPORT ' + icao + ' ===');
    var promiseAirport = new Promise(function (resolve, reject) {
        for (var a = 0; a < airports.length; a++) {
            if (airports[a].icao == icao) {
                // Already Loaded
                resolve(true);
            }
        }
        $.get("data/1712/airports.txt", function (data) {
            var found = false;
            var lines = data.split('\n');
            var words;
            var mode = '';
            var route = -1;
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words[0] == 'A') {
                    if (found) {
                        break;
                    }
                    if (mode == '') {
                        if (words[1] == icao) {
                            found = true;
                            var a = airports.length;
                            // First airport is located always in the center of the control area
                            airports[a] = new Airport();
                            airports[a].name = words[2];
                            airports[a].icao = words[1];
                            airports[a].latitude = parseFloat(words[3]);
                            airports[a].longitude = parseFloat(words[4]);
                            mode = 'A';
                        }
                    }
                    else {
                        mode = '';
                    }
                }
                if (mode == 'A' && words[0] == 'R') {

                    // Add runway to airport
                    var r = runways.length;
                    var name = words[1];
                    var heading = parseInt(words[2]);
                    var strip_length =  parseInt(words[3]);
                    var strip_width = parseInt(words[4]);
                    runways[r] = new Runway();
                    runways[r].icao  = icao;
                    runways[r].name = name;
                    runways[r].label1 = name;
                    runways[r].heading = heading;
                    runways[r].strip_length = strip_length;
                    runways[r].strip_width = strip_width;
                    runways[r].latitude = parseFloat(words[8]);
                    runways[r].longitude = parseFloat(words[9]);
                    runways[r].gLabel1.text = runways[r].label1;
                    runways[r].gLabel2.text = runways[r].label2 + '\n' + runways[r].heading + '\n' + runways[r].strip_length;

                    // Check for reciprocal runway to merge data
                    var opposite_heading = Math.inverseBearing(heading);
                    var marker = undefined;
                    if (name.includes('R')) {
                        marker = 'L';
                    }
                    if (name.includes('L')) {
                        marker = 'R';
                    }
                    if (name.includes('C')) {
                        marker = 'C';
                    }
                    console.log('Created runway ' + words[1] + '(' + icao + ') ' + heading + ' / ' + opposite_heading);

                    for(var r1=0; r1 < r; r1++ ) {
                        if (runways[r1].icao == icao) {
                            if (runways[r1].heading == opposite_heading) {
                                if (marker == undefined || runways[r1].name.includes(marker)) {
                                    if (runways[r1].strip_length == strip_length && runways[r1].strip_width == strip_width) {
                                        console.log('Find opposite ' + runways[r1].name);
                                        runways[r1].latitude_end = runways[r].latitude;
                                        runways[r1].longitude_end = runways[r].longitude;
                                        runways[r1].setScreenPosition();
                                        runways[r].latitude_end = runways[r1].latitude;
                                        runways[r].longitude_end = runways[r1].longitude;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    // Add runway
                    runways[r].setScreenPosition();

                    // Create FIX for runways
                    var f = fixes.length;
                    fixes[f] = new Fix();
                    fixes[f].name = words[1];
                    fixes[f].label = words[1];
                    fixes[f].latitude = parseFloat(words[8]);
                    fixes[f].longitude = parseFloat(words[9]);
                    fixes[f].type = FIX_TYPE_RWY;
                    // fixes[f].gLabel.text = fixes[f].label;
                    // fixes[f].setScreenPosition();
                    // mainContainer.addChild(fixes[f].gDraw);
                }
            }
            resolve(true);
        });
    });
    return promiseAirport;
}

function loadProcedures(icao) {
    console.log('=== LOAD PROCEDURES ' + icao + ' ===');
    var promiseProcedures = new Promise(function (resolve, reject) {
        $.get("data/1712/proc/" + icao + ".txt", function (data) {

            //split on new lines
            var lines = data.split('\n');
            var words;
            var mode = '';
            var route = -1;
            var mapFixPos = -1;
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');

                /*
                 FIX TYPE
                 CA - Course to an Altitude
                 CF - Course to a Fix
                 DF - Direct to a Fix
                 FA - Fix to an Altitude
                 FM - Fix to a Manual Termination
                 HA - Racetrack Course Reversal (Alt Term)
                 HF - Racetrack (Single Circuit -Fix Term)
                 HM - Racetrack (Manual Termination)
                 IF - Initial Fix
                 TF - Track to a Fix TF
                 RF - Constant Radius Arc
                 VA - Heading to an Altitude
                 VI - Heading to an Intercept
                 V  - Heading to a Manual Termination


                 PROC format
                 TF,QN878,-45.302217,168.731147,0, ,0.0,0.0,160.0,9.1,0,0,0,0,0,0,0,0,0.1

                 WAYPOINT TYPE TF (Waypoint to a Fix)
                 TF = Record identifier string  always TF
                 QN878 = Waypoint identifier
                 -45.302217 = Track latitude degrees
                 168.731147 = Track longitude  degrees
                 0 = Turn direction int, 0=shorters, 1=left, 2=right
                 " " = Navaid identifier
                 0.0 = Track bearing   degrees
                 0.0 = Track distance nautical miles
                 160.0 = Magnetic course   degrees
                 9.1= distance  nautical miles
                 0 = Altitude constraint int 0=no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
                 0 = First altitude int feet
                 0 = Second altitude int feet
                 0 = Speed constraint int see Speed Constraints below
                 0 = First speed int knots
                 0 = Second speed int knots
                 0 = Special Track int see Special Tracks below
                 0 = Overfly Track bool see Overfly Tracks below
                 0.1 = Req. Nav. Perf.


                 And a RF Leg something like this:

                 RF = Record identifier
                 REDGO = Start fix
                 50.10916669 = Track latitude   degrees
                 8.85638906 = Track longitude   degrees
                 0 = Turn direction
                 TAU = Arc Center
                 249 = Sweep angle  degrees
                 4.3 = Radius nautical miles
                 1 = Altitude constraint
                 4000 = First altitude   feet
                 0 = Second altitude   feet
                 1 = Speed constraint
                 160 = First speed  knots
                 0 = Second speed   knots
                 0 = Special Track
                 0 = Overfly Track
                 0.1 = Req. Nav. Perf.

                 */

                if (true) { // && (words[0] == 'IF' || words[0] == 'TF' || words[0] == 'CF' || words[0] == 'DA' || words[0] == 'DF' || words[0] == 'FA'))
                    // Fix
                    var fix_type = words[0];
                    var fix_label = words[1];
                    var found = false;
                    for (f = 0; f < fixes.length; f++) {
                        if (fixes[f].label == fix_label) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        var f = fixes.length;
                        fixes[f] = new Fix();
                        fixes[f].name = fix_label;
                        fixes[f].label = fix_label;
                        fixes[f].latitude = parseFloat(words[2]);
                        fixes[f].longitude = parseFloat(words[3]);
                        fixes[f].type = FIX_TYPE_ROUTE_FIX;
                        fixes[f].gLabel.text = fixes[f].label;
                        if (words.length > 10) {
                            fixes[f].altitude = parseFloat(words[11])
                        }
                        if (fix_type == 'IF' || fix_type == 'TF') {
                            var c;
                            if ((c = waypointsById[fix_label]) != undefined) {
                                // TODO
                                if (waypoints[c] != undefined && waypoints[c].type != undefined) {
                                    // Delete waypoint with the same name of the fix
                                    waypoints.splice(c, 1);
                                }
                                waypointsById[fix_label] = undefined;
                            }
                            // var o_wp = findWaypoint(fix_label);
                            // if (o_wp != undefined) {
                            // Show fix
                            fixes[f].show(true, false);
                            fixes[f].setScreenPosition();
                            mainContainer.addChild(fixes[f]);
                        }
                    }
                    if (mode == 'SID' || mode == 'STAR' || mode == 'APPTR' || mode == 'FINAL') {
                        routes[route].addFix(f);
                        if (mode == 'FINAL' && routes[route].tracks.length == mapFixPos) {
                            // Set fix as MAP
                            routes[route].mapFix = fixes[f].label;
                            mapFixPos = -1;
                        }
                    }

                }

                if (words[0] == 'SID') {
                    mode = 'SID';
                    route = routes.length;
                    routes[route] = new Route();
                    routes[route].icao = icao;
                    routes[route].name = words[1];
                    routes[route].name2 = words[2];
                    routes[route].type_number = words[3];
                    routes[route].type = mode;
                    for (var r=0; r<runways.length; r++) {
                        if (runways[r].icao == icao && runways[r].label1 == words[2]) {
                            routes[route].runway = words[2];
                        }
                    }
                }
                else if (words[0] == 'STAR') {
                    mode = 'STAR';
                    route = routes.length;
                    routes[route] = new Route();
                    routes[route].name = words[1];
                    routes[route].type = mode;
                    routes[route].icao = icao;
                    if (words[2] == 'ALL') {
                        routes[route].runway = words[2];
                    }
                    else {
                        for (var r = 0; r < runways.length; r++) {
                            if (runways[r].icao == icao && runways[r].label1 == words[2]) {
                                routes[route].runway = words[2];
                            }
                        }
                    }
                }
                else if (words[0] == 'APPTR') {
                    mode = 'APPTR';
                    route = routes.length;
                    routes[route] = new Route();
                    routes[route].name = words[1];
                    routes[route].type = mode;

                }
                else if (words[0] == 'FINAL') {
                    mode = 'FINAL';
                    route = routes.length;
                    routes[route] = new Route();
                    routes[route].name = words[1];
                    routes[route].type = mode;
                    routes[route].icao = icao;
                    for (var r=0; r<runways.length; r++) {
                        if (runways[r].icao == icao && runways[r].label1 == words[2]) {
                            routes[route].runway = words[2];
                        }
                    }
                    routes[route].finalFix = words[2];
                    routes[route].mapFix = '';
                    mapFixPos = words[4];
                }
                else {
                    // Add Leg to Route
                    var step = new Step();
                    step.type = words[0];
                    switch (step.type) {
                        case 'IF':
                            // IF - Initial Fix
                            step.identifier = words[1];
                            step.latitude = parseFloat(words[2]);
                            step.longitude = parseFloat(words[3]);
                            step.navaid_id = words[4];
                            step.track_bearing = words[5];
                            step.track_distance = words[6];
                            step.altitude_constraint = words[7];
                            step.altitude_1 = parseInt(words[8]);
                            step.altitude_2 = parseInt(words[9]);
                            step.speed_constraint = words[10];
                            step.speed_1 = words[11];
                            step.speed_2 = words[12];
                            break;
                        case 'TF':
                            // TF - Track to a Fix TF
                            step.identifier = words[1];
                            step.latitude = parseFloat(words[2]);
                            step.longitude = parseFloat(words[3]);
                            step.turn_direction = words[4];
                            step.navaid_id = words[5];
                            step.track_bearing = words[6];
                            step.track_distance = words[7];
                            step.heading = words[8];
                            step.distance = words[9];
                            step.altitude_constraint = words[10];
                            step.altitude_1 = parseInt(words[11]);
                            step.altitude_2 = parseInt(words[12]);
                            step.speed_constraint = words[13];
                            step.speed_1 = words[14];
                            step.speed_2 = words[15];
                            break;
                        case 'CA':
                            // CA - Course to an Altitude
                            // CA,0,330.0,2,830,0,0,0,0,0,0
                        case 'VA':
                            // VA - Heading to an Altitude
                            // VA,0,308.0,2,600,0,0,0,0,0,0
                            step.turn_direction = words[1];
                            step.heading = words[2];
                            step.altitude_constraint = words[3];
                            step.altitude_1 = parseInt(words[4]);
                            step.altitude_2 = parseInt(words[5]);
                            break;
                        case 'CF':
                            // CF - Course to a Fix
                            // CF,XENOL,41.788333,11.552222,0,ROM,267.1,46.5,274.0,12.0,2,4000,0,0,0,0,0,0
                            step.identifier = words[1];
                            step.latitude = parseFloat(words[2]);
                            step.longitude = parseFloat(words[3]);
                            step.turn_direction = words[4];
                            step.navaid_id = words[5];
                            step.track_bearing = words[6];
                            step.track_distance = words[7];
                            step.heading = words[8];
                            step.distance = words[9];
                            step.speed_constraint = words[10];
                            step.speed_1 = words[11];
                            step.speed_2 = words[12];
                            step.overfly = words[16];
                            break;
                        case 'DF' :
                            // DF - Direct to a Fix
                            step.identifier = words[1];
                            step.latitude = parseFloat(words[2]);
                            step.longitude = parseFloat(words[3]);
                            step.turn_direction = words[4];
                            step.navaid_id = words[5];
                            step.track_bearing = words[6];
                            step.track_distance = words[7];
                            step.altitude_constraint = words[8];
                            step.altitude_1 = parseInt(words[9]);
                            step.altitude_2 = parseInt(words[10]);
                            step.speed_constraint = words[11];
                            step.speed_1 = words[12];
                            step.speed_2 = words[13];
                            break;
                        case 'CD':
                            // CD - Coarse Direction
                            // CD, ,0,0,0,OST,0,0.0,161.0,2.0,2,620,0,0,0,0,0,0
                            // CD, ,0,0,0,OST,0,0.0,68.0,5.0,2,1000,0,0,0,0,0,0
                            step.navaid_id = words[5];
                            step.heading = words[8];
                            step.track_distance = words[9];
                            step.altitude_constraint = words[10];
                            step.altitude_1 = parseInt(words[11]);
                            step.altitude_2 = parseInt(words[12]);
                            break;
                        case 'CI':
                            // CI - Coarse to Intercept
                            // CI,2, ,0.0,300.0,0,0,0,1,220,0,0,0
                            step.heading = words[4];
                            step.speed_constraint = words[13];
                            step.speed_1 = words[14];
                            step.speed_2 = words[15];

                            break;
                        case 'FD':
                            // FD - Fix to a direction
                            // FD,OST,41.803778,12.237528,0,OST,0.0,20.0,262.0,20.0,0,0,0,0,0,0,0,0
                            // FD,OST,41.803778,12.237528,0,OST,0.0,9.0,193.0,9.0,1,2000,0,0,0,0,0,0
                            // FD,TAQ,42.215056,11.732611,0,TAQ,0.0,16.0,119.0,16.0,0,0,0,0,0,0,1,0
                            step.navaid_id = words[5];
                            step.track_bearing = words[6];
                            step.track_distance = words[7];
                            step.heading = words[8];
                            step.altitude_constraint = words[10];
                            step.altitude_1 = parseInt(words[11]);
                            step.altitude_2 = parseInt(words[12]);
                            step.speed_constraint = words[13];
                            step.speed_1 = words[14];
                            step.speed_2 = words[15];
                            step.overfly = words[16];
                            break;
                        case 'FA':
                            // FA - Fix to an Altitude
                            // FA,RW16L,41.845969,12.261494,0,CMP,0.0,0.0,161.0,2,450,0,0,0,0,0,0
                            step.heading = words[8];
                            step.altitude_constraint = words[9];
                            step.altitude_1 = parseInt(words[10]);
                            step.altitude_2 = parseInt(words[11]);
                            break;
                        case 'HA':
                        // HA - Racetrack Course Reversal (Alt Term)
                        case 'HF':
                        // HF - Racetrack (Single Circuit -Fix Term)
                        // HF,UNPIV,43.544722,10.251111,1, ,0.0,0.0,36.0,05,2,3000,0,0,0,0,0,0,0
                        case 'HM':
                            // HM - Racetrack (Manual Termination)
                            // HM,D193S,41.497331,12.130561,2, ,0.0,0.0,13.0,05,0,0,0,0,0,0,0,0,0
                            // HM,D291S,41.925397,11.846133,2, ,0.0,0.0,111.0,05,2,3000,0,0,0,0,0,0,0
                            // HM,D160S,41.502928,12.369833,1, ,0.0,0.0,340.0,05,0,0,0,1,185,0,0,0,0
                            step.identifier = words[1];
                            step.latitude = parseFloat(words[2]);
                            step.longitude = parseFloat(words[3]);
                            step.turn_direction = parseInt(words[4]);
                            step.heading = parseInt(words[8]);
                            step.leg_distance = parseInt(words[9]);
                            step.altitude_constraint = parseInt(words[10]);
                            step.altitude_1 = parseInt(words[11]);
                            step.altitude_2 = parseInt(words[12]);
                            step.speed_constraint = parseInt(words[13]);
                            step.speed_1 = parseInt(words[14]);
                            step.speed_2 = parseInt(words[15]);
                            break;
                        case 'VI':
                            // VI - Heading to an Intercept
                            // VI,2, ,0.0,238.0,0,0,0,1,200,0,0,0
                            step.turn_direction = words[1];
                            step.heading = words[4];
                            step.altitude_constraint = words[8];
                            step.altitude_1 = parseInt(words[9]);
                            step.altitude_2 = parseInt(words[10]);
                            break;
                        case 'RF':
                            // RF - Constant Radius Arc
                        case 'V':
                        case 'VM':
                            // V / VM - Heading to a Manual Termination
                        case 'FM':
                            // FM - Fix to a Manual Termination
                            console.log('Leg type ' + step.type + ' unsupported');
                            break;
                    }
                    if (mode == 'FINAL') {
                        step.change_flight_phase = PHASE_FINAL;
                    }
                    routes[route].addLeg(step);
                }

            }
            resolve(true);
            // $('#msg').html( data.substr(0,100) );
            // randomizePlanes();
            // randomizeFixes();
        });
    });
    return promiseProcedures;
}


function loadATS() {
    console.log('=== LOAD ATS ===');
    var promiseAts =  new Promise(function (resolve, reject) {
        $.get("data/1712/ATS.txt", function (data) {
            var found = false;
            var lines = data.split('\n');
            var words;
            var mode = '';
            var route_name = '';
            var fix = '';
            var route = -1;
            var points = 0;
            var valid = false;
            var latitude = 0;
            var longitude = 0;
            var o_step = undefined;
            var o_route = undefined;
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words.length < 3) {
                    mode = 0;
                    if (o_route != undefined && valid == true) {
                        route = ats_routes.length;
                        ats_routes[route] = o_route;
                        var steps = o_route.getLegs();
                        for (var s=0; s<steps.length; s++) {
                            o_step = steps[s];
                            var o_fix = findFixByLabel(o_step.identifier);
                            if (o_fix == undefined || (Math.abs(o_fix.latitude - o_step.latitude) > 0.05)) {
                                o_fix = addFix(o_step.identifier, '', o_step.latitude, o_step.longitude);
                                // o_wp = addWaypoint(o_step.identifier, '', o_step.latitude, o_step.longitude);
                                mainContainer.addChild(o_fix);
                            }
                        }
                    }
                    o_route = undefined;
                }
                if (words.length == 3) {
                    o_route = undefined;
                    valid = false;
                    route_name = words[1];
                    mode = 1;
                    points = parseInt(words[2]);
                    o_route = new Route();
                    o_route.type = 'ATS';
                    o_route.name = route_name;
                }
                if (mode == 1 && words.length > 8) {
                    latitude = parseFloat(words[2]);
                    longitude = parseFloat(words[3]);
                    if (latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE && longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE) {
                        valid = true;
                    }
                    o_step = new Step();
                    o_step.type = 'DF';
                    o_step.identifier = words[1];
                    o_step.latitude = latitude;
                    o_step.longitude = longitude;
                    o_step.heading = parseInt(words[8]);
                    o_step.distance = parseFloat(words[9]);
                    o_route.addLeg(o_step);
                }
            }
            resolve(true);
        });
    });
    return promiseAts;
}
