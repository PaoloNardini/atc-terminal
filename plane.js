/* The airplane object */
function Plane() {

    this.Container_constructor();

    // Identification
    this.label = '';

    // Graphic objects
    this.gLabel = new createjs.Text("", "normal 10px Courier", PLANE_TEXT_COLOR);
    this.gLabel.x = 0;
    this.gLabel.y = 0;
    this.gLabel.lineHeight = 9;
    this.gLabel.setBounds(0,0,100,40);
    this.gLabelConnector = new createjs.Shape();

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(PLANE_BODY_COLOR).dr(0,0,6,6);
    this.gTail = new createjs.Shape();
    this.addChild(this.gBox, this.gTail, this.gLabel, this.gLabelConnector);

    // Graphic data
    this.x = (Math.random() * 1000);
    this.y = (Math.random() * 500);
    this.connectorX = 25;
    this.connectorY = -5;
    this.connectorDeg = 45;     // Degrees of label connector
    this.videotracks = [];

    // tick data

    if (speedX2 == 1) {
        this.lastcompute = new Date().getTime() / 500;
    }
    else {
        this.lastcompute = new Date().getTime() / 1000;
    }

    // Flight info
    this.callsign = '' + Math.floor((Math.random() * 9999));
    this.aircraft = 'B738';
    this.vfr = false;
    this.airp_dep = '';
    this.airp_dest = '';
    this.squack = AUTO_SQUACK == 1 ? (1000 + Math.floor(Math.random() * 8999)) : 'STDBY';
    this.squack_assigned = this.squack;
    this.arrival = Math.random() > 0.5 ? true : false;
    this.departure = !this.arrival;
    this.transit = false;
    this.phase = '';
    this.status = '';
    this.atc_phase = PLANE_ATC_OUT;

    this.latitude = 0;
    this.longitude = 0;
    this.coarse = 0;
    this.distance = 0;

    // Navigation data
    this.speed = 150 + (Math.random() * 350);
    this.speed_target = this.speed;
    this.heading = 0; // Math.random() * 360;
    this.heading_target = this.heading;
    this.fl = Math.random() * 35000;
    this.fl_final = Math.floor((20000 + (Math.random() * 17000))/1000)*1000;
    this.fl_initial = this.fl_final;
    this.fl_cleared = this.fl_final;
    this.climb = 0;
    this.turn = 0;

    // Route data
    this.route = -1;
    this.o_route = undefined;   // Route object
    this.tracks = [];           // OLD Tracks
    this.steps = [];            // NEW Legs Steps
    this.fix_next = -1;         // OLD
    this.fix_step = -1;         // OLD
    this.step_current = -1;     // NEW
    this.runway = undefined;    // Landing only

    // Radial intercept data
    this.intercepting = false;          // Intercepting a radial
    this.radial2intercept = undefined;  // Radial to intercept
    this.navaid2intercept = undefined;  // Navaid to intercept radial
    this.radialInbound = undefined;     // true to follow radial inbound / false for outbound
    this.interceptPoint = undefined;    // LatLon coordinates of radial intercept point
    this.interceptProcedure = undefined;// Type of intercept procedure: STRAIGHT / TURN

    // Holding Pattern data
    this.holding = false;
    this.holding_identifier = undefined;        // holding fix name
    this.holding_o_fix = undefined;             // holding fix object;
    this.holding_radial = undefined;            // inbound radial
    this.holding_leg_distance = undefined;      // leg distance in miles
    this.holding_turn_direction = undefined;    // turn direction 1 = left 2 = right
    this.holding_points = [];                   // 4 holding points
    this.holding_point_next = undefined;        // next point in holding pattern
    this.o_holding = undefined;                 // Holding graphical object

    // Strip object
    this.o_strip = new Strip();
    this.o_strip.setCallsign(this.callsign);
    this.o_strip.setAircraftType(this.aircraft);
    this.stripPosition = 0;
    this.updateStripMode();

    // Slot data
    this.slot = undefined;

    // Internal
    this.recurse = false;
}
createjs.extend(Plane, createjs.Container);
createjs.promote(Plane, "Container");

Plane.prototype.setX = function ( x ) {
    this.x = x;
}

Plane.prototype.setY = function ( y ) {
    this.y = y;
}

Plane.prototype.setPosition = function() {
    var coords = Math.coordsToScreen(this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);
}

Plane.prototype.getSpeed = function() {
    return this.speed;
}

/**
 * Set speed automatically based on flight status and route
 */
Plane.prototype.setAutoSpeed = function() {
    switch (this.phase) {
        case PHASE_WAIT_TAKEOFF:
            this.speed = 0;
            this.speed_target = 0;
            break;
        case PHASE_TAKEOFF:
            this.speed = 5;
            this.speed_target = 160;
            break;
        case PHASE_CLIMB_INITIAL:
            this.speed_target = 250;
            break;
        case PHASE_CLIMB_CRUISE:
            this.speed_target = 360;
            break;
        case PHASE_CRUISE:
            this.speed_target = 405;
            break;
        case PHASE_DESCENT_CRUISE:
            if (this.holding == false && this.speed > 360) {
                this.speed_target = 360;
            }
            break;
        case PHASE_APPROACH:
            this.speed_target = 250;
            break;
        case PHASE_FINAL_APPROACH:
            this.speed_target = 200;
            break;
        case PHASE_FINAL:
            this.speed_target = 140;
            break;
        case PHASE_MISSED_APPROACH:
            this.speed_target = 250;
            break;
        case PHASE_TAXI:
            this.speed_target = 10;
            break;
        case PHASE_LANDED:
            this.speed_target = 0;
            return;
    }
console.log('phase = ' + this.phase + ' speed = ' + this.speed_target);
    this.checkSpeedConstraint();
    this.checkAltitudeConstraint();
}


Plane.prototype.setHeading = function(heading, turn_direction) {
// console.log('setHeading = ' + heading);
    // Turn direction int, 0=shorters, 1=left, 2=right
    if (turn_direction == 1) turn_direction = 'L';  // adjust from legs to L/R
    if (turn_direction == 2) turn_direction = 'R';  // adjust from legs to L/R
    // TODO Don't clear tracks but adjust them
    this.heading_target = 1 * heading;
    if (Math.abs(heading - this.heading) > 1) {
        if (turn_direction == 'R' || (heading > this.heading && (heading - this.heading) < 180) || (this.heading > heading && (this.heading - heading) > 180)) {
            this.turn = PLANE_TURN_RATIO;
        }
        else {
            this.turn = -PLANE_TURN_RATIO;
        }
    }
}

Plane.prototype.setLevelCleared = function(fl_cleared) {
    if (fl_cleared > 45000) {
        var stop = 1;
    }
    if (this.hasStatus(STATUS_CLEARED_TAKEOFF)) {
        this.fl_initial = fl_cleared;
    }
    this.fl_cleared = fl_cleared;
console.log(this.callsign + ' setLevelCleared = ' + this.fl_cleared);
}

Plane.prototype.setLevel = function(level) {
    this.setLevelCleared(level);
    if (this.fl > this.fl_cleared) {
        // Descend
        if (this.phase == PHASE_CRUISE || this.phase == PHASE_DESCENT_CRUISE || this.phase == '') {
            // Distance from destination?
            if (this.airp_dest != '') {
                var o_airport = findAirport(this.airp_dest);
                if (o_airport instanceof Airport) {
                    var coords = new LatLon(this.latitude, this.longitude);
                    var dest_coords = new LatLon(o_airport.latitude, o_airport.longitude);
                    var distance = Math.metersToMiles(coords.distanceTo(dest_coords));
                    console.log('Distance to destination' + this.airp_dest + ' : ' + distance + ' miles');
                    if (distance < 75) {
                        this.setFlightPhase(PHASE_DESCENT_CRUISE);
                        this.addStatus(STATUS_DESCENDING);
                        this.checkAltitudeConstraint();
                    }
                    else {
                        this.climb = PLANE_DESCENT_RATIO;
                    }
                    console.log('setLevel (1) ' + level + ' New climb = ' + this.climb);
                    return;
                }
            }
        }
        else {
            this.climb = PLANE_DESCENT_RATIO;
        }
    }
    if (this.phase == PHASE_CRUISE || this.phase == '') {
        if (this.climb >= 0 && this.fl > this.fl_cleared) {
            this.climb = PLANE_DESCENT_RATIO;
        }
        else if (this.climb <= 0 && this.fl < this.fl_cleared) {
            this.climb = PLANE_CLIMB_RATIO;
        }
    }
    else {
        if (this.fl < this.fl_cleared && this.climb > 0) {
            // Continue climbing / descending accordingly to phase flight
        }
        if (this.fl < this.fl_cleared && this.climb <= 0) {
            this.climb = PLANE_CLIMB_RATIO;
        }

    }
    console.log('setLevel(2)' + level + ' New climb = ' + this.climb);
}

Plane.prototype.setSpeed = function(speed) {
    this.speed_target = speed;
    this.checkAltitudeConstraint();
}

