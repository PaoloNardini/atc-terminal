import * as fs from 'fs';
import * as path from 'path';
import { Airport, Context, Runway, Scenario } from "../core/entities"
import { ScenarioGateway } from "../core/gateways"
import D from 'debug'
import { Bearing, Coordinate } from '../core/valueObjects';
import * as geomath from '../helpers/geomath'

const debug = D('app:src:infrastructure:scenarioGateway')


export const makeScenarioGateway = (context: Context): ScenarioGateway => {

    return {
        loadScenarioByName( name: string) {
            // Test
            loadScenario(context ,'ROME', undefined )
            const scenario: Scenario = {
                name: name,
            }
            return scenario
        },
        loadScenarioByAirportCode( icao: string) {
            // Test
            loadScenario(context, undefined, 'LIRF' )
            const scenario: Scenario = {
                name: icao,
            }
            return scenario
        }
    }
}

function loadScenario ( context: Context, name?: string, icao?: string ) {
    void context && name && icao
    debug( `Load scenario`)
    fs.readFile(path.join(__dirname, '../../data/scenery.txt'), 'utf8', (error, data) => {
        if (error) {
            debug(error)
        }
        if (data) {
            let icao: any[] = []
            let runways: any[] = []
            debug(`data: ${data}`)
            var lines = data.split('\n');
            var words;
            var mode = '';
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words[0] == 'SCENERY') {
                    if (mode == '') {
                        if (name && words[1].toUpperCase() == name.toUpperCase()) {
                            mode = 'scenery';
                            context.parameters.minLatitude = parseFloat(words[2]);
                            context.parameters.minLongitude = parseFloat(words[3]);
                            context.parameters.maxLatitude = parseFloat(words[4]);
                            context.parameters.maxLongitude = parseFloat(words[5]);

                            context.parameters.latitudeCenter = (context.parameters.minLatitude + context.parameters.maxLatitude) / 2;
                            context.parameters.longitudeCenter = (context.parameters.minLongitude + context.parameters.maxLongitude) / 2;
                        }
                    }
                    else if (mode == 'scenery') {
                        // End of scenery
                        break;
                    }
                }
                if (mode == 'scenery') {
                    if (words[0] == 'AIRP') {
                        const airport_icao = words[1] 
                        icao[icao.length] = airport_icao
                        loadAirport(context, airport_icao)
                    }
                    if (words[0] == 'RWY' && words.length > 3) {
                        // Runway open/close status
                        var r = new Runway()
                        r.icao = words[1];
                        r.name = words[2];
                        r.status = words[3];
                        runways.push(r)
                    }
                }
            }
            context.scenario.runways = runways
        }
                /*
                if (mode == '') {
                    // No scenery found with that name ... try to load as airport
                    words = name.split(',');
                    for (var w=0; w<words.length; w++) {
                        icao[icao.length] = words[w].toUpperCase();
                    }
                    loadAirport(icao[0]).then(function () {
                        if (airports.length > 0) {
                            if (LATITUDE_CENTER == 0 && LONGITUDE_CENTER == 0) {
                                LATITUDE_CENTER = Math.floor(airports[0].latitude * 10) / 10;
                                LONGITUDE_CENTER = Math.floor(airports[0].longitude * 10) / 10;
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
                */
    });
        /*
        promiseScenery.then(function () {
            if (icao.length > 0) {
                // Load Navaids & Waypoints between coordinates
                loadNavaids().then(function () {
                    loadWaypoints().then(function () {
                        loadATS().then(function () {
                            loadAirlines().then(function () {
                                // Load a maximum of 3 airports
                                // CASCADE PROMISES: UGLY BUT WORKS!!
                                var a = 0;
                                if (a < icao.length) {
                                    loadAirport(icao[a]).then(function () {
                                        if (LATITUDE_CENTER == 0 && LONGITUDE_CENTER == 0) {
                                            LATITUDE_CENTER = Math.floor(airports[0].latitude * 10) / 10;
                                            LONGITUDE_CENTER = Math.floor(airports[0].longitude * 10) / 10;
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
                });
            }
        }); 
        */
}

const loadAirport = (context: Context, icao: string) => {
    debug( `Load airport ${icao}`)
    if (context.scenario.airports?.find((airp: Airport) => {
        return airp.icao == icao
    })) {
        // Airport already loaded
        return
    }
    fs.readFile(path.join(__dirname, '../../data/1712/Airports.txt'), 'utf8', (error, data) => {
        if (error) {
            debug(error)
        }
        if (data) {
            let airport: Airport | undefined = undefined
            let runway: Runway | undefined = undefined
            var found = false;
            var lines = data.split('\n');
            var words;
            var mode = '';
            // var route = -1;
            for (var i = 0; i < lines.length; i++) {
                words = lines[i].split(',');
                if (words[0] == 'A') {
                    if (found) {
                        break;
                    }
                    if (mode == '') {
                        if (words[1] == icao) {
                            found = true;
                            airport = new Airport()
                            airport.name = words[2];
                            airport.icao = words[1];
                            const latitude = parseFloat(words[3]);
                            const longitude = parseFloat(words[4]);
                            airport.coordinate = new Coordinate(latitude, longitude)
                            context.scenario.airports?.push(airport)
                            mode = 'A';
                        }
                    }
                    else {
                        mode = '';
                    }
                }
                if (mode == 'A' && words[0] == 'R') {
                    // Add runway to airport
                    runway = new Runway()
                    runway.name = words[1];
                    runway.heading = new Bearing(parseInt(words[2]))
                    runway.strip_length =  parseInt(words[3]);
                    runway.strip_width = parseInt(words[4]);
                    runway.coordinate1 = new Coordinate(parseFloat(words[8]), parseFloat(words[9]))
                    if (airport) airport.runways?.push(runway)
                    // runways[r].gLabel1.text = runways[r].label1;
                    // runways[r].gLabel2.text = runways[r].label2 + '\n' + runways[r].heading + '\n' + runways[r].strip_length;

                    // Check for reciprocal runway to merge data
                    var opposite_heading = geomath.inverseBearing(runway.heading.getBearing());
                    var marker: string | undefined = undefined;
                    if (runway.name.includes('R')) {
                        marker = 'L';
                    }
                    if (runway.name.includes('L')) {
                        marker = 'R';
                    }
                    if (runway.name.includes('C')) {
                        marker = 'C';
                    }
                    debug('Created runway ' + words[1] + '(' + icao + ') ' + words[2] + ' / ' + opposite_heading);

                    airport?.runways?.forEach( rwy2 => {
                        if (runway && rwy2.icao == icao) {
                            if (rwy2.heading?.getBearing() == opposite_heading) {
                                if (marker == undefined || rwy2.name?.includes(marker)) {
                                    if (rwy2.strip_length == runway.strip_length && rwy2.strip_width == runway.strip_width) {
                                        // Found the reciprocal runway
                                        rwy2.coordinate2 = new Coordinate(runway.coordinate1?.latitude, runway.coordinate1?.longitude)
                                        runway.coordinate2 = new Coordinate(rwy2.coordinate1?.latitude, rwy2.coordinate1?.longitude)
                                    }
                                }
                            }
                        }
                    })
                    // TODO
                    /*
                    // Create FIX for runways
                    var o_wp = findWaypoint(name, latitude, longitude );
                    if (o_wp == undefined) {
                        o_wp = addWaypoint(name, '', latitude, longitude);
                    }
                    o_wp.isRunway = true;
                    o_wp.useCounter++;
                    */
                }
            }
        }
    })
}
