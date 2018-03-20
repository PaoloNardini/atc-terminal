/**
 * COMMUNICATION FUNCTIONS
 */

function speakNumber(number) {

    var p = new Promise(function(resolve, reject) {

        var instance = undefined;
        switch (number) {
            case 1:
                instance = createjs.Sound.play("numbers", {startTime: 145, duration: 370});
                break;
            case 2:
                instance = createjs.Sound.play("numbers", {startTime: 1050, duration: 370});
                break;
            case 3:
                instance = createjs.Sound.play("numbers", {startTime: 1930, duration: 370});
                break;
            case 4:
                instance = createjs.Sound.play("numbers", {startTime: 2860, duration: 370});
                break;
            case 5:
                instance = createjs.Sound.play("numbers", {startTime: 3850, duration: 330});
                break;
            case 6:
                instance = createjs.Sound.play("numbers", {startTime: 4750, duration: 380});
                break;
            case 7:
                instance = createjs.Sound.play("numbers", {startTime: 5840, duration: 370});
                break;
            case 8:
                instance = createjs.Sound.play("numbers", {startTime: 6673, duration: 270});
                break;
            case 9:
                instance = createjs.Sound.play("numbers", {startTime: 7475, duration: 360});
                break;
            case 0:
                instance = createjs.Sound.play("numbers", {startTime: 8450, duration: 390});
                break;
        }
        if (instance != undefined) {
            instance.on("complete", function () {
                resolve(true);
            }, this);
        }
        else {
            reject(true);
        }
    });
    return p;
}

function speakLetter(letter) {

    var p = new Promise(function(resolve, reject) {

        if (letter == undefined) {
            resolve(true);
            return;
        }
        var instance = undefined;
        switch (letter.toUpperCase()) {
            case 'A':
                instance = createjs.Sound.play("alpha", {startTime: 168, duration: 504});
                break;
            case 'B':
                instance = createjs.Sound.play("alpha", {startTime: 1177, duration: 672});
                break;
            case 'C':
                instance = createjs.Sound.play("alpha", {startTime: 2416, duration: 546});
                break;
            case 'D':
                instance = createjs.Sound.play("alpha", {startTime: 3551, duration: 567});
                break;
            case 'E':
                instance = createjs.Sound.play("alpha", {startTime: 4601, duration: 483});
                break;
            case 'F':
                instance = createjs.Sound.play("alpha", {startTime: 5736, duration: 630});
                break;
            case 'G':
                instance = createjs.Sound.play("alpha", {startTime: 6955, duration: 525});
                break;
            case 'H':
                instance = createjs.Sound.play("alpha", {startTime: 8068, duration: 525});
                break;
            case 'I':
                instance = createjs.Sound.play("alpha", {startTime: 9035, duration: 546});
                break;
            case 'J':
                instance = createjs.Sound.play("alpha", {startTime: 10190, duration: 567});
                break;
            case 'K':
                instance = createjs.Sound.play("alpha", {startTime: 11409, duration: 504});
                break;
            case 'L':
                instance = createjs.Sound.play("alpha", {startTime: 13468, duration: 525});
                break;
            case 'M':
                instance = createjs.Sound.play("alpha", {startTime: 14518, duration: 462});
                break;
            case 'N':
                instance = createjs.Sound.play("alpha", {startTime: 15611, duration: 567});
                break;
            case 'O':
                instance = createjs.Sound.play("alpha", {startTime: 16725, duration: 441});
                break;
            case 'P':
                instance = createjs.Sound.play("alpha", {startTime: 17775, duration: 462});
                break;
            case 'Q':
                instance = createjs.Sound.play("alpha", {startTime: 18826, duration: 609});
                break;
            case 'R':
                instance = createjs.Sound.play("alpha", {startTime: 20002, duration: 588});
                break;
            case 'S':
                instance = createjs.Sound.play("alpha", {startTime: 21172, duration: 504});
                break;
            case 'T':
                instance = createjs.Sound.play("alpha", {startTime: 22313, duration: 588});
                break;
            case 'U':
                instance = createjs.Sound.play("alpha", {startTime: 23469, duration: 609});
                break;
            case 'V':
                instance = createjs.Sound.play("alpha", {startTime: 24688, duration: 430});
                break;
            case 'W':
                instance = createjs.Sound.play("alpha", {startTime: 25675, duration: 525});
                break;
            case 'X':
                instance = createjs.Sound.play("alpha", {startTime: 26747, duration: 630});
                break;
            case 'Y':
                instance = createjs.Sound.play("alpha", {startTime: 27920, duration: 567});
                break;
            case 'Z':
                instance = createjs.Sound.play("alpha", {startTime: 29020, duration: 520});
                break;
        }
        if (instance != undefined) {
            instance.on("complete", function () {
                resolve(true);
            }, this);
        }
        else {
            reject(true);
        }
    });
    return p;
}

function speakInstruction(word) {
    var p = new Promise(function(resolve, reject) {

        var instance = undefined;
        switch (word) {
            case 'FL':
                instance = createjs.Sound.play("001", {startTime: 2663, duration: 1178});
                break;
            case 'HR':
                instance = createjs.Sound.play("001", {startTime: 5790, duration: 1000});
                break;
            case 'HL':
                instance = createjs.Sound.play("001", {startTime: 9032, duration: 1081});
                break;
            case 'DT':
                instance = createjs.Sound.play("004", {startTime: 10336, duration: 1112});
                break;

        }
        if (instance != undefined) {
            instance.on("complete", function () {
                resolve(true);
            }, this);
        }
        else {
            reject(true);
        }
    });
    return p;
}

