import * as fs from 'fs'
import * as path from 'path'
import { Airport, Context, Runway, Scenario } from '../../../core/entities'
import { ScenarioGateway } from '../../../core/gateways'
import D from 'debug'
import { Bearing, Coordinate } from '../../../core/valueObjects'
import * as geomath from '../../../helpers/geomath'
import util from 'util'
const debug = D('app:src:infrastructure:scenarioGateway')

export const makeScenarioGateway = (context: Context): ScenarioGateway => {
  return {
    async loadScenarioByName(name: string) {
      context = await loadScenario(context, name)
      debug(`Scenario loaded: ${util.inspect(context.scenario, false, 5)}`)
      return context.scenario
    },
    async loadScenarioByAirportCode(icao: string) {
      // TODO
      context = await loadScenario(context, icao)
      return context.scenario
    },
  }
}

const loadScenario = async (
  context: Context,
  name: string
): Promise<Context> => {
  debug(`Load scenario`)
  context.scenario = new Scenario()
  context.scenario.airports = []
  context.scenario.runways = []
  context.scenario.atsRoutes = []
  context.scenario.initialPlanes = []
  context.waypoints = {}
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/scenery.txt'),
    'utf8'
  )
  if (data) {
    let icao: any[] = []
    let runways: any[] = []
    // debug(`data: ${data}`)
    var lines: string[] = data.split('\n')
    var words: string[]
    var mode = ''
    // debug(`lines: ${lines.length}`)
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      // debug(`words: ${words} - ${words[0]} - ${words[1]}`)
      if (words[0] == 'SCENERY') {
        if (mode == '') {
          if (name && words[1].toUpperCase() == name.toUpperCase()) {
            debug(`name: ${name}`)
            context.scenario.name = name
            mode = 'scenery'
            context.parameters.minCoordinates = new Coordinate(
              parseFloat(words[2]),
              parseFloat(words[3])
            )
            context.parameters.maxCoordinates = new Coordinate(
              parseFloat(words[4]),
              parseFloat(words[5])
            )
            context.parameters.latitudeCenter =
              (context.parameters.minCoordinates.getLatitude() +
                context.parameters.maxCoordinates.getLatitude()) /
              2
            context.parameters.longitudeCenter =
              (context.parameters.minCoordinates.getLongitude() +
                context.parameters.maxCoordinates.getLongitude()) /
              2
            context.scenario.latitudeCenter = context.parameters.latitudeCenter
            context.scenario.longitudeCenter =
              context.parameters.longitudeCenter
          }
        } else if (mode == 'scenery') {
          // End of scenery
          debug(`End of scenery: ${name}`)
          return context
          break
        }
      }
      if (mode == 'scenery') {
        if (words[0] == 'AIRP') {
          const airport_icao = words[1]
          debug(`airport: ${airport_icao}`)
          icao[icao.length] = airport_icao
          context = await loadAirport(context, airport_icao)
        }
        if (words[0] == 'RWY' && words.length > 3) {
          // Runway open/close status
          var r = new Runway()
          r.icao = words[1]
          r.name = words[2]
          r.status = words[3]
          runways.push(r)
        }
      }
    }
    context.scenario.runways = runways
  }
  return context
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

const loadAirport = async (
  context: Context,
  icao: string
): Promise<Context> => {
  debug(`Load airport ${icao}`)
  if (
    context.scenario.airports?.find((airp: Airport) => {
      return airp.icao == icao
    })
  ) {
    // Airport already loaded
    return context
  }
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/1712/Airports.txt'),
    'utf8'
  )
  if (data) {
    let airport: Airport | undefined = undefined
    let runway: Runway | undefined = undefined
    var found = false
    var lines = data.split('\n')
    var words
    var mode = ''
    // var route = -1;
    for (var i = 0; i < lines.length; i++) {
      words = lines[i].split(',')
      if (words[0] == 'A') {
        if (found) {
          break
        }
        if (mode == '') {
          if (words[1] == icao) {
            found = true
            airport = new Airport()
            airport.runways = []
            airport.name = words[2]
            airport.icao = words[1]
            const latitude = parseFloat(words[3])
            const longitude = parseFloat(words[4])
            airport.coordinate = new Coordinate(latitude, longitude)
            context.scenario.airports?.push(airport)
            mode = 'A'
          }
        } else {
          mode = ''
        }
      }
      if (mode == 'A' && words[0] == 'R') {
        // Add runway to airport
        runway = new Runway()
        runway.icao = airport?.icao
        runway.name = words[1]
        runway.heading = new Bearing(parseInt(words[2]))
        runway.strip_length = parseInt(words[3])
        runway.strip_width = parseInt(words[4])
        runway.coordinate1 = new Coordinate(
          parseFloat(words[8]),
          parseFloat(words[9])
        )
        if (airport) airport.runways?.push(runway)
        context.scenario.runways?.push(runway)
        // runways[r].gLabel1.text = runways[r].label1;
        // runways[r].gLabel2.text = runways[r].label2 + '\n' + runways[r].heading + '\n' + runways[r].strip_length;

        // Check for reciprocal runway to merge data
        var opposite_heading = geomath.inverseBearing(
          runway.heading.getBearing()
        )
        var marker: string | undefined = undefined
        if (runway.name.includes('R')) {
          marker = 'L'
        }
        if (runway.name.includes('L')) {
          marker = 'R'
        }
        if (runway.name.includes('C')) {
          marker = 'C'
        }
        debug(
          'Created runway ' +
            words[1] +
            '(' +
            icao +
            ') ' +
            words[2] +
            ' / ' +
            opposite_heading
        )

        airport?.runways?.forEach(rwy2 => {
          if (runway && rwy2.icao == icao) {
            if (rwy2.heading?.getBearing() == opposite_heading) {
              if (marker == undefined || rwy2.name?.includes(marker)) {
                if (
                  rwy2.strip_length == runway.strip_length &&
                  rwy2.strip_width == runway.strip_width
                ) {
                  // Found the reciprocal runway
                  rwy2.coordinate2 = new Coordinate(
                    runway.coordinate1?.latitude || 0,
                    runway.coordinate1?.longitude || 0
                  )
                  runway.coordinate2 = new Coordinate(
                    rwy2.coordinate1?.latitude || 0,
                    rwy2.coordinate1?.longitude || 0
                  )
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
  return context
}
