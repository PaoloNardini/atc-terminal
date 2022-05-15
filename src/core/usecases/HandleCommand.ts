import { UseCases } from '..'
import {
  SocketMsgType,
  Context,
  TalkMessageType,
  Plane,
  planeInterceptRadial,
} from '../entities'
import { Deps } from '../gateways'
import util from 'util'
import D from 'debug'
import * as config from '../../config'

const debug = D('app:core:usecases:HandleCommand')

export const useCaseName = 'handle-command'

export const PlaneActions = [
  'H',
  'HDG',
  'S',
  'SPD',
  'F',
  'FL',
  'L',
  'LEFT',
  'R',
  'RIGHT',
  'TO',
  'PROC',
  'RAD',
] // Allowed single letter plane actions commands

export const PlaneActionsFormat: Record<string, string> = {
  H: '(H) ?([0-9]{1,3})',
  HDG: '(HDG) ?([0-9]{1,3})',
  S: '(S) ?([0-9]{3})',
  SPD: '(SPD) ?([0-9]{3})',
  F: '(F) ?([0-9]{2,3})',
  FL: '(FL) ?([0-9]{2,3})',
  L: '(L) ?([0-9]{1,3})',
  LEFT: '(LEFT) ?([0-9]{1,3})',
  R: '(R) ?([0-9]{1,3})',
  RIGHT: '(R) ?([0-9]{1,3})',
  TO: '(TO) ?([A-Z0-9]{1,6})',
  PROC: '(PROC) ?([A-Z0-9]{1,10})',
  RAD: '(RAD) ([0-9]{1,3}) ([T][O]|[F][R][O][M]) ([A-Z0-9]{1,10})',
}

export type Input = {
  msgType: SocketMsgType
  msgPayload: any
  context: Context
  useCases: UseCases
}

export type Output = {
  context: Context
}

export const createUseCase = ({}: Deps) => async (
  input: Input
): Promise<Output> => {
  let context = input.context

  debug(
    `HandleCommand: msg: ${input.msgType}: ${util.inspect(input.msgPayload)}`
  )

  input.useCases.dispatch({
    msgType: input.msgType,
    payload: 'Message received',
    context,
  })

  // Main message filter based on message type
  switch (input.msgType) {
    case SocketMsgType.MSG_GENERAL:
      switch (input.msgPayload) {
        case 'INIT':
          // Client has been reloaded....
          // ... clear everything
          context.planes = []
          context.waypoints = {}
          break
        /*
             case 'LOADSCENARIO':
              case 'LS':
                const output = await input.useCases.loadScenario({
                    context, 
                    useCases: input.useCases
                })
                context = output.context
                break;
              case 'ADDPLANE':
              case 'P+':
                const output2 = await input.useCases.testPlanes({
                  context,
                  useCases: input.useCases
                })
                context = output2.context
                break;
*/
        default:
          // TODO
          break
      }
      break
    case SocketMsgType.MSG_TALK:
      parseTalkCommand(input.msgPayload, input)
      break
    default:
      // TODO
      break
  }

  return { context }
}

export type HandleCommand = ReturnType<typeof createUseCase>

// Parse simulation control commands
const parseSimulationCommand = async (
  command: string,
  input: Input
): Promise<void> => {
  if (command.substring(0, 1) == config.PARAMS.talk_general_prefix) {
    command = command.substring(1)
    debug('[parseSimulationCommand]:' + command)
    switch (command) {
      case 'LOADSCENARIO':
      case 'LS':
        const output = await input.useCases.loadScenario({
          context: input.context,
          useCases: input.useCases,
        })
        input.context = output.context
        break
      case 'ADDPLANE':
      case 'P+':
        const output2 = await input.useCases.testPlanes({
          context: input.context,
          useCases: input.useCases,
        })
        input.context = output2.context
        break
    }
  }
}

