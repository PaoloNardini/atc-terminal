var waypoints = [];
var waypointsById = [];

function Waypoint() {

    this.Container_constructor();

    // Identification
    this.type = 'FIX';
    this.label = '';
    this.latitude = 0;
    this.longitude = 0;
    this.useCounter = 0;
    this.fix = -1;
    this.visible = false;
    this.labelVisible = false;
    this.visibleTemp = false;
    this.labelVisibleTemp = false;

    // Flags: The same coordinate point could be more than one type of fix
    this.isNavaid = false;      // A radio-navigation aid (vor/dme/ndb/ils)
    this.isFix = false;         // A star/sid/final fix point
    this.isWaypoint = false;    // A published generic waypoint
    this.isRunway = false;      // A runway threshold indicator
    this.isAts = false;         // A Ats route fix

    this.isNavaidVisible = false;
    this.isFixVisible = false;
    this.isWaypointVisible = false;
    this.isRunwayVisible = false;
    this.isAtsVisible = false;

    // Navaid specific
    this.freq = '';             // Navaid frequency
    this.navaid_type = '';      // Navaid specific type - see consts NAVAID_TYPE..

    // Fix specific
    this.altitude = -1;
    this.isRouteFix = false;

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

    scale = scale + 0.4 / 1.2;
    // scale = scale + 0.4;
    this.gBox.scaleX = scale; //  / 1.5;
    this.gBox.scaleY = scale; // / 1.5;
    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;

    this.gBox.graphics.clear();
    if (this.isNavaid) {
        if (this.navaid_type == NAVAID_TYPE_NDB) {
            this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
        }
        else if (this.navaid_type  == NAVAID_TYPE_VORDMENDB) {
            this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 7).beginFill(FIX_BODY_COLOR).moveTo(-4, 4).lineTo(0, -4).lineTo(4, 4).lineTo(-4, 4).endStroke();
        }
        else {
            this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).beginFill(FIX_BODY_COLOR).moveTo(-2, 2).lineTo(0, -2).lineTo(2, 2).lineTo(-2, 2).endStroke();
        }
    }
    else if (this.isAts) {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).beginFill(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    }
    else if (this.isFix) {
        var c = this.useCounter;
        if (c<4) c = 4;
        if (c>4) c = 5;
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-c,c).lineTo(0,-c).lineTo(c,c).lineTo(-c,c).endStroke();
    }
    else {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-3,3).lineTo(0,-3).lineTo(3,3).lineTo(-3,3).endStroke();
        this.gLabel.scaleX = scale * 0.8;
        this.gLabel.scaleY = scale * 0.8;
    }
    if (this.labelVisibleTemp) {
        this.gLabel.color = "rgba(255,255,0,1)";
        this.gLabel.scaleX = scale * 1.5;
        this.gLabel.scaleY = scale * 1.5;
    }
    else {
        this.gLabel.color = FIX_TEXT_COLOR;
    }
    this.setScreenPosition(scale);
}

Waypoint.prototype.setX = function ( x ) {
    this.x = x;
}

Waypoint.prototype.setY = function ( y ) {
    this.y = y;
}

/*
Waypoint.prototype.setFix = function (f) {
    this.fix = f;
    this.latitude = fixes[f].latitude;
    this.longitude = fixes[f].longitude;
}
*/

