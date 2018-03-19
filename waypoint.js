var waypoints = [];
var waypointsById = [];

function Waypoint() {

    this.Container_constructor();

    // Identification
    this.type = 'FIX';
    this.label = '';
    this.latitude = 0;
    this.longitude = 0;
    this.fix = -1;
    this.visible = false;
    this.labelVisible = false;
    this.visibleTemp = false;
    this.labelVisibleTemp = false;

    // The same coordinate point could be more than one type of fix
    this.isNavaid = false;      // A radio-navigation aid (vor/dme/ndb/ils)
    this.isFix = false;         // A star/sid/final fix point
    this.isWaypoint = false;    // A published generic waypoint
    this.isRunway = false;      // A runway threshold indicator
    this.isAts = false;         // A Ats route fix

    // Navaid specific
    this.freq = '';             // Navaid frequency
    this.navaid_type = '';      // Navaid specific type - see consts NAVAID_TYPE..

    // Graphic objects
    this.gLabel = new createjs.Text("", "normal 10px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 10;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.addChild(this.gBox, this.gLabel);
}
createjs.extend(Waypoint, createjs.Container);
createjs.promote(Waypoint, "Container");

Waypoint.prototype.getDisplayData = function( scale ) {
    // scale = scale + 0.4;
    scale = scale + 0.4 / 1.2;
    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;
    this.gBox.scaleX = scale; //  / 1.5;
    this.gBox.scaleY = scale; // / 1.5;
    this.setScreenPosition(scale);
}

Waypoint.prototype.setX = function ( x ) {
    this.x = x;
}

Waypoint.prototype.setY = function ( y ) {
    this.y = y;
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
    this.type = 'WP';
    /*
    for(var c=0; c<label.length; c++) {
        if (parseInt(label.substr(c,1)) > 0) {
            this.type = 'WP';
            return;
        }
    }
    this.type = 'WP';
    */
}

Waypoint.prototype.show = function(visible, isTemporary) {
    if (isTemporary == undefined) {
        isTemporary = false;
    }
    if (visible) {
        // Show fix
        if (this.visible && !this.visibleTemp) {
            // Fix always displayed
            return;
        }
        if (!this.visible) {
            this.visible = visible;
            this.visibleTemp = isTemporary;
        }
    }
    else {
        // Hide fix
        if (this.visible && ((isTemporary && this.visibleTemp) || !isTemporary)) {
            // Hide temporary
            this.visible = visible;
            this.visibleTemp = false;
        }
    }
}

Waypoint.prototype.showLabel = function(visible, isTemporary) {
    if (isTemporary == undefined) {
        isTemporary = false;
    }
    if (visible) {
        // Show fix label
        if (this.labelVisible && !this.labelVisibleTemp) {
            // Fix label is always visible
            return;
        }
        if (!this.labelVisible) {
            this.labelVisible = true;
            this.labelVisibleTemp = isTemporary;
            this.gLabel.visible = true;
        }
    }
    else {
        // Hide fix label
        if (this.labelVisible && ((isTemporary && this.labelVisibleTemp) || !isTemporary)) {
            this.labelVisible = false;
            this.labelVisibleTemp = false;
            this.gLabel.visible = false;
        }

    }
}

/**** GLOBAL WAYPOINT FUNCTIONS ****/

function addWaypoint(name, label, latitude, longitude) {
    var o_wp = new Waypoint();
    o_wp.name = name.toUpperCase();
    o_wp.setLabel(o_wp.name);
    o_wp.gLabel.text = o_wp.name;
    o_wp.latitude = latitude;
    o_wp.longitude = longitude;
    o_wp.setScreenPosition(1);
    if (o_wp.type == 'FIX') {
        o_wp.show(true, false);
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
            if ((Math.abs(waypoints[c].latitude - latitude) < 0.05) && (Math.abs(waypoints[c].longitude - longitude) < 0.05)) {
                // Waypoint has the same name and coordinates are within tollerance
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