const parseTalkCommand = async (
  command: string,
  input: Input
): Promise<void> => {
  // remove any multiple spaces
  debug('[parseTalkCommand]:' + command)
  let v = 0
  while (command.includes('  ') && v++ < 100) {
    command = command.replace('  ', ' ')
  }
  debug('[parseTalkCommand]:' + command)
  var words = command.split(' ')
  /*
  var planeID = 0;
  var fix = -1;
  var msg;
  var speak;
  var delay_min;
  var delay_max;
  */
  var callsign: string = ''
  var msg2atc = false
  var msg2twr = false
  // var msgType = TalkMessageType.MSG_TO_PLANE

  if (words.length > 0) {
    // speakPhrase(words[0]);
    if (words[0].substring(0, 1) == config.PARAMS.talk_general_prefix) {
      await parseSimulationCommand(command, input)
      return
    }
    callsign = words[0].toUpperCase()
    const { msgType, plane } = decodeMessageType(callsign, input.context)
    if (!msgType) {
      debug(`[parseTalkCommand] BAD MESSAGE OR PLANE NOT FOUND: ${callsign}`)
      return
    }
    if (msgType == TalkMessageType.MSG_TO_ATC) {
      msg2atc = true
      callsign = nextWord(words)
    }
    if (msgType == TalkMessageType.MSG_TO_TWR) {
      msg2twr = true
      callsign = nextWord(words)
    }
    if (msgType == TalkMessageType.MSG_TO_PLANE && plane) {
      void msgType && msg2twr && msg2atc
      debug(`[parseTalkCommand] Found Plane: ${plane.completeCallsign}`)
      if (words.length == 0) {
        debug(`MISSING PLANE COMMAND`)
        return
      }
      let maxCommands = 0
      // Handle consecutive plane commands
      while (words.length > 0 && maxCommands++ < 50) {
        // Decode a single plane action command
        const { action, parameters } = decodePlaneShortAction(words)
        if (action == '') {
          // No plane command
          return
        }
        if (!PlaneActions.includes(action)) {
          debug(`BAD PLANE ACTION ${action}`)
          return
        }
        /*
            let planeAction = nextWord(words)
            let letterAction = planeAction.substring(0,1)
            let param = planeAction.substring(1)
            if (planeAction == letterAction) {
                words.shift()
                planeAction = ''
                param = words[0]
            }
            */

        debug(`[parseTalkCommand] Command: ${action} - ${parameters}`)

        switch ('') {
          default:
            // Check for single letter action
            switch (action) {
              case 'H':
              case 'HDG':
                // Set Heading
                plane.turnToHeading(parseInt(parameters[0]), undefined)
                /*
                    words.shift();
                    var newHeading = words[0];
                    words.shift();

                    msg += 'set heading ' + newHeading + ' ';
                    delay_min = 2000;
                    delay_max = 5000;
                    if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                        delay_min = 1000;
                        delay_max = 3000;
                    }
                    setTimeout(function() {
                        console.log('New heading ' + newHeading);
                        planes[planeID].clearRoute();
                        planes[planeID].setHeading(newHeading, '');
                    }, delay_min + (Math.random() * delay_max));
                    */
                break
              case 'L':
              case 'R':
              case 'LEFT':
              case 'RIGHT':
                // Set Heading with turn indication
                plane.turnToHeading(parseInt(parameters[0]), action)
                /*
                    words.shift();
                    var newHeading = words[0];
                    words.shift();
                    msg += 'turn to heading ' + newHeading + ' ';
                    speak += 'H' + letter + ' ' + newHeading + ' ';
                    delay_min = 2000;
                    delay_max = 5000;
                    if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                        delay_min = 1000;
                        delay_max = 3000;
                    }
                    setTimeout(function() {
                        console.log('New heading ' + newHeading);
                        planes[planeID].clearRoute();
                        planes[planeID].setHeading(newHeading, letter);
                    }, delay_min + (Math.random() * delay_max));
                    */
                break
              case 'S':
              case 'SPD':
                // Set Speed
                plane.setNewSpeed(parseInt(parameters[0]))
                /*
                    words.shift();
                    var newSpeed = words[0];
                    words.shift();
                    msg += 'set speed to ' + newSpeed + ' knots ';
                    delay_min = 8000;
                    delay_max = 10000;
                    if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                        delay_min = 4000;
                        delay_max = 5000;
                    }
                    setTimeout(function() {
                        console.log('New speed ' + newSpeed);
                        planes[planeID].setSpeed(parseFloat(newSpeed));
                    },delay_min + (Math.random() * delay_max));
                    */
                break
              case 'F':
              case 'FL':
                // Set Level
                plane.setNewFL(parseInt(parameters[0]))
                /*
                    var newLevel;
                    words.shift();
                    var flight_level = parseInt(words[0]);
                    newLevel = flight_level  * 100;
                    words.shift();
                    if (planes[planeID].fl > newLevel) {
                        msg += 'descend to FL ' + flight_level + ' ';
                        speak += 'FL ' + flight_level + ' ';
                    }
                    else if (planes[planeID].fl < newLevel) {
                        if (planes[planeID].hasStatus(STATUS_CLEARED_TAKEOFF)) {
                            msg += 'initial climb to FL ' + flight_level + ' ';
                            speak += ' INITIAL FL ' + flight_level + ' ';

                        }
                        else {
                            msg += 'climb to FL ' + flight_level + ' ';
                            speak += 'FL ' + flight_level + ' ';
                        }
                    }
                    else {
                        msg += 'maintain FL ' + flight_level + ' ';
                    }
                    delay_min = 1000;
                    delay_max = 5000;
                    if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                        delay_min = 1000;
                        delay_max = 3000;
                    }
                    setTimeout(function() {
                        console.log('New level ' + newLevel);
                        planes[planeID].setLevel(newLevel);
                    }, delay_min + (Math.random() * delay_max));
                    */
                break
              case 'TO':
                // Go To Fix
                debug(`[parseTalkCommand] Go To Fix ${parameters[0]}`)
                const waypoint = input.context.findWaypointByName(parameters[0])
                if (!waypoint) {
                  debug(`[parseTalkCommand] INVALID FIX: ${parameters[0]}`)
                  return
                }
                debug(`[parseTalkCommand] Go to ${waypoint?.label}`)
                plane.goToFix(waypoint)

                break
              case 'PROC':
                // Follow procedure
                const atsRoute = input.context.findAtsRoute(parameters[0])
                if (!atsRoute) {
                  debug(
                    `[parseTalkCommand] INVALID PROCEDURE: ${parameters[0]}`
                  )
                  return
                }
                debug(`[parseTalkCommand] Follow procedure ${atsRoute.name}`)
                plane.followProcedure(atsRoute)
                break
              case 'RAD':
                //Intercept radial
                const radial: number = parseInt(parameters[0])
                const inbound: boolean = parameters[1] == 'TO'
                const radialWaypoint = input.context.findWaypointByName(
                  parameters[2]
                )
                debug(
                  `[parseTalkCommand] RAD ${radial} ${inbound} ${parameters[2]}`
                )
                if (!radialWaypoint) {
                  debug(
                    `[parseTalkCommand] INVALID RADIAL FIX: ${parameters[2]}`
                  )
                  return
                }
                debug(
                  `[parseTalkCommand] Intercept radial ${radial} ${inbound} ${radialWaypoint?.label}`
                )
                planeInterceptRadial(plane, radialWaypoint, radial, inbound)
                break

              default:
                debug(`[parseTalkCommand] INVALID PLANE ACTION:: ${action}`)
                break
            }
        }
      }
      input.useCases.dispatch({
        context: input.context,
        msgType: SocketMsgType.MSG_PLANES,
        payload: {
          type: 'UPDATE_PLANE',
          plane: plane,
        },
      })
    }
  }
  /*
  msg = planes[planeID].completeCallsign + ' ';
  speak = planes[planeID].completeCallsign + ' ';
  if (words.length > 0) {
      var loop = 0;
      words.shift();
      while (words.length > 0 && (loop++ < 50)) {
          console.log('parsing word ' + words[0]);
          var letter = words[0].toUpperCase().substring(0, 1);
          if (words[0].toUpperCase() == 'RAD') {
              //  Follow Radial
              var inbound = undefined;
              words.shift();
              var radial = parseInt(words[0]);
              msg += 'follow radial ' + ' ' + radial;
              speak += 'RAD ' + radial;
              words.shift();
              words[0] = words[0].toUpperCase();
              if (words[0] == 'TO' || words[0] == 'INBOUND') {
                  msg += ' inbound to ';
                  speak += ' INBOUND';
                  inbound = true;
                  words.shift();
              }
              if (words[0] == 'FROM' || words[0] == 'OUTBOUND') {
                  msg += ' outbound from ';
                  speak += ' OUTBOUND';
                  inbound = false;
                  words.shift();
              }
              fix = words[0].toUpperCase();
              o_wp = findWaypoint(fix);
              if (o_wp.isNavaid) {
                  words.shift();
                  msg += ' ' + fix;
                  speak += ' ' + fix;
                  var o_route = new Route();
                  var o_step = undefined;
                  o_step = new Step();
                  o_step.type = 'FD';
                  o_step.identifier = o_wp.label;
                  o_step.latitude = o_wp.latitude;
                  o_step.longitude = o_wp.longitude;
                  o_step.track_bearing = radial;
                  o_step.inbound = inbound;
                  o_route.addLeg(o_step);
                  planes[planeID].assignRoute(o_route);
              }
              else {
                  // Bad FIX
              }
              letter = '';
          }
          if (words.length > 0 && (words[0].toUpperCase() == 'REL' || words[0].toUpperCase() == 'RELEASE')) {
              words.shift();
              msg += ' release accepted ';
              speak += ' RELEASE ';
              director.planeRelease(planeID);
              letter = '';
          }
          if (words.length > 0 && (words[0].toUpperCase() == 'SQ' || words[0].toUpperCase() == 'SQUACK')) {
              // Squack
              msg+= ' squack ';
              speak += ' SQUACK ';
              words.shift();
              if (words.length > 0) {
                  var squack = parseInt(words[0]);
                  words.shift();
                  if (squack > 0) {
                      planes[planeID].squack_assigned = squack;
                      if (planes[planeID].arrival) {
                          planes[planeID].squack = planes[planeID].squack_assigned;
                       }
                      msg+= squack;
                      speak += squack;
                  }
              }
              letter = '';
          }
          if (words.length > 0 && (words[0].toUpperCase() == 'ID' || words[0].toUpperCase() == 'IDENT')) {
              // Squack
              msg+= ' squack ident ';
              speak += ' SQUACK IDENT ';
              words.shift();
              planes[planeID].squack = planes[planeID].squack_assigned;
              planes[planeID].addStatus(STATUS_IDENT);
              letter = '';
          }
          if (words.length > 0 && words[0].toUpperCase() == 'HOLD') {
              // Holding pattern
              msg += ' hold ';
              speak += ' HOLD ';
              words.shift();
              fix = words[0].toUpperCase();
              o_fix = findWaypoint(fix);
              if (o_fix != undefined) {
                  msg += o_fix.label + ' ';
                  speak += o_fix.label + ' ';
                  words.shift();
                  if (words.length > 0) {
                      var radial = parseInt(words[0]);
                      msg += 'radial ' + radial + ' ';
                      speak += 'RADIAL ' + radial + ' ';
                      words.shift();
                  }
              }
              var o_route = new Route();
              var o_step = undefined;

              var o_step = undefined;
              o_step = new Step();
              o_step.type = 'FD';
              o_step.identifier = o_fix.label;
              o_step.latitude = o_fix.latitude;
              o_step.longitude = o_fix.longitude;
              o_step.track_bearing = radial;
              o_step.inbound = true;
              o_route.addLeg(o_step);

              o_step = new Step();
              o_step.type = 'HM';
              o_step.identifier = o_fix.label;
              o_step.latitude = o_fix.latitude;
              o_step.longitude = o_fix.longitude;
              o_step.heading = radial;
              o_step.leg_distance = 5;
              o_step.turn_direction = 1;
              o_step.speed_constraint = 1;
              o_step.speed_1 = 250;
              o_route.addLeg(o_step);

              planes[planeID].assignRoute(o_route);
              planes[p].setSpeed(250); // TEST
              letter = '';
              continue;
          }
          if (words.length > 0 && words[0].toUpperCase() == 'GA') {
              // Go Around
              words.shift();
              if (planes[p].hasStatus(STATUS_FINAL) && !planes[p].hasStatus(STATUS_LANDED)) {
                  // Advance step to missing approach step (the next one after runway)
                  msg += 'GO AROUND ';
                  speak += 'GA ';
                  for (var s = 0; s < planes[p].steps.length; s++ ) {
                      o_step = planes[p].steps[s];
                      if (o_step.identifier != '' && o_step.identifier == planes[p].o_route.mapFix) {
                          planes[p].current_step = s-1;
console.log('MAP step = ' + s );
                          planes[p].addStatus(STATUS_MISSED_APPROACH);
                          planes[p].advance2NextStep();
                          break;
                      }
                  }
              }
              letter = '';
          }
          if (words.length > 0 && words[0].toUpperCase() == 'DIVERT') {
              words.shift();
              icao = words[0].toUpperCase();
              // TODO divert to to other airport
              letter = '';
          }
          if (words.length > 0 && (words[0].toUpperCase() == 'CH' || words[0].toUpperCase() == 'CHANGE')) {
              words.shift();
              if (words.length > 0 && words[0].toUpperCase() == 'TWR') {
                      words.shift();
                      msg += 'CHANGE FREQUENCY WITH TOWER ';
                      planes[p].changeFreq('TWR');
              }
              else if (words.length > 0 && words[0].toUpperCase() == 'ATC') {
                  words.shift();
                  msg += 'CHANGE FREQUENCY WITH ATC ';
                  planes[p].changeFreq('ATC');
              }
              letter = '';
          }
          if (words.length > 0 && words[0].toUpperCase() == 'CAI') {
              // Continue as instructed
              words.shift();
              msg += 'CONTINUE AS INSTRUCTED ';
              speak += 'CIA ';
              planes[p].continueAsInstructed();
              letter = '';
          }
          if (letter == 'H') {
              // Set Heading
              words.shift();
              var newHeading = words[0];
              words.shift();

              msg += 'set heading ' + newHeading + ' ';
              delay_min = 2000;
              delay_max = 5000;
              if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                  delay_min = 1000;
                  delay_max = 3000;
              }
              setTimeout(function() {
                  console.log('New heading ' + newHeading);
                  planes[planeID].clearRoute();
                  planes[planeID].setHeading(newHeading, '');
              }, delay_min + (Math.random() * delay_max));
          }
          if (letter == 'L' || letter == 'R') {
              // Set Heading with turn indication
              words.shift();
              var newHeading = words[0];
              words.shift();
              msg += 'turn to heading ' + newHeading + ' ';
              speak += 'H' + letter + ' ' + newHeading + ' ';
              delay_min = 2000;
              delay_max = 5000;
              if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                  delay_min = 1000;
                  delay_max = 3000;
              }
              setTimeout(function() {
                  console.log('New heading ' + newHeading);
                  planes[planeID].clearRoute();
                  planes[planeID].setHeading(newHeading, letter);
              }, delay_min + (Math.random() * delay_max));
          }
          if (letter == 'S') {
              // Set Speed
              words.shift();
              var newSpeed = words[0];
              words.shift();
              msg += 'set speed to ' + newSpeed + ' knots ';
              delay_min = 8000;
              delay_max = 10000;
              if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                  delay_min = 4000;
                  delay_max = 5000;
              }
              setTimeout(function() {
                  console.log('New speed ' + newSpeed);
                  planes[planeID].setSpeed(parseFloat(newSpeed));
              },delay_min + (Math.random() * delay_max));
          }
          if (letter == 'F') {
              // Set Level
              var newLevel;
              words.shift();
              var flight_level = parseInt(words[0]);
              newLevel = flight_level  * 100;
              words.shift();
              if (planes[planeID].fl > newLevel) {
                  msg += 'descend to FL ' + flight_level + ' ';
                  speak += 'FL ' + flight_level + ' ';
              }
              else if (planes[planeID].fl < newLevel) {
                  if (planes[planeID].hasStatus(STATUS_CLEARED_TAKEOFF)) {
                      msg += 'initial climb to FL ' + flight_level + ' ';
                      speak += ' INITIAL FL ' + flight_level + ' ';

                  }
                  else {
                      msg += 'climb to FL ' + flight_level + ' ';
                      speak += 'FL ' + flight_level + ' ';
                  }
              }
              else {
                  msg += 'maintain FL ' + flight_level + ' ';
              }
              delay_min = 1000;
              delay_max = 5000;
              if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                  delay_min = 1000;
                  delay_max = 3000;
              }
              setTimeout(function() {
                  console.log('New level ' + newLevel);
                  planes[planeID].setLevel(newLevel);
              }, delay_min + (Math.random() * delay_max));
          }
          if (letter == 'C') {
              // Cleared to
              msg += 'proceed to: ';
              var assigned_route = [];
              var ar = -1;
              var o_route = new Route();
              var o_step = undefined;
              words.shift();
              while (words.length > 0) {
                  fix = words[0].toUpperCase();
                  if (fix == 'TO' || fix == 'TAKEOFF') {
                      words.shift();
                      msg = planes[planeID].completeCallsign + ' cleared to take off ';
                      director.planeTakeoff(planes[planeID]);
                      break;
                  }
                  o_wp = findWaypoint(fix);
                  if (o_wp != undefined && !o_wp.isRunway) {
                      words.shift();
                      msg += fix + ' ';
                      speak += 'DT ' + fix;
                      o_step = new Step();
                      o_step.type = 'TF';
                      o_step.identifier = o_wp.name;
                      o_step.latitude = o_wp.latitude;
                      o_step.longitude = o_wp.longitude;
                      o_route.addLeg(o_step);
                  }
                  else {
                      var icao = '';
                      if (planes[planeID].departure) {
                          var icao = planes[planeID].airp_dep;
                          o_runway = findRunway(icao, fix);
                      }
                      else if (planes[planeID].arrival) {
                          var icao = planes[planeID].airp_dest;
                          o_runway = findRunway(icao, fix);
                      }
                      if (o_runway instanceof Runway) {
                          o_airport = findAirport(icao);
                          words.shift();
                          msg += fix + ' ';
                          speak += 'DT ' + fix;
                          // Find final procedure for landing
                          o_final_route = director.assignFinalRoute(o_airport, o_runway);
                          if (o_final_route instanceof Route) {
                              // Add final legs to route
                              for (var fl=0; fl < o_final_route.getLegsNumber(); fl++) {
                                  o_step = o_final_route.getLeg(fl);
                                  o_route.addLeg(o_step);
                              }
                              o_route.mapFix = o_final_route.mapFix;
                              o_route.runway = o_final_route.runway;
                          }
                      }
                      else {
                          // Break at first non-fix word
                          break;
                      }
                  }
              }
              if (o_route.getLegsNumber() > 0) {
                  if (planes[planeID].departure) {
                      o_route.type = 'SID';
                  }
                  else if (planes[planeID].arrival) {
                      o_route.type = 'STAR';
                  }
                  if (planes[planeID].hasStatus(STATUS_MISSED_APPROACH)) {
                      // Resume approach
console.log('Exit GA and resume Approach phase');
                      planes[planeID].setStatus(STATUS_APPROACH);
                  }
                  planes[planeID].assignRoute(o_route);
              }
          }
      }
  }
  sendMessage(msg, msgType);

  if (AUDIO == 1) {
      var words = speak.split(' ');
      speakPhrase(words);
  }

  $('#talk').val('');
  */
}