Waypoint.prototype.setScreenPosition = function(scale) {
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    /*
    if (this.isWaypoint) {
        this.gLabel.x = (Math.random() * -30) * scale;
        this.gLabel.y = (10 + Math.random() * 10) * scale;
    }
    else {
        this.gLabel.x = (Math.random() * 10) * scale;
        this.gLabel.y = (-10 + Math.random() * -10) * scale;
    }
    */
    /*
    if (this.type == 'FIX') {
        this.gLabel.x = 10 * scale;
        this.gLabel.y = -10 * scale;
    }
    else {
        this.gLabel.x = -30 * scale;
        this.gLabel.y = 10 * scale;
    }
    */
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
            this.labelVisibleTemp = isTemporary;
            this.getDisplayData(currentScale)
            this.labelVisibleTemp = false;
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
    this.getDisplayData(currentScale)
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
    /*
    if (o_wp.type == 'FIX') {
        o_wp.show(true, false);
    }
    else {
        o_wp.show(false);
    }
    */
    var c = waypoints.length;
    waypoints[c] = o_wp;
    waypointsById[name] = c;
    mainContainer.addChild(o_wp);
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

function showWaypoints(type, onoff, isTemporary) {
    var o_wp;
    var x = 0;
    for (w = 0; w < waypoints.length; w++) {
        o_wp = waypoints[w];
        if (type == 'WP' && o_wp.isWaypoint) {
            if (onoff != o_wp.isWaypointVisible) {
                if (!o_wp.isFixVisible && !o_wp.isNavaidVisible && !o_wp.isRunwayVisible && !o_wp.isAtsVisible) {
                    o_wp.show(onoff, isTemporary);
                }
                o_wp.isWaypointVisible = onoff;
            }
        }
        if (type == 'FIX' && o_wp.isFix) {
            if (onoff != o_wp.isFixVisible) {
                if (!o_wp.isWaypointVisible && !o_wp.isNavaidVisible && !o_wp.isRunwayVisible && !o_wp.isAtsVisible) {
                    o_wp.show(onoff, isTemporary);
                }
                o_wp.isFixVisible = onoff;
            }
        }
        if (type == 'NAV' && o_wp.isNavaid) {
            // Show only major navaids types
            if (o_wp.navaid_type == NAVAID_TYPE_VORDME || o_wp.navaid_type == NAVAID_TYPE_VORDME || o_wp.navaid_type == NAVAID_TYPE_VOR || o_wp.navaid_type == NAVAID_TYPE_NDB || o_wp.navaid_type == NAVAID_TYPE_VORDMENDB) {
                if (onoff != o_wp.isNavaidVisible) {
                    if (!o_wp.isWaypointVisible && !o_wp.isFixVisible && !o_wp.isRunwayVisible && !o_wp.isAtsVisible) {
                        o_wp.show(onoff, isTemporary);
                    }
                    o_wp.isNavaidVisible = onoff;
                }
            }
        }
        if (type == 'RWY' && o_wp.isRunway) {
            if (onoff != o_wp.isRunwayVisible) {
                if (!o_wp.isWaypointVisible && !o_wp.isFixVisible && !o_wp.isNavaidVisible && !o_wp.isAtsVisible) {
                    o_wp.show(onoff, isTemporary);
                }
                o_wp.isRunwayVisible = onoff;
            }
        }
        if (type == 'ATS' && o_wp.isAts) {
            if (onoff != o_wp.isAtsVisible) {
                if (!o_wp.isWaypointVisible && !o_wp.isFixVisible && !o_wp.isNavaidVisible && !o_wp.isRunwayVisible) {
                    o_wp.show(onoff, isTemporary);
                }
                o_wp.isAtsVisible = onoff;
            }
        }

        /*

         if ((type == 'WP' && waypoints[w].isWaypoint) ||( type == 'FIX' && waypoints[w].isFix) || (type == 'NAV' && waypoints[w].isNavaid) || (type == 'RWY' && waypoints[w].isRunway) || (type == 'ATS' && waypoints[w].isATs)) {
         waypoints[w].show(onoff, isTemporary);
         }
         */
    }
}

function showWaypointsLabels(type, onoff, isTemporary) {
    var o_wp;
    for (w = 0; w < waypoints.length; w++) {
        o_wp = waypoints[w];
        if (type == 'WP' && o_wp.isWaypoint) {
            o_wp.showLabel(onoff, isTemporary);
        }
        if (type == 'FIX' && o_wp.isFix) {
            o_wp.showLabel(onoff, isTemporary);
        }
        if (type == 'NAV' && o_wp.isNavaid) {
            o_wp.showLabel(onoff, isTemporary);
        }
        if (type == 'RWY' && o_wp.isRunway) {
            o_wp.showLabel(onoff, isTemporary);
        }
        if (type == 'ATS' && o_wp.isAts) {
            o_wp.showLabel(onoff, isTemporary);
        }
    }
}
