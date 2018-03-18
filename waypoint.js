var waypoints = [];
var waypointsById = [];


function Waypoint() {

    // Identification
    this.type = 'FIX';
    this.label = '';
    this.latitude = 0;
    this.longitude = 0;
    this.fix = -1;
    this.visible = true;

    // Graphic objects
    // Graphic object
    this.gDraw = new createjs.Container();
    this.gLabel = new createjs.Text("", "normal 10px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 10;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.gDraw.addChild(this.gBox, this.gLabel);
}

Waypoint.prototype.getDisplayData = function( scale ) {
    scale = scale + 0.4;

    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;

    this.gBox.scaleX = scale / 1.5;
    this.gBox.scaleY = scale / 1.5;

    this.setScreenPosition(scale);
}

Waypoint.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Waypoint.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Waypoint.prototype.setFix = function (f) {
    this.fix = f;
    this.latitude = fixes[f].latitude;
    this.longitude = fixes[f].longitude;
}

Waypoint.prototype.setScreenPosition = function(scale) {
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    if (this.type == 'FIX') {
        this.gLabel.x = 10 * scale;
        this.gLabel.y = -10 * scale;
    }
    else {
        this.gLabel.x = -30 * scale;
        this.gLabel.y = 10 * scale;
    }
    this.setY(coords.y);
    this.setX(coords.x);
}

Waypoint.prototype.setLabel = function(label) {
    this.label = label;
    for(var c=0; c<label.length; c++) {
        if (parseInt(label.substr(c,1)) > 0) {
            this.type = 'WP';
            return;
        }
    }
    this.type = 'FIX';
}

Waypoint.prototype.show = function(visible) {
    this.visible = visible;
    this.gDraw.visible = visible;
}

Waypoint.prototype.showLabel = function(visible) {
    this.gLabel.visible = visible;
}

function addWaypoint(name, label, latitude, longitude) {
    var o_wp = new Waypoint();
    o_wp.name = name.toUpperCase();
    o_wp.setLabel(o_wp.name);
    o_wp.gLabel.text = o_wp.name;
    o_wp.latitude = latitude;
    o_wp.longitude = longitude;
    o_wp.setScreenPosition(1);
    if (o_wp.type == 'FIX') {
        o_wp.show(true);
    }
    else {
        o_wp.show(false);
    }
    var c = waypoints.length;
    waypoints[c] = o_wp;
    waypointsById[name] = c;
    return o_wp;
}

function updateWaypoints() {
    for (w=0; w < waypoints.length; w++) {
        waypoints[w].getDisplayData(currentScale);
    }
}

function findWaypoint(identifier, latitude, longitude) {
    if ((c = waypointsById[identifier]) != undefined) {
        if (latitude != undefined && longitude != undefined) {
            if (latitude == waypoints[c].latitude && longitude == waypoints[c].longitude) {
                return waypoints[c];
            }
        }
        else {
            return waypoints[c];
        }
    }
    /*
    for (w=0; w < waypoints.length; w++) {
        if (identifier.toUpperCase() == waypoints[w].label) {
            if (latitude != undefined && longitude != undefined) {
                if (latitude == waypoints[w].latitude && longitude == waypoints[w].longitude) {
                    return waypoints[w];
                }
            }
            else {
                return waypoints[w];
            }
        }
    }
    */
    return undefined;
}