Plane.prototype.addStatus = function(status) {
    var that = this;
    if (this.status.indexOf(status) == -1) {
        this.status += status;
    }
    switch (status) {
        case STATUS_CLEARED_TAKEOFF:
            setTimeout(function () {
                that.setFlightPhase(PHASE_TAKEOFF);
                that.removeStatus(STATUS_CLEARED_TAKEOFF);
                that.addStatus(STATUS_TAKEOFF);
            }, 10000 + (Math.random() * 15000));
            break;
        case STATUS_TAKEOFF:
            this.climb = 0;
            this.setLevelCleared(this.fl_initial);
            // this.setLevelCleared(this.fl_final);
            this.current_step = -1;
            if (speedX2 == 1) {
                this.lastcompute = (new Date().getTime() - 5000) / 500;
            }
            else {
                this.lastcompute = (new Date().getTime() - 5000) / 1000;
            }
            this.advance2NextStep();
            setTimeout(function () {
                that.removeStatus(STATUS_RADIO_CONTACT_TWR);
                that.addStatus(STATUS_RADIO_CONTACT_YOU);
                that.setAtcPhase(PLANE_ATC_ACTIVE);
            }, 5000 + (Math.random() * 5000));
            break;
        case STATUS_RADIO_CONTACT_YOU:
            this.removeStatus(STATUS_RADIO_CONTACT_ATC);
            this.removeStatus(STATUS_RADIO_CONTACT_TWR);
            break;
        case STATUS_RADIO_CONTACT_ATC:
            this.removeStatus(STATUS_RADIO_CONTACT_YOU);
            this.removeStatus(STATUS_RADIO_CONTACT_TWR);
            break;
        case STATUS_RADIO_CONTACT_TWR:
            this.removeStatus(STATUS_RADIO_CONTACT_ATC);
            this.removeStatus(STATUS_RADIO_CONTACT_YOU);
            break;
        case STATUS_APPROACH:
            this.removeStatus(STATUS_LANDING);
            this.removeStatus(STATUS_FINAL);
            this.removeStatus(STATUS_FINAL_APPROACH);
            this.removeStatus(STATUS_MISSED_APPROACH);
            break;
        case STATUS_FINAL:
            this.removeStatus(STATUS_APPROACH);
            this.removeStatus(STATUS_FINAL_APPROACH);
            break;
        case STATUS_LANDING:
            this.removeStatus(STATUS_FINAL);
            this.removeStatus(STATUS_APPROACH);
            this.removeStatus(STATUS_FINAL_APPROACH);
            break;
        case STATUS_LANDED:
            this.removeStatus(STATUS_LANDING);
            this.removeStatus(STATUS_FINAL);
            this.removeStatus(STATUS_APPROACH);
            this.removeStatus(STATUS_FINAL_APPROACH);
            break;
        case STATUS_MISSED_APPROACH:
            this.removeStatus(STATUS_LANDING);
            this.removeStatus(STATUS_FINAL);
            this.removeStatus(STATUS_APPROACH);
            this.removeStatus(STATUS_FINAL_APPROACH);
            break;
    }
}

Plane.prototype.removeStatus = function(status) {
    var pos = this.status.indexOf(status);
    if (pos != -1) {
        this.status = this.status.substr(0,pos) + this.status.substr(pos+(status.length));
    }
}

Plane.prototype.hasStatus = function(status) {
    if (this.status.indexOf(status) != -1) {
        return true;
    }
    return false;
}


Plane.prototype.setFlightPhase = function(phase) {
    this.phase = phase;
    // TODO changes....
    console.log('Plane ' + this.callsign + ' new flight phase:  ' + phase);
    switch (phase) {
        case PHASE_WAIT_TAKEOFF:
            this.fl = 0;
            this.setLevelCleared(0);
            this.speed = 0;
            this.departure = true;
            this.arrival = false;
            this.transit = false;
            break;
/*
        case PHASE_CLEARED_TAKEOFF:
            var that = this;
            setTimeout(function() {
                that.setFlightPhase(PHASE_TAKEOFF);
                that.removeStatus(STATUS_CLEARED_TAKEOFF);
                that.addStatus(STATUS_TAKEOFF);
            }, 10000 + (Math.random() * 15000));
            break;
        case PHASE_TAKEOFF:
            this.climb = 0;
            this.setLevelCleared(this.fl_final);
            this.current_step = -1;
            if (speedX2 == 1) {
                this.lastcompute = (new Date().getTime() - 5000) / 500;
            }
            else {
                this.lastcompute = (new Date().getTime() - 5000) / 1000;
            }
            this.advance2NextStep();
            break;
*/
        case PHASE_CLIMB_INITIAL:
            this.climb = 2500;
            break;
        case PHASE_CLIMB_CRUISE:
            this.climb = 2000;
            break;
        case PHASE_DESCENT_CRUISE:
            this.climb = -4500;
            break;
        case PHASE_APPROACH:
            this.climb = -1000;
            break;
        case PHASE_FINAL_APPROACH:
            this.climb = -750;
            break;
        case PHASE_FINAL:
            this.climb = -500;
            break;
        case PHASE_MISSED_APPROACH:
            if (this.fl > this.fl_cleared) {
                this.climb = -750;
            }
            else if (this.fl < this.fl_cleared)
            {
                this.climb = 750;
            }
            else  {
                this.climb = 0;
            }
            break;
        case PHASE_LANDED:
            this.climb = 0;
            break;
        case PHASE_TAXI:
            this.climb = 0;
            break;
    }
    this.setAutoSpeed();
}

Plane.prototype.destroy = function() {
    console.log('DESTROY Plane ' + this.callsign);
    this.removeChild(this.gTail);
    this.removeChild(this.gLabel);
    this.removeChild(this.gLabelConnector);
    this.removeChild(this.gBox);

}

/********************
 *      MOVE
 *******************/
Plane.prototype.updateTimer = function(value) {
    this.lastcompute = value;
}

Plane.prototype.move = function(newTimer) {

    /*
    this.addStatus(STATUS_ARRIVAL);
    this.addStatus(STATUS_CRUISE);
    this.addStatus(STATUS_DESCENDING);
    this.removeStatus(STATUS_APPROACH);
    this.removeStatus(STATUS_CRUISE);
    this.removeStatus(STATUS_DESCENDING);
    this.removeStatus(STATUS_ARRIVAL);
    */


    var tmp;
    var elapsed = newTimer - this.lastcompute;
    if (elapsed > 1000) {
        console.log(elapsed + ' - ' + this.latitude + ' - ' + this.longitude);
    }

    // TEST
    /*
    if (this.callsign == planes[0].callsign) {
        this.holdingPattern('TAQ', 280, 5, 1);
    }
    */

    if (this.fl == 0 && this.speed == 0) {
        // Plane on the ground
        return;
    }
    this.updateTimer(newTimer);
    if (this.turn != 0) {
        // Compute new heading
        // console.log('Turn hdg ' + this.heading + ' > ' + this.heading_target + ' turn = ' + this.turn);
        if (Math.abs(this.heading - this.heading_target) < Math.abs(this.turn * elapsed)) {
            // Reached assigned heading
            this.turn = 0;
            this.heading = this.heading_target;
        }
        tmp = this.heading;
        if (this.turn != 0) {
            tmp = tmp + this.turn * elapsed;
        }
        if (tmp < 0) {
            tmp = 360 + tmp;
        } else if (tmp >= 360) {
            tmp = tmp - 360;
        }
        this.heading = tmp;
    }
    if (this.heading < 180) {
        this.connectorDeg = 225;
    }
    else {
        this.connectorDeg = 45;
    }

    this.speed = 0 + this.speed;
    this.speed_target = 0 + this.speed_target;

    if (this.speed_target > this.speed) {
        // Increase speed
        if (this.phase == PHASE_TAKEOFF) {
            this.speed = Math.floor(this.speed + (elapsed * 5));
        }
        else {
            this.speed = Math.floor(this.speed + (elapsed * 1.5));
        }
        if (this.speed < 140 && this.phase != PHASE_LANDED) {
            this.speed = 140;
            this.speed_target = 140;
        }
    }
    if (this.speed_target < this.speed) {
        // Decrease speed
        if (this.phase == PHASE_LANDED) {
            //Brakes!!
            this.speed = Math.floor(this.speed - (elapsed * 10));
        }
        else {
            this.speed = Math.floor(this.speed - (elapsed * 2));
        }
    }
    if (Math.abs(this.speed_target - this.speed) < 5) {
        this.speed = this.speed_target;
    }

    var latlon = Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, (this.speed / 3600) * elapsed);
    this.latitude = latlon.lat;
    this.longitude = latlon.lon;
// console.log(this.callsign + ' new position - ' + this.latitude + ' - ' + this.longitude);
    this.setPosition();

    if (this.phase == PHASE_TAKEOFF) {
        if (this.climb == 0 && this.speed >= 140) {
            // V1 Rotation and take off
            this.climb = 3500;
            console.log('(move 10) Plane ' + this.callsign + ' V1 rotation ... climb at ' + this.climb + ' ft/min');
        }
    }

    // Compute new FL
    var ratio = (this.climb * elapsed / 60 );
    if (ratio != 0) {
        if (Math.abs(this.fl - this.fl_cleared) < Math.abs(ratio)) {
            console.log('Plane ' + this.callsign + ' Level ' + this.fl + ' > ' + this.fl_cleared + ' ratio = ' + ratio);
            // Reached assigned altitude
            this.climb = 0;
            this.fl = this.fl_cleared;
            console.log('(move 11) Plane ' + this.callsign + ' reached assigned altitude ' + this.fl_cleared + ' : new ratio = 0');
        }
        else {
            if (this.fl < this.fl_cleared && ratio <= 0) {
                this.setLevel(this.fl_cleared);
            }
            else if (this.fl > this.fl_cleared && ratio >= 0) {
                this.setLevel(this.fl_cleared);
            }
            else {
                this.fl = this.fl + ratio;
            }
        }
    }

    var newCoords = new LatLon(this.latitude, this.longitude);
    if (this.fix_next != -1) {
        var nextFixCoords = new LatLon(waypoints[this.fix_next].latitude, waypoints[this.fix_next].longitude);
    }
    else {
        var nextFixCoords = new LatLon(LATITUDE_CENTER, LONGITUDE_CENTER);
    }

    this.coarse = newCoords.bearingTo(nextFixCoords);
    this.distance = Math.metersToMiles(newCoords.distanceTo(nextFixCoords));

    // CHECK FLIGHT PHASE
    switch (this.phase) {
        case PHASE_TAKEOFF:
            if (this.climb > 0 && this.fl > 2000) {
                this.setFlightPhase(PHASE_CLIMB_INITIAL);
                this.removeStatus(STATUS_TAKEOFF);
                this.addStatus(STATUS_CLIMB_INITIAL);
            }
            break;
        case PHASE_CLIMB_INITIAL:
            if (this.climb > 0 && this.fl > 10000) {
                this.setFlightPhase(PHASE_CLIMB_CRUISE);
                this.removeStatus(STATUS_CLIMB_INITIAL);
                this.addStatus(STATUS_CLIMBING);
            }
            break;
        case PHASE_CLIMB_CRUISE:
            if (this.climb > 0 && this.fl > 20000) {
                this.setFlightPhase(PHASE_CRUISE);
                this.removeStatus(STATUS_CLIMB_INITIAL);
                this.addStatus(STATUS_CRUISE);
            }
            break;
    }

    // Check for any route to follow
    this.followRoute();
}


