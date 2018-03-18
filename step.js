/* The step object, representing a navigation point */
function Step() {
    /*
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
    */

    // General step data
    this.type = '';
    this.identifier = '';
    this.latitude = 0;
    this.longitude = 0;
    this.turn_direction = 0;
    this.navaid_id = '';
    this.track_bearing = -1;
    this.track_distance = -1;
    this.heading = -1;
    this.distance = -1;
    this.altitude_constraint = 0;
    this.altitude_1 = -1;
    this.altitude_2 = -1;
    this.speed_constraint = -1;
    this.speed_1 = -1;
    this.speed_2 = -1;
    this.special_track = -1;
    this.overfly = -1;
    this.req_nav_pref = -1;
    this.inbound = undefined;   // used in FD steps to intercept radials
    this.leg_distance = undefined;  // used in HM (holding patterns)

    this.change_flight_phase = '';  // Next phase of flight when step is reaceh

    // Step position
    this.x = 0;
    this.y = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Graphic object
    this.gDraw = new createjs.Container();
    this.gLabel = new createjs.Text("", "normal 8px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 9;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.gDraw.addChild(this.gBox, this.gLabel);
}

Step.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Step.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Step.prototype.setScreenPosition = function() {
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);
}

Step.prototype.clone = function() {
    var n = new Step();
    n.type = this.type;
    n.identifier = this.identifier;
    n.latitude = this.latitude;
    n.longitude = this.longitude;
    n.turn_direction = this.turn_direction;
    n.navaid_id = this.navaid_id;
    n.track_bearing = this.track_bearing;
    n.track_distance = this.track_distance;
    n.heading = this.heading;
    n.distance = this.distance;
    n.altitude_constraint = this.altitude_constraint;
    n.altitude_1 = this.altitude_1;
    n.altitude_2 = this.altitude_2;
    n.speed_constraint = this.speed_constraint;
    n.speed_1 = this.speed_1;
    n.speed_2 = this.speed_2;
    n.special_track = this.special_track;
    n.overfly = this.overfly;
    n.req_nav_pref = this.req_nav_pref;
    n.x = this.x;
    n.y = this.y;
    n.zoom_min = this.zoom_min;
    n.zoom_max = this.zoom_max;
    n.change_flight_phase = this.change_flight_phase;
    n.inbound = this.inbound;
    n.leg_distance = this.leg_distance;
    return n;
}
