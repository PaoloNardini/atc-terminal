import * as constants from '../../../src/core/constants'
import { Parameters, Plane } from '../../../src/core/entities'
import * as geomath from '../../../src/helpers/geomath'
// import { LatLon } from '../../../src/helpers/latlon'

export class PlaneGraphic extends createjs.Container {

    plane: Plane
    // latitude: number = 0
    // longitude: number = 0

    gBox: createjs.Shape
    gTail: createjs.Shape
    gLabel: createjs.Text
    gLabelConnector: createjs.Shape

    // Graphic data
    // x: number = (Math.random() * 1000);
    // y: number = (Math.random() * 500);
    connectorX: number = 25;
    connectorY: number = -5;
    connectorDeg: number = 45;     // Degrees of label connector

    lastTimer: number = 0           // Last update timer

    constructor(plane: Plane) {
        super()
        this.plane = plane
        this.gBox = new createjs.Shape()
        this.gTail = new createjs.Shape()
        this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.PLANE_BODY_COLOR).dr(0,0,6,6);
        this.gLabel = new createjs.Text("TEST", "normal 10px Courier", constants.PLANE_TEXT_COLOR)
        this.gLabelConnector = new createjs.Shape()
        super.addChild(this.gBox, this.gTail, this.gLabel, this.gLabelConnector);
    }

    setPosition(parameters: Parameters) {
        var coords = geomath.coordsToScreen(this.plane.latitude, this.plane.longitude, parameters)
        console.log(`[setPosition] lat: ${this.plane.latitude} lon: ${this.plane.longitude} y:${coords.y} x:${coords.x} scale: ${this.scaleY}/${this.scaleX}`)
        this.x = coords.x
        this.y = coords.y
    }
    
    move(parameters: Parameters) {
        var tmp;
        if (this.lastTimer == 0) {
            this.lastTimer = parameters.mainTimer
        }
        var elapsed = parameters.mainTimer - this.lastTimer
        if (elapsed > 1000) {
            console.log(elapsed + ' - ' + this.plane.latitude + ' - ' + this.plane.longitude);
        }
    
        // TEST
        /*
        if (this.callsign == planes[0].callsign) {
            this.holdingPattern('TAQ', 280, 5, 1);
        }
        */
    
        if (this.plane.fl == 0 && this.plane.speed == 0) {
            // Plane on the ground
            return;
        }
        this.lastTimer = parameters.mainTimer

        if (this.plane.turn != 0) {
            // Compute new heading
            // console.log('Turn hdg ' + this.heading + ' > ' + this.heading_target + ' turn = ' + this.turn);
            if (Math.abs(this.plane.heading - this.plane.heading_target) < Math.abs(this.plane.turn * elapsed)) {
                // Reached assigned heading
                this.plane.turn = 0;
                this.plane.heading = this.plane.heading_target;
            }
            tmp = this.plane.heading;
            if (this.plane.turn != 0) {
                tmp = tmp + this.plane.turn * elapsed;
            }
            if (tmp < 0) {
                tmp = 360 + tmp;
            } else if (tmp >= 360) {
                tmp = tmp - 360;
            }
            this.plane.heading = tmp;
        }
        if (this.plane.heading < 180) {
            this.connectorDeg = 225;
        }
        else {
            this.connectorDeg = 45;
        }
    
        this.plane.speed = 0 + this.plane.speed;
        this.plane.speed_target = 0 + this.plane.speed_target;
    
        if (this.plane.speed_target > 0) {
            if (this.plane.speed_target > this.plane.speed) {
                // Increase speed
                if (false /* this.hasStatus(STATUS_TAKEOFF) */) {
                    this.plane.speed = Math.floor(this.plane.speed + (elapsed * 5));
                }
                else {
                    this.plane.speed = Math.floor(this.plane.speed + (elapsed * 1.5));
                }
                if (this.plane.speed < 140 /* && !this.hasStatus(STATUS_LANDED) */) {
                    this.plane.speed = 140;
                    this.plane.speed_target = 140;
                }
            }
            if (this.plane.speed_target < this.plane.speed) {
                // Decrease speed
                if (false /* this.hasStatus(STATUS_LANDED) */) {
                    //Brakes!!
                    this.plane.speed = Math.floor(this.plane.speed - (elapsed * 10));
                }
                else {
                    this.plane.speed = Math.floor(this.plane.speed - (elapsed * 2));
                }
            }
            if (Math.abs(this.plane.speed_target - this.plane.speed) < 5) {
                this.plane.speed = this.plane.speed_target;
            }
        }
    
        var latlon = geomath.coordsFromCoarseDistance(this.plane.latitude, this.plane.longitude, this.plane.heading, (this.plane.speed / 3600) * elapsed);
        this.plane.latitude = latlon.lat;
        this.plane.longitude = latlon.lon;
    
        console.log(this.plane.completeCallsign + ' new position - ' + this.plane.latitude + ' - ' + this.plane.longitude);

        this.setPosition(parameters);
    
        /* TODO
        if (this.hasStatus(STATUS_TAKEOFF)) {
            if (this.climb == 0 && this.speed >= 140) {
                // V1 Rotation and take off
                this.climb = 3500;
                console.log('(move 10) Plane ' + this.completeCallsign + ' V1 rotation ... climb at ' + this.climb + ' ft/min');
            }
        }
        */
    
        // Compute new FL
        var ratio = (this.plane.climb * elapsed / 60 );
        if (ratio != 0) {
            if (Math.abs(this.plane.fl - this.plane.fl_cleared) < Math.abs(ratio)) {
                console.log('Plane ' + this.plane.completeCallsign + ' Level ' + this.plane.fl + ' > ' + this.plane.fl_cleared + ' ratio = ' + ratio);
                // Reached assigned altitude
                this.plane.climb = 0;
                this.plane.fl = this.plane.fl_cleared;
                console.log('(move 11) Plane ' + this.plane.completeCallsign + ' reached assigned altitude ' + this.plane.fl_cleared + ' : new ratio = 0');
            }
            else {
                if (this.plane.fl < this.plane.fl_cleared && ratio <= 0) {
                    this.setLevel(this.plane.fl_cleared);
                }
                else if (this.plane.fl > this.plane.fl_cleared && ratio >= 0) {
                    this.setLevel(this.plane.fl_cleared);
                }
                else {
                    this.plane.fl = this.plane.fl + ratio;
                }
            }
        }
    
        /* 
        // TODO
        var newCoords = new LatLon(this.plane.latitude, this.plane.longitude);
        if (this.plane.fix_next != -1) {
            var nextFixCoords = new LatLon(waypoints[this.fix_next].latitude, waypoints[this.fix_next].longitude);
        }
        else {
            var nextFixCoords = new LatLon(LATITUDE_CENTER, LONGITUDE_CENTER);
        }
    
        this.coarse = newCoords.bearingTo(nextFixCoords);
        this.distance = Math.metersToMiles(newCoords.distanceTo(nextFixCoords));
        */
    
        /*
        // CHECK FLIGHT PHASE
        // TODO
        if (this.hasStatus(STATUS_TAKEOFF)) {
            if (this.fl > 0) {
                this.removeStatus(STATUS_GROUND);
            }
            if (this.climb > 0 && this.fl > 2000) {
                this.removeStatus(STATUS_TAKEOFF);
                this.addStatus(STATUS_CLIMB_INITIAL);
            }
        }
        else if (this.hasStatus(STATUS_CLIMB_INITIAL)) {
            if (this.climb > 0 && this.fl > 10000) {
                this.removeStatus(STATUS_CLIMB_INITIAL);
                this.addStatus(STATUS_CLIMBING);
            }
        }
        else if (this.hasStatus(STATUS_CLIMBING) && !this.hasStatus(STATUS_CRUISE)) {
            if (this.climb > 0 && this.fl > 20000) {
                this.removeStatus(STATUS_CLIMB_INITIAL);
                this.addStatus(STATUS_CRUISE);
            }
        }
    
        // Check for any route to follow
        this.followRoute();
        */
    }

    setLevel(level: number) {
        // ?? this.setLevelCleared(level);
        if (this.plane.fl > this.plane.fl_cleared) {
            // Descend
            if (false /* this.hasStatus(STATUS_CRUISE) */) {
                // Distance from destination?
                /*
                if (this.plane.airp_dest != '') {
                    var o_airport = findAirport(this.airp_dest);
                    if (o_airport instanceof Airport) {
                        var coords = new LatLon(this.latitude, this.longitude);
                        var dest_coords = new LatLon(o_airport.latitude, o_airport.longitude);
                        var distance = Math.metersToMiles(coords.distanceTo(dest_coords));
                        console.log('Distance to destination' + this.airp_dest + ' : ' + distance + ' miles');
                        if (distance < 75) {
                            this.addStatus(STATUS_DESCENDING);
                            this.checkAltitudeConstraint();
                            this.setAutoSpeed();
                        }
                        else {
                            this.climb = PLANE_DESCENT_RATIO;
                        }
                        console.log('setLevel (1) ' + level + ' New climb = ' + this.climb);
                        return;
                    }
                }
                */
            }
            else {
                this.plane.climb = constants.PLANE_DESCENT_RATIO
            }
        }
        if (true /* this.hasStatus(STATUS_CRUISE) */) {
            if (this.plane.climb >= 0 && this.plane.fl > this.plane.fl_cleared) {
                this.plane.climb = constants.PLANE_DESCENT_RATIO
            }
            else if (this.plane.climb <= 0 && this.plane.fl < this.plane.fl_cleared) {
                this.plane.climb = constants.PLANE_CLIMB_RATIO;
            }
        }
        else {
            if (this.plane.fl < this.plane.fl_cleared && this.plane.climb > 0) {
                // Continue climbing / descending accordingly to phase flight
            }
            if (this.plane.fl < this.plane.fl_cleared && this.plane.climb <= 0) {
                this.plane.climb = constants.PLANE_CLIMB_RATIO;
            }
    
        }
        console.log('setLevel(2)' + level + ' New climb = ' + this.plane.climb);
    }
    
    setSpeed(speed: number) {
        this.plane.speed_target = speed;
        // TODO this.checkAltitudeConstraint();
    }

    /*****************************************
     * GRAPHIC FUNCTIONS
     ****************************************/
    getTail(parameters: Parameters) {

        // console.log(this.completeCallsign + ' heading = ' + this.heading);
        this.gBox.graphics.clear();
        this.gTail.graphics.clear();
        if (this.plane.latitude == 0 || this.plane.longitude == 0 || this.plane.speed == 0) {
            return;
        }
        /*
        // TODO
        if (this.hasStatus(STATUS_WAIT_TAKEOFF) && this.fl == 0) {
            // Don't show data for planes on the ground
            return;
        }
        if (this.hasStatus(STATUS_LANDED)) {
            // Don't show data for planes on the ground
            return;
        }
        */
        const inverse = geomath.inverseBearing(this.plane.heading)
        console.log(`[getTail] ${this.plane.completeCallsign} - heading: ${this.plane.heading} / ${inverse} - speed: ${this.plane.speed}`)
        var tailLatlon = geomath.coordsFromCoarseDistance(this.plane.latitude, this.plane.longitude, inverse, (this.plane.speed / 3600) * 60);
        // var latlon = Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, (this.speed / 3600) * 60);

        var coords = geomath.coordsToScreen( tailLatlon.lat, tailLatlon.lon, parameters);

        var shiftX = this.x - coords.x;
        var shiftY = this.y - coords.y;

        // Draw tail
        var planeColor = constants.PLANE_TAIL_COLOR
        /*
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
        */
        this.gBox.graphics.setStrokeStyle(1).beginStroke(planeColor).dr(0,0,6,6);
        this.gTail.graphics.beginStroke(planeColor).moveTo(3, 3).lineTo(shiftX, shiftY).endStroke();
    }

    getConnectorPosition() {
        // console.log(this.connectorDeg);
        if (this.connectorDeg == 45) {
            this.gLabel.x = 50;
            this.gLabel.y = -50;
            this.gLabelConnector.graphics.clear();
            this.gLabelConnector.graphics.beginStroke(constants.PLANE_CONNECTOR_COLOR).moveTo(5, -5).lineTo(45, -37).lineTo(165, -37).endStroke();
        }
        if (this.connectorDeg == 135) {
            this.gLabel.x = 40;
            this.gLabel.y = 40;
            this.gLabelConnector.graphics.clear();
            this.gLabelConnector.graphics.beginStroke(constants.PLANE_CONNECTOR_COLOR).moveTo(5, 5).lineTo(40, 53).lineTo(165, 53).endStroke();
        }
        if (this.connectorDeg == 225) {
            this.gLabel.x = -155;
            this.gLabel.y = 30;
            this.gLabelConnector.graphics.clear();
            this.gLabelConnector.graphics.beginStroke(constants.PLANE_CONNECTOR_COLOR).moveTo(-5, 5).lineTo(-35, 43).lineTo(-155, 43).endStroke();
        }
        if (this.connectorDeg == 315) {
            this.gLabel.x = -160;
            this.gLabel.y = -55;
            this.gLabelConnector.graphics.clear();
            this.gLabelConnector.graphics.beginStroke(constants.PLANE_CONNECTOR_COLOR).moveTo(-5, -5).lineTo(-35, -43).lineTo(-155, -43).endStroke();
        }
    }

    getDisplayData( scale: number ) {

        /*
        // TODO
        if (this.hasStatus(STATUS_GROUND) && this.fl == 0) {
            // Don't show data for planes on the ground
            return;
        }
        */

        /*
        if (this.hasStatus(STATUS_WAIT_TAKEOFF) && this.fl == 0) {
            // Don't show data for planes on the ground
            return;
        }
        if (this.hasStatus(STATUS_LANDED) && this.speed == 0) {
            // Don't show data for planes on the ground
            return;
        }
        */

        scale = scale + 0.4;
        var callsign;
        if (true /* this.hasStatus(STATUS_IDENT) */) {
            callsign = `${this.plane.completeCallsign}`
        }
        else {
            callsign = `${this.plane.squack}`
        }
        var aircraft = `${this.plane.aircraft}`;
        var speed = `${Math.floor(this.plane.speed)}`
        var heading = `${Math.floor(this.plane.heading)}`;
        callsign  = callsign + Array(8 - callsign.length).join(' ');
        aircraft  = Array(7 - aircraft.length).join(' ') + aircraft;
        speed  = Array(5 - speed.length).join(' ') + speed;
        heading  = Array(5 - heading.length).join(' ') + heading;
        var level = `${Math.floor(this.plane.fl / 100)}`
        if (true /*this.hasStatus(STATUS_IDENT)*/) {
            if (this.plane.fl_cleared != undefined && Math.floor(this.plane.fl_cleared / 100) != Math.floor(this.plane.fl / 100)) {
                if (Math.floor(this.plane.climb) > 0) {
                    level = level + "\u2191" + Math.floor(this.plane.fl_cleared / 100);
                } else if (Math.floor(this.plane.climb) < 0) {
                    level = level + "\u2193" + Math.floor(this.plane.fl_cleared / 100)
                }
            }
        }
        level = level + Array(8 - level.length).join(' ');

        this.getConnectorPosition();
        if (false /* !this.hasStatus(STATUS_IDENT) */) {
            this.gLabel.text = callsign + '\n' + level;
        }
        else {
            this.gLabel.text = callsign + aircraft + '\n' + level + speed + heading + '\n'; // + 'C' + Math.round2(this.coarse) + ' - D' + Math.round2(this.distance) + '\nLAT' + Math.round2(this.latitude) + ' - ' + Math.round2(this.longitude); //  + '\nX:' + Math.round2(this.x) + '-Y:' + Math.round2(this.y);
        }

        /*
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
        */

        this.gBox.scaleX= scale;
        this.gBox.scaleY= scale;

        this.gLabel.scaleX = scale;
        this.gLabel.scaleY = scale;

        this.getConnectorPosition();
    }

    
}
// createjs.extend(Plane, createjs.Container);
// createjs.promote(Plane, "Container");