Plane.prototype.goTo = function(fixNum) {
    this.fix_next = fixNum;
    var origin = new LatLon(this.latitude, this.longitude);
    var dest = new LatLon(waypoints[fixNum].latitude, waypoints[fixNum].longitude);
    this.setHeading(origin.finalBearingTo(dest));
}

/******************************
 * NAVIGATION
 *****************************/
Plane.prototype.goToWaypoint = function(o_wp) {
    if (o_wp instanceof Waypoint) {
        // console.log('gotowaypoint(1) - ' + this.latitude + ' - ' +  this.longitude);
        var origin = new LatLon(this.latitude, this.longitude);
        var dest = new LatLon(o_wp.latitude, o_wp.longitude);
        this.setHeading(origin.finalBearingTo(dest));
        var estimate = this.estimateToCoords(o_wp.latitude, o_wp.longitude);
        // console.log('gotowaypoint(2) - ' + this.latitude + ' - ' + this.longitude);
        return estimate;

    }
    else {
        console.log('Plane.goToWaypoint: bad parameter, not a waypoint');
        return -1;
    }
}

Plane.prototype.goToNavaid = function(o_wp) {
    if (o_wp.isNavaid) {
        // console.log('gotonavaid(1) - ' + this.latitude + ' - ' +  this.longitude);
        var origin = new LatLon(this.latitude, this.longitude);
        var dest = new LatLon(o_wp.latitude, o_wp.longitude);
        this.setHeading(origin.finalBearingTo(dest));
        var estimate = this.estimateToCoords(o_wp.latitude, o_wp.longitude);
        // console.log('gotonavaid(2) - ' + this.latitude + ' - ' +  this.longitude);
        return estimate;
    }
    else {
        console.log('Plane.goToNavaid: bad parameter, not a waypoint');
        return -1;
    }
}

Plane.prototype.goToCoords = function(latitude, longitude, turn_direction, heading) {
    var origin = new LatLon(this.latitude, this.longitude);
    var dest = new LatLon(latitude, longitude);
    this.setHeading(origin.finalBearingTo(dest), turn_direction);
    // TODO check heading
    return this.estimateToCoords(latitude, longitude);
}

Plane.prototype.estimateToCoords = function(latitude, longitude) {
    var distance =  Math.distanceToCenter(this.latitude, this.longitude, latitude, longitude);
    return distance / (this.speed / 60);
}


/**
 * Intercept a radial to/from a fix
 * @param identifier        name of the fix/navaid
 * @param radial            radial to intercept in degrees
 * @param inbound           true = inbound / false = outbound
 */
Plane.prototype.interceptRadial = function(identifier, radial, inbound) {

    var o_fix = undefined;

    if (this.intercepting == false) {
        // Identify Fix
        this.navaid2intercept = findWaypoint(identifier);
        if (this.navaid2intercept == undefined) {
            return true;
        }
        // Enter intercepting mode
        this.intercepting = true;         // Intercepting a radial
        this.radial2intercept = radial;   // Radial to intercept
        this.radialInbound = inbound;     // true to follow radial inbound / false for outbound
        this.interceptPoint = undefined;
        this.interceptProcedure = undefined;
    }

    var current_distance = Math.distanceToCenter(this.latitude, this.longitude, this.navaid2intercept.latitude, this.navaid2intercept.longitude);
    // Check current radial
    var inverse_radial = Math.inverseBearing(this.radial2intercept);
    var origin = new LatLon(this.latitude, this.longitude);
    var dest = new LatLon(this.navaid2intercept.latitude, this.navaid2intercept.longitude);
    var current_radial = Math.floor(Math.inverseBearing(origin.finalBearingTo(dest)));
    var heading_to_fix = origin.bearingTo(dest);
    var turn_direction = 1; // left
    var diff_radial = Math.round(this.radial2intercept - current_radial);
    var angle = 0;
    var distance_intercept_point = 0;
    var destination_point;
    var new_heading;
    var intercept_angle;

    if (this.radialInbound == undefined) {
        // Check angle between current heading and radial to intercept
        angle = this.heading - this.radial2intercept;
console.log('angle=' + angle);
        if (angle > 180 || angle < -180) {
            this.radialInbound = true;
        }
        else {
            this.radialInbound = false;
        }
    }

    if (diff_radial < 0 || Math.abs(diff_radial) >= 180) {
        diff_radial = current_radial - this.radial2intercept;
        turn_direction = 2; // right
    }

    if (Math.floor(Math.abs(current_radial - this.radial2intercept)) < 2) {
        if (this.radialInbound == true && Math.floor(Math.abs(this.heading - inverse_radial)) < 4) {
console.log('RADIAL INBOUND OK');
            this.setHeading(inverse_radial, 0);
            // End of intercepting manouver
            this.intercepting = false;
            this.hideRoute();   // TEST
            return true;
        }
        if (this.radialInbound == false && Math.floor(Math.abs(this.heading - this.radial2intercept)) < 4) {
console.log('RADIAL OUTBOUND OK');
            this.setHeading(this.radial2intercept, 0);
            // End of intercepting manouver
            this.intercepting = false;
            this.hideRoute();   // TEST
            return true;
        }
    }

    if (this.radialInbound == true && this.interceptPoint != undefined) {
        distance_intercept_point = Math.distanceToCenter(this.latitude, this.longitude, this.interceptPoint.lat, this.interceptPoint.lon);
        new_heading = origin.finalBearingTo(this.interceptPoint);
        // Inbound to intercept point ... OK
        intercept_angle = Math.floor(new_heading - inverse_radial);
        if (intercept_angle < 0) {
            intercept_angle = 360 + intercept_angle;
        }
        console.log('Plane ' + this.callsign + ' intercept angle = ' + intercept_angle + ' MODE = ' + this.interceptProcedure);
        if (this.interceptProcedure == undefined && Math.abs(new_heading - this.heading) < 45) {
            if (intercept_angle >= 90 && intercept_angle <= 270) {
                this.interceptProcedure = INTERCEPT_MODE_PROCEDURE;
            }
            else {
                this.interceptProcedure = INTERCEPT_MODE_STRAIGHT;
            }
        }
        if (this.interceptProcedure == INTERCEPT_MODE_PROCEDURE && distance_intercept_point < ((this.speed / 3600) * 10)) {
            // Start outbound leg
            this.interceptProcedure = INTERCEPT_MODE_OUTBOUND_LEG;
            console.log('Plane ' + this.callsign + ' begin OUTBOUND LEG');
            return;
        }
        if (this.interceptProcedure == INTERCEPT_MODE_OUTBOUND_LEG) {
            if (distance_intercept_point > ((this.speed / 3600) * 60)) {
                // Begin procedure turn
                console.log('Plane ' + this.callsign + ' begin PROCEDURE TURN');
                if (intercept_angle > 180) {
                    this.goToCoords(this.interceptPoint.lat, this.interceptPoint.lon, 1);
                } else {
                    this.goToCoords(this.interceptPoint.lat, this.interceptPoint.lon, 2);
                }
                this.interceptProcedure = INTERCEPT_MODE_STRAIGHT;
            }
            return;
        }
    }

    if (Math.abs(current_radial - this.radial2intercept) < (5 / (current_distance / 10))) {
        if (this.radialInbound == true) {
console.log('====== inbound - current_radial=' + current_radial + ' radial=' + this.radial2intercept + ' diff=' + diff_radial + ' turn=' + turn_direction);
            this.setHeading(this.heading - (diff_radial * 2), turn_direction);
        }
        else {
console.log('====== outbound - current_radial=' + current_radial + ' radial=' + this.radial2intercept + ' diff=' + diff_radial + ' turn=' + turn_direction);
            if (diff_radial < 0) {
                this.setHeading(this.heading + (diff_radial * 2), 2); // turn_direction
            }
            else {
                this.setHeading(this.heading + (diff_radial * 2), 1); // turn_direction
            }
        }
    }
console.log('Plane ' + this.callsign + ' - current radial=' + current_radial + ' radial=' + this.radial2intercept + ' heading=' + this.heading);

    // Check angle distance from radial to intercept

    if (this.holding == false) {
        this.hideRoute();   // TEST
    }

    if (this.interceptPoint == undefined) {
        // Calculate a 45° intercept route
        if (this.radialInbound == true) {
            if (this.phase == PHASE_FINAL) {
                // Intercept final path as soon as possible
                distance_intercept_point = current_distance;
            }
            else {
                distance_intercept_point = current_distance / 2;
                if (distance_intercept_point < 7) {
                    // At least 10 miles to intercept
                    distance_intercept_point = 7;
                }
            }
        }
        else {
            distance_intercept_point = current_distance * 1.5;
            if (distance_intercept_point > 5 ) {
                distance_intercept_point = 5;
            }
        }
console.log('intercept in ' + distance_intercept_point + ' miles');
        this.interceptPoint = Math.coordsFromCoarseDistance(this.navaid2intercept.latitude, this.navaid2intercept.longitude, this.radial2intercept, distance_intercept_point);
    }
    else {
        distance_intercept_point = Math.distanceToCenter(this.latitude, this.longitude, this.interceptPoint.lat, this.interceptPoint.lon);
        if (distance_intercept_point < 3) {
console.log('intercept in ' + distance_intercept_point + ' miles (' + (distance_intercept_point / (this.speed / 3600)) + ' secs');
        }
        if (distance_intercept_point < ((this.speed / 3600) * 20)) {
            // Less than 20 seconds to intercept point...
            var new_distance;
            // move intercept point ahead to smooth interception
            if (this.radialInbound == true) {
                if (this.phase == PHASE_FINAL) {
                    new_distance = distance_intercept_point / 2;
                }
                else {
                    new_distance = distance_intercept_point / 4;

                }
                this.interceptPoint = Math.coordsFromCoarseDistance(this.interceptPoint.lat, this.interceptPoint.lon, inverse_radial, new_distance);
            }
            else {
console.log('move intercept point far radial=' + this.radial2intercept + ' distance=' + distance_intercept_point / 4);
                this.interceptPoint = Math.coordsFromCoarseDistance(this.interceptPoint.lat, this.interceptPoint.lon, this.radial2intercept, distance_intercept_point / 4);
            }
        }
    }

    new_heading = origin.finalBearingTo(this.interceptPoint);
    /*
    if (this.radialInbound == true) {
        intercept_angle = Math.floor(Math.abs(new_heading - inverse_radial));
    }
    else {
        intercept_angle = Math.floor(Math.abs(new_heading - this.radial2intercept));
    }
    */
    intercept_angle = Math.floor(new_heading - inverse_radial);
    if (intercept_angle < 0) {
        intercept_angle = 360 + intercept_angle;
    }

console.log('(2) intercept angle = ' + intercept_angle);
    if (intercept_angle > 45 && intercept_angle < 315) {
        if (this.radialInbound == false && current_distance > distance_intercept_point) {
            // Move intercept point a bit far
            this.interceptPoint = Math.coordsFromCoarseDistance(this.interceptPoint.lat, this.interceptPoint.lon, this.radial2intercept, distance_intercept_point / 4);
        }
        else if (this.radialInbound == true && this.phase == PHASE_FINAL) {
            // Move intercept point a bit close
            this.interceptPoint = Math.coordsFromCoarseDistance(this.interceptPoint.lat, this.interceptPoint.lon, inverse_radial, distance_intercept_point / 4);
        }
    }

    // TEST
    /*
    var v = this.videotracks.length;
    this.videotracks[v] = new VideoTrack();
    this.videotracks[v].from_latitude = this.navaid2intercept.latitude;
    this.videotracks[v].from_longitude = this.navaid2intercept.longitude;
    this.videotracks[v].to_latitude = this.interceptPoint.lat;
    this.videotracks[v].to_longitude = this.interceptPoint.lon;
    this.videotracks[v].setScreenPosition();
    mainContainer.addChild(this.videotracks[v].gDraw);
    */
    this.goToCoords(this.interceptPoint.lat, this.interceptPoint.lon);
    return false;
}


