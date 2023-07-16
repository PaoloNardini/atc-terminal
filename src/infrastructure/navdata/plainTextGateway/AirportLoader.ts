import * as fs from 'fs'
import * as path from 'path'
import { AirportGateway } from '../../../core/gateways'
import { Context, Airport, Runway } from '../../../core/entities'
import { Bearing, Coordinate } from '../../../core/valueObjects'
import * as geomath from '../../../helpers/geomath'
import D from 'debug'
import util from 'util'

const debug = D('app:src:infrastructure:airportGateway')

export const makeAirportGateway = (context: Context): AirportGateway => {
  void context
  return {
    async loadAirportByIcao(icao: string) {
      const airport = await loadAirport(context, icao)
      debug(`Airport loaded: ${util.inspect(airport, false, 5)}`)
      return airport
    },
  }
}

const loadAirport = async (
  context: Context,
  icao: string
): Promise<Airport | undefined> => {
  debug(`Load airport ${icao}`)
  let airport: Airport | undefined = undefined
  if (
    (airport = context.scenario.airports?.find((airp: Airport) => {
      return airp.icao == icao && airp.runways && airp.runways.length > 0
    }))
  ) {
    // Airport already loaded
    return airport
  }
  const data = fs.readFileSync(
    path.join(__dirname, '../../../../data/1712/Airports.txt'),
    'utf8'
  )
  if (data) {
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
            // context.scenario.airports?.push(airport)
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
  return airport
}
