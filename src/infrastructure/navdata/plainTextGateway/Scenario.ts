import * as fs from 'fs'
import * as path from 'path'
import { Airport, Context, Runway, Scenario } from '../../../core/entities'
import { ScenarioGateway } from '../../../core/gateways'
import D from 'debug'
// import { Bearing } from '../../../core/valueObjects'
import { Coordinate } from '../../../core/valueObjects'
// import * as geomath from '../../../helpers/geomath'
import util from 'util'
const debug = D('app:src:infrastructure:scenarioGateway')

export const makeScenarioGateway = (context: Context): ScenarioGateway => {
  return {
    async loadScenarioByName(name: string) {
      const scenario = await loadScenario(context, name)
      debug(`Scenario loaded: ${util.inspect(scenario, false, 5)}`)
      return scenario
    },
    async loadScenarioByAirportCode(icao: string) {
      // TODO
      const scenario = await loadScenario(context, icao)
      debug(`Scenario loaded: ${util.inspect(scenario, false, 5)}`)
      return scenario
    },
  }
}

const loadScenario = async (
  context: Context,
  name: string
): Promise<Scenario> => {
  debug(`Load scenario`)
  const scenario = new Scenario()
  scenario.airports = []
  scenario.runways = []
  scenario.atsRoutes = []
  scenario.initialPlanes = []
  scenario.waypoints = {}
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/scenery.txt'),
    'utf8'
  )
  if (data) {
    // let icao: any[] = []
    // let runways: any[] = []
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
            scenario.name = name
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
          return scenario
          break
        }
      }
      if (mode == 'scenery') {
        if (words[0] == 'AIRP') {
          const airport_icao = words[1]
          debug(`airport: ${airport_icao}`)
          const airport = new Airport()
          airport.icao = airport_icao
          scenario.airports.push(airport)
          /*
          icao[icao.length] = airport_icao
          context = await loadAirport(context, airport_icao)
          */
        }
        if (words[0] == 'RWY' && words.length > 3) {
          // Runway open/close status
          var r = new Runway()
          r.icao = words[1]
          r.name = words[2]
          r.status = words[3]
          scenario.runways.push(r)
        }
      }
    }
    // context.scenario.runways = runways
  }
  return scenario // context
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