Plane.prototype.holdingPattern = function(identifier, inbound_radial, leg_distance, turn_direction ) {

    if (this.holding == false) {
        this.holding = true;
        this.holding_o_fix  = findWaypoint(identifier);
        if (this.holding_o_fix == undefined) {
            this.holding = false;
            return false;
        }
        this.holding_identifier = identifier;
        this.holding_radial = inbound_radial;
        this.holding_leg_distance = leg_distance;
        this.holding_turn_direction = turn_direction;

        // Compute 4 points of holding
        var radial_perpendicular;
        if (this.holding_turn_direction == 2) {
            radial_perpendicular = inbound_radial - 90;
            if (radial_perpendicular < 0) {
                radial_perpendicular = 360 + radial_perpendicular;
            }
        }
        else {
            radial_perpendicular = (inbound_radial + 90) % 360;
        }
console.log(this.callsign + ' HM radial=' + inbound_radial + '  perpend.=' + radial_perpendicular);
        var hp1 = new LatLon(this.holding_o_fix.latitude, this.holding_o_fix.longitude);
        var hp2 = Math.coordsFromCoarseDistance(hp1.lat, hp1.lon, radial_perpendicular, leg_distance / 2);
        var hp3 = Math.coordsFromCoarseDistance(hp2.lat, hp2.lon, inbound_radial, leg_distance);
        var hp4 = Math.coordsFromCoarseDistance(hp1.lat, hp1.lon, inbound_radial, leg_distance);
        this.holding_points[0] = hp1;
        this.holding_points[1] = hp2;
        this.holding_points[2] = hp3;
        this.holding_points[3] = hp4;
        if (this.interceptProcedure == INTERCEPT_MODE_STRAIGHT) {
            this.holding_point_next = 0;    // Next point is fix
        }
        else {
            this.holding_point_next = 2;    // Next point is opposite point
        }

        if (this.o_holding != undefined) {
            mainContainer.removeChild(this.o_holding);
        }
        this.o_holding = new Holding();
        this.o_holding.setPattern(identifier, inbound_radial, leg_distance, turn_direction );
        mainContainer.addChild(this.o_holding);

    }
}

Plane.prototype.changeFreq = function(frequency) {
    console.log(this.callsign + ' - Change frequency with ' + frequency);
    if (frequency == 'TWR') {
        if (this.hasStatus(STATUS_APPROACH) || this.hasStatus(STATUS_FINAL_APPROACH) || this.hasStatus(STATUS_FINAL) || this.hasStatus(STATUS_LANDING) || this.hasStatus(STATUS_LANDED)) {
            this.setAtcPhase(PLANE_ATC_OUT);
            this.addStatus(STATUS_RADIO_CONTACT_TWR);
            this.removeStatus(STATUS_IDENT);
            director.planeDestroy(this);
        }
    }
    if (frequency == 'ATC') {
        if (true || this.departure && this.hasStatus(STATUS_CRUISE)) {
            // TODO CHECK RELEASE
            this.setAtcPhase(PLANE_ATC_OUT);
            this.removeStatus(STATUS_IDENT);
            this.addStatus(STATUS_RADIO_CONTACT_ATC);

            var that = this;
            setTimeout(function() {
                director.planeDestroy(that);
            },5000 + (Math.random() * 5000));
        }
        else {
            // TODO - BAD COMMAND
        }
    }
    // this.updateStripMode();
}


// Check distance to a coordinate point
Plane.prototype.checkNearCoords = function(latitude, longitude) {
    var planeCoords = new LatLon(this.latitude, this.longitude);
    var nextFixCoords = new LatLon(latitude, longitude);
    return Math.metersToMiles(planeCoords.distanceTo(nextFixCoords));
}

/***********************
 * FOLLOWROUTE
 ***********************/