const nextWord = (words: string[]): string => {
  words.shift()
  if (words.length > 0) {
    return words[0].toUpperCase()
  }
  return ''
}

/**
 * Decode the message type from the callsign
 * @param callsign
 * @param context
 * @returns TalkMessageType
 */
const decodeMessageType = (
  callsign: string,
  context: Context
): {
  msgType: TalkMessageType | undefined
  plane: Plane | undefined
} => {
  debug(`[decodeMessageType] callsign: ${callsign}`)
  let msgType = undefined
  let plane: Plane | undefined = undefined
  if (callsign == 'ATC') {
    msgType = TalkMessageType.MSG_TO_ATC
  }
  if (callsign == 'TWR') {
    msgType = TalkMessageType.MSG_TO_TWR
  }
  plane = context.findPlaneByCallsign(callsign)
  if (!plane) {
    // TODO
    // sendMessage('BAD PLANE CALLSIGN', MSG_ERROR);
    debug(`[decodeMessageType] NOT FOUND Plane: ${callsign}`)
  } else {
    msgType = TalkMessageType.MSG_TO_PLANE
  }
  return {
    msgType,
    plane,
  }
}

/**
 * Decode a short plane command with format "H150" or "H 150"
 * @param words
 * @returns {action, parameter}
 */
const decodePlaneShortAction = (
  words: string[]
): {
  action: string
  parameters: string[]
} => {
  let planeAction = nextWord(words)
  if (PlaneActions.includes(planeAction) || planeAction.length == 1) {
    // Parameter is separated by a space.. add next word
    planeAction += ' ' + nextWord(words)
  }
  debug(`[decodePlaneShortAction] planeAction:${planeAction}`)
  const parsed = planeAction.match('([A-Z]{1,5}).*')
  if (parsed && parsed.length > 0) {
    const command = parsed[1]
    const format = PlaneActionsFormat[command]
    debug(`[decodePlaneShortAction] command:${command} format:${format}`)
    if (format) {
      // count additional parameters needed
      var p = format.split('(').length - 1
      while (p > 2) {
        planeAction += ' ' + nextWord(words)
        p--
      }
      const matches = planeAction.match(format)
      if (matches && matches.length > 2) {
        const action = matches[1]
        const parameters = matches.slice(2)
        return { action, parameters }
      }
    }
  }
  return { action: '', parameters: [] }
}