function loadHandler(event) {
    // This is fired for each sound that is registered.
    // var instance = createjs.Sound.play("numbers");  // play using id.  Could also use full sourcepath or event.src.
    // var instance = createjs.Sound.play("numbers", {startTime: 1000, duration: 400});
    // instance.on("complete", handleComplete, this);
    // instance.volume = 0.5;
}

function handleComplete() {
    // todo
}




function spellNumber(numbers) {
    var p = new Promise(function(resolve, reject) {
        var c = 0;
        var s = numbers.shift();
        if (parseInt(s) >= 0) {
            speakNumber(parseInt(s)).then(function () {
                spellNumber(numbers).then(function() {
                    if (numbers.length <= 1) {
                        resolve(true);
                    }
                });
            });
        }
        else {
            resolve(true);
        }
    });
    return p;
}

function spellIcao(letters) {
    var p = new Promise(function(resolve, reject) {
        var c = 0;
        if (letters.length == 0) {
            resolve(true);
            return;
        }
        var s = letters.shift();
        speakLetter(s).then(function () {
            spellIcao(letters).then(function() {
                if (letters.length <= 1) {
                    resolve(true);
                }
            });
        });
    });
    return p;
}

function speakPhrase(words) {
    var word;
    if (words.length > 0) {
        word = words[0];
console.log('SPEAK ' + word);
        words.shift();
        if (parseInt(word) >= 0) {
            var numbers = word.split('');
            spellNumber(numbers).then(function() {
                speakPhrase(words);
            });
        }
        else {
            switch (word) {
                case 'FL':
                case 'HR':
                case 'HL':
                case 'DT':
                    speakInstruction(word).then(function() {
                        speakPhrase(words);
                    });
                    break;
                default:
                    var letters = word.split('');
                    spellIcao(letters).then(function() {
                        speakPhrase(words);
                    });
            }
        }
    }
}


function sendMessage(msg, type) {
    // var current = $('#msg').text;
    // console.log(current);
    // $('#msg').text(msg);
    msgbar.showMessage(msg, type);
}


function parseCommand(command) {
    console.log('Parse:' + command);
    var words = command.split(' ');
    var planeID = 0;
    var msg2atc = false;
    var msg2twr = false;
    var msgType = MSG_TO_PLANE;
    var fix = -1;
    var msg;
    var speak;
    var delay_min;
    var delay_max;
    var callsign;
    if (words.length > 0) {
        // speakPhrase(words[0]);
        callsign = words[0].toUpperCase();
        if (callsign == 'ATC') {
            msg2atc = true;
            msgType = MSG_TO_ATC;
            words.shift();
            callsign = words[0].toUpperCase();
        }
        if (callsign == 'TWR') {
            msg2twr = true;
            msgType = MSG_TO_TWR;
            words.shift();
            callsign = words[0].toUpperCase();
        }
        planeID = findPlaneID(callsign);
        if (planeID == -1) {
            sendMessage('BAD PLANE CALLSIGN', MSG_ERROR);
            return;
        }
        console.log('Plane ' + planeID);
    }
    msg = planes[planeID].callsign + ' ';
    speak = planes[planeID].callsign + ' ';
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
                words.shift();
                fix = words[0].toUpperCase();
                o_fix = findWaypoint(fix);
                if (o_fix != undefined) {
                    words.shift();
                    var radial = parseInt(words[0]);
                    words.shift();
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
                if ((planes[p].phase == PHASE_FINAL || planes[p].hasStatus(STATUS_FINAL)) && !planes[p].hasStatus(STATUS_LANDED)) {
                    // Advance step to missing approach step (the next one after runway)
                    msg += 'GO AROUND ';
                    speak += 'GA ';
                    for (var s = 0; s < planes[p].steps.length; s++ ) {
                        o_step = planes[p].steps[s];
                        if (o_step.identifier != '' && o_step.identifier == planes[p].o_route.mapFix) {
                            planes[p].current_step = s-1;
console.log('MAP step = ' + s );
                            planes[p].setFlightPhase(PHASE_MISSED_APPROACH);
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
            if (letter == 'H') {
                // Set Heading
                words.shift();
                var newHeading = words[0];
                words.shift();

                msg += 'set heading ' + newHeading + ' ';
                delay_min = 2000;
                delay_max = 5000;
                if (planes[planeID].phase == PHASE_MISSED_APPROACH) {
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
                if (planes[planeID].phase == PHASE_MISSED_APPROACH) {
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
                if (planes[planeID].phase == PHASE_MISSED_APPROACH) {
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
                    msg += 'climb to FL ' + flight_level + ' ';
                    speak += 'FL ' + flight_level + ' ';
                }
                else {
                    msg += 'maintain FL ' + flight_level + ' ';
                }
                delay_min = 1000;
                delay_max = 5000;
                if (planes[planeID].phase == PHASE_MISSED_APPROACH) {
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
                        msg = planes[planeID].callsign + ' cleared to take off ';
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
                                /*
                                if (o_final_route.getLegsNumber() > 1) {
                                    o_step = o_final_route.getLeg(1);
                                    // Add intercept of final radial
                                    var fd_step = new Step();
                                    fd_step.type = 'FD';
                                    fd_step.identifier = o_step.identifier;
                                    // fd_step.latitude = o_step.latitude;
                                    // fd_step.longitude = o_step.longitude;
                                    fd_step.track_bearing = Math.inverseBearing(o_step.heading);
                                    fd_step.inbound = inbound;
                                    o_route.addLeg(fd_step);
                                }
                                */
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
                    if (planes[planeID].phase == PHASE_MISSED_APPROACH) {
                        // Resume approach
console.log('Exit GA and resume Approach phase');
                        planes[planeID].setFlightPhase(PHASE_APPROACH);
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
}