Plane.prototype.followRoute = function() {
    if (this.current_step == -1) {
        // TODO
        return;
    }
    var o_step = this.steps[this.current_step];
    if (o_step instanceof Step) {
// console.log(this.callsign + ' current step = ' + this.current_step + ' = '  + o_step.type + ' - ' + o_step.identifier);
        switch (o_step.type) {
            case 'CA':
            case 'VA':
                // Check for altitude
                var alt = this.fl;
                if (o_step.altitude_constraint != undefined) {
                    // 0=no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
                    if (o_step.altitude_constraint == 1 && alt == o_step.altitude_1) {
                        console.log('Plane ' + this.callsign + ' reached alt ' + alt);
                        this.advance2NextStep();
                    }
                    if (o_step.altitude_constraint == 2 && alt >= o_step.altitude_1) {
                        console.log('Plane ' + this.callsign + ' crossing alt ' + alt + ' climbing');
                        this.advance2NextStep();
                    }
                    if (o_step.altitude_constraint == 3 && alt <= o_step.altitude_1) {
                        console.log('Plane ' + this.callsign + ' crossing alt ' + alt + ' descending');
                        this.advance2NextStep();
                    }
                    if (o_step.altitude_constraint == 4 && (alt >= o_step.altitude_1 && alt <= o_step.altitude_2)) {
                        console.log('Plane ' + this.callsign + ' crossing ' + alt + ' between ' + o_step.altitude_1 + ' and ' + o_step.altitude_2);
                        this.advance2NextStep();
                    }
                }
                else {
                    console.log('Plane ' + this.callsign + ' BAD STEP CA');
                    this.advance2NextStep();
                }
                break;
            case 'VI':
                // Vector to an intercept
                if (this.heading == o_step.heading) {
                    console.log('Plane ' + this.callsign + ' set heading ' + this.heading + ' (VI)');
                    this.advance2NextStep();
                }
                break;
            case 'VM':
                // Vector to a manual termination
                if (this.heading == o_step.heading) {
                    // Wait for a manual clearence
                }
                break;
            case 'FD':
                // Follow a radial
                if (this.intercepting) {
                    if (this.radialInbound == true && o_step.latitude != 0 && o_step.longitude != 0) {
                        // Inbound radial ...check for fix
                        if (this.checkNearCoords(o_step.latitude, o_step.longitude) < (this.speed / 240)) {
                            // TODO RADIO - CROSSING FIX
                            console.log('Plane ' + this.callsign + ' < ' + (this.speed / 240) + ' miles from next fix');
                            // console.log(this.latitude + ' - ' + this.longitude);
                            this.intercepting = false;
                            this.hideRoute();   // TEST
                            this.advance2NextStep();
                            break;
                        }
                    }
                    if (this.interceptRadial()) {
                        this.hideRoute();   // TEST
                        this.advance2NextStep();
                    }
                }
                else {
                    this.hideRoute();   // TEST
                    this.advance2NextStep();
                }
                break;
            case 'HM':
                // Holding Pattern;
                // check position respect to next holding point
                var h = -1;
                if (this.holding_point_next != undefined) {
                    h = this.holding_point_next;
                    if (this.checkNearCoords(this.holding_points[h].lat, this.holding_points[h].lon) < (this.speed / 240)) {
                        // Holding point reached ... advance to next point in pattern
                        h = (h + 1) % 4;
                    }
                }
                if (h != -1) {
                    console.log(this.callsign + ' - Holding ... next point = ' + h);
                    this.goToCoords(this.holding_points[h].lat, this.holding_points[h].lon, this.holding_turn_direction);
                    this.holding_point_next = h;
                }
                break;
            case 'LAND':
                if (this.phase != PHASE_MISSED_APPROACH &&  this.phase != PHASE_LANDED) { // && this.fl == this.fl_cleared
                    if (o_step.latitude != 0 && o_step.longitude != 0) {
                        if (this.checkNearCoords(o_step.latitude, o_step.longitude) < (this.speed / 240)) {
                            // LANDED!
console.log('LANDED BY RUNWAY');
                            this.setFlightPhase(PHASE_LANDED);
                            this.addStatus(STATUS_LANDED);
                            planeDestroy(this);
                            return;
                        }
                    }
                    else if (this.fl == this.fl_cleared) {
                        // LANDED!
console.log('LANDED BY ALTITUDE');
                        this.setFlightPhase(PHASE_LANDED);
                        this.addStatus(STATUS_LANDED);
                        planeDestroy(this);
                    }
                }
                break;
            default:
                if (this.intercepting == true) {
                    if (this.interceptRadial()) {
                        this.advance2NextStep();
                    }
                    else {
                        // Check for fix crossing
                        if (o_step.latitude != 0 && o_step.longitude != 0) {
                            if (this.checkNearCoords(o_step.latitude, o_step.longitude) < (this.speed / 240)) {
                                console.log('Plane ' + this.callsign + ' < ' + (this.speed / 240) + ' miles from next fix');
                                // console.log(this.latitude + ' - ' + this.longitude);
                                this.advance2NextStep();
                            }
                        }
                    }
                }
                else {
                    // Check for fix or coords
                    if (o_step.latitude != 0 && o_step.longitude != 0) {
                        if (this.checkNearCoords(o_step.latitude, o_step.longitude) < (this.speed / 240)) {
                            // TODO RADIO - CROSSING FIX
                            console.log('Plane ' + this.callsign + ' < ' + (this.speed / 240) + ' miles from next fix');
                            // console.log(this.latitude + ' - ' + this.longitude);
                            this.advance2NextStep();
                            // console.log(this.latitude + ' - ' + this.longitude);
                        }
                        else {
                            // Adjust heading
                            this.goToCoords(o_step.latitude, o_step.longitude);
                        }
                    }
                }
                break;
        }
        return;
    }
    // TODO ... no steps
}


Plane.prototype.advance2NextStep = function() {
    var step;
    if (this.current_step != -1) {
        step = this.steps[this.current_step];
        if (step.change_flight_phase != '') {
            if (this.phase == PHASE_MISSED_APPROACH) {
                // Ignore any phase change 
            }
            else {
                this.setFlightPhase(step.change_flight_phase);
                // TODO STATUS
            }
        }
    }
    if (this.steps.length > (this.current_step+1)) {
        this.current_step++;
        if (this.holding == true) {
            this.holding = false;
            this.holding_points = [];
            if (this.o_holding != undefined) {
                mainContainer.removeChild(this.o_holding);
            }
        }
        step = this.steps[this.current_step];
        var wp_id;
        var o_wp;
        var latitude;
        var longitude;
        var estimate;
        var altitude_constraint = step.altitude_constraint;
        // Execute Next Step
        console.log('Plane ' + this.callsign + ' next step ' + step.type + ' (' + step.identifier + ')');
        if (this.phase != PHASE_MISSED_APPROACH && step.identifier != '' && step.identifier == this.o_route.mapFix) {
            // Next step is MAP fix ...
            // Replace with runway threshold
            var o_runway = findRunway(this.airp_dest, this.o_route.runway);
            if (o_runway instanceof Runway) {
                step = new Step();
                step.type = 'LAND'; //Special type
                step.identifier = o_runway.label1;
                step.latitude = o_runway.latitude;
                step.longitude = o_runway.longitude;
                step.altitude_constraint = 1;
                step.altitude_1 = 0;
                step.track_bearing = this.steps[this.current_step-1].heading;
                this.steps.splice(this.current_step, 0, step);
                // this.current_step++;
                this.removeStatus(STATUS_APPROACH);
                this.removeStatus(STATUS_FINAL_APPROACH);
                this.addStatus(STATUS_FINAL);
            }
        }
        switch (step.type) {
            case 'IF':
            case 'TF':
                wp_id = step.identifier;
                latitude = step.latitude;
                longitude = step.longitude;
                this.intercepting = false;  // Clear any previous radial interception
                o_wp = findWaypoint(wp_id, latitude, longitude);
                estimate = this.goToWaypoint(o_wp);
                // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
                this.checkAltitudeConstraint();
                break;
            case 'CF':
            case 'LAND':
                // CF - Course to a Fix
                wp_id = step.identifier;
                latitude = step.latitude;
                longitude = step.longitude;
                this.intercepting = false;  // Clear any previous radial interception
                if (this.phase == PHASE_FINAL) {
                    var o_runway = findRunway(this.airp_dest, this.o_route.runway);
                    if (o_runway != undefined && o_runway.heading == step.heading) {
                        // Intercept final path
                        this.interceptRadial(this.o_route.runway, Math.inverseBearing(o_runway.heading), true);
                        break;
                    }
                }
                /*
                if (step.navaid_id != undefined && step.track_bearing != undefined) {
                    // Intercept a radial
                }
                */
                estimate = this.goToCoords(step.latitude, step.longitude, step.turn_direction, step.heading);
                // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
                this.checkAltitudeConstraint();
                break;
            case 'DF':
                // Direct to a fix
                wp_id = step.identifier;
                latitude = step.latitude;
                longitude = step.longitude;
                this.intercepting = false;  // Clear any previous radial interception
                o_wp = findWaypoint(wp_id, latitude, longitude);
                if (o_wp != undefined) {
                    estimate = this.goToWaypoint(o_wp);
                }
                else {
                    // TODO
                }
                // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
                this.checkAltitudeConstraint();
                break;
            case 'CD':
                // Coarse Direction
                o_wp = findWaypoint(step.navaid_id);
                if (o_wp != undefined) {
                    this.intercepting = false;  // Clear any previous radial interception
                    var fix_coords = Math.coordsFromCoarseDistance(o_wp.latitude, o_wp.longitude, step.heading, step.track_distance);
                    this.steps[this.current_step].latitude = fix_coords.lat;
                    this.steps[this.current_step].longitude = fix_coords.lon;
                    estimate = this.goToCoords(fix_coords.lat, fix_coords.lon);
                    // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
                    this.checkAltitudeConstraint();
                }
                break;
            case 'CA':
            case 'VA':
                // Coarse/Heading to Altitude
                var estimate = 0;
                if (step.turn_direction != undefined && step.heading != undefined) {
                    this.intercepting = false;  // Clear any previous radial interception
                    this.setHeading(step.heading, step.turn_direction);
                }
                else if (step.heading != undefined) {
                    this.intercepting = false;  // Clear any previous radial interception
                    this.setHeading(step.heading, 0);
                }
                if (step.altitude_constraint != undefined) {
                    // 0= no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
                    var alt = this.fl;
                    if (this.climb == 0 && this.phase != PHASE_TAKEOFF) {
                        if (step.altitude_constraint == 1 && alt < step.altitude_1) {
                            this.climb = 500;
                        }
                        if (step.altitude_constraint == 2 && alt < step.altitude_1) {
                            this.climb = 500;
                        }
                        if (step.altitude_constraint == 3 && alt > step.altitude_1) {
                            this.climb = -500;
                        }
                        console.log('Plane.advance2NextStep: ' + this.callsign + ' - new climb = ' + this.climb);
                    }
                    if (step.altitude_constraint == 1 && ((alt <= step.altitude_1 && this.climb > 0) || (alt >= step.altitude_1 && this.climb < 0))) {
                        estimate = this.estimateToAltitude(step.altitude_1);
                    }
                    if (step.altitude_constraint == 2 && (alt <= step.altitude_1 && this.climb > 0)) {
                        estimate = this.estimateToAltitude(step.altitude_1);
                    }
                    if (step.altitude_constraint == 3 && (alt >= step.altitude_1 && this.climb < 0)) {
                        estimate = this.estimateToAltitude(step.altitude_1);
                    }
                    // this.checkFixAltitudeConstraint(step.altitude_constraint, step.altitude_1, step.altitude_2, estimate);
                    this.checkAltitudeConstraint();
                }
                break;
            case 'VI':
                // Vector to an intercept
                if (step.heading != undefined) {
                    this.intercepting = false;  // Clear any previous radial interception
                    this.setHeading(step.heading, 0);
                    this.checkAltitudeConstraint();
                }
                else {
                    console.log('Step VI without heading');
                    this.advance2NextStep();
                }
                break;
            case 'VM':
                // Vector to a manual termination
                if (step.heading != undefined) {
                    this.intercepting = false;  // Clear any previous radial interception
                   this.setHeading(step.heading, 0);
                    this.checkAltitudeConstraint();
                    // TODO - Set a timer to call for further instructions
                }
                else {
                    console.log('Step VM without heading');
                }
                break;
            case 'FD':
                // Follow a radial
                o_wp = findWaypoint(step.identifier);
                if (o_wp != undefined) {
                    this.steps[this.current_step].latitude = o_wp.latitude;
                    this.steps[this.current_step].longitude = o_wp.longitude;
                    this.intercepting = false;  // Clear any previous radial interception
                    this.interceptRadial(step.identifier, step.track_bearing, step.inbound);
                }
                else {
                    this.setHeading(step.heading, 0);
                }
                break;
            case 'HM':
                // Holding pattern
                this.holdingPattern(step.identifier, step.heading, step.leg_distance, step.turn_direction);
                break;
            default:
                console.log('Step ' + step.type + ' not handled');
                this.advance2NextStep();
        }
    }
    else {
        // No further instruction - Maintain holding to last fix
        var o_route = new Route();
        var last_step = undefined;
        for (var s=this.current_step; s>=0; s--) {
            last_step = this.steps[s];
            if (last_step.type == 'FD' && last_step.inbound == false) {
                // Is following a radial outbound ... continue!
                console.log('Plane.advance2NextStep: ' + this.callsign + ' - Continue following outbound route');
            }
            else {
                // TODO - if phase = DEPARTURE DON'T HOLD
                if (this.hasStatus(STATUS_ARRIVAL) && last_step.identifier != undefined && last_step.identifier != '') {
                    console.log('Plane.advance2NextStep: ' + this.callsign + ' - NO FURTHER INSTRUCTIONS - MAINTAIN HOLDING ON ' + last_step.identifier);
                    o_step = new Step();
                    o_step.type = 'HM';
                    o_step.identifier = last_step.identifier;
                    o_step.latitude = last_step.latitude;
                    o_step.longitude = last_step.longitude;
                    o_step.heading = this.heading;
                    o_step.leg_distance = 5;
                    o_step.turn_direction = 1;
                    o_step.speed_constraint = 1;
                    o_step.speed_1 = 250;
                    o_route.addLeg(o_step);
                    this.assignRoute(o_route);
                    this.setSpeed(250);
                    return;
                }
            }
        }
        // TODO RADIO - NEXT FIX?
        // continue present heading
        console.log('Plane.advance2NextStep: ' + this.callsign + ' - END OF ROUTE');
    }
}

