import * as fs from 'fs';
import * as path from 'path';
import { Scenario } from "../core/entities"
import { ScenarioGateway } from "../core/gateways"
import D from 'debug'

const debug = D('app:src:infrastructure:scenarioGateway')


export const makeScenarioGateway = (): ScenarioGateway => {

    return {
        loadScenarioByName( name: string) {
            // Test
            loadScenario({},'ROME', undefined )
            const scenario: Scenario = {
                name: name,
            }
            return scenario
        },
        loadScenarioByAirportCode( icao: string) {
            // Test
            loadScenario({}, undefined, 'LIRF' )
            const scenario: Scenario = {
                name: icao,
            }
            return scenario
        }
    }
}

function loadScenario ( context: any, name?: string, icao?: string ) {
    void context && name && icao
    debug( `Load scenario`)
    fs.readFile(path.join(__dirname, '../../data/scenery.txt'), 'utf8', (error, data) => {
                if (error) {
                    debug(error)
                }
                if (data) {
                    debug(`data: ${data}`)
                }

                 // ...
                /*
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