Plane.prototype.clearRoute = function() {
    this.steps = [];
    this.o_route = undefined;
}

Plane.prototype.assignRandomRoute = function() {
    var route = Math.floor(Math.random() * routes.length);
    var o_route = routes[route];
    this.assignRoute(o_route);
}

Plane.prototype.assignRoute = function(o_route, runway) {
    this.o_route = o_route;
    if (o_route.type == 'SID') {
        this.arrival = false;
        this.departure = true;
        this.transit = false;
        // this.fl = 0;
        // this.climb = 3000;
        // this.fl_cleared = 5000;
    }
    else if (o_route.type == 'STAR') {
        this.arrival = true;
        this.departure = false;
        this.transit = false;
        if (runway != undefined) {
            // Route runway could be ALL ... store assigned runway
            this.runway = runway;
        }
    }
    else if (o_route.type == 'FINAL') {
        this.arrival = true;
        this.departure = false;
        this.transit = false;
        // this.fl = 6000;
        // this.climb = -300;
        this.setLevelCleared(0);
    }
    var way = o_route.tracks;
    var a_steps = o_route.getLegs();
    // OLD this.assignRouteByWaypoints(way);
    this.assignRouteBySteps(a_steps);
}


/*
Plane.prototype.assignFinalRoute = function(o_final_route) {
    if (o_final_route instanceof Route) {
        // Add final legs to route
        for (var fl=0; fl < o_final_route.getLegsNumber(); fl++) {
            o_step = o_final_route.getLeg(fl);
            this.o_route.addLeg(o_step);
        }
    }
    // TODO
}
*/

Plane.prototype.addLeg = function(o_step) {
    if (o_step != undefined) {
        var new_step = o_step.clone();
        this.steps[this.steps.length] = new_step;
    }
}


Plane.prototype.assignRouteBySteps = function(a_steps) {
    if (a_steps.length > 0) {
        this.steps = [];
        for (s = 0; s < a_steps.length; s++) {
            this.addLeg(a_steps[s]);
        }
        this.current_step = -1;
        if (this.latitude == 0 && this.longitude == 0 && this.steps.length > 0) {
            // Find first fix leg
            // ...
            var latitude = this.steps[0].latitude;
            var longitude = this.steps[0].longitude;
            // Move plane to opposite route to the fix
            // ...
            this.latitude = latitude;
            this.longitude = longitude;
        }
        if (this.fl > 0 && this.speed > 0) {
            this.advance2NextStep();
        }
    }
}

/*
Plane.prototype.assignRouteByWaypoints = function(a_wp) {
    if (a_wp.length > 0) {
        this.tracks = [];
        for (w = 0; w < a_wp.length; w++) {
            this.addTrack(a_wp[w].fix);
        }
        // this.fix_next = this.tracks[0].fix;
        this.fix_step = -1;
        // OLD
        // this.advanceRoute2NextFix();
    }
}
*/

/**
 * Show the assigned plane route on the screen
 */
Plane.prototype.showRoute = function() {
    if (this.steps.length > 0) {
        var v = 0;
        var vt = 0;
        var valid = false;
        this.videotracks = [];
        // console.log('show route ' + this.callsign);
        if (this.current_step <= 0) {
            this.videotracks[v] = new VideoTrack();
            this.videotracks[v].from_latitude = this.latitude;
            this.videotracks[v].from_longitude = this.longitude;
            valid = true;
        }

        this.o_strip.setMode(STRIP_SELECTED);
        for (var w = 0; w < (this.steps.length); w++) {
            var o_step = this.steps[w];
            if (o_step.identifier != undefined) {
                // Display step fix with label
                var o_fix = findWaypoint(o_step.identifier);
                if (o_fix != undefined) {
                    if (!o_fix.visible) {
                        // Show fix with label as temporary
                        o_fix.show(true, true);
                    }
                    o_fix.showLabel(true, true);
                }
            }
            if (o_step.latitude != 0 && o_step.longitude !=0) {
                if (!valid) {
                    this.videotracks[v] = new VideoTrack();
                    this.videotracks[v].from_latitude = o_step.latitude;
                    this.videotracks[v].from_longitude = o_step.longitude;
                    valid = true;
                }
                else {
                    this.videotracks[v].to_latitude = o_step.latitude;
                    this.videotracks[v].to_longitude = o_step.longitude;
                    this.videotracks[v].setScreenPosition();
                    mainContainer.addChild(this.videotracks[v].gDraw);
                    v++;
                    this.videotracks[v] = new VideoTrack();
                    this.videotracks[v].from_latitude = o_step.latitude;
                    this.videotracks[v].from_longitude = o_step.longitude;
                }
            }
        }
    }
}

Plane.prototype.hideRoute = function() {
    // console.log('Hide route ' + this.callsign);
    for (var v = 0; v < this.videotracks.length; v++) {
        mainContainer.removeChild(this.videotracks[v].gDraw);
    }
    this.videotracks = [];
    for (var w = 0; w < (this.steps.length); w++) {
        var o_step = this.steps[w];
        if (o_step.identifier != undefined) {
            // Hide fix with temporary visibility selected
            var o_fix = findWaypoint(o_step.identifier);
            if (o_fix != undefined) {
                // Hide fix only if visibility is temporary
                o_fix.show(false, true);
                o_fix.showLabel(false, true);
            }
        }
    }
    this.updateStripMode();
}

Plane.prototype.getRouteDescription = function() {
    var descr = '';
    if (this.o_route instanceof Route) {
        /*
        if (this.o_route.runway != '') {
            descr += this.o_route.runway + '-';
        }
        */
        descr += this.o_route.name + ':';
        var cs = this.current_step;
        if (cs <0) cs = 0;
        // descr += cs + ':';
        for (var s = cs; s < this.steps.length; s++) {
            var o_step = this.steps[s];
            if (o_step.identifier != undefined && o_step.identifier != '') {
                descr += o_step.identifier + '>';
            }
            else if (o_step.type == 'VA' || o_step.type == 'VM') {
                descr += o_step.heading + '>';

            }
            else if (o_step.type != '') {
                descr += o_step.type + '>';
            }
        }
    }
    return descr;
}


/***************************************
 * CONSTRAINTS
 **************************************/
Plane.prototype.checkAltitudeConstraint = function() {
    if (this.current_step == -1 || this.recurse == 1) {
        return;
    }
    this.recurse = 1;
    for (var s = this.current_step; s < this.steps.length; s++) {
        var o_step = this.steps[s];
        var estimate = -1;
        // latitude = o_step.latitude;
        // longitude = o_step.longitude;
        /*
        if (o_step_identifier == this.o_route.mapFix) {
            // Next step is MAP fix ...
            o_step.altitude_constraint = 1;
            o_step.altitude_1 = 0;

        }
        */

        var o_fix = findWaypoint(o_step.identifier);
        if (o_fix != undefined) {
            estimate = this.estimateToCoords(o_fix.latitude, o_fix.longitude);
            if (o_fix.isRunway) {
                // Set target altitude to zero
                o_step.altitude_constraint = 1;
                o_step.altitude_1 = 0;
            }
        }
        if (estimate != -1 && o_step.altitude_constraint != 0) {
            if (s == this.current_step && o_step.change_flight_phase == PHASE_FINAL && this.phase != PHASE_FINAL && this.phase != PHASE_MISSED_APPROACH) {
                // heading to a initial final approach fix
                this.setFlightPhase(PHASE_APPROACH);
                this.addStatus(STATUS_APPROACH);
            }
            this.checkFixAltitudeConstraint(o_step.altitude_constraint, o_step.altitude_1, o_step.altitude_2, estimate);
            this.recurse = 0;
            return;
        }
    }
    this.recurse = 0;
}

Plane.prototype.checkFixAltitudeConstraint = function(altitude_constraint, altitude_1, altitude_2, estimate) {
    // int 0=no alt const, 1= at alt1, 2=above alt1, 3= below alt1, 4=between alt1 and 2.
    var alt = this.fl;
    var alt_cleared = this.fl_cleared;
console.log(this.callsign + ' checkFixAltitudeConstraint: alt=' + alt + ' alt_cleared=' + alt_cleared + ' constraint=' + altitude_constraint + ' - ' + altitude_1 + ' - estimate = ' + estimate  + ' phase:' + this.phase);

    if (this.phase == PHASE_APPROACH || this.phase == PHASE_FINAL_APPROACH || this.phase == PHASE_FINAL) {
        // Automatically follow the altitude constraints
        if (altitude_constraint == 1) {
            if ( alt == altitude_1) {
                // At altitude 1
                this.climb = 0;
            }
            if (alt > altitude_1) {
                // Adjust descent rate to reach altitude on fix
                this.climb = -Math.floor((alt - altitude_1) / estimate);
            }
            this.setLevelCleared(altitude_1);
            console.log('Plane ' + this.callsign + ' new descent (F1) = ' + this.climb + ' to reach ' + altitude_1);
        }
        if (altitude_constraint == 2) {
            // Above altitude 1
            if (this.climb < 0 && alt > altitude_1 && alt >= alt_cleared) {
                // Descending ... adjust descent ratio
                this.climb = -Math.floor((alt - altitude_1) / estimate);
            }
            if (alt == altitude_1) {
                // At altitude 1
                this.climb = 0;
            }
            this.setLevelCleared(altitude_1);
            console.log('Plane ' + this.callsign + ' new descent (F2) = ' + this.climb);
        }
        if (altitude_constraint == 3) {
            // Below altitude 1
            if (alt <= altitude_1 && this.climb <= 0 && alt_cleared <= altitude_1) {
                // Ok
            }
            else {
                // Descending ... adjust descent ratio
                this.climb = -Math.floor((alt - altitude_1) / estimate);
            }
            console.log('Plane ' + this.callsign + ' new descent (F3) = ' + this.climb);
        }
        return;
    }
    if (altitude_constraint == 0) {
        if (this.o_route.type == 'SID') {
            // Continue climbing
            // this.climb = 1500;
            this.setLevelCleared(this.fl_final);
        }
        return;
    }
    if (altitude_constraint == 1) {
        // At altitude 1
        if ( alt  == altitude_1 && this.climb == 0) {
            // Already at requested altitude!
            return;
        }
        if ( alt_cleared == altitude_1 && this.climb != 0) {
            // Already cleared to requested altitude
            if (this.climb > 0 && alt < alt_cleared) {
                // Adjust climbing rate to reach altitude on fix
                this.climb = Math.floor((alt_cleared - alt) / estimate);
            }
            else if (this.climb < 0 && alt > alt_cleared) {
                // Adjust descend rate to reach altitude on fix
                this.climb = Math.floor((alt - alt_cleared) / estimate);
            }
            console.log('Plane ' + this.callsign + ' new climb(1) = ' + this.climb);
        }
        else if (alt < altitude_1 && this.climb > 0) {
            // Adjust climbing rate to reach altitude on fix
            this.climb = Math.floor((altitude_1 - alt) / estimate);
            // TODO Check max Ratio
            console.log('Plane ' + this.callsign + ' new climb(3) = ' + this.climb + ' to reach ' + altitude_1);
        }
        else if (alt > altitude_1 && (this.climb < 0)) {
            // Adjust descent rate to reach altitude on fix
            this.climb = -Math.floor((alt - altitude_1) / estimate);
            // TODO Check max Ratio
            console.log('Plane ' + this.callsign + ' new descent(4) = ' + this.climb + ' to reach ' + altitude_1);
        }
        else {
            // Request clearence
            // TODO
            console.log('Plane ' + this.callsign + ' Request climb/descent to fix altitude ' + altitude_1);
        }
    }
    if (altitude_constraint == 2) {
        // Above altitude 1
        if (this.climb >= 0 && alt >= altitude_1) {
            // Climbing, and already above requested altitude!
            return;
        }
        if ( alt < altitude_1 && alt_cleared >= altitude_1 && this.climb > 0) {
            // Already cleared to requested altitude
            if (this.climb > 0 && alt < alt_cleared) {
                // Adjust climbing rate to reach altitude on fix
                if ((alt + (this.climb * estimate)) >= altitude_1) {
                    // Climb ratio is ok
                    return
                }
                // Increase climb ratio
                this.climb = Math.floor((altitude_1 - alt) / estimate);
                // TODO CHECK MAX RATIO
            }
            else if (this.climb < 0 && alt > alt_cleared) {
                // Adjust descend rate to reach altitude on fix
                this.climb = Math.floor((alt - altitude_1) / estimate);
            }
            console.log('Plane ' + this.callsign + ' new climb (2) = ' + this.climb);
        }
        else {
            if (this.o_route.type == 'SID') {
                // Follow departure route
                // this.climb = 1500;
                // this.fl_cleared = altitude_1;
                console.log('Plane ' + this.callsign + ' continue climbing to ' + altitude_1);
            }
            else if (this.o_route.type == 'STAR') {
                if ((this.climb < 0) && alt > altitude_1 && alt >= alt_cleared) {
                    // Descending ... adjust descent ratio
                    this.climb = -Math.floor((alt - alt_cleared) / estimate);
                    console.log('Plane ' + this.callsign + ' new climb ratio (3) = ' + this.climb);
                }
            }
            else {
                // Request clearence
                // TODO
                console.log('Plane ' + this.callsign + ' Request climb/descent to fix altitude ' + altitude_1);
            }
        }
    }
    if (altitude_constraint == 3) {
        // Below altitude 1
        if ( alt <= altitude_1 && this.climb <= 0) {
            // Already below requested altitude!
            return;
        }
        if ( alt > altitude_1 && alt_cleared <= altitude_1 && (this.climb < 0)) {
            // Already cleared to descend to requested altitude
            if (this.climb < 0 && alt > alt_cleared) {
                // Adjust climbing rate to cross altitude on fix
                if ((alt - (this.climb * estimate)) <= altitude_1) {
                    // Descend ratio is ok
                    return
                }
                // Increase descend ratio
                this.climb = Math.floor((alt - altitude_1) / estimate);
                // TODO CHECK MAX RATIO
            }
            else if (this.climb > 0 && alt < alt_cleared) {
                // Adjust climb rate to cross fix below altitude
                this.climb = Math.floor((altitude_1 - alt) / estimate);
            }
            console.log('Plane ' + this.callsign + ' new ratio = ' + this.climb);
        }
        else {
            // Request clearence
            // TODO
            console.log('Plane ' + this.callsign + ' Request climb/descent to fix altitude ' + altitude_1);
        }
    }
    if (altitude_constraint == 4) {
        // Between altitude 1 and altitude 2
        // TODO
    }
}

Plane.prototype.checkSpeedConstraint = function() {
    // TODO
}


Plane.prototype.estimateToAltitude = function(altitude) {
    var estimate = 0;
    var alt = this.fl;
    var alt_cleared = this.fl_cleared;
    if (alt <= altitude && this.climb > 0) {
        estimate = (altitude - alt) / this.climb;
    }
    if (alt >= altitude && this.climb < 0) {
        estimate = (alt - altitude) / this.climb;
    }
    console.log('Estimate to reach ' + altitude + ' : ' + estimate);
    return estimate;
}



/*****************************************
 * GRAPHIC FUNCTIONS
 ****************************************/
Plane.prototype.getTail = function() {

    // console.log(this.callsign + ' heading = ' + this.heading);
    this.gBox.graphics.clear();
    this.gTail.graphics.clear();
    if (this.latitude == 0 || this.longitude == 0 || this.speed == 0) {
        return;
    }
    if (this.phase == PHASE_WAIT_TAKEOFF && this.fl == 0) {
        // Don't show data for planes on the ground
        return;
    }
    if (this.phase == PHASE_LANDED) {
        // Don't show data for planes on the ground
        return;
    }
    var latlon = Math.coordsFromCoarseDistance(this.latitude, this.longitude, Math.inverseBearing(this.heading), (this.speed / 3600) * 60);
    // var latlon = Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, (this.speed / 3600) * 60);

    var coords = Math.coordsToScreen( latlon.lat, latlon.lon);

    var shiftX = this.x - coords.x;
    var shiftY = this.y - coords.y;

    // Draw tail
    var planeColor;
    switch (this.atc_phase) {
        case (PLANE_ATC_OUT):
            planeColor = STRIP_COLOR_OUT;
            break;
        case PLANE_ATC_ARRIVAL_WARNING:
        case PLANE_ATC_DEPARTURE_WARNING:
            planeColor = STRIP_COLOR_WARNING;
            break;
        case PLANE_ATC_ARRIVAL_RELEASE:
        case PLANE_ATC_DEPARTURE_RELEASE:
            planeColor = STRIP_COLOR_RELEASE;
            break;
        default:
            planeColor = PLANE_TAIL_COLOR;
            break;
    }
    this.gBox.graphics.setStrokeStyle(1).beginStroke(planeColor).dr(0,0,6,6);
    this.gTail.graphics.beginStroke(planeColor).moveTo(3, 3).lineTo(shiftX, shiftY).endStroke();
}

Plane.prototype.getConnectorPosition = function() {
    // console.log(this.connectorDeg);
    if (this.connectorDeg == 45) {
        this.gLabel.x = 50;
        this.gLabel.y = -50;
        this.gLabelConnector.graphics.clear();
        this.gLabelConnector.graphics.beginStroke(PLANE_CONNECTOR_COLOR).moveTo(5, -5).lineTo(45, -37).lineTo(165, -37).endStroke();
    }
    if (this.connectorDeg == 135) {
        this.gLabel.x = 40;
        this.gLabel.y = 40;
        this.gLabelConnector.graphics.clear();
        this.gLabelConnector.graphics.beginStroke(PLANE_CONNECTOR_COLOR).moveTo(5, 5).lineTo(40, 53).lineTo(165, 53).endStroke();
    }
    if (this.connectorDeg == 225) {
        this.gLabel.x = -155;
        this.gLabel.y = 30;
        this.gLabelConnector.graphics.clear();
        this.gLabelConnector.graphics.beginStroke(PLANE_CONNECTOR_COLOR).moveTo(-5, 5).lineTo(-35, 43).lineTo(-155, 43).endStroke();
    }
    if (this.connectorDeg == 315) {
        this.gLabel.x = -160;
        this.gLabel.y = -55;
        this.gLabelConnector.graphics.clear();
        this.gLabelConnector.graphics.beginStroke(PLANE_CONNECTOR_COLOR).moveTo(-5, -5).lineTo(-35, -43).lineTo(-155, -43).endStroke();
    }
}

Plane.prototype.getDisplayData = function( scale ) {

    if (this.phase == PHASE_WAIT_TAKEOFF && this.fl == 0) {
        // Don't show data for planes on the ground
        return;
    }
    if (this.phase == PHASE_LANDED && this.speed == 0) {
        // Don't show data for planes on the ground
        return;
    }

    scale = scale + 0.4;
    var callsign;
    if (this.hasStatus(STATUS_IDENT)) {
        callsign = '' + this.callsign;
    }
    else {
        callsign = '' + this.squack;
    }
    var aircraft = '' + this.aircraft;
    var speed = '' + Math.floor(this.speed);
    if (speed.length == 0) {
        speed = '0';
    }
    var heading = '' + Math.floor(this.heading);
    callsign  = callsign + Array(6 - callsign.length).join(' ');
    aircraft  = Array(7 - aircraft.length).join(' ') + aircraft;
    speed  = Array(5 - speed.length).join(' ') + speed;
    heading  = Array(5 - heading.length).join(' ') + heading;
    var level = '' + Math.floor(this.fl / 100);
    if (this.hasStatus(STATUS_IDENT)) {
        if (this.fl_cleared != undefined && Math.floor(this.fl_cleared / 100) != Math.floor(this.fl / 100)) {
            if (Math.floor(this.climb) > 0) {
                level = level + "\u2191" + Math.floor(this.fl_cleared / 100);
            } else if (Math.floor(this.climb) < 0) {
                level = level + "\u2193" + Math.floor(this.fl_cleared / 100)
            }
        }
    }
    level = level + Array(8 - level.length).join(' ');

    this.getConnectorPosition();
    if (!this.hasStatus(STATUS_IDENT)) {
        this.gLabel.text = callsign + '\n' + level;
    }
    else {
        this.gLabel.text = callsign + aircraft + '\n' + level + speed + heading + '\n'; // + 'C' + Math.round2(this.coarse) + ' - D' + Math.round2(this.distance) + '\nLAT' + Math.round2(this.latitude) + ' - ' + Math.round2(this.longitude); //  + '\nX:' + Math.round2(this.x) + '-Y:' + Math.round2(this.y);
    }

    for(var p=0; p < planes.length; p++) {

        var rectangle1 = this.gLabel.getBounds();
        var point1a = this.gLabel.localToGlobal(rectangle1.x, rectangle1.y);
        var point1b = this.gLabel.localToGlobal(rectangle1.x + rectangle1.width, rectangle1.y + rectangle1.height);
        var x1a = point1a.x;
        var y1a = point1a.y;
        var x1b = point1b.x;
        var y1b = point1b.y;

        var overlap = false;
        if (planes[p].callsign != this.callsign) {
            var x_overlap = false;
            var y_overlap = false;
            var rectangle2 = planes[p].gLabel.getBounds();
            var point2a = planes[p].gLabel.localToGlobal(rectangle2.x, rectangle2.y);
            var point2b = planes[p].gLabel.localToGlobal(rectangle2.x + rectangle2.width, rectangle2.y + rectangle2.height);
            var x2a = point2a.x;
            var y2a = point2a.y;
            var x2b = point2b.x;
            var y2b = point2b.y;

            // console.log(x1a,y1a,x1b,y1b,'-',x2a,y2a,x2b,y2b);
            // Check X overlap

            //  x1a------------------------- x1b
            //         x2a--------------------------- x2b
            if (x1a <= x2a && x1b > x2a && x1b <= x2b) x_overlap = true;

            //  x2a------------------------- x2b
            //         x1a--------------------------- x1b
            if (x2a <= x1a && x2b > x1a && x2b <= x1b) x_overlap = true;

            //  x1a------------------------- x1b
            //         x2a-----------x2b
            if (x1a <= x2a && x1b>= x2b) x_overlap = true;

            //  x2a------------------------- x2b
            //         x1a-----------x1b
            if (x2a <= x1a && x2b >= x1b) x_overlap = true;

            // Check Y overlap

            //  y1a------------------------- y1b
            //         y2a--------------------------- y2b
            if (y1a <= y2a && y1b > y2a && y1b <= y2b) y_overlap = true;

            //  y2a------------------------- y2b
            //         y1a--------------------------- y1b
            if (y2a <= y1a && y2b > y1a && y2b <= y1b) y_overlap = true;

            //  y1a------------------------- y1b
            //         y2a-----------y2b
            if (y1a <= y2a && y1b>= y2b) y_overlap = true;

            //  y2a------------------------- y2b
            //         y1a-----------y1b
            if (y2a <= y1a && y2b >= y1b) y_overlap = true;

            //
            // console.log('x overlap = ' + x_overlap + ' - y overlap = ' + y_overlap);
            if (x_overlap && y_overlap) {
                overlap = true;
                // Try to move plane label to another position
                this.connectorDeg = (this.connectorDeg + 90) % 360;
                // this.getConnectorPosition();
                // break;
            }
            else {
                // this.connectorDeg = 45;
                // this.getConnectorPosition();
            }
        }
    }

    this.gBox.scaleX= scale;
    this.gBox.scaleY= scale;

    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;

    this.getConnectorPosition();

}

/*****************************
 * STRIP FUNCTIONS
 ****************************/
Plane.prototype.getStrip = function() {
    return this.o_strip;
}

Plane.prototype.updateStrip = function() {
    if (this.o_strip != undefined) {
        var route_description = this.getRouteDescription();
        var runway = this.runway;
        if (runway == undefined && this.o_route && this.o_route.runway != '') {
            runway = this.o_route.runway;
        }
        if (runway == undefined) {
            runway = '';
        }
        this.o_strip.updateStrip(this.stripPosition, route_description, this.speed, this.fl, this.fl_cleared, this.fl_initial, this.fl_final, this.airp_dep, this.airp_dest, runway, this.squack, this.squack_assigned, this.status, this.slot);
    }
}

Plane.prototype.setStripPosition = function(type, position) {
    this.stripType = type;
    this.stripPosition = position;
    this.o_strip.type = type;
    this.o_strip.position = position;
    this.o_strip.o_plane = this;
}

Plane.prototype.getStripPosition = function() {
    return this.stripPosition;
}

Plane.prototype.setAtcPhase = function(phase) {
    this.atc_phase = phase;
    this.updateStripMode();
}

Plane.prototype.updateStripMode = function() {
    var o_strip = this.getStrip();
    switch (this.atc_phase) {
        case PLANE_ATC_OUT:
            o_strip.setMode(STRIP_OUT);
            break;
        case PLANE_ATC_ARRIVAL_WARNING:
        case PLANE_ATC_DEPARTURE_WARNING:
            o_strip.setMode(STRIP_WARNING);
            break;
        case PLANE_ATC_ARRIVAL_RELEASE:
        case PLANE_ATC_DEPARTURE_RELEASE:
            o_strip.setMode(STRIP_RELEASE);
            break;
        case PLANE_ATC_ACTIVE:
            o_strip.setMode(STRIP_ACTIVE);
            break;
    }
}


/* General date & functions */

function planeDestroy(o_plane) {
    o_plane.destroy();
    for(p=0; p<planes.length; p++) {
        if (planes[p].callsign == o_plane.callsign) {
            planes.splice(p,1);
            break;
        }
    }
}
